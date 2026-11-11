# Demo Plan: "How Costco Actually Makes Money" (60–90 second proof of concept)

## 1. Purpose

Prove (or disprove) that Claude can produce **watchable, professional-looking faceless documentary video** entirely from code and free assets, with no human editing and no paid subscriptions:

- original motion graphics, charts and simple illustrated scenes
- a consistent visual style that can be reused for every future video
- a free AI narrator, captions and sound design
- all assembled automatically from a script

The demo is also **the first version of the real production pipeline** (Option 3 in `02-ai-video-tools.md`). Everything should be built to be reused, not as a one-off.

### Success criteria (judged by the owner watching the result)
1. It looks like a real YouTube business explainer, not a slideshow or a school PowerPoint.
2. Something meaningful changes on screen every 2–4 seconds; no frame sits still longer than 4 seconds.
3. The narration sounds natural enough not to put a viewer off.
4. The visual style is consistent, so you could imagine 100 videos looking like this.
5. Facts are correct and sourced.

## 2. Environment facts (checked 11 Nov 2026 in this cloud session)

| Item | Status |
|---|---|
| ffmpeg 6.1 (libx264, aac) | ✅ installed |
| Node 22, Python 3.13 | ✅ installed |
| Chromium (Playwright) | ✅ at `/opt/pw-browsers/` (chromium-1243, chromium_headless_shell-1243) |
| CPU / RAM / GPU | 4 cores, 15 GB, **no GPU** |
| npm registry, PyPI | ✅ reachable |
| GitHub release downloads | ✅ reachable (used for the Kokoro voice model) |
| Google Fonts | ✅ reachable (but prefer `@fontsource/*` npm packages) |
| huggingface.co, Pexels, Pixabay, Wikimedia, YouTube, jsdelivr/unpkg CDNs | ❌ **blocked**: don't depend on them |

Consequences: **no stock footage or photos for this demo.** It's 100% vector motion graphics, which suits Claude's strengths. Voice comes from **Kokoro (ONNX)**, which downloads from GitHub releases.

## 3. Technical approach

| Component | Choice | Licence |
|---|---|---|
| Video engine | **Remotion** (React → MP4), 1920×1080, 30 fps | Free for individuals / companies of up to 3 people |
| Narration | **Kokoro-82M** via `kokoro-onnx` (pip), model files from `github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/` (`kokoro-v1.0.onnx` or the smaller int8 version, plus `voices-v1.0.bin`) | Apache-2.0 weights, MIT package |
| Characters | **Open Peeps** (`@opeepsfun/open-peeps`, npm) | MIT / CC0 artwork |
| Objects / icons | **Fluent Emoji Flat** (`@iconify-json/fluent-emoji-flat`) as the primary icon set; Noto (`@iconify-json/noto`) as a fallback. Customise the colours to the palette where possible. | MIT / Apache-2.0 |
| Illustrated scenes | Hand-built SVG components (warehouse building, shelves, trolley, membership card, price tags, coins) in a flat geometric style | Original |
| Fonts | `@fontsource/montserrat` (headings) + `@fontsource/inter` (body and captions) | OFL |
| Music | Procedurally generated soft ambient bed (numpy or ffmpeg synthesis), kept very quiet. Optional: skip if it sounds cheap. | Original |
| Sound effects | Synthesised whoosh, pop, tick and "cha-ching" sounds (filtered noise and sine blips) | Original |
| Captions | Burned in, sentence-chunked, timed from per-sentence audio durations | n/a |

**If Remotion can't download its own browser:** set `browserExecutable` to the Playwright Chromium in `/opt/pw-browsers/` (find the actual binary path with `find`). Last-resort fallback: render frames with Playwright and stitch them with ffmpeg.

### Architecture (reusable pipeline)

```
pipeline/
  voice/            # tts.py: script JSON -> per-sentence WAVs + timings.json (Kokoro)
  audio/            # sfx + music bed generation, final mix & loudness normalisation
  video/            # Remotion project
    src/style/      # theme.ts: palette, fonts, easings, spacing (THE style guide in code)
    src/components/ # reusable library: Chart bars/lines, Counter, PriceTag, Card, Character,
                    # Building, IconPop, Caption, LowerThird, Transition, CameraDrift, GrainOverlay
    src/scenes/     # demo scenes composed from components
  projects/costco-demo/
    script.json     # scenes -> sentences -> visual cues (the single source of truth)
    sources.md      # every fact with its source link
out/                # rendered mp4 + contact sheet (commit the final mp4 and contact sheet only)
```

`script.json` drives everything: the voice step reads it, writes per-sentence timings, and the Remotion composition sizes every scene from those timings. That lets any future video be made by writing a new `script.json` plus scene definitions.

