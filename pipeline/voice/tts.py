"""Narration + timing builder.

Reads projects/<id>/script.json, synthesises every line with Kokoro (free, local),
and writes into projects/<id>/build/:
  narration.wav  - full narration, 48 kHz mono
  timings.json   - scene, line, caption-chunk and cue times in seconds

Usage: python pipeline/voice/tts.py <project-id> [--voice NAME] [--speed X]

Word timing: Kokoro does not return word timestamps, so each line is force-aligned
against its own text with PocketSphinx (offline, bundled model). If a word is not in
its dictionary the line falls back to an estimate from phoneme counts and pauses.
"""
import sys, os, re, json, argparse
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_SR = 48000
PUNCT = ",.;:?!—"


def parse_line(say, show):
    """Return words[], chunks[(first_word, last_word, show_text)], cues{name: word_index}."""
    say_chunks = [c.strip() for c in say.split("|")]
    show_chunks = [c.strip() for c in show.split("|")]
    assert len(say_chunks) == len(show_chunks), f"chunk mismatch: {say!r}"
    words, cues, chunks = [], {}, []
    for sc, sh in zip(say_chunks, show_chunks):
        first = len(words)
        for tok in sc.split():
            m = re.match(r"^((?:\{\w+\})+)(.*)$", tok)
            if m:
                for name in re.findall(r"\{(\w+)\}", m.group(1)):
                    cues[name] = len(words)
                tok = m.group(2)
            if tok:
                words.append(tok)
        chunks.append((first, len(words) - 1, sh))
    return words, chunks, cues


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


def word_times(k, words, lang, x, sr):
    """Estimate (start, end) for each word in the audio x."""
    def weight(w):
        core = re.sub(r"[^\w']", "", w)
        try:
            ph = k.tokenizer.phonemize(core, lang)
            return max(len(ph.replace(" ", "")), 1)
        except Exception:
            return max(len(core), 1)

    wts = [weight(w) for w in words]
    start, end, gaps = speech_bounds_and_gaps(x, sr)
    breaks = [i for i, w in enumerate(words[:-1]) if w[-1] in PUNCT]  # pause after word i
    anchored = False
    if breaks and len(gaps) >= len(breaks):
        # keep the longest pauses, in time order
        chosen = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: len(breaks)])
        segs, a, w0 = [], start, 0
        for b, (g0, g1) in zip(breaks, chosen):
            segs.append((w0, b, a, g0))
            a, w0 = g1, b + 1
        segs.append((w0, len(words) - 1, a, end))
        anchored = True
    else:
        segs = [(0, len(words) - 1, start, end)]
    times = [None] * len(words)
    for w0, w1, a, b in segs:
        tot = sum(wts[w0 : w1 + 1])
        t = a
        for i in range(w0, w1 + 1):
            d = (b - a) * wts[i] / tot
            times[i] = (t, t + d)
            t += d
    return times, anchored


def polish_voice(x, out_dir, target_lufs=-17.0):
    """Broadcast-style voice chain: rumble filter, gentle compression, limiter, then level.
    Raw TTS has big peaks and a low average level, which sounds thin on phones."""
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


_decoder = None


def _dict_form(tok):
    """Closest in-dictionary form of a token (possessives fall back to the base word)."""
    if _decoder.lookup_word(tok) is not None:
        return tok
    for alt in (tok.strip("'"), tok[:-2] if tok.endswith("'s") else tok, tok.replace("'", "")):
        if alt and _decoder.lookup_word(alt) is not None:
            return alt
    return tok


