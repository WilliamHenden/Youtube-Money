# Demo Review: "How Costco Actually Makes Money"

*Built 11 November 2026 from the plan in `03-demo-plan.md`.*

## Where everything is

| What | File |
|---|---|
| **The video** (82.5 seconds, 1920×1080, 30 fps, 46 MB) | `out/costco-demo.mp4` |
| Contact sheet (one frame every 2 seconds) | `out/costco-demo-contact-sheet.jpg` |
| Six narrator voices reading the opening, to compare | `out/voice-auditions/` |
| Script, with captions and sync cues | `projects/costco-demo/script.json` |
| Every fact and its source | `projects/costco-demo/sources.md` |
| The reusable pipeline and how to run it | `pipeline/` (start with `pipeline/README.md`) |

## The most important caveat

**I can't watch or listen to the video the way you can.** I reviewed it as still frames (a frame every 2 seconds, plus frames just after each key moment) and as audio measurements (loudness, peaks, how loud the sound effects are against the voice). So:

- **Checked:** layout, legibility, consistency, facts on screen, that visuals appear on the right spoken word, loudness, no frozen stretches.
- **Not checked by eye or ear:** how smooth the motion feels, whether the pacing is enjoyable, whether the narrator sounds natural, whether the music and sound effects sound good or cheap, and whether every word is pronounced correctly.

Your reaction on first watch is the real test. Judge it against the question from the plan: *does this look like a real YouTube business channel, or a slideshow?*

## Cost and time

| Item | Result |
|---|---|
| Paid tools or subscriptions used | **None** |
| Full build (narration → music → render → master) | About 12 minutes on this 4-core machine with no graphics card |
| Render time alone | About 10 minutes for 82 seconds of video (roughly 7 minutes per minute of video) |
| Human editing | None |

## What I think looks good

- **It reads as a designed channel.** One palette, two fonts, one motion style, a channel bug, consistent captions. The frames look like they belong to the same show.
- **The motion-graphics scenes are the strongest:** the hanging price tags with the "REFUSED" stamp, the 100-coin grid where 3 turn green, the markup bars, the fees-vs-profit chart, and the renewal gauge. These are what the pipeline does best.
- **The membership card reveal** ("This.") and the closing "The bait / The business" are the two moments that feel most like a real explainer.
- **Sync is tight.** Each number appears within about 0.2 seconds of being spoken, because the narration is aligned to the script word by word.
- **Facts are sourced and conservative.** Every figure uses Costco's latest full-year results (fiscal 2026, reported September 2026), and the on-screen notes say where a comparison is approximate.
- **Something changes on screen every 2–3 seconds**, and nothing is ever fully still (slow camera drift, floating icons, moving backgrounds). An automatic check found no frozen stretch of 1.5 seconds or more.

## What I think is weak

1. **The narrator.** The free voice (Kokoro "Heart") is clear, but I'd expect it to sound flatter and less expressive than ElevenLabs over a long video. I chose it on its published quality rating, not by ear. Listen to the six auditions: you may prefer another, and switching is one command.
2. **The music is the element most likely to sound cheap.** It's a simple synthesised chord loop, set very quiet under the voice. A licensed track from the YouTube Audio Library would be better, and the pipeline can take one.
3. **The sound effects are synthesised** (pops, whooshes, a "cha-ching"). I balanced their levels by measurement, but they may sound basic next to a professional sound-effects library.
4. **Characters are limited to round avatar "chips".** There are no full-body characters walking, pointing or reacting. The shoppers scene (about 38–41 seconds) is the least convincing part of the video for that reason.
5. **Three art styles are mixed:** hand-drawn characters (Open Peeps), glossy emoji icons (Microsoft Fluent) and my own flat shapes. It holds together because of the shared colours and framing, but a designer would notice, and the emoji are recognisable as emoji.
6. **No real footage or photos.** For a company story, real images (stores, products, archive photos) add credibility. This machine's network blocks the free stock libraries, so the demo is 100% graphics. That's fine for 80 seconds, but probably tiring over 15 minutes.
7. **The opening two seconds are plain:** just the year "1985" before the hot dog appears.

## How it went against the plan's success criteria