## 4. Visual style guide (v1)

- **Look:** flat, geometric, modern editorial. Think business explainer with personality: bold shapes, generous spacing, thick rounded strokes, subtle paper-grain texture.
- **Palette:** deep navy background `#0E1A2B`; off-white `#F4EFE6`; accent red `#E3463B` (Costco-ish but not their brand colours exactly); accent blue `#2F6FDB`; money green `#2FBF71`; warm yellow `#F5B83D`. Tune as needed, but keep it to 6 or fewer colours.
- **Type:** Montserrat ExtraBold for big numbers and headlines; Inter SemiBold for labels and captions. Big numbers are the hero of every scene.
- **Motion language:** everything enters with spring easing (slight overshoot), and nothing pops in linearly. A constant slow "camera drift" (1–3% scale or pan) on every scene so nothing is ever static. Staggered entrances (80–120 ms apart). Numbers count up. Charts grow.
- **Transitions:** 2–3 types only (slide-wipe in an accent colour, zoom-through, match-cut on a shape) used consistently.
- **Captions:** bottom-centre, Inter SemiBold ~44 px, off-white on a semi-transparent dark pill, max 2 lines, highlight key numbers in yellow.
- **Branding:** a small placeholder channel bug in the corner (e.g. "MONEY MECHANICS", a working name only).
- **Logos:** don't recreate Costco's logo. Show the name in our own typography. (Editorial logo use is common, but avoid it in the demo.)

## 5. Script & storyboard (draft; **every fact must be verified before rendering**)

Target: about 190–210 words, about 75–85 seconds at a calm documentary pace.

| # | Narration (draft) | Visuals | Facts to verify |
|---|---|---|---|
| 1 Hook (0–10s) | "In 1985, a Costco hot dog and a soda cost one dollar fifty. Today? Still one dollar fifty. Costco has refused to raise that price for forty years, and that tells you everything about how this company really makes money." | Hot dog + drink pop in; giant "$1.50" price tag; calendar flips 1985 → 2025 while the price stays frozen; a ghosted "inflation-adjusted" tag floats up to ~$4+ and gets stamped "NOPE". | Hot dog combo $1.50 since 1985; inflation-adjusted value |
| 2 Revenue vs profit (10–22s) | "Last year Costco sold around [$X] billion dollars' worth of stuff. But here's the strange part: it kept less than three cents of every dollar as profit." | Flat warehouse building assembles; revenue counter rolls up; a stack of 100 coins where only ~3 glow green. | Latest fiscal-year revenue and net income (FY2025 if available, else FY2024); net margin |
| 3 Low markups (22–34s) | "That's deliberate. Costco caps how much it marks up most products, reportedly around fourteen percent, so prices stay low and shoppers keep coming back to buy in bulk." | Price tag with a cost bar plus a small markup segment; comparison bar for a "typical retailer" (only if a sourced figure exists, otherwise skip the comparison); trolley fills up with bulk items. | The markup cap (~14%, ~15% for Kirkland) and its source |
| 4 The membership (34–52s) | "So where does the money actually come from? This. To shop at Costco you need a membership, [$65] a year in the US, and around [N] million households pay it. That's nearly [$Y] billion dollars a year in fees, and almost all of it is profit." | Membership card spins in (generic design, our typography); Open Peeps characters queue up and multiply into a crowd grid; fee counter rolls to $Y billion. | Current US fee ($65 Gold Star since Sept 2024); paid household members; annual membership fee income |
| 5 Side by side (52–66s) | "Put the two together: membership fees are worth roughly [two-thirds] of Costco's entire annual profit. And around [90] percent of members renew every year." | Two bars: membership fees vs net income, with a bracket "≈ 2/3"; circular renewal gauge fills to ~90%. | Fee income ÷ net income ratio; worldwide renewal rate |
| 6 Payoff (66–80s) | "The cheap groceries, the cheap fuel, the one-dollar-fifty hot dog: that's the bait. The membership is the business." | Callback: hot dog, fuel pump and groceries line up labelled "BAIT"; the card slides in centre labelled "BUSINESS"; end card with the channel name. | n/a |

Rules for the script:
- **Verify every number with WebSearch** against Costco's annual report or 10-K or reputable coverage. Record each in `projects/costco-demo/sources.md`. If a figure can't be verified, rewrite the line to avoid it.
- Keep claims hedged where the source is a report rather than Costco itself ("reportedly").
- Write numbers in the narration the way they should be spoken (e.g. "two hundred and seventy-five billion"), and in figures on screen.

## 6. Build steps

