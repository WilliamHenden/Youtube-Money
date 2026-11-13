"""Sound director: decides which sounds play, mixes the soundtrack, and prints the sound report.

  python pipeline/audio/director.py <project> [--cut NAME]

Reads projects/<id>/build/<cut>/timings.json + narration.wav and writes audio.wav (voice + music + effects)
and sound-report.txt next to them.

The script never names a sound file. It asks for a ROLE at a moment, and this file applies the channel's rules
(docs/05-production-standards.md, section 3):

  roles        transition  a scene change. Asked for automatically; a scene can say "sound": "none".
               pop         something appears.            impact  something lands.
               draw        a line or border is drawn.    tick    a small step or number landing.
               reveal      reserved for the biggest moments. Only plays in a scene marked "major": true.
               sting       the channel's musical signature, for the intro sting and the end card. Major scenes only.
  density      at most one sound every MIN_GAP seconds. When two collide, the more important one stays.
  cooldown     the same file never plays twice within 30 seconds; variants of a role are rotated.
  beats        nothing plays during a scripted beat, and the music drops out for it.
  counters     make no sound unless the script asks for a tick.
"""
import sys, os, json, argparse, subprocess
import numpy as np
import soundfile as sf
import pyloudnorm as pyln

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
LIB = os.path.join(ROOT, "pipeline", "audio", "library")
SR = 48000
MIN_GAP = 6.0       # seconds between any two effects
COOLDOWN = 30.0     # seconds before the same file may play again
MAX_REVEALS = 4     # per video
PRIORITY = {"reveal": 5, "sting": 5, "impact": 4, "transition": 3, "draw": 2, "pop": 2, "tick": 1, "riser": 1}


def db(x):
    return 10 ** (x / 20)


def load(path):
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    if sr != SR:
        from scipy.signal import resample_poly
        x = resample_poly(x, SR, sr, axis=0).astype(np.float32)
    return x


def plan_effects(tm, lib, cfg):
    """Returns (played, dropped). Each is a list of dicts describing one request."""
    cues, beats = tm["cues"], tm.get("beats", [])
    reqs = []
    for i, sc in enumerate(tm["scenes"]):
        role = sc.get("sound", "transition" if i > 0 else "none")
        if role != "none":
            reqs.append({"role": role, "at": sc["start"], "scene": sc["id"], "why": "scene change", "major": bool(sc.get("major"))})
        for s in sc.get("sounds", []):
            if "cue" in s and s["cue"] not in cues:
                raise SystemExit(f"Scene {sc['id']} asks for a sound on the cue {{{s['cue']}}}, which isn't in its lines.")
            at = (cues[s["cue"]] if "cue" in s else sc["start"]) + s.get("offset", 0)
            reqs.append({"role": s["role"], "at": at, "scene": sc["id"], "why": s.get("cue", "scene"), "major": bool(sc.get("major"))})
    for r in reqs:  # a sound asked for at the end of a beat lands as the silence ends, on the payoff
        for bt in beats:
            if bt["start"] - 0.05 <= r["at"] <= bt["end"] + 0.15:
                r["at"] = bt["end"] + 0.03
                r["not_before"] = bt["end"]  # a sound with a lead-in starts as the silence ends, not inside it
    for r in reqs:
        if r["role"] not in lib["roles"]:
            raise SystemExit(f"Unknown sound role \"{r['role']}\". Roles: {', '.join(lib['roles'])}")
    played, dropped = [], []
    # 1. reveals only on major moments, and only a few per video
    keep = []
    for r in sorted(reqs, key=lambda r: r["at"]):
        if r["role"] in ("reveal", "sting") and not r["major"]:
            dropped.append(dict(r, reason=f"{r['role']} asked for in a scene not marked major"))
        elif r["role"] == "reveal" and sum(1 for k in keep if k["role"] == "reveal") >= MAX_REVEALS:
            dropped.append(dict(r, reason=f"more than {MAX_REVEALS} reveals in one video"))
        else:
            keep.append(r)
    # 2. density: most important first; a sound is dropped if another already sits within MIN_GAP
    accepted = []
    for r in sorted(keep, key=lambda r: (-PRIORITY[r["role"]], r["at"])):
        clash = next((a for a in accepted if abs(a["at"] - r["at"]) < cfg["minGap"]), None)
        if clash:
            dropped.append(dict(r, reason=f"within {cfg['minGap']:.0f}s of the {clash['role']} at {clash['at']:.1f}s"))
        else:
            accepted.append(r)
    # 3. in time order: rotate variants, apply the cooldown, keep beats silent
    last_used, turn = {}, {}
    for r in sorted(accepted, key=lambda r: r["at"]):
        variants = lib["roles"][r["role"]]
        k = turn.get(r["role"], 0)
        order = variants[k % len(variants):] + variants[: k % len(variants)]
        choice = next((v for v in order if r["at"] - last_used.get(v, -1e9) >= COOLDOWN), None)
        if choice is None:
            dropped.append(dict(r, reason="every variant of this role played in the last 30s"))
            continue
        s = lib["sounds"][choice]
        start = max(r["at"] - s["sync"], r.get("not_before", 0), 0)
        end = start + s["duration"]
        beat = next((b for b in beats if start < b["end"] - 0.02 and end > b["start"] + 0.05), None)
        if beat:
            dropped.append(dict(r, reason="would sound during a scripted beat"))
            continue
        speech = any(start < l["end"] and end > l["start"] for l in tm["lines"])
        gain = cfg["trim"] + (s["under_voice_db"] if speech else 0) + (cfg["revealBoost"] if r["role"] in ("reveal", "sting") else 0)
        turn[r["role"]] = k + 1 + order.index(choice)
        last_used[choice] = r["at"]
        played.append(dict(r, file=choice, start=round(start, 3), gain=round(gain, 1), over_speech=speech))
    return played, dropped


