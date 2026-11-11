"""Sound design, all synthesised (no samples, no licences needed).

  python pipeline/audio/make_audio.py sfx                 -> pipeline/audio/sfx/*.wav
  python pipeline/audio/make_audio.py music <project-id>  -> projects/<id>/build/music.wav
     (length and level are matched to that project's narration)
"""
import sys, os, json
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, sosfiltfilt

SR = 48000
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def env_exp(d, tau, attack=0.002):
    t = t_(d)
    return np.minimum(t / attack, 1.0) * np.exp(-t / tau)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def sweep(f0, f1, d, curve=1.0):
    t = t_(d)
    f = f0 + (f1 - f0) * (t / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def norm(x, peak=0.7):
    return (x / (np.abs(x).max() + 1e-9) * peak).astype(np.float32)


def fade_tail(x, d=0.01):
    n = int(SR * d)
    x = x.copy()
    x[-n:] *= np.linspace(1, 0, n)
    return x


def make_sfx():
    out = {}
    # soft UI pop: quick upward blip
    out["pop"] = norm(sweep(420, 900, 0.09, 0.6) * env_exp(0.09, 0.03), 0.6)
    out["pop_low"] = norm(sweep(260, 520, 0.11, 0.6) * env_exp(0.11, 0.04), 0.6)
    # whoosh: band-passed noise with a moving centre frequency
    d = 0.5
    n = rng.standard_normal(int(SR * d))
    t = t_(d)
    parts = []
    for i, (lo, hi) in enumerate([(250, 700), (600, 1600), (1400, 3600), (3000, 7000)]):
        centre = 0.18 + i * 0.07
        parts.append(bp(n, lo, hi) * np.exp(-((t - centre) ** 2) / (2 * 0.07 ** 2)))
    out["whoosh"] = norm(fade_tail(sum(parts), 0.05), 0.55)
    # short swish for small moves
    d = 0.22
    n = rng.standard_normal(int(SR * d))
    t = t_(d)
    out["swish"] = norm(fade_tail(bp(n, 1500, 6000) * np.exp(-((t - 0.09) ** 2) / (2 * 0.04 ** 2)), 0.03), 0.4)
    # tick + counter roll (ticks that slow down as the number settles)
    tick = hp(rng.standard_normal(int(SR * 0.012)), 2000) * env_exp(0.012, 0.003, 0.0005)
    tick = tick + 0.6 * np.sin(2 * np.pi * 2400 * t_(0.012)) * env_exp(0.012, 0.004)
    out["tick"] = norm(tick, 0.5)
    for name, d in (("roll", 1.3), ("roll_short", 0.8)):
        roll = np.zeros(int(SR * (d + 0.1)))
        pos, gap = 0.0, 0.028
        while pos < d:
            i = int(pos * SR)
            g = 0.45 + 0.55 * (pos / d)
            roll[i : i + len(tick)] += tick * g
            gap *= 1.07
            pos += gap
        out[name] = norm(roll, 0.45)
    # bell ding (reveal) and two-note "cha-ching"
    def bell(f, d=1.1, tau=0.28):
        t = t_(d)
        x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (tau / (1 + 0.6 * i)))
                for i, (m, a) in enumerate([(1, 1.0), (2.0, 0.45), (2.76, 0.3), (5.4, 0.12)]))
        return x * np.minimum(t / 0.002, 1)
    out["ding"] = norm(fade_tail(bell(1318.5), 0.05), 0.55)
    cc = np.zeros(int(SR * 1.3))
    a, b = bell(1568.0, 0.5, 0.12), bell(2093.0, 1.1, 0.3)
    cc[: len(a)] += a * 0.8
    o = int(SR * 0.09)
    cc[o : o + len(b)] += b
    shimmer = hp(rng.standard_normal(int(SR * 0.25)), 6000) * env_exp(0.25, 0.06)
    cc[o : o + len(shimmer)] += shimmer * 0.25
    out["chaching"] = norm(fade_tail(cc, 0.05), 0.6)
    # stamp thud
    d = 0.35
    thud = sweep(120, 45, d, 0.5) * env_exp(d, 0.07) + 0.5 * lp(rng.standard_normal(int(SR * d)), 900) * env_exp(d, 0.025)
    out["thud"] = norm(fade_tail(thud, 0.03), 0.8)
    # riser before a big reveal
    d = 0.9
    t = t_(d)
    n = rng.standard_normal(int(SR * d))
    rise = bp(n, 800, 5000) * (t / d) ** 2.2 * 0.6 + sweep(180, 720, d, 2.0) * (t / d) ** 2 * 0.35
    out["rise"] = norm(fade_tail(rise, 0.015), 0.5)
    # impact for big reveals: low boom + bright transient
    d = 0.9
    boom = sweep(95, 38, d, 0.4) * env_exp(d, 0.22) + 0.25 * hp(rng.standard_normal(int(SR * d)), 3000) * env_exp(d, 0.03)
    out["impact"] = norm(fade_tail(boom, 0.05), 0.8)
    os.makedirs(os.path.join(HERE, "sfx"), exist_ok=True)
    for name, x in out.items():
        sf.write(os.path.join(HERE, "sfx", f"{name}.wav"), x, SR, subtype="PCM_16")
    print("sfx:", ", ".join(f"{k} {len(v)/SR:.2f}s" for k, v in out.items()))


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def make_music(project, under_voice_lu=21.0):
    import pyloudnorm as pyln
    b = os.path.join(ROOT, "projects", project, "build")
    T = json.load(open(os.path.join(b, "timings.json")))
    voice, vsr = sf.read(os.path.join(b, "narration.wav"))
    dur = T["duration"]
    N = int(SR * dur)
    L, R = np.zeros(N), np.zeros(N)
    bpm = 92.0
    beat = 60 / bpm
    bar = 4 * beat
    # Am9 - Fmaj7 - Cmaj7 - Gadd9, one bar each
    chords = [
        (45, [57, 60, 64, 71]),
        (41, [57, 60, 64, 67]),
        (48, [55, 59, 64, 67]),
        (43, [55, 59, 62, 69]),
    ]

    def add(buf, start, x, g=1.0):
        i = int(start * SR)
        if i >= N:
            return
        x = x[: N - i]
        buf[i : i + len(x)] += x * g

    nbars = int(np.ceil(dur / bar)) + 1
    for bi in range(nbars):
        bass, notes = chords[bi % 4]
        t0 = bi * bar
        # pad: slow attack, detuned sines
        d = bar + 1.2
        t = t_(d)
        e = np.minimum(t / 0.9, 1) * np.minimum((d - t) / 1.2, 1)
        for j, n in enumerate(notes):
            f = midi(n)
            v = sum(np.sin(2 * np.pi * f * det * t + ph) for det, ph in ((0.997, 0.3 * j), (1.0, 1.1 * j), (1.004, 2.0 * j)))
            v = v + 0.18 * np.sin(2 * np.pi * 2 * f * t)
            pan = 0.5 + 0.3 * np.sin(j * 2.1)
            add(L, t0, v * e, 0.10 * (1 - pan))
            add(R, t0, v * e, 0.10 * pan)
        # sub bass
        tb = t_(bar)
        eb = np.minimum(tb / 0.03, 1) * np.exp(-tb / 1.6)
        bx = np.sin(2 * np.pi * midi(bass) * tb) * eb
        add(L, t0, bx, 0.26)
        add(R, t0, bx, 0.26)
        # soft kick on beats 1 and 3
        for kb in (0, 2):
            k = sweep(110, 45, 0.22, 0.4) * env_exp(0.22, 0.06)
            add(L, t0 + kb * beat, k, 0.22)
            add(R, t0 + kb * beat, k, 0.22)
        # pluck arpeggio, 8th notes, with a ping-pong echo
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for s, pi in enumerate(pattern):
            n = notes[pi] + 12
            tp = t_(0.5)
            px = (np.sin(2 * np.pi * midi(n) * tp) + 0.3 * np.sin(2 * np.pi * 2 * midi(n) * tp)) * env_exp(0.5, 0.11, 0.004)
            vel = (0.85 if s % 2 == 0 else 0.55) * (0.8 + 0.2 * np.sin(bi * 1.7 + s))
            ts = t0 + s * beat / 2
            for echo, g in ((0, 1.0), (1, 0.42), (2, 0.2)):
                te = ts + echo * beat * 0.75
                left = (echo + s) % 2 == 0
                add(L, te, px, 0.085 * vel * g * (1.0 if left else 0.35))
                add(R, te, px, 0.085 * vel * g * (0.35 if left else 1.0))
    mix = np.stack([L, R], axis=1)
    sos = butter(2, 5200, btype="low", fs=SR, output="sos")
    mix = sosfiltfilt(sos, mix, axis=0)
    # intro/outro fades
    fi, fo = int(SR * 1.2), int(SR * 2.0)
    mix[:fi] *= np.linspace(0, 1, fi)[:, None]
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    meter_v, meter_m = pyln.Meter(vsr), pyln.Meter(SR)
    lv, lm = meter_v.integrated_loudness(voice), meter_m.integrated_loudness(mix)
    gain = 10 ** ((lv - under_voice_lu - lm) / 20)
    mix = (mix * gain).astype(np.float32)
    sf.write(os.path.join(b, "music.wav"), mix, SR, subtype="PCM_16")
    print(f"music: {dur:.1f}s, voice {lv:.1f} LUFS, music {lv - under_voice_lu:.1f} LUFS, peak {np.abs(mix).max():.3f}")


if __name__ == "__main__":
    if sys.argv[1] == "sfx":
        make_sfx()
    else:
        make_music(sys.argv[2])
