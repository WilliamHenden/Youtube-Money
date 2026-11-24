# Youtube-Money: notes for Claude

A faceless YouTube business channel made with a code-based video pipeline. The owner is not a developer and often works from a phone: explain things in plain English and keep replies short.

## Read first
- `docs/05-production-standards.md`: the rules every video follows (story, writing, sound, voice, visuals). Follow it exactly and update it when the owner changes a decision.
- `docs/09-roadmap-and-decisions.md`: where the project stands, what's next, every decision the owner has made, and known risks.
- `docs/08-build-plan.md`: the current build plan and what each session should do.
- `projects/norway-fund/brief.md`: the first real video (script draft v3 from 18 November, fact sheet, status). Drafts 1 and 2 are in `projects/norway-fund/archive/`. `storyboard-plan.md` is the visual plan for draft 3. The sample's `script.json`, the thumbnails and `packaging.md` were made for draft 1 and need redoing once draft 3 is approved.
- `pipeline/README.md`: how the video pipeline works, how to write a storyboard, and the list of scene templates.
- `docs/10-session-1-review.md`: what session 1 built, the sample's weak points, and what the owner still has to decide.
- **The owner's decisions for the Norway video** are collected on a private page: https://claude.ai/artifact/WMPHgDruLbBt3KHd3kSWPs (script draft v3, title, sound and music choices). When the owner says they've answered, read the document `norway-script-v3` in the page's `decisions` collection with the ArtifactData tool (earlier answers, if any, are in `norway-script-v2` and `norway-video`). Page source: `docs/decision-page/` (run `build.py` after the script in `brief.md` changes, then republish to the same link).
- `docs/11-prep-notes.md`: what was prepared after session 1 (fact checks, intro and outro options, thumbnails, the storyboard plan, video 2 groundwork) and what is still waiting on the owner.
- `docs/13-script-playbook.md`: how scripts are written for this channel (structure, writing for the ear, phrases to avoid, writing for the ElevenLabs voice, word budget). Follow it for every script.
- `docs/12-voice-workflow.md`: how ElevenLabs fits in (text to speech or the owner's recording re-voiced), what it costs, the order of work, and Spotify.
- `docs/14-footage-options.md`: free against paid footage (Pexels, Artlist, Storyblocks, AI clips), what can be automated, and the plan (free for video 1).
- Background, only if needed: `docs/01` (strategy), `02` (tools), `04` (demo review), `06` (channel setup), `07` (topic shortlist).

## First thing next session: build the Norway draft video
The owner approved script draft 3 on 24 November and wants the full video built now.

**Progress (24 November, session 2):** steps 1 to 3 are done and pushed. `script.json` holds the whole of draft 3 (49 scenes, words checked word for word against `brief.md`), narrated by James: **9 min 4 s**, about 8,200 credits used. A `placeholder` template was added (12 placeholder scenes). The contact sheet (a frame every 2 seconds) is at `out/norway-fund-contact-sheet.jpg`, also split into four pages (`-1` to `-4`), and was sent to the owner for checking. Layout faults found on the first sheet were fixed (title width, split-screen text overflow, bar labels, tank label). **Next: wait for the owner's go-ahead on the contact sheet, then step 4's half-resolution draft render.** The voice is cached, so rebuilding costs nothing unless a line's words change. One line paused oddly according to the pacing check ("Oil companies came anyway...", scene `c-wells`): listen to it in the draft. Paid voice lines are kept in `projects/norway-fund/voice-cache/`. The Whisper listening check couldn't download its model this session, so nobody has checked the hard names by ear yet (Ekofisk, al-Kasim, kroner, IPPR). The storyboard's departures from `storyboard-plan.md` are listed in the `notes` of `script.json`.

The task, in order:

1. **Narration with James.** Use the `elevenlabs` engine (`"voice": {"engine": "elevenlabs", "voice": "GrVxA7Ub86nJH91Viyiv", "model": "eleven_v4"}`). The key is a network secret on the environment and already works. It costs about 8,200 credits (Starter plan, 40,000 a month, about 1,150 used). Lines are cached, so only changed lines cost again.
2. **Storyboard.** Rewrite `projects/norway-fund/script.json` for the whole of draft 3 (in `brief.md`), following `projects/norway-fund/storyboard-plan.md` and the mood rules in `docs/05-production-standards.md`. Replace the old draft-1 scenes and cuts.
   - Captions (`show`) use digits ("$2.3 trillion", "1965").
   - Use cues `{name}` for anything that must land on a word.
   - Opening order: hook, question, `[beat]`, the `ident` sting, title. Then the subscribe moment, and outro A on the `end` template.
3. **Placeholders (owner's request).** Every real footage or photo slot, and every graphic not built yet (`grid`, `document`, map dots, the three custom scenes), is a plain dark screen with a small icon and a label saying what is meant to go there (for example "FOOTAGE: offshore oil rig in a storm"). A `placeholder` template may need adding. This lets the owner judge what imagery fits while watching.
4. **Check one contact sheet,** then do a **draft render at half resolution** (`render.mjs --scale 0.5`, about 20 minutes) and send it to the owner. Line changes happen at this stage.
5. **Then:**
   - fetch real clips with `pipeline/media/pixabay.py`, using specific search words ("offshore oil rig", not "oil platform"), and let the owner pick
   - build the remaining graphics
   - one full-quality render, saved to the Google Drive folder

**Also to know:**
- **Pixabay key:** the owner said to keep using the key they pasted in chat on 24 November. It was saved only on that session's machine (`~/.config/youtube-money/pixabay.key`), so a new machine won't have it. Ask the owner to add `PIXABAY_API_KEY` in the environment settings, or paste it again. Only step 5 needs it. Pexels keys are paused.
- **Model:** the owner may use Fable for steps 2 and 3, then Opus for the rest.
- **Still open, not blocking:** the title (working title "How Norway Built the Biggest Wealth Fund on Earth"); whether the sample's sound effects are fine; the channel name (idea: "Money Stories"); channel artwork.
- **Music:** keep the quiet bed. The standard says to switch tracks once mid-video; `pipeline/audio/director.py` doesn't do that yet (a small addition).

## Standing instructions from the owner

### Saving work (owner's instruction, 13 Nov 2026)
- The repo's **default branch** is the main line and must always hold the complete, latest work. It is currently `claude/blissful-cannon-vqzf8t`; the owner may rename it, so check which branch is the default.
- Commit and push as you go to the session's own branch.
- **At the end of each session, open a pull request from the session's branch into the default branch and merge it without asking the owner.** This is pre-approved. If the session is already working on the default branch, pushing to it is enough.
- If the merge has conflicts or fails, do not force anything. Leave the pull request open and tell the owner plainly what happened.
- Never force-push or rewrite history on the default branch.

### Working style
- **Keep usage down.** The owner's Claude limit is tight. Check still frames before rendering, avoid repeat full renders, don't redo research that's already in the docs, and stop cleanly with a progress note if the limit is close.
- **Approval gates:** the owner approves the topic, then the script, then the finished video. Don't start production on an unapproved script.
- **Facts:** every claim in a script needs a source in that project's fact sheet. Never state a figure from memory as verified.
- **No false endorsements.** Don't write claims that the channel uses products it doesn't use.

## Practical notes
- Use the **youtube-money** cloud environment. It installs the pipeline tools at session start and allows the stock-photo, voice-model and YouTube sites.
- Files over 100 MB can't go in the repo. Save finished long videos to the Google Drive folder "YouTube Business - Videos" (ID `1LdoEe4r0zkBtsIfB1xwNxtO8sE35HYvY`) and commit only small previews.
- Render with the default graphics setting in `pipeline/video/scripts/render.mjs`. The "swangle" setting is about ten times slower on this machine.
- A video is `projects/<id>/script.json` only: words plus a storyboard naming a template per scene. Build with `pipeline/build.sh <id> [--cut name]`; add `--no-render` while storyboarding, and check one contact sheet (`render.mjs --sheet 2`) before any render.
- New tools since the environment was made: run `pipeline/setup.sh` if the listening check or a voice model is missing (`pipeline/setup.sh chatterbox` for the 3.3 GB expressive voice).
- Wikimedia Commons throttles this machine's shared address hard. Search sparingly, and expect downloads to need retries.
- Sound and music licences: `pipeline/audio/LICENCES.md`. Music is CC BY, so the credits file from each build must go in the video description.
- Research tools: `tools/yt_search.py` (YouTube view counts for a topic) and `tools/yt_handle_check.sh` (handle availability).
- Undecided: channel name. Narrator: ElevenLabs "James - English Story Teller" (the owner's choice; final once heard on the full script). Parked: mascot, AI-generated cinematic clips.