def music_bed(tm, cfg, voice_lufs, n):
    track = cfg.get("track")
    path = os.path.join(LIB, "music", f"{track}.mp3") if track else None
    if not path or not os.path.exists(path):
        return np.zeros((n, 2), dtype=np.float32), f"none ({'file missing: ' + str(track) if track else 'no track chosen'})"
    tmp = os.path.join(os.path.dirname(path), "_decode.wav")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(cfg.get("start", 0)), "-i", path, "-ar", str(SR), "-ac", "2", tmp], check=True)
    m = load(tmp)
    os.remove(tmp)
    while len(m) < n:  # loop with a two-second crossfade
        x = int(SR * 2)
        ramp = np.linspace(0, 1, x)[:, None]
        m = np.concatenate([m[:-x], m[-x:] * (1 - ramp) + m[:x] * ramp, m[x:]])
    m = m[:n]
    lm = pyln.Meter(SR).integrated_loudness(m)
    m = m * db(voice_lufs - cfg.get("underVoice", 22) - lm)
    t = np.arange(n) / SR
    env = np.minimum(t / 1.5, 1) * np.minimum((t[-1] - t) / 2.5, 1)
    swell = np.zeros(n)
    for sc in tm["scenes"]:  # lift the music a little in scenes with no narration (title card, end card)
        if not any(l["scene"] == sc["id"] for l in tm["lines"]):
            swell = np.maximum(swell, np.clip((t - sc["start"]) / 0.5, 0, 1) * np.clip((sc["end"] - t) / 0.6, 0, 1))
    env = env * db(cfg.get("swell", 5) * swell)
    for b in tm.get("beats", []):  # silence for the beat: out as the last word ends, back as the payoff lands
        env = env * (1 - np.clip((t - (b["start"] - 0.05)) / 0.3, 0, 1) * np.clip((b["end"] + 0.5 - t) / 0.6, 0, 1))
    return (m * env[:, None]).astype(np.float32), f"{track} at {cfg.get('underVoice', 22)} LU under the voice"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--cut", default="full")
    a = ap.parse_args()
    pdir = os.path.join(ROOT, "projects", a.project)
    b = os.path.join(pdir, "build", a.cut)
    script = json.load(open(os.path.join(pdir, "script.json")))
    tm = json.load(open(os.path.join(b, "timings.json")))
    lib = json.load(open(os.path.join(LIB, "sounds.json")))
    cfg = {"minGap": MIN_GAP, "trim": -3.0, "revealBoost": 2.0, **script.get("sound", {})}  # trim: effects level in dB; a script can set "sound": {"trim": -6}
    cfg["minGap"] = max(cfg["minGap"], MIN_GAP)  # a project may ask for fewer sounds, never more
    mcfg = {**script.get("music", {}), **script.get("cuts", {}).get(a.cut, {}).get("music", {})}

    voice = load(os.path.join(b, "narration.wav"))
    n = len(voice)
    spoken = np.abs(voice).max() > 0
    voice_lufs = pyln.Meter(SR).integrated_loudness(voice) if spoken else -18.0
    played, dropped = plan_effects(tm, lib, cfg)
    music, music_note = music_bed(tm, mcfg, voice_lufs, n)
    mix = voice + music
    for p in played:
        x = load(os.path.join(LIB, lib["sounds"][p["file"]]["file"])) * db(p["gain"])
        i = int(p["start"] * SR)
        x = x[: max(n - i, 0)]
        mix[i: i + len(x)] += x
    peak = np.abs(mix).max()
    if peak > 0.97:
        mix *= 0.97 / peak
    sf.write(os.path.join(b, "audio.wav"), mix, SR, subtype="PCM_16")

    # ---- report ----
    dur = tm["duration"]
    times = sorted(p["at"] for p in played)
    gaps = [b2 - a2 for a2, b2 in zip(times, times[1:])]
    by_file = {}
    for p in played:
        by_file.setdefault(p["file"], []).append(p["at"])
    repeat_gaps = [t2 - t1 for ts in by_file.values() for t1, t2 in zip(ts, ts[1:])]
    reveals = [p for p in played if p["role"] in ("reveal", "sting")]
    scene_of = {s["id"]: s for s in tm["scenes"]}
    checks = [
        ("No file repeated within 30 seconds", not repeat_gaps or min(repeat_gaps) >= COOLDOWN,
         f"closest repeat {min(repeat_gaps):.0f}s apart" if repeat_gaps else "no file played twice"),
        (f"At most one sound every {cfg['minGap']:.0f} seconds", not gaps or min(gaps) >= cfg["minGap"] - 1e-6,
         f"closest two sounds {min(gaps):.1f}s apart" if gaps else "fewer than two sounds"),
        ("Reveal sounds only on major moments", all(scene_of[p["scene"]].get("major") for p in reveals),
         f"{len(reveals)} reveal(s): " + (", ".join(f"{p['scene']} at {p['at']:.1f}s" for p in reveals) or "none")),
        ("Silence during every scripted beat", True, f"{len(tm.get('beats', []))} beat(s): " + (", ".join(f"{x['start']:.1f}-{x['end']:.1f}s" for x in tm.get("beats", [])) or "none")),
        ("Counters silent", not any(p["role"] == "tick" for p in played), "no tick sounds were asked for" if not any(p["role"] == "tick" for p in played) else "ticks were asked for in the script"),
    ]
    L = [f"SOUND REPORT: {a.project} ({a.cut}), {dur:.1f} seconds", "",
         f"Music: {music_note}",
         f"Effects played: {len(played)} (one every {dur / max(len(played), 1):.0f}s on average). Requests dropped by the rules: {len(dropped)}.", "",
         "Played:", f"  {'time':>6}  {'role':<11}{'file':<28}{'level':>7}  scene"]
    for p in sorted(played, key=lambda p: p["at"]):
        L.append(f"  {p['at']:6.1f}  {p['role']:<11}{p['file']:<28}{p['gain']:5.1f}dB  {p['scene']} ({p['why']}){', under speech' if p['over_speech'] else ''}")
    L += ["", "How often each file played:"] + [f"  {len(ts)}x  {f}" for f, ts in sorted(by_file.items(), key=lambda kv: -len(kv[1]))]
    if dropped:
        L += ["", "Dropped:"] + [f"  {d['at']:6.1f}  {d['role']:<11}{d['scene']} ({d['why']}): {d['reason']}" for d in sorted(dropped, key=lambda d: d["at"])]
    L += ["", "Checks:"] + [f"  {'PASS' if ok else 'FAIL'}  {name} ({detail})" for name, ok, detail in checks]
    report = "\n".join(L)
    open(os.path.join(b, "sound-report.txt"), "w").write(report + "\n")
    json.dump({"played": played, "dropped": dropped}, open(os.path.join(b, "sound-plan.json"), "w"), indent=1)
    print(report)
    if not all(ok for _, ok, _ in checks):
        raise SystemExit("Sound rules failed. See the report above.")


if __name__ == "__main__":
    main()
