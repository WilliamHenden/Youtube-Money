# Video pipeline

Turns a script into a finished video with narration, captions, motion graphics, real photos, sound effects and music. A video is one file, `projects/<id>/script.json`: the words, plus a **storyboard** that names a ready-made scene template for each part. No scene code is written per video.

```
projects/<id>/script.json
   │  media/commons.py     photos from Wikimedia Commons, with licence and credit
   │  voice/tts.py         narration.wav + timings.json (every word timed, pauses inserted)
   │  audio/director.py    audio.wav (voice + music + effects) and the sound report
   │  video/ (Remotion)    out/<name>-raw.mp4, drawn from the templates
   ▼  master.sh            out/<name>.mp4 at YouTube loudness, plus a contact sheet
```

## Build a video

```bash
pipeline/build.sh norway-fund --cut sample
```

- Leave out `--cut` to build the whole script. A **cut** is a named selection of scenes in the script: a sample, or a vertical Short.
- `--no-render` stops after the sound step, which takes seconds. Use it while writing a storyboard.
- `--engine chatterbox` or `--voice bm_george` changes the narrator. The visuals re-time themselves.

Check the pictures before rendering (one image, a frame every two seconds):

```bash
cd pipeline/video && node scripts/render.mjs norway-fund --cut sample --sheet 2
```

Rendering takes about 7 minutes per minute of video on this machine, so check stills first.

Change only the sound of a video that is already rendered (a different music track, quieter effects), without rendering the pictures again:

```bash
pipeline/remix.sh norway-fund --cut sample
```

Music level is `"music": { "underVoice": 22 }` (bigger is quieter). Effects level is `"sound": { "trim": -3 }` in decibels (more negative is quieter).

## What a build produces (in `out/`)

| File | What it is |
|---|---|
| `<name>.mp4` | The finished video, −14 LUFS |
| `<name>-contact-sheet.jpg` | A frame every 2 seconds, for review |
| `<name>-sound-report.txt` | Every sound that played, what was dropped and why, and the rule checks |
| `<name>-credits.txt` | Photo and music credits to paste into the YouTube description |

`<name>` is the project id, or `<project>-<cut>`.

## Writing a storyboard

`projects/template-gallery/script.json` shows every template once and is the best thing to copy from. The shape:

```json
{
  "id": "my-video", "title": "…", "channel": "MONEY MECHANICS",
  "voice": { "engine": "kokoro", "voice": "af_heart", "speed": 0.95 },
  "music": { "track": "deliberate-thought", "underVoice": 22 },
  "pauses": { "line": 0.38, "scene": 0.75, "beat": 1.2 },
  "photos": { "rig": { "file": "File:Exact name on Commons.jpg" }, "coast": { "search": "words to search for" } },
  "scenes": [
    { "id": "the-question", "template": "question", "tone": "cream",
      "props": { "text": "So what did Norway do that Britain didn't?", "accent": "Norway", "cue": "ask" },
      "lines": [ { "say": "{ask}So what did Norway do | that Britain didn't?", "show": "So what did Norway do | that Britain didn't?", "beat": 1.3 } ] }
  ],
  "cuts": { "short-1": { "format": "tall", "scenes": ["the-question", { "id": "extra", "template": "…", "lines": [] }] } }
}
```

**Lines**
- `say` is spoken, `show` is the caption. `|` splits caption chunks (same number in both). `*words*` in `show` are highlighted.
- `{name}` in `say` marks a **cue**: the moment that word is spoken. Templates use cues to time what appears (`"cue": "name"`). Cue names must be unique in the script. Anything without a cue appears in turn, evenly spaced.
- Numbers in `say` are written as spoken ("two point three trillion"). No dotted abbreviations.

**Pauses** (the pipeline inserts the silence, so they work with every voice)
- `"beat": 1.3` on a line, or `[beat]` / `[beat 1.3]` inside `say`: a held silence. Music and effects drop out, and the picture holds until the next word. This is the question → beat → payoff device. Use it 3 or 4 times a video.
- `"pause": 0.8` on a line: a plain longer gap. Music keeps playing.
- `"hold": 3` on a scene with no lines: a silent scene (title card, subscribe moment, end card).

