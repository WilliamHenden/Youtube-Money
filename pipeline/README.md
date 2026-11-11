# Video pipeline

Turns a script into a finished 1080p video with narration, captions, motion graphics, sound effects and music. Everything is free and runs locally: no editing software, no paid tools.

```
projects/<id>/script.json ──► voice/tts.py ──► narration.wav + timings.json
                                   │
            audio/make_audio.py ───┤ (music bed matched to the narration; sound effects)
                                   ▼
        video/ (Remotion) ──► out/<id>-raw.mp4 ──► master.sh ──► out/<id>.mp4
```

## One-time setup

```bash
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile numpy scipy pyloudnorm pocketsphinx
```

```bash
cd pipeline/video && npm install && node scripts/extract-icons.mjs
```

Download the two Kokoro voice-model files (about 350 MB, not stored in git) into `pipeline/voice/models/`:

```bash
curl -L -o pipeline/voice/models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
```

```bash
curl -L -o pipeline/voice/models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

## Build a video

```bash
pipeline/build.sh costco-demo
```

Change the narrator without touching anything else (the visuals re-time themselves):

```bash
pipeline/build.sh costco-demo --voice am_michael
```

Check a few frames before a full render:

```bash
cd pipeline/video && node scripts/render.mjs costco-demo --stills 5,20,45
```

## How the pieces fit

| Part | What it does |
|---|---|
| `projects/<id>/script.json` | The single source of truth. `say` is what the narrator speaks, `show` is the caption. `\|` splits caption chunks, `{name}` marks a cue the visuals can sync to, `*text*` highlights caption words. |
| `voice/tts.py` | Speaks each line with Kokoro, then force-aligns the audio to the words (PocketSphinx) so every cue has an exact time. Writes `timings.json`. |
| `audio/make_audio.py` | Synthesises the sound effects and a quiet music bed, set 21 LU under the voice. |
| `video/src/lib/theme.ts` | The channel style guide: colours, fonts. |
| `video/src/components/` | The reusable library: backgrounds, captions, wipes, price tags, characters, cards, counters, charts, sound effects. `shell.tsx` is the frame every video shares. |
| `video/src/projects/<id>/` | The scenes for one video, built from the components and timed by cue names (`c.price`, `c.fees`, …). |
| `master.sh` | Normalises loudness to -14 LUFS and makes a contact sheet for review. |

## Making the next video

1. Copy `projects/costco-demo/` to `projects/<new-id>/` and rewrite `script.json` (and `sources.md`).
2. Add `pipeline/video/src/projects/<new-id>/index.tsx` with the scenes, and register it in `src/Root.tsx`.
3. Run `pipeline/build.sh <new-id>`.

Step 2 is the real work: the components are reusable, but each video's scenes are designed for its story.

## Licences
- Remotion: free for individuals and companies of up to 3 people; a company licence is needed above that.
- Kokoro voice model: Apache 2.0. PocketSphinx (word alignment): BSD-style. Open Peeps characters: CC0 (npm package MIT). Fluent Emoji: MIT. Montserrat and Inter: SIL Open Font Licence.
- Music and sound effects are synthesised by `make_audio.py`, so there is nothing to license.
