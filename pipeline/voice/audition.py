"""Render the same lines with several Kokoro voices so a human can pick one.
Usage: python pipeline/voice/audition.py "<text>" out_dir voice1 voice2 ...
"""
import sys, os, time
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
k = Kokoro(os.path.join(HERE, "models/kokoro-v1.0.onnx"), os.path.join(HERE, "models/voices-v1.0.bin"))
text, out_dir, voices = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(out_dir, exist_ok=True)
for v in voices:
    lang = "en-gb" if v[0] == "b" else "en-us"
    t = time.time()
    samples, sr = k.create(text, voice=v, speed=1.0, lang=lang)
    sf.write(os.path.join(out_dir, f"{v}.wav"), samples, sr)
    print(v, f"{len(samples)/sr:.1f}s audio in {time.time()-t:.1f}s")