**Scenes**
- `template` and `props`: see the table below. `tone` is `navy` or `cream`.
- `"enter": "fade"` or `"cut"` replaces the default wipe.
- `"major": true` marks one of the video's 2–4 biggest moments. Only these may use the reveal sound.
- `"sound"`: the sound at the scene change. Default `transition`; `none` for silence; `impact` or `reveal` for emphasis.
- `"sounds": [{ "cue": "name", "role": "pop" }]`: a sound inside the scene.
- `"bugIn": true`: the channel mark starts large in the middle and travels to its corner as the scene opens (one of the intro options).
- `"tag": "…"`: a label in the corner, for demo reels only.
- `"tall": { … }` inside `props`: settings that replace the wide ones in vertical videos (a map's centre, for example).

**Rules to follow when storyboarding** (from `docs/05-production-standards.md`): change the kind of picture every 20–40 seconds, never use the same template twice in a row, and ask for few sounds. The sound director will drop extra ones anyway.

## The templates

Each has a 16:9 and a 9:16 layout. Code: `video/src/storyboard/`.

| Template | For | Main settings (`props`) |
|---|---|---|
| `title` | Title card | `lines[]`, `accent` (which line is big), `kicker` |
| `chapter` | Chapter card | `number`, `title`, `kicker` |
| `number` | Big number that counts up (silently) | `label`, `value`, `prefix`, `suffix`, `unit`, `decimals`, `caption`, `cue`, `source` |
| `bars` | Bar comparison, 2–4 bars | `title`, `bars[{label, value, display, highlight, cue}]`, `note` |
| `chart` | Line or area chart over time | `title`, `points[[x, y]]`, `xTicks`, `yTicks`, `ySuffix`, `cue`, `annotations[{x, label}]` |
| `timeline` | Events along a line | `title`, `events[{label, text, cue, highlight}]` |
| `map` | Countries, a drawn border, labelled points, zoom | `center`, `span`, `countries[{name, label, color, labelAt}]`, `lines[{points, cue, label}]`, `points[{lon, lat, label, cue, kind}]`, `zoomTo{center, span, at or cue, dur}` |
| `photo` | A real photo with slow movement | `photo`, `kicker`, `title`, `titleCue`, `caption`, `move`, `focus`. The credit is added automatically. |
| `split` | Two sides compared | `kicker`, `left{…}`, `right{…}`: `flag`, `label`, `value` or `text`, `unit`, `caption`, `cue`, `color` |
| `icons` | 2–4 items appearing in turn | `title`, `items[{icon, label, text, cue}]` |
| `question` | The question before a beat | `kicker`, `text`, `accent`, `cue` |
| `answer` | The payoff after a beat | `kicker`, `text`, `sub`, `cue` |
| `quote` | One sentence, large | `text`, `accent`, `by`, `kicker`, `cue` |
| `names` | Many names resolving into one owner or number | `title`, `names[]`, `resolve{label, text, caption, cue}` |
| `flow` | Simple diagram: source → pot → spending | `title`, `nodes[{icon, label, sub, cue, color}]`, `links[]` |
| `clip` | Real video footage, silent, under the narration | `clip` (key from the script's `clips`), `start`, `rate`, plus the same settings as `photo` |
| `ident` | The three-second channel sting | `name`, `tagline` |
| `thumb` | A thumbnail, rendered as a still | `layout` (`flags`, `photo` or `map`) and its words |
| `tank` | A pot that fills while a tap lets out a little: saving the capital, spending the return | `title`, `inLabel`, `tankLabel`, `rate`, `outLabel`, `fillCue`, `tapCue` |
| `subscribe` | The five-second subscribe moment | `line`, `sub`, `cue` (same design every time) |
| `end` | End card with room for YouTube's end-screen elements | `kicker`, `title` |

Drawn icons, in the channel's own style, are named `draw:rig`, `draw:contract`, `draw:fine`, `draw:barrel`, `draw:bank`, `draw:house` and `draw:clock` (add more in `storyboard/icons-drawn.tsx`). Other icons are Fluent Emoji. To use a new one, add its name to `video/src/icons/list.json` and run `node scripts/extract-icons.mjs` in `pipeline/video`. Flags available: `norway`, `uk`, `usa` (drawn in `storyboard/kit.tsx`).

A custom scene for a video's biggest moment is a new template: write the component, add it to the list in `storyboard/Storyboard.tsx`, and name it in the storyboard.

## Sound

The script asks for a **role**, never a file. `audio/director.py` chooses the file and enforces the rules:

| Rule | What happens |
|---|---|
| Roles | `transition`, `pop`, `impact`, `draw`, `tick`, `reveal`, and `sting` (the channel's musical signature, for the intro sting and end card), each with 3–5 variants that rotate |
| Density | At most one effect every 6 seconds. When two collide, the more important one stays. |
| Cooldown | The same file never plays twice within 30 seconds |
| Reveal and sting | Only in a scene marked `major`; at most 4 reveals a video |
| Beats | Nothing plays during a scripted beat, and the music drops out |
| Counters | Silent unless the script asks for a `tick` |

The build fails if a rule is broken, and prints the sound report either way. Effects and music are in `audio/library/`; every file's licence is in `audio/LICENCES.md`.

## Photos

```bash
.venv/bin/python pipeline/media/commons.py search "Ekofisk oil platform"
```

lists photos on Wikimedia Commons that are safe to use (public domain, CC0, CC BY). Name the chosen file in the script's `photos`, and the build downloads it and records its licence in `projects/<id>/photos/credits.json`. Share-alike, non-commercial and no-derivatives photos are refused. Commons limits how fast it can be asked; if it answers "too many requests", wait a few minutes. **Pexels** (free stock photos and video, free for commercial use) is wired in but has not been run yet, because it needs a free key from the owner:

```bash
.venv/bin/python pipeline/media/pexels.py search "oil rig north sea" --video
```

Name the result's id in the script (`"clips": { "rig": { "pexels": 1234567 } }`) and the build downloads it. Pixabay is not wired in: its key has to travel in the web address, which the secure credential store can't do.

## Thumbnails

Thumbnails are scenes too. The Norway script has a `thumbnails` cut with three options. To remake them as 1280×720 stills:

```bash
pipeline/build.sh norway-fund --cut thumbnails --no-render
```

```bash
cd pipeline/video && node scripts/render.mjs norway-fund --cut thumbnails --stills 0.9,2.5,4.2 --scale 0.66667
```

The PNGs land in `out/tmp/stills/`; the chosen ones are kept in `out/norway-fund-thumbnails/`.

## Voices

| Engine | Cost | Notes |
|---|---|---|
| `kokoro` | Free | Fast and clear, limited expression. Voices: `af_heart` (US), `bm_george` (UK) and others. |
| `chatterbox` | Free | More expressive, with an `exaggeration` setting. About three times slower than real time here (an 8-minute video takes about 25 minutes to speak). Needs 3.3 GB of model files. |
| ElevenLabs | About £17 a month | The paid option. Not wired in; it would be a third engine in `voice/engines.py`. |

Compare them on the same passage:

```bash
pipeline/voice/voice_test.sh
```

After speaking, the pipeline listens to its own narration with a speech recogniser (Whisper) and lists any words it didn't hear back as written. It is a prompt to check those words by ear, not a verdict.

## Setup on a new machine

```bash
pipeline/setup.sh
```

installs the Python and Node tools and downloads the Kokoro voice and the listening-check model. Add `chatterbox` to also download that voice (3.3 GB):

```bash
pipeline/setup.sh chatterbox
```

## The older demo

`projects/costco-demo` was built with hand-written scenes in `video/src/projects/costco-demo/` and synthesised sound. It still builds with `pipeline/build.sh costco-demo`, and shows how a fully custom video looks.

## Licences
- Remotion: free for individuals and companies of up to 3 people; a company licence is needed above that.
- Kokoro voice: Apache 2.0. Chatterbox voice: MIT. Whisper (listening check): MIT. PocketSphinx (word timing): BSD-style.
- Open Peeps characters: CC0. Fluent Emoji: MIT. Montserrat and Inter: SIL Open Font Licence. Natural Earth map data: public domain.
- Sound effects and music: see `audio/LICENCES.md`.
