# Roadmap and Decisions

*Last updated 13 November 2026. This file records what the owner has decided and what comes next, so a new session doesn't need the earlier conversations.*

## Where things stand

- **Done:** strategy research, tools research, an 82-second demo video the owner and their family rated highly, production standards from the owner's feedback, channel setup research, and the script draft for the first real video.
- **Not done:** the scene template system, the first 8-minute video, the YouTube channel itself (not created yet), branding, and all automation.

## The roadmap, in order

1. **Template system and a 60–90 second sample** (session 1 in `08-build-plan.md`).
2. **First full video:** Norway's oil fund (session 2).
3. **Owner tests it** on friends and family, creates the YouTube channel (checklist in `06-channel-setup.md`) and uploads.
4. **Passive research:** a scheduled job that gathers which competitor videos are outperforming, feeding a ranked idea shortlist. Plain scripts where possible, since scheduled Claude sessions use the owner's limit.
5. **Command centre:** a web dashboard with a "big red button" that starts the weekly run, shows each video's status, and handles the three approvals (idea, script, finished video) from a phone. The owner has Vercel and Supabase connected.
6. **Cross-posting** the vertical clips to TikTok, Instagram and Facebook.

The owner's end goal: press one button at the start of the week, approve at three points, and have long videos plus 2–3 Shorts a day produced and published.

## Video queue

1. **How Norway Saved $2.3 Trillion and Britain Saved Nothing** (script drafted, `projects/norway-fund/brief.md`)
2. **America's debt:** who does America owe the money to, and why hasn't it gone bust? Use the exact current figure in the title. Avoid the word "thrives".
3. **How billionaires pay for everything without selling anything:** borrowing against shares. Elon Musk is an example, not the subject.

Later ideas: why glasses cost so much; buying a company with its own money (as a story, not how-to advice). Dropped for now: standalone "how to buy a business with no money" advice, and broad AI-topic videos.

Pattern: the owner's ideas are about **how money really works** (debt, wealth, national finances), with company stories alongside.

## Decisions made

| Topic | Decision |
|---|---|
| Channel theme | Business and money explainers, with a self-improvement takeaway at the end of each video |
| Format | 8+ minute videos, each cut into vertical Shorts |
| Platforms | YouTube only for income to begin with. Claim the channel name on the other platforms. Cross-post later. |
| Google account | Use the owner's spare Google account, create a brand channel, add the main account as a second owner |
| Storage | Finished long videos go to the Google Drive folder "YouTube Business - Videos" |
| Code | One main line (the repo's default branch); each session merges into it at the end without asking |
| Mascot | Parked. The owner didn't like the first three designs. If it returns, intro, outro and subscribe moment only. |
| AI cinematic clips | Not for now. Revisit only if the first long video feels flat. The owner is willing to pay a few pounds per video if needed. |
| Channel name | Undecided, and not a priority. Shortlist in `05-production-standards.md`. |
| Narrator voice | Undecided. Side-by-side test in session 1; the owner chooses by ear. Open to paying for a better voice. |
| Affiliate links | Only for products genuinely used or relevant to a video, clearly labelled. No false "we use this" claims. |
| Spending | Avoid new subscriptions and hardware unless they clearly earn their place |

## Known risks for the next session

- **The environment's install script is untested.** It was run by hand successfully, but its first real run is the next fresh session. If the tools are missing, the commands are in `pipeline/README.md`.
- **Voice-model downloads may be blocked.** `huggingface.co` is allowed, but model files are often served from other download hosts. If a download is refused, propose adding that exact host to the environment.
- **Pexels and Pixabay need free API keys.** Ask the owner through the secure credential form. Wikimedia Commons needs no key.
- **A stray branch named "Main"** may still exist on GitHub. It is an old copy; ignore it. The default branch is the main line.
- **The demo's narration and sound were never heard by Claude.** The owner's ears are the only real test of audio.

## Research tools in the repo

- `tools/yt_search.py`: top YouTube results with view counts for any search, for checking demand and spotting copycat clusters.
- `tools/yt_handle_check.sh`: checks whether YouTube handles are free.