1. **Setup:** `pipeline/` structure, `.gitignore` (node_modules, model files, caches, intermediate renders). Install Remotion (latest v4), the fontsource fonts, Open Peeps and the Iconify icon sets. `pip install kokoro-onnx soundfile numpy`; download the Kokoro model and voice files from the GitHub release into an ignored `pipeline/voice/models/`.
2. **Facts:** verify the numbers and finalise `script.json` plus `sources.md`.
3. **Voice audition:** render the hook sentence with 4–5 voices (candidates: `bm_george`, `bm_lewis`, `am_michael`, `af_heart`, `bf_emma`) at speed 0.95–1.05. Pick the most natural documentary voice: calm, authoritative, not sing-song. Save the auditions to `out/voice-auditions/` so the owner can compare. Then render all sentences and write `timings.json`. Add small natural pauses between sentences (~250–400 ms) and longer pauses at scene breaks.
4. **Style and component library:** build `theme.ts` and the reusable components first. Render a **style frame** (a single PNG) of 2–3 representative scenes and review it critically before animating everything.
5. **Scenes:** build scenes 1–6 driven by `timings.json`. Sync key visual beats to specific words or sentences.
6. **Audio:** generate SFX (synced to visual pops and transitions) and the music bed; mix narration at about −16 LUFS for speech, music 18–22 dB below the voice, then normalise the final mix to **−14 LUFS integrated, true peak ≤ −1 dBTP** (ffmpeg `loudnorm`, two-pass).
7. **Render** 1080p30 H.264 (CRF ~18), AAC 192 kbps → `out/demo-costco.mp4`.
8. **QA loop (at least 2 passes):** see §7. Fix and re-render.
9. **Write `docs/04-demo-review.md`:** an honest assessment of what looks professional, what looks weak, and what would most improve it (e.g. ElevenLabs voice, stock footage, a custom character set), plus render time, file sizes, and how reusable the pipeline is for the next video.
10. **Commit and push** to the working branch: code, `script.json`, `sources.md`, `out/demo-costco.mp4`, `out/contact-sheet.png`, the voice auditions, and the review doc. Don't commit node_modules or model files.

## 7. QA checklist (Claude reviews its own output before showing it)

- [ ] Generate a **contact sheet** (one frame every 2 seconds, tiled) with ffmpeg and inspect it. Check composition, consistency, legibility and anything that looks broken.
- [ ] Extract and view full-size frames at every scene transition and every key reveal.
- [ ] No frame is visually static for more than 4 seconds (verify via the contact sheet and the timeline).
- [ ] All text is legible on a phone-sized screen; nothing touches the frame edges (≥ 80 px safe margin); captions never cover key numbers.
- [ ] Narration timing: captions match the speech; visual reveals land on or just before the spoken number.
- [ ] Audio: loudness measured (−14 LUFS ±1), no clipping, SFX not annoying, music not distracting.
- [ ] Facts on screen match `sources.md` exactly.
- [ ] Ask: "Would a viewer think this was made by a small professional studio?" List the 3 weakest moments and fix at least those before finishing.

## 8. Out of scope for the demo
Thumbnails, titles and description, uploading, Shorts versions, stock footage, AI image or video generation, paid tools. These come after the owner reviews the demo.

---

## 9. The prompt to paste

Switch model, then send this message:

```
Build the demo video described in docs/03-demo-plan.md in this repo. Read that plan fully first, plus docs/01-business-strategy.md (sections 0 and 4) and docs/02-ai-video-tools.md (section 4) for context.

Goal: a 60–90 second, 1080p faceless business explainer, "How Costco Actually Makes Money", made entirely from code and free assets: Remotion motion graphics, Open Peeps characters, Fluent Emoji icons, original SVG scenes, a Kokoro AI narrator, synthesised SFX, burned-in captions. This is a proof of concept for whether we can make professional-looking videos with no editing software or paid tools, and it is the first version of our reusable production pipeline. Build it to be reused.

How I want you to work:
- Work autonomously from start to finish. Don't stop to ask me questions unless you are truly blocked. Make sensible decisions and note them in the review doc.
- Verify every fact in the script with web search before rendering, and record sources in projects/costco-demo/sources.md. If a number can't be verified, rewrite the line.
- Respect the environment limits in section 2 of the plan (no Hugging Face, Pexels, Wikimedia or CDNs; no GPU).
- Aim for the highest quality you can. Render a style frame before animating everything, then do at least two full QA passes using the checklist in section 7 (contact sheet, key frames, loudness, sync), and fix the weakest moments each time.
- Be honest in docs/04-demo-review.md about what looks good and what doesn't.
- Commit and push everything listed in step 10 of the plan to the current branch. When done, tell me where the video, the voice auditions and the review are, and what you'd improve next.
```
