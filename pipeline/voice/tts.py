"""Narration + timing builder.

Reads projects/<id>/script.json, speaks every line with the chosen voice engine, and writes into
projects/<id>/build/<cut>/:
  narration.wav  - the narration, 48 kHz mono, with every scripted pause in place
  timings.json   - everything the video needs: format, scenes (template + settings), captions, cue times, beats

Usage:
  python pipeline/voice/tts.py <project> [--cut NAME] [--engine kokoro|chatterbox] [--voice NAME] [--speed X]

Pauses (they work the same with every voice engine, because the pipeline inserts the silence itself):
  "[beat]" or "[beat 1.4]" inside a line's "say"   a held silence. Music and sound effects drop out for it.
  "beat": 1.2 on a line                            the same, after the line.
  "pause": 0.8 on a line                           a plain longer gap after the line (music keeps playing).
  "hold": 3 on a scene with no lines               a silent scene (title card, subscribe moment, end card).

Word timing: each spoken piece is force-aligned to its own text with PocketSphinx. If a word is not in its
dictionary (a name like "Ekofisk"), Whisper's word timestamps are used instead, and failing that an estimate.
Every spoken piece is cached, so rebuilding or cutting a Short re-uses the audio already made.
"""
import sys, os, re, json, argparse, hashlib, difflib
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import engines

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_SR = 48000
PUNCT = ",.;:?!—"
FORMATS = {"wide": (1920, 1080), "tall": (1080, 1920)}
BEAT_RE = re.compile(r"\[beat(?:\s+([\d.]+))?\]")

# Written forms the narrator reads badly, mapped to what it should say.
# Dotted abbreviations make the voice pause as if a sentence ended ("U. ... S.").
SAY_AS = {"U.S.A.": "U S A", "U.S.": "U S", "U.K.": "U K", "E.U.": "E U", "vs.": "versus", "e.g.": "for example", "i.e.": "that is"}


def normalise_for_speech(text):
    for written, spoken in SAY_AS.items():
        text = re.sub(re.escape(written) + r"(?=[\s,;:!?]|$)", spoken, text)
    return re.sub(r"\b((?:[A-Za-z]\.){2,})", lambda m: " ".join(m.group(1).replace(".", " ").split()), text)


def parse_line(say, show, default_beat):
    """Return words[], chunks[(first_word, last_word, show_text)], cues{name: word_index}, beats{word_index_after: seconds}."""
    say = normalise_for_speech(say)
    say_chunks = [c.strip() for c in say.split("|")]
    show_chunks = [c.strip() for c in show.split("|")]
    assert len(say_chunks) == len(show_chunks), f"caption chunks don't match the spoken chunks: {say!r}"
    words, cues, chunks, beats = [], {}, [], {}
    for sc, sh in zip(say_chunks, show_chunks):
        first = len(words)
        sc = BEAT_RE.sub(lambda m: f" \x00{m.group(1) or default_beat} ", sc)
        for tok in sc.split():
            if tok[0] == "\x00":
                assert words, "a line can't start with [beat]; put the beat on the line before"
                beats[len(words) - 1] = float(tok[1:])
                continue
            m = re.match(r"^((?:\{\w+\})+)(.*)$", tok)
            if m:
                for name in re.findall(r"\{(\w+)\}", m.group(1)):
                    cues[name] = len(words)
                tok = m.group(2)
            if tok:
                words.append(tok)
        chunks.append((first, len(words) - 1, sh))
    return words, chunks, cues, beats


def speech_bounds_and_gaps(x, sr, min_gap=0.10):
    hop = int(sr * 0.010)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    thr = max(rms.max() * 0.035, 1e-4)
    voiced = rms > thr
    idx = np.where(voiced)[0]
    start, end = idx[0] * hop / sr, (idx[-1] + 1) * hop / sr
    gaps, i = [], idx[0]
    while i < idx[-1]:
        if not voiced[i]:
            j = i
            while j < idx[-1] and not voiced[j]:
                j += 1
            if (j - i) * hop / sr >= min_gap:
                gaps.append((i * hop / sr, j * hop / sr))
            i = j
        else:
            i += 1
    return start, end, gaps