def align_words(words, x, sr):
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
        toks = [_dict_form(t)
                for t in re.sub(r"[^a-z' ]", " ", w2).split()]
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--voice")
    ap.add_argument("--speed", type=float)
    ap.add_argument("--out", default="build")
    a = ap.parse_args()
    pdir = os.path.join(ROOT, "projects", a.project)
    script = json.load(open(os.path.join(pdir, "script.json")))
    voice = a.voice or script["voice"]
    speed = a.speed or script.get("speed", 1.0)
    lang = "en-gb" if voice[0] == "b" else script.get("lang", "en-us")
    out = os.path.join(pdir, a.out)
    os.makedirs(out, exist_ok=True)

    k = Kokoro(os.path.join(HERE, "models/kokoro-v1.0.onnx"), os.path.join(HERE, "models/voices-v1.0.bin"))
    audio = [np.zeros(int(OUT_SR * script.get("leadIn", 0.5)), dtype=np.float32)]
    t = script.get("leadIn", 0.5)
    scenes, lines, all_cues = [], [], {}
    n_scenes = len(script["scenes"])
    for si, scene in enumerate(script["scenes"]):
        s_first = t
        for li, line in enumerate(scene["lines"]):
            words, chunks, cues = parse_line(line["say"], line["show"])
            text = " ".join(words)
            x, sr = k.create(text, voice=voice, speed=speed, lang=lang)
            x = np.asarray(x, dtype=np.float32)
            wt = align_words(words, x, sr)
            anchored = wt is not None
            if wt is None:
                wt, _ = word_times(k, words, lang, x, sr)
            sp0, sp1 = wt[0][0], wt[-1][1]
            # trim silence, keep a little air
            i0, i1 = max(int((sp0 - 0.03) * sr), 0), min(int((sp1 + 0.06) * sr), len(x))
            x = x[i0:i1]
            off = t - i0 / sr
            fade = int(sr * 0.008)
            x[:fade] *= np.linspace(0, 1, fade)
            x[-fade:] *= np.linspace(1, 0, fade)
            y = resample_poly(x, OUT_SR, sr).astype(np.float32)
            line_id = f"{scene['id']}.{li}"
            ch = []
            for ci, (w0, w1, show) in enumerate(chunks):
                ch.append({"show": show, "start": round(wt[w0][0] + off, 3), "end": round(wt[w1][1] + off, 3)})
            for c0, c1 in zip(ch, ch[1:]):
                c0["end"] = c1["start"]
            for name, wi in cues.items():
                assert name not in all_cues, f"duplicate cue {name}"
                all_cues[name] = round(wt[wi][0] + off, 3)
            dur = len(y) / OUT_SR
            lines.append({"id": line_id, "scene": scene["id"], "text": text, "start": round(t, 3), "end": round(t + dur, 3),
                          "anchored": anchored, "chunks": ch})
            audio.append(y)
            t += dur
            last_line = li == len(scene["lines"]) - 1
            gap = line.get("gapAfter", script["sceneGap"] if last_line else script["lineGap"])
            if not (last_line and si == n_scenes - 1):
                audio.append(np.zeros(int(OUT_SR * gap), dtype=np.float32))
                t += gap
        scenes.append({"id": scene["id"], "firstWord": round(s_first, 3), "lastWord": round(lines[-1]["end"], 3)})
    tail = script.get("tail", 2.0)
    audio.append(np.zeros(int(OUT_SR * tail), dtype=np.float32))
    full = np.concatenate(audio)
    total = len(full) / OUT_SR
    # scene boundaries: midpoint of the silence between scenes
    for i, s in enumerate(scenes):
        s["start"] = 0.0 if i == 0 else round((scenes[i - 1]["lastWord"] + s["firstWord"]) / 2, 3)
    for i, s in enumerate(scenes):
        s["end"] = round(total, 3) if i == len(scenes) - 1 else scenes[i + 1]["start"]
    full = polish_voice(full / np.abs(full).max() * 0.89, out)
    sf.write(os.path.join(out, "narration.wav"), full, OUT_SR, subtype="PCM_16")
    json.dump({"project": a.project, "title": script["title"], "voice": voice, "speed": speed, "fps": 30,
               "duration": round(total, 3), "scenes": scenes, "lines": lines, "cues": all_cues},
              open(os.path.join(out, "timings.json"), "w"), indent=1)
    words_n = sum(len(l["text"].split()) for l in lines)
    print(f"voice={voice} speed={speed} duration={total:.1f}s words={words_n} "
          f"force-aligned={sum(l['anchored'] for l in lines)}/{len(lines)} lines")
    for l in lines:
        if not l["anchored"]:
            print("  (estimated timing)", l["id"], l["text"])
    for s in scenes:
        print(f"  {s['id']:<12}{s['start']:6.2f} -> {s['end']:6.2f}")


if __name__ == "__main__":
    main()
