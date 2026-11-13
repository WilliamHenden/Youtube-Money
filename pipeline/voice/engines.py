"""Voice engines. Each one turns a piece of text into audio: synth(text) -> (float32 samples, sample_rate).

The pipeline handles everything else (pauses, [beat] marks, word timing, loudness), so every engine gets the same
scripted pauses and the visuals re-time themselves whichever engine is used.

  kokoro      Kokoro v1.0, Apache 2.0. Fast (several times faster than real time on this machine). Clear, limited expression.
  chatterbox  Chatterbox by Resemble AI, MIT licence. More expressive, has an "exaggeration" control.
              Slow without a graphics card. Model files (about 3.3 GB) go in pipeline/voice/models/chatterbox/.
  elevenlabs  Paid (not wired in). Would be a third engine here if the owner chooses it.
"""
import os, re
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))


class Kokoro:
    name = "kokoro"

    def __init__(self, voice="af_heart", speed=1.0, lang=None, **_):
        from kokoro_onnx import Kokoro as K
        self.k = K(os.path.join(HERE, "models/kokoro-v1.0.onnx"), os.path.join(HERE, "models/voices-v1.0.bin"))
        self.voice, self.speed = voice, speed
        self.lang = lang or ("en-gb" if voice[0] == "b" else "en-us")
        self.id = f"kokoro:{voice}:{speed}"

    def synth(self, text):
        x, sr = self.k.create(text, voice=self.voice, speed=self.speed, lang=self.lang)
        return np.asarray(x, dtype=np.float32), sr


class Chatterbox:
    name = "chatterbox"
    SR, START, STOP = 24000, 6561, 6562

    def __init__(self, voice="default", exaggeration=0.5, speed=1.0, threads=4, **_):
        import onnxruntime as ort
        from tokenizers import Tokenizer
        d = os.path.join(HERE, "models/chatterbox")
        if not os.path.exists(os.path.join(d, "onnx/language_model.onnx_data")):
            raise SystemExit("Chatterbox model files are missing. See pipeline/README.md, 'Voices'.")
        so = ort.SessionOptions()
        so.intra_op_num_threads = threads
        so.log_severity_level = 3
        self.enc, self.emb, self.lm, self.dec = (ort.InferenceSession(os.path.join(d, "onnx", n + ".onnx"), so, providers=["CPUExecutionProvider"])
                                                 for n in ("speech_encoder", "embed_tokens", "language_model", "conditional_decoder"))
        self.tok = Tokenizer.from_file(os.path.join(d, "tokenizer.json"))
        self.ex, self.speed = float(exaggeration), speed
        self.id = f"chatterbox:{voice}:{exaggeration}:{speed}"
        ref = os.path.join(d, "default_voice.wav") if voice == "default" else voice
        import soundfile as sf
        from scipy.signal import resample_poly
        a, sr = sf.read(ref, dtype="float32")
        if a.ndim > 1:
            a = a.mean(axis=1)
        if sr != self.SR:
            a = resample_poly(a, self.SR, sr).astype(np.float32)
        self.cond = self.enc.run(None, {"audio_values": a[None, :]})  # cond_emb, prompt_token, ref_x_vector, prompt_feat
        self.kv_names = [i.name for i in self.lm.get_inputs() if i.name.startswith("past_key_values")]

    @staticmethod
    def _norm(text):
        text = re.sub(r"\s+", " ", text).strip()
        for a, b in (("…", ", "), ("—", ", "), ("–", ", "), ("“", '"'), ("”", '"'), ("‘", "'"), ("’", "'")):
            text = text.replace(a, b)
        if text and text[0].islower():
            text = text[0].upper() + text[1:]
        if text and text[-1] not in ".!?,":
            text += "."
        return text

    def _one(self, text):
        ids = np.array([self.tok.encode(self._norm(text)).ids], dtype=np.int64)
        pos = np.where(ids >= self.START, 0, np.arange(ids.shape[1])[None, :] - 1)
        ex = np.array([self.ex], dtype=np.float32)
        cond_emb, prompt_token, xvec, feat = self.cond
        x = np.concatenate((cond_emb, self.emb.run(None, {"input_ids": ids, "position_ids": pos, "exaggeration": ex})[0]), axis=1)
        past = {n: np.zeros([1, 16, 0, 64], dtype=np.float32) for n in self.kv_names}
        mask = np.ones((1, x.shape[1]), dtype=np.int64)
        gen = [self.START]
        limit = min(1500, 120 + int(len(text) * 4.0))  # about 25 tokens per second of speech
        for i in range(limit):
            logits, *present = self.lm.run(None, dict(inputs_embeds=x, attention_mask=mask, **past))
            lg = logits[0, -1, :].copy()
            seen = np.unique(gen)
            lg[seen] = np.where(lg[seen] < 0, lg[seen] * 1.2, lg[seen] / 1.2)  # repetition penalty
            nxt = int(np.argmax(lg))
            gen.append(nxt)
            if nxt == self.STOP:
                break
            x = self.emb.run(None, {"input_ids": np.array([[nxt]], dtype=np.int64), "position_ids": np.array([[i + 1]], dtype=np.int64), "exaggeration": ex})[0]
            mask = np.concatenate([mask, np.ones((1, 1), dtype=np.int64)], axis=1)
            past = dict(zip(self.kv_names, present))
        toks = np.array([gen[1:-1] if gen[-1] == self.STOP else gen[1:]], dtype=np.int64)
        wav = self.dec.run(None, {"speech_tokens": np.concatenate([prompt_token, toks], axis=1), "speaker_embeddings": xvec, "speaker_features": feat})[0]
        return np.squeeze(wav).astype(np.float32)

    def synth(self, text):
        # Long passages drift, so speak one sentence at a time and join them with a natural breath.
        parts = [p for p in re.split(r"(?<=[.!?])\s+", text.strip()) if p]
        out = []
        for i, p in enumerate(parts):
            w = self._one(p)
            idx = np.where(np.abs(w) > 0.01)[0]
            if len(idx):
                w = w[max(idx[0] - 600, 0): idx[-1] + 2400]
            out.append(w)
            if i < len(parts) - 1:
                out.append(np.zeros(int(self.SR * 0.28), dtype=np.float32))
        x = np.concatenate(out)
        if self.speed != 1.0:
            import subprocess, tempfile, soundfile as sf
            with tempfile.TemporaryDirectory() as td:
                sf.write(td + "/a.wav", x, self.SR)
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", td + "/a.wav", "-af", f"atempo={self.speed}", td + "/b.wav"], check=True)
                x, _ = sf.read(td + "/b.wav", dtype="float32")
        return x, self.SR


def make(engine="kokoro", **kw):
    if engine == "kokoro":
        return Kokoro(**kw)
    if engine == "chatterbox":
        return Chatterbox(**kw)
    if engine == "elevenlabs":
        raise SystemExit("ElevenLabs is the paid option and is not wired in yet. It needs an API key from the owner.")
    raise SystemExit(f"Unknown voice engine: {engine}")
