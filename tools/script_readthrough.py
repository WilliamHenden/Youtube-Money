"""Free read-through of a project's script with the local Kokoro voice, to judge a draft by ear before spending ElevenLabs credits.

  .venv/bin/python tools/script_readthrough.py projects/<id>/brief.md out/<id>-read-through.mp3 [voice] [speed]

Reads section 3 of the brief (from "### Hook" to "## 4. Notes for the owner"), pauses about a second at each [beat],
plays the channel sting where the intro sting goes, and saves an MP3. Voice defaults to bm_george (British male) at speed 1.1.
"""
import sys, re, os, subprocess
import numpy as np, soundfile as sf
sys.path.insert(0, "pipeline/voice")
import engines
brief, out = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "bm_george"
speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.1
s = open(brief, encoding="utf-8").read()
body = s[s.index("### Hook"): s.index("## 4. Notes for the owner")]
eng = engines.make("kokoro", voice=voice, speed=speed)
SR = 24000
sil = lambda sec: np.zeros(int(SR * sec), dtype=np.float32)
sting, _ = sf.read("pipeline/audio/library/sfx/sting-warm-short.wav", dtype="float32", always_2d=True)
from scipy.signal import resample_poly
sting = resample_poly(sting.mean(axis=1), SR, 48000).astype(np.float32) * 0.6
parts = [sil(0.4)]
words = 0
for sec in re.split(r"\n(?=### )", body.strip()):
    name = sec.split("\n")[0][4:]
    if "sting" in name.lower():
        parts += [sil(0.3), sting, sil(1.2)]
        continue
    text = re.sub(r"^###.*$", "", sec, flags=re.M)
    text = re.sub(r"\*\(.*?\)\*", "", text, flags=re.S)
    for para in [p.strip() for p in text.split("\n\n") if p.strip()]:
        for i, piece in enumerate(para.split("`[beat]`")):
            piece = " ".join(piece.split())
            if not piece:
                continue
            if i > 0:
                parts.append(sil(1.0))
            x, sr = eng.synth(piece)
            words += len(piece.split())
            idx = np.where(np.abs(x) > 0.01)[0]
            parts.append(x[max(idx[0] - 240, 0): idx[-1] + 1200] if len(idx) else x)
        parts.append(sil(0.45))
    parts.append(sil(0.5))
y = np.concatenate(parts)
wav = out + ".wav"
sf.write(wav, y, SR)
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-ac", "1", "-b:a", "96k", out], check=True)
os.remove(wav)
print(f"{words} words, {len(y)/SR/60:.2f} minutes, {words/(len(y)/SR/60):.0f} words a minute overall")
