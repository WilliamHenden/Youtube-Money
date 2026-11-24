# Voice Workflow: ElevenLabs and How a Video Comes Together

*17 November 2026. Answers the owner's questions about ElevenLabs, speech to speech, the order of work, and Spotify. Prices are from third-party guides checked on 17 November; confirm on elevenlabs.io/pricing before paying.*

## The order of work

**Script → voice → pictures.** This is already how the pipeline works.

1. The script is written and approved. The words are fixed from here, because changing a word later means remaking that piece of audio.
2. The narration is made: ElevenLabs reads it, or the owner records it and ElevenLabs re-voices it.
3. The pipeline listens to the narration and times every word.
4. The storyboard is built on those times: each picture appears on the word it belongs to. The storyboard can be drafted while the voice is being made, because scenes are pinned to words, not to seconds.
5. Stills are checked, then one full render.

The video is never made first and then voiced to fit. Narration first gives natural pacing, and the pictures follow it.

## Two ways to use ElevenLabs

| | A. ElevenLabs reads the script | B. The owner records, ElevenLabs re-voices it |
|---|---|---|
| Who does the work | Claude, automatically | The owner records about 8 minutes per video (more with retakes); Claude does the rest |
| Delivery | Good, and the most consistent from video to video | The owner's own timing and emphasis, in the channel's voice |
| Fixing one line | Remake that sentence in seconds | Re-record that sentence |
| Credits for an 8-minute video | About 6,700 per full read (1 credit per character; the Norway script is about 6,700 characters). Allow 10,000 to 15,000 with retakes. | About 8,000 (1,000 credits per minute of audio). Plus the owner's time. |
| Fits the one-button goal | Yes | No: a person has to record every video |

**The money is about the same either way.** The real difference is the owner's time and how easy it is to fix a line.

Plans, as reported for 2026 (check the official page): Starter about $6 a month with 30,000 credits and a commercial licence; Creator $22 a month with about 121,000 credits. The free plan has no commercial licence, so it can't be used for monetised videos. Starter covers two or three videos a month; Creator about ten. Shorts reuse the long video's narration, so they cost nothing extra.

**Suggested approach:** start with A for everything. If a few key moments (the hook, the big reveals) don't land, the owner records just those lines and they are re-voiced with B. That keeps the owner's recording to a minute or so per video.

## How Claude connects to ElevenLabs

**Done (24 November 2026):** the owner saved a restricted API key in the environment, and `pipeline/voice/engines.py` has a working `elevenlabs` engine. The steps below are how it was set up.

- The owner opens an account (Starter is enough to begin) and creates an API key.
- Claude asks for the key through the secure form in this environment. It is never pasted in chat and never stored in the repo.
- `api.elevenlabs.io` is added to the environment's allowed sites.
- An `elevenlabs` engine is added to `pipeline/voice/engines.py`, beside Kokoro and Chatterbox. After that, `pipeline/build.sh <video>` makes the narration with no extra steps.
- For speech to speech: the owner sends a phone recording (in chat or in the Drive folder). The pipeline re-voices it, then times the words the same way.

Nothing needs installing on the owner's side. ElevenLabs also has its own MCP connector, but the API key route keeps everything inside the build, so it runs automatically.

**Choosing the voice:** once connected, Claude makes the usual 30-second test passage in four to six ElevenLabs voices for the owner to choose by ear. Whatever is chosen becomes the channel's only narrator.

## Spotify

- **Allowed, as far as the published policy shows.** Spotify's May 2026 rule bans AI voices that impersonate a real person without permission. An AI narrator that imitates nobody isn't covered by it. Music must be licensed (the channel's CC BY music is, with its credit). A fully AI-voiced show is unlikely to get Spotify's new "verified" badge.
- **Audio only or video.** Spotify for Creators takes audio and video podcasts. The finished YouTube video could go up as a video podcast with no extra work. An audio-only edition would need a few lines adjusted where the script relies on a map or chart.
- **Money.** Spotify's Partner Program pays video podcasts. Reported thresholds: three episodes, 2,000 hours watched or listened, and 1,000 engaged listeners in the last 30 days. Check the country list and current rules on the Monetize tab before planning around it.
- Treat Spotify as a later step, after the YouTube channel is running (roadmap item 7).

## Sources
- ElevenLabs plans and credits (third-party guides, 2026): [Smallest.ai](https://smallest.ai/blog/elevenlabs-pricing-plans-cost-what-you-get-in-2026), [BigVU](https://bigvu.tv/blog/elevenlabs-pricing-2026-plans-credits-commercial-rights-api-costs/), [Toolradar](https://toolradar.com/tools/elevenlabs/pricing)
- Voice changer at 1,000 credits per minute: [ElevenLabs pricing page (German)](https://elevenlabs.io/de/pricing), [DIY AI](https://diyai.io/ai-tools/audio-generation/elevenlabs-pricing/)
- Spotify impersonation policy: [Spotify support](https://support.spotify.com/jp/creators/article/impersonation-policy/), [Music Business Worldwide](https://www.musicbusinessworldwide.com/spotify-extends-verified-by-spotify-badges-to-podcasts-further-cracking-down-on-ai-impersonators/)
- Spotify Partner Program: [Spotify newsroom](https://newsroom.spotify.com/?p=42323), [RouteNote](https://routenote.com/radar/spotify-partner-program-expands-to-more-than-35-new-countries-how-creators-can-make-money/)
