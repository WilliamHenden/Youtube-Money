# Youtube-Money: notes for Claude

A faceless YouTube business channel made with a code-based video pipeline. The owner is not a developer and often works from a phone: explain things in plain English and keep replies short.

## Read first
- `docs/05-production-standards.md`: the rules every video follows (story, writing, sound, voice, visuals). Follow it exactly and update it when the owner changes a decision.
- `docs/09-roadmap-and-decisions.md`: where the project stands, what's next, every decision the owner has made, and known risks.
- `docs/08-build-plan.md`: the current build plan and what each session should do.
- `projects/norway-fund/brief.md`: the first real video (script, fact sheet, status).
- `pipeline/README.md`: how the video pipeline works and how to build a video.
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
- Research tools: `tools/yt_search.py` (YouTube view counts for a topic) and `tools/yt_handle_check.sh` (handle availability).
- Undecided: channel name, narrator voice engine. Parked: mascot, AI-generated cinematic clips.