| Criterion | My assessment |
|---|---|
| 1. Looks like a real YouTube explainer, not a slideshow | **Likely yes** for the chart and card scenes; the shoppers scene is closer to "nice slide". Needs your eye. |
| 2. Something changes every 2–4 seconds; nothing static over 4 seconds | **Met** (frame checks and freeze detection) |
| 3. Narration natural enough not to put viewers off | **Unknown.** I can't hear it. This is the biggest open question. |
| 4. Consistent style you could imagine across 100 videos | **Met** |
| 5. Facts correct and sourced | **Met**, with one caveat: sources are trade press and earnings summaries, not Costco's own filing (see `sources.md`) |

## QA checklist results

| Check | Result |
|---|---|
| Contact sheet reviewed | Done on all three full renders |
| Frames at every scene change and key reveal | Done; fixed a stamp covering a number, overlapping labels, two cramped headlines, an off-balance chart |
| No static stretch over 4 seconds | Pass. Added two extra beats (a "Members only" tag and a groceries-vs-fees comparison) where pass 1 showed 4–5 quiet seconds. |
| Text legible at phone size, inside safe margins, captions clear of key numbers | Pass. Smallest text (source notes) is 23 px, which is small on a phone by design. |
| Captions match speech; reveals land on the spoken number | Pass (word-level alignment worked on all 18 lines) |
| Loudness | **−14.0 LUFS, true peak −1.0 dBTP** (YouTube's target) |
| Sound effects vs voice | Typical effects sit 4–8 dB under the voice; I turned down the three loudest (stamp, two impacts) after pass 2 |
| Facts on screen match `sources.md` | Pass |

## Decisions I made without asking

- **Used fiscal 2026 numbers**, not the fiscal 2025 ones I knew when writing the plan. Costco reported new full-year results in September 2026, so the script says "about three cents" (the margin is now 3.0%, no longer under 3%).
- **Narrator: "Heart" (US, female).** It has the highest quality rating of the free voices. The best-rated male voices are a grade lower. Auditions for three male and three female voices are in `out/voice-auditions/`.
- **Reworded one claim.** The plan's "almost all of it is profit" became "those fees cost Costco very little to collect", which is easier to support. The bar comparison for it is labelled "illustration only, not to scale" because I have no exact figures.
- **"Nearly two-thirds of annual profit"** compares fee revenue with net income. The on-screen note says so, because fees are revenue and profit is after all costs and tax.
- **Added word-level alignment** (a free offline speech tool) so visuals sync to exact words. The plan only had sentence-level timing.
- **The building sign says "COSTCO" in our own lettering**; the logo isn't recreated. "Kirkland Signature" appears as a text label.
- **Channel name "MONEY MECHANICS" is a placeholder**, not a checked or chosen name.
- **Render setting changed** to one that is about ten times faster on this machine, with identical output.

## Is the pipeline really reusable?

Partly, and it's worth being precise:

- **Reusable as-is:** narration with word timing, captions, music and sound-effect generation, loudness mastering, the style guide, and a library of about 25 components (backgrounds, wipes, counters, price tags, cards, characters, charts, gauges, stamps).
- **Still custom per video:** the scenes. This demo's six scenes are about 450 lines written for this story. A new video needs new scene code, built from the library.
- **What that means for a 15-minute video:** roughly ten times as many scene beats. Writing each by hand would be slow. The fix is a set of **scene templates** (big number, bar comparison, icon row, timeline, map, quote, title card) so most of a script can be mapped to visuals automatically, with custom scenes only for the key moments.

## What I'd improve next (in order)

1. **Get your reaction.** Watch it once normally, then tell me the three moments that felt weakest and what you think of the voice.
2. **Fix the voice question.** Pick from the auditions, or test ElevenLabs (about £17/month) with the same script and compare side by side.
3. **Replace the music** with a licensed track.
4. **Build scene templates** so a 12–15 minute script doesn't need hand-coding scene by scene.
5. **Add real photos and footage**, which needs the network settings for this environment to allow the free libraries (Pexels, Pixabay, Wikimedia Commons).
6. **Unify the art style:** one consistent icon set drawn for the channel, and a small set of full-body characters with a few poses.
7. **A stronger first two seconds**, since that's where viewers decide to stay.

## My honest verdict

For a first attempt with no paid tools and no editing software, the visual result is better than I expected: I think the graphics-led scenes would pass as a small professional channel. The audio is the unknown, and I'd expect it to be the weakest part.

If the visuals work for you, the realistic route is this pipeline for graphics, charts, captions and assembly, a better voice, licensed music, and real photos and footage mixed in. If they don't, the off-the-shelf tools in `02-ai-video-tools.md` are the fallback, with this pipeline supplying the charts.
