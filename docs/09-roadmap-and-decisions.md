# Roadmap and Decisions

*Last updated 13 November 2026. This file records what the owner has decided and what comes next, so a new session doesn't need the earlier conversations.*

## Where things stand

- **Done:** strategy research, tools research, an 82-second demo video the owner and their family rated highly, production standards from the owner's feedback, channel setup research, the script draft for the first real video, and (13 November, session 1) the scene template system, the sound director, the photo fetcher, the voice test and a sample of the Norway video with one vertical Short.
- **Waiting on the owner:** feedback on the sample (`docs/10-session-1-review.md`), a choice of voice from `out/voice-tests/`, and approval of the Norway script.
- **Not done:** the first 8-minute video, the YouTube channel itself (not created yet), branding, and all automation.

## The roadmap, in order

1. **Template system and a 60–90 second sample** (session 1 in `08-build-plan.md`). *Done 13 November 2026.*
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
| Narrator voice | Undecided. Four free clips are in `out/voice-tests/`. On 13 November the owner asked to look harder at ElevenLabs and at "speech-to-speech" (a person records the narration and AI re-voices it, keeping the human emphasis). Next step: add both to the voice test once the owner provides an ElevenLabs key. Open to paying for a better voice. |
| Real imagery | At least 4 to 6 real photos or clips per 8-minute video (owner, 13 November). Stock video from Pexels and Pixabay to be added. |
| Affiliate links | Only for products genuinely used or relevant to a video, clearly labelled. No false "we use this" claims. |
| Spending | Avoid new subscriptions and hardware unless they clearly earn their place |

## Known risks for the next session

- **The environment's install script worked** on its first real run (13 November). It was then extended to install the listening check too; that version is unproven until a fresh session starts. If anything is missing, run `pipeline/setup.sh` (add `chatterbox` for that voice, 3.3 GB, which is never installed automatically).
- **Voice-model downloads:** Hugging Face serves model files from `us.aws.cdn.hf.co`, which the owner added to the environment on 13 November, along with `incompetech.com` for the music.
- **Wikimedia Commons throttles this machine's shared address.** Searches and downloads were refused for long stretches in session 1. Search sparingly, name exact files in the script, and allow time for retries. If it blocks the full video, ask the owner for free Pexels and Pixabay keys through the secure credential form and wire those in.
- **The sound effects are a designed, synthesised library (CC0), not recordings.** If the owner dislikes them by ear, recorded ones have to be downloaded by hand (Pixabay) or the environment needs freesound.org and an API key.
- **Music is CC BY (Kevin MacLeod), so the description must carry the credit.** His tracks are very widely used on YouTube; the owner may prefer a YouTube Audio Library track for a more distinctive sound.
- **A stray branch named "Main"** may still exist on GitHub. It is an old copy; ignore it. The default branch is the main line.
- **The demo's narration and sound were never heard by Claude.** The owner's ears are the only real test of audio.

## Research tools in the repo

- `tools/yt_search.py`: top YouTube results with view counts for any search, for checking demand and spotting copycat clusters.
- `tools/yt_handle_check.sh`: checks whether YouTube handles are free.