def estimate_words(words, x, sr):
    """Last resort: share the speech between the words by length, anchored on the longest pauses."""
    wts = [max(len(re.sub(r"[^\w']", "", w)), 1) for w in words]
    start, end, gaps = speech_bounds_and_gaps(x, sr)
    breaks = [i for i, w in enumerate(words[:-1]) if w[-1] in PUNCT]
    if breaks and len(gaps) >= len(breaks):
        chosen = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: len(breaks)])
        segs, a, w0 = [], start, 0
        for b, (g0, g1) in zip(breaks, chosen):
            segs.append((w0, b, a, g0))
            a, w0 = g1, b + 1
        segs.append((w0, len(words) - 1, a, end))
    else:
        segs = [(0, len(words) - 1, start, end)]
    times = [None] * len(words)
    for w0, w1, a, b in segs:
        tot = sum(wts[w0: w1 + 1])
        t = a
        for i in range(w0, w1 + 1):
            d = (b - a) * wts[i] / tot
            times[i] = (t, t + d)
            t += d
    return times


_decoder = None


def _dict_form(tok):
    if _decoder.lookup_word(tok) is not None:
        return tok
    for alt in (tok.strip("'"), tok[:-2] if tok.endswith("'s") else tok, tok.replace("'", "")):
        if alt and _decoder.lookup_word(alt) is not None:
            return alt
    return tok


def align_sphinx(words, x, sr):
    """Forced alignment with PocketSphinx. Returns [(start, end)] per word, or None."""
    global _decoder
    try:
        from pocketsphinx import Decoder
    except ImportError:
        return None
    if _decoder is None:
        _decoder = Decoder(samprate=16000, loglevel="ERROR")
    toks_per_word = []
    for w in words:
        w2 = w.lower().replace("-", " ").replace(".", " ") if re.search(r"\w\.\w", w) else w.lower().replace("-", " ")
        toks = [_dict_form(t) for t in re.sub(r"[^a-z' ]", " ", w2).split()]
        if not toks or any(_decoder.lookup_word(t) is None for t in toks):
            return None
        toks_per_word.append(toks)
    pcm = (np.clip(resample_poly(x, 16000, sr), -1, 1) * 32767).astype(np.int16)
    _decoder.set_align_text(" ".join(t for ts in toks_per_word for t in ts))
    _decoder.start_utt()
    _decoder.process_raw(pcm.tobytes(), full_utt=True)
    _decoder.end_utt()
    segs = [(s.start_frame / 100, (s.end_frame + 1) / 100) for s in _decoder.seg()
            if not s.word.startswith("<") and not s.word.startswith("(")]
    if len(segs) != sum(len(t) for t in toks_per_word):
        return None
    out, i = [], 0
    for ts in toks_per_word:
        out.append((segs[i][0], segs[i + len(ts) - 1][1]))
        i += len(ts)
    return out


_whisper = None
_plain = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())


def hear(x, sr):
    """Whisper's transcript of a piece of audio as [(word, start, end)], or None if Whisper isn't installed."""
    global _whisper
    if _whisper is False:
        return None
    if _whisper is None:
        try:
            from faster_whisper import WhisperModel
            local = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "whisper-base.en")
            _whisper = WhisperModel(local if os.path.exists(os.path.join(local, "model.bin")) else "base.en", device="cpu", compute_type="int8")
        except Exception as e:
            print(f"  (listening check unavailable: {str(e)[:80]})")
            _whisper = False
            return None
    a = resample_poly(x, 16000, sr).astype(np.float32)
    segs, _ = _whisper.transcribe(a, word_timestamps=True, beam_size=3, language="en", condition_on_previous_text=False)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]


