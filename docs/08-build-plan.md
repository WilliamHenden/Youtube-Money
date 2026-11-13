# Build Plan: Template System and the First Real Video

*Written 13 November 2026. Read with `05-production-standards.md` (the rules) and `projects/norway-fund/brief.md` (the script).*

## Goal

Make the first 8-minute video, "How Norway Saved $2.3 Trillion and Britain Saved Nothing", using a template system so that later videos need a script and a storyboard file, not new code.

The work is split into two sessions so the improvements are checked on a short sample before an hour of rendering is spent on the full video.

## Starting point

- All work so far is on the branch `claude/blissful-cannon-vqzf8t`. Start from its latest commit.
- Use the **youtube-money** cloud environment. It installs the pipeline tools at session start and allows Pexels, Pixabay, Wikimedia Commons, Hugging Face and YouTube.
- Existing pipeline: `pipeline/README.md`. Demo scenes: `pipeline/video/src/projects/costco-demo/`.
- Finished long videos are too large for GitHub (limit 100 MB per file). Save them to the Google Drive folder "YouTube Business - Videos" (ID `1LdoEe4r0zkBtsIfB1xwNxtO8sE35HYvY`) and commit only a small preview and the contact sheet.

## Session 1: build the system, prove it on a 60–90 second sample

### 1. Storyboard format
- Extend `script.json` so each line names a **template** and its settings (text, numbers, image, map region), plus optional `pause` after the line and a `sound` role.
- A project with only a script and storyboard, and no custom scene code, must build end to end.

### 2. Scene templates (each with a 16:9 and a 9:16 layout)
Build as reusable components driven entirely by the storyboard:
1. **Title card** and **chapter card**
2. **Big number** (counter with label and caption)
3. **Bar comparison** (2–4 bars, optional highlight)
4. **Line or area chart over time** (with annotations)
5. **Timeline** (events appearing along a line)
6. **Map** (region highlight, a drawn border line, labelled points, zoom)
7. **Photo scene** (a real photo with slow depth movement, caption and credit)
8. **Split screen** (two sides compared, used for UK versus Norway)
9. **Icon row** (2–4 items appearing in turn)
10. **Question card** and **answer card** (for question → pause → payoff)
11. **Quote or rule card** (one sentence, large)
12. **Name wall** (many names or logos-as-text resolving into one owner or one number)
13. **Simple diagram** (flow of money: source → pot → spending)
14. **Subscribe moment** (fixed five-second design)
15. **End card** (space for YouTube's end-screen elements)

Rule: a visual mode change at least every 20–40 seconds; no template used twice in a row.

### 3. Sound director
- Sounds are requested by role (reveal, pop, transition, impact, tick) with 3–5 variants each, rotated automatically.
- Enforce: one accent sound per 6–8 seconds at most, a 30-second cooldown per file, reveal sounds only on moments marked as major, counters silent by default, and music and effects dropped for a marked `beat`.
- Source professionally recorded effects that are free for commercial use, and record each licence in `pipeline/audio/LICENCES.md`. Replace the synthesised music with one or two licensed tracks.
- Print a sound report on every build.

### 4. Real photos
- A fetch step that finds and downloads images from Wikimedia Commons (no key needed), saving the licence and credit for each. Pexels and Pixabay need free API keys: ask the owner through the secure credential form when needed.
- Credits are collected automatically into a block for the video description.
- Only use images whose licence allows commercial use. Prefer public domain and CC BY.

### 5. Voice test
- Render the same 30-second passage from the Norway script in: the current voice, at least one more expressive free model (if it runs acceptably without a graphics card), and note that ElevenLabs is the paid option.
- Save the clips to `out/voice-tests/` for the owner to choose by ear.
- Scripted pauses (`[beat]`) must work with every engine.

### 6. The sample
- Build the first 60–90 seconds of the Norway video (hook and context) with the new templates, sounds and the best free voice.
- Also render one vertical Short from it.
- Deliver the sample, the Short, the voice tests, the sound report and a short honest review. **Stop there for the owner's feedback.**

## Session 2: the full video

Only after the owner has approved the script (`brief.md` status) and given feedback on the sample.

1. Verify or rewrite every ⚠ line in the fact sheet. Re-check the fund value and the America debt figure.
2. Write the full storyboard. Custom scenes only for the two or three biggest moments (the three percent rule, the size reveal, Regent Street).
3. Check still frames across the whole video before any full render.
4. One full render (about an hour for 8 minutes on this machine), then fix and re-render only the scenes that changed.
5. Master the audio, upload the video to the Drive folder, and produce:
   - 6–8 vertical Shorts cut from the strongest moments
   - 3 thumbnail options and 3 title options
   - the description (with sources, photo credits and chapters) and tags
   - a contact sheet and a written review
6. Update `05-production-standards.md` with anything learned.

## Keeping usage down

- Check stills, not full renders, while building. No more than two full renders of the long video.
- Review with one contact sheet per pass, not many separate images.
- Don't re-research what is already in the docs.
- If the session limit is close, commit and push, write what's left in `docs/10-progress.md`, and stop cleanly.

## Acceptance checks

- A new project builds from script and storyboard alone.
- The sound report shows no file repeated within 30 seconds and reveal sounds only on marked moments.
- Every template renders correctly in both 16:9 and 9:16.
- Loudness is −14 LUFS, true peak at or below −1 dBTP.
- Every fact on screen and in narration matches the fact sheet.
- The honest review lists the three weakest moments.

---

## Prompt for session 1

```
Read docs/08-build-plan.md, docs/05-production-standards.md and projects/norway-fund/brief.md, then carry out "Session 1" of the build plan.

Context: this repo holds a working video pipeline that made an 82-second demo (pipeline/README.md, docs/04-demo-review.md). I liked the demo's look. The standards file lists what I want improved: story, natural writing, sound variety and restraint, voice, visual variety. The build plan turns that into a template system so future videos don't need custom code.

How I want you to work:
- Work on your own from start to finish. Only stop to ask me something if you are truly blocked.
- Follow the standards file exactly, especially the sound rules and the writing rules.
- Keep usage down as the build plan says: check stills while building, and avoid full renders until the sample is ready.
- Finish with the 60–90 second sample of the Norway video, one vertical Short, the voice test clips, the sound report and an honest review. Then stop and wait for my feedback. Do not make the full 8-minute video in this session.
- Commit and push as you go. Tell me where every file is when you finish.
```

## Prompt for session 2

```
Read docs/08-build-plan.md, docs/05-production-standards.md, projects/norway-fund/brief.md and the review from session 1, then carry out "Session 2" of the build plan: the full Norway video, its Shorts, thumbnails, titles and description.

My feedback on the sample: [write it here]
Voice I chose: [write it here]
Script changes: [write them here, or "approved as written"]

Work on your own, keep usage down as the plan says, verify every flagged fact before recording narration, and finish with an honest review. Save the full video to the Google Drive folder named in the plan.
```
