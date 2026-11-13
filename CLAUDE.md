# Youtube-Money: notes for Claude

A faceless YouTube business channel made with a code-based video pipeline. The owner is not a developer and often works from a phone: explain things in plain English and keep replies short.

## Read first
- `docs/05-production-standards.md`: the rules every video follows (story, writing, sound, voice, visuals). Follow it exactly and update it when the owner changes a decision.
- `docs/09-roadmap-and-decisions.md`: where the project stands, what's next, every decision the owner has made, and known risks.
- `docs/08-build-plan.md`: the current build plan and what each session should do.
- `projects/norway-fund/brief.md`: the first real video (script, fact sheet, status).
- `pipeline/README.md`: how the video pipeline works, how to write a storyboard, and the list of scene templates.
- `docs/10-session-1-review.md`: what session 1 built, the sample's weak points, and what the owner still has to decide.
- **The owner's decisions for the Norway video** are collected on a private page: https://claude.ai/artifact/WMPHgDruLbBt3KHd3kSWPs (script, voice clips, music, tap-to-answer choices). When the owner says they've answered, read the document `norway-video` in the page's `decisions` collection with the ArtifactData tool. Page source: `docs/decision-page/` (run `build.py` after the script in `brief.md` changes, then republish to the same link).
- `docs/11-prep-notes.md`: what was prepared after session 1 (fact checks, intro and outro options, thumbnails, the storyboard plan, video 2 groundwork) and what is still waiting on the owner.
- Background, only if needed: `docs/01` (strategy), `02` (tools), `04` (demo review), `06` (channel setup), `07` (topic shortlist).

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
- Undecided: channel name, narrator voice engine. Parked: mascot, AI-generated cinematic clips.