def align_heard(words, heard):
    """Map script words to Whisper's word times. Returns ([(start, end)] or None, [mismatch notes])."""
    if not heard:
        return None, []
    a, b = [_plain(w) for w in words], [_plain(h[0]) for h in heard]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    times, notes = [None] * len(words), []
    for tag, i0, i1, j0, j1 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i1 - i0):
                times[i0 + k] = (heard[j0 + k][1], heard[j0 + k][2])
        else:
            said, got = " ".join(words[i0:i1]), " ".join(h[0] for h in heard[j0:j1])
            if _plain(said) != _plain(got):  # "sixty-five" heard as "65" is fine; flag real differences
                notes.append(f'script "{said}" -> heard "{got}"')
            if i1 > i0 and j1 > j0:  # spread the heard span over the script words
                s, e = heard[j0][1], heard[j1 - 1][2]
                for k in range(i1 - i0):
                    times[i0 + k] = (s + (e - s) * k / (i1 - i0), s + (e - s) * (k + 1) / (i1 - i0))
    if any(t is None for t in times):  # words Whisper skipped: borrow from neighbours
        known = [i for i, t in enumerate(times) if t]
        if len(known) < max(2, len(words) // 2):
            return None, notes
        for i in range(len(times)):
            if times[i] is None:
                prev = max([k for k in known if k < i], default=None)
                nxt = min([k for k in known if k > i], default=None)
                s = times[prev][1] if prev is not None else times[nxt][0] - 0.2
                e = times[nxt][0] if nxt is not None else s + 0.3
                times[i] = (s, max(e, s + 0.05))
    return times, notes


NUM_WORDS = set("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion trillion point and percent dollars pounds a sixties seventies eighties nineties".split())
SAME = [{"licence", "license"}, {"programme", "program"}, {"cheque", "check"}, {"metre", "meter"}, {"centre", "center"}, {"defence", "defense"}, {"labour", "labor"}]


def real_mismatches(notes):
    """Keep only differences worth an ear check: drop number formatting ("nineteen sixty-five" heard as "1965")
    and British/American spellings of the same word."""
    out = []
    for n in notes:
        m = re.match(r'script "(.*)" -> heard "(.*)"', n)
        said = [w for w in (re.sub(r"[^a-z']", "", w) for w in re.split(r"[\s-]+", m.group(1).lower())) if w]
        got = [w for w in (re.sub(r"[^a-z0-9']", "", w) for w in m.group(2).lower().split()) if w]
        if said and all(w in NUM_WORDS for w in said):
            continue
        if len(said) == 1 and len(got) == 1 and any({said[0], got[0]} <= pair for pair in SAME):
            continue
        if not said:
            n = f'extra words heard: "{m.group(2)}" (often a false alarm of the checker itself)'
        out.append(n)
    return out


def polish_voice(x, out_dir, target_lufs=-17.0):
    """Broadcast-style voice chain: rumble filter, gentle compression, limiter, then level."""
    import subprocess, pyloudnorm as pyln
    raw, tmp = os.path.join(out_dir, "_voice_raw.wav"), os.path.join(out_dir, "_voice_fx.wav")
    sf.write(raw, x, OUT_SR, subtype="PCM_24")
    chain = ("highpass=f=75,acompressor=threshold=0.04:ratio=4:attack=4:release=90:makeup=4.5:knee=5,"
             "alimiter=limit=0.85:attack=3:release=40:level=false")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", chain, "-ar", str(OUT_SR), tmp], check=True)
    y, _ = sf.read(tmp)
    y = y[: len(x)] if len(y) >= len(x) else np.pad(y, (0, len(x) - len(y)))
    lufs = pyln.Meter(OUT_SR).integrated_loudness(y)
    y = y * min(10 ** ((target_lufs - lufs) / 20), 0.88 / np.abs(y).max())
    os.remove(raw), os.remove(tmp)
    print(f"voice level: {pyln.Meter(OUT_SR).integrated_loudness(y):.1f} LUFS, peak {np.abs(y).max():.2f}")
    return y.astype(np.float32)


def resolve_scenes(script, cut):
    """The scene list for a cut: ids pick scenes from the main list, objects are extra scenes only this cut has."""
    if cut == "full":
        return script["scenes"], script.get("format", "wide")
    spec = script.get("cuts", {}).get(cut)
    if spec is None:
        raise SystemExit(f"No cut called \"{cut}\" in script.json. Cuts: {', '.join(script.get('cuts', {})) or 'none'}")
    by_id = {s["id"]: s for s in script["scenes"]}
    scenes = []
    for s in spec["scenes"]:
        if isinstance(s, str):
            if s not in by_id:
                raise SystemExit(f"Cut \"{cut}\" asks for scene \"{s}\", which isn't in the script.")
            s = by_id[s]
        scenes.append(s)
    return scenes, spec.get("format", script.get("format", "wide"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--cut", default="full")
    ap.add_argument("--engine")
    ap.add_argument("--voice")
    ap.add_argument("--speed", type=float)
    ap.add_argument("--exaggeration", type=float)
    ap.add_argument("--no-listen", action="store_true", help="skip the Whisper listening check")
    a = ap.parse_args()
    pdir = os.path.join(ROOT, "projects", a.project)
    script = json.load(open(os.path.join(pdir, "script.json")))
    v = script.get("voice", {})
    v = {"engine": "kokoro", "voice": v} if isinstance(v, str) else dict(v)
    v.setdefault("engine", "kokoro")
    if a.engine and a.engine != v["engine"]:
        v = {"engine": a.engine}
    for k in ("voice", "speed", "exaggeration"):
        if getattr(a, k) is not None:
            v[k] = getattr(a, k)
    if "speed" not in v and "speed" in script:
        v["speed"] = script["speed"]
    pauses = script.get("pauses", {})
    line_gap = pauses.get("line", script.get("lineGap", 0.35))
    scene_gap = pauses.get("scene", script.get("sceneGap", 0.7))
    default_beat = pauses.get("beat", 1.1)
    lead_in, tail = script.get("leadIn", 0.5), script.get("tail", 2.0)
    scenes_in, fmt = resolve_scenes(script, a.cut)
    cut_spec = script.get("cuts", {}).get(a.cut, {})
    tail = cut_spec.get("tail", tail)

    legacy = a.cut == "full" and not any("template" in s for s in scenes_in)
    out = os.path.join(pdir, "build") if legacy else os.path.join(pdir, "build", a.cut)
    cache = os.path.join(pdir, "build", "voice-cache")
    os.makedirs(out, exist_ok=True), os.makedirs(cache, exist_ok=True)

    eng = None
    def speak(text):
        nonlocal eng
        if eng is None:
            eng = engines.make(**v)
        key = hashlib.sha1(f"{eng.id}|{text}".encode()).hexdigest()[:16]
        path = os.path.join(cache, key + ".wav")
        if os.path.exists(path):
            x, sr = sf.read(path, dtype="float32")
            return x, sr
        x, sr = eng.synth(text)
        sf.write(path, x, sr, subtype="PCM_16")
        return x, sr

    audio = [np.zeros(int(OUT_SR * lead_in), dtype=np.float32)]
    t = lead_in
    def silence(sec):
        nonlocal t
        audio.append(np.zeros(int(OUT_SR * sec), dtype=np.float32))
        t += len(audio[-1]) / OUT_SR

    scenes, lines, all_cues, beats, heard_notes = [], [], {}, [], []
    methods = {"sphinx": 0, "whisper": 0, "estimate": 0}
    n_scenes = len(scenes_in)
    for si, scene in enumerate(scenes_in):
        s_first, late_cut = t, False
        last_scene = si == n_scenes - 1
        if not scene.get("lines"):
            silence(scene.get("hold", 3.0))
            s_last = t
            if not last_scene:
                silence(scene.get("pause", scene_gap * 0.5))
        for li, line in enumerate(scene.get("lines", [])):
            words, chunks, cues, inline_beats = parse_line(line["say"], line.get("show", line["say"]), default_beat)
            line_id, line_start = f"{scene['id']}.{li}", t
            wt = [None] * len(words)
            # speak each piece between [beat] marks separately, so the silence is exact with any engine
            cuts_at = sorted(inline_beats) + [len(words) - 1]
            w0 = 0
            for seg_end in cuts_at:
                seg_words = words[w0: seg_end + 1]
                text = " ".join(seg_words)
                x, sr = speak(text)
                x = np.asarray(x, dtype=np.float32)
                _, _, gaps = speech_bounds_and_gaps(x, sr, min_gap=0.2)
                marks = sum(1 for w in seg_words[:-1] if w[-1] in PUNCT)
                if len(gaps) > marks + 1:
                    print(f"  ! check pacing: {len(gaps)} long pauses but {marks} punctuation marks in: {text}")
                heard = None if a.no_listen else hear(x, sr)
                seg_t = align_sphinx(seg_words, x, sr)
                how = "sphinx"
                h_times, notes = align_heard(seg_words, heard)
                notes = real_mismatches(notes)
                if notes:
                    heard_notes.append((line_id, notes))
                if seg_t is None:
                    seg_t, how = (h_times, "whisper") if h_times else (estimate_words(seg_words, x, sr), "estimate")
                methods[how] += 1
                sp0, sp1 = seg_t[0][0], seg_t[-1][1]
                b0, b1, _ = speech_bounds_and_gaps(x, sr)
                sp0, sp1 = min(sp0, b0), max(sp1, b1)  # never clip speech the aligner missed
                i0, i1 = max(int((sp0 - 0.03) * sr), 0), min(int((sp1 + 0.06) * sr), len(x))
                x = x[i0:i1].copy()
                off = t - i0 / sr
                fade = int(sr * 0.008)
                x[:fade] *= np.linspace(0, 1, fade)
                x[-fade:] *= np.linspace(1, 0, fade)
                y = resample_poly(x, OUT_SR, sr).astype(np.float32)
                for k, (s, e) in enumerate(seg_t):
                    wt[w0 + k] = (s + off, e + off)
                audio.append(y)
                t += len(y) / OUT_SR
                if seg_end in inline_beats:
                    beats.append({"start": round(t, 3), "end": round(t + inline_beats[seg_end], 3), "line": line_id})
                    silence(inline_beats[seg_end])
                w0 = seg_end + 1
            line_end = t
            ch = [{"show": show, "start": round(wt[a0][0], 3), "end": round(wt[a1][1], 3)} for a0, a1, show in chunks]
            for c0, c1 in zip(ch, ch[1:]):
                c0["end"] = min(c0["end"] + 0.25, c1["start"]) if c1["start"] - c0["end"] > 0.6 else c1["start"]
            for name, wi in cues.items():
                assert name not in all_cues, f"the cue name {{{name}}} is used twice; cue names must be unique"
                all_cues[name] = round(wt[wi][0], 3)
            lines.append({"id": line_id, "scene": scene["id"], "text": " ".join(words), "start": round(line_start, 3),
                          "end": round(line_end, 3), "chunks": ch})
            last_line = li == len(scene["lines"]) - 1
            s_last = line_end
            if "beat" in line:
                beats.append({"start": round(t, 3), "end": round(t + line["beat"], 3), "line": line_id})
                silence(line["beat"])
                late_cut = last_line
            elif not (last_line and last_scene):
                silence(line.get("pause", line.get("gapAfter", scene_gap if last_line else line_gap)))
        entry = {"id": scene["id"], "firstWord": round(s_first, 3), "lastWord": round(s_last, 3), "lateCut": late_cut}
        for k in ("template", "tone", "props", "major", "enter", "sound", "sounds"):
            if k in scene:
                entry[k] = scene[k]
        scenes.append(entry)
    silence(tail)
    full = np.concatenate(audio)
    total = len(full) / OUT_SR
    # A scene changes halfway through the silence before it. After a beat the picture holds until just before
    # the next word, so the question stays on screen through the silence and the answer lands with the voice.
    for i, s in enumerate(scenes):
        if i == 0:
            s["start"] = 0.0
        elif scenes[i - 1].pop("lateCut", False):
            s["start"] = round(s["firstWord"] - 0.1, 3)
        else:
            s["start"] = round((scenes[i - 1]["lastWord"] + s["firstWord"]) / 2, 3)
    scenes[-1].pop("lateCut", None)
    for i, s in enumerate(scenes):
        s["end"] = round(total, 3) if i == len(scenes) - 1 else scenes[i + 1]["start"]
    spoken = np.abs(full).max() > 0
    if spoken:
        full = polish_voice(full / np.abs(full).max() * 0.89, out)
    sf.write(os.path.join(out, "narration.wav"), full, OUT_SR, subtype="PCM_16")
    w, h = FORMATS[fmt]
    photos = {}
    cpath = os.path.join(pdir, "photos", "credits.json")
    if os.path.exists(cpath):
        photos = json.load(open(cpath))
    timings = {"project": a.project, "cut": a.cut, "title": script["title"], "channel": script.get("channel", ""),
               "voice": v, "fps": 30, "format": fmt, "width": w, "height": h, "duration": round(total, 3),
               "scenes": scenes, "lines": lines, "cues": all_cues, "beats": beats, "photos": photos}
    json.dump(timings, open(os.path.join(out, "timings.json"), "w"), indent=1)
    words_n = sum(len(l["text"].split()) for l in lines)
    wpm = words_n / max(sum(l["end"] - l["start"] for l in lines), 1) * 60
    print(f"voice={v} cut={a.cut} format={fmt} duration={total:.1f}s words={words_n} ({wpm:.0f} words a minute while speaking)")
    print(f"word timing: {methods['sphinx']} pieces force-aligned, {methods['whisper']} by Whisper, {methods['estimate']} estimated")
    if heard_notes:
        print("listening check: these words were not heard back as written. Check them by ear (names are often fine):")
        for lid, notes in heard_notes:
            for n in notes:
                print(f"  {lid}: {n}")
    elif not a.no_listen and _whisper:
        print("listening check: every line was heard back as written")
    json.dump({"notes": [{"line": l, "notes": n} for l, n in heard_notes]}, open(os.path.join(out, "listening-check.json"), "w"), indent=1)
    for s in scenes:
        print(f"  {s['id']:<16}{s['start']:7.2f} -> {s['end']:7.2f}  {s.get('template', '')}")


if __name__ == "__main__":
    main()
