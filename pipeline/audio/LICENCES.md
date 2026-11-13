# Sound and music licences

Every sound file the pipeline can play is listed here with where it came from and what its licence allows.
Add a line whenever a file is added. Nothing goes into `library/` without one.

## Sound effects: `library/sfx/`

**All 27 files are from "SFX Kit" by Wyzowl, version 1.0.0.**

- Source: https://huggingface.co/datasets/wyzowl/sfx-kit (also https://github.com/wyzowl/sfx-kit)
- Licence: **CC0 1.0** (public domain dedication). Free for any use including commercial, no credit required. Full text in `library/sfx/LICENSE-SFX-KIT.txt`.
- Downloaded 13 November 2026.
- **How they were made:** the kit's own notes say every sound is synthesised by code, modelled on how real things make sound, and listened to and approved by Wyzowl before release. They are **not microphone recordings**. They replace the demo's home-made synthesised set with a designed, level-matched library, but if recorded sounds are wanted the roles in `library/sounds.json` can point at any other files.

| Role | Files |
|---|---|
| transition (scene changes) | whoosh-medium-soft, whoosh-slow-soft, reverse-whoosh-medium-soft, whoosh-medium-medium, swish-soft |
| pop (something appears) | pop-medium-in, pop-small-in, pop-medium-bubble, impact-light-firm, zip-in-soft |
| impact (something lands) | impact-medium-soft, impact-medium-firm, impact-heavy-soft, boom-hit-soft |
| reveal (major moments only) | shimmer-medium-bright, boom-hit-medium, sting-minimal-short, tone-ding-mid |
| tick (a small step, a number landing) | data-number-land, writing-pen-tick, click-tap-firm, impact-light-hard |
| draw (a line being drawn) | writing-marker-draw, zip-in-medium, swish-medium |
| riser (optional build before a reveal) | riser-1s-soft, riser-2s-soft |

`library/sounds.json` holds each file's length, sync point and level, copied from the kit's own data.

## Music: `library/music/`

| File | Track | Author | Licence | Source |
|---|---|---|---|---|
| deliberate-thought.mp3 | Deliberate Thought | Kevin MacLeod | CC BY 4.0 | [incompetech.com](https://incompetech.com/music/royalty-free/music.html), downloaded 13 November 2026 |
| thinking-music.mp3 | Thinking Music | Kevin MacLeod | CC BY 4.0 | [incompetech.com](https://incompetech.com/music/royalty-free/music.html), downloaded 13 November 2026 |

- **CC BY means credit is required.** The exact credit lines are in `library/music/tracks.json`, and every build writes them into `out/<video>-credits.txt` for the YouTube description. A video using these tracks must carry that credit.
- CC BY 4.0 allows commercial use and monetised videos. The licence is stated on the composer's site: https://incompetech.com/music/royalty-free/licenses/ (he also sells a no-credit licence, which isn't needed while the credit is given).
- The YouTube Audio Library is still the safest free source, but its tracks can only be downloaded by signing in to YouTube Studio. To use one: download the MP3, put it in `library/music/`, add it to `tracks.json` and to the table above, and name it in the script's `"music": { "track": "..." }`.

## Older files: `sfx/`

The twelve files in `pipeline/audio/sfx/` were synthesised by `make_audio.py` for the Costco demo. They are the project's own work, so there is nothing to license. Only the demo uses them.

## Photos and maps

- Photos are fetched per project by `pipeline/media/commons.py`, which records each one's licence and credit in `projects/<id>/photos/credits.json`. It only accepts public domain, CC0 and CC BY.
- Map shapes come from Natural Earth (public domain) through the `world-atlas` package.
