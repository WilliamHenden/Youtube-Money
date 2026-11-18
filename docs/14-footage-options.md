# Footage Options: Free, Paid and AI

*19 November 2026. Researched because the owner asked whether paying for Artlist (or similar) would improve the videos enough to be worth it. Prices are from third-party trackers; check the official pages before paying.*

## The short version

- **Video 1 (Norway): free sources only.** Pexels and Pixabay videos are free, have no watermark and can be used in monetised videos. Pexels has a free API, so the pipeline can fetch footage itself once the owner adds a free key. Historical photos come from Wikimedia (the Norwegian Petroleum Museum's are CC BY). The rest is the channel's own motion graphics.
- **Revisit after video 1.** If the owner feels the real-footage moments look thin or generic, trial one paid month for video 2 and judge by eye.
- **No paid service solves the hardest gap**, which is real archive footage of history (1960s rigs, 1980s Britain). Stock libraries are mostly modern footage.

## What each option offers

| Option | Cost | What it gives | Can Claude run it automatically? | Notes |
|---|---|---|---|---|
| **Pexels** | Free | Photos and video, no watermark, free for commercial use | Yes: free API (`pipeline/media/pexels.py`, needs the owner's key) | Quality varies; plenty of nature, cities, offshore, money shots |
| **Pixabay** | Free | Same idea | Partly: its key has to go in the web address, which the secure key store can't do | |
| **Wikimedia Commons** | Free | Real historical photos | Yes, but it throttles this machine | Only public domain, CC0, CC BY |
| **Artlist** | Footage plans about $17–40/month (annual); AI credit plans separate | Cinematic stock footage, music and sound effects, plus AI image, video and voice generation (it includes ElevenLabs' voice models) | **Partly.** Artlist has an MCP connector for Claude, but it is for **AI generation** (paid per use in credits, not covered by "unlimited" plans). It can find music; there is no confirmed way for Claude to search and download its **stock footage**. Downloads are done on the website. | Licence covers monetised YouTube for anything published while subscribed. Its music is registered with YouTube's Content ID, so the channel has to be registered with Artlist ("Clearlist") to avoid claims. |
| **Storyblocks** | About $21–30/month for unlimited downloads | Large stock footage library | Its API is Enterprise only, price on request | |
| **AI-generated clips** (Artlist, Higgsfield, Runway and similar) | Credits per clip, adds up fast | Any shot you can describe | Yes, through MCP connectors | Fine for mood shots (an oil drop, money flowing, a stormy sea). **Not** for real events: an AI "1969 oil rig" isn't real, and realistic synthetic footage needs YouTube's "altered content" disclosure. The owner parked AI clips until the first video is judged. |

## What matters most

1. **Automation.** The one-button goal needs footage Claude can fetch without a person clicking. Today that's Pexels (free key). Artlist's stock footage isn't automatable as far as the research shows.
2. **Authenticity.** History scenes need real photos, not AI. Viewers trust real.
3. **Cost.** ElevenLabs is already about $6 a month. One more subscription should only be added once it clearly earns its place.

## Sources
- Artlist and ElevenLabs: [Artlist's ElevenLabs page](https://artlist.io/ai/models/elevenlabs), [Artlist vs ElevenLabs](https://artlist.io/blog/artlist-vs-elevenlabs/)
- Artlist MCP and pricing: [Artlist MCP](https://artlist.io/mcp), [Artlist AI pricing](https://artlist.io/blog/ai-tools-pricing-plans/), [PricingSaaS changelog](https://pricingsaas.com/companies/artlist/diffs/2026W31), [Subger](https://subger.com/en/service/artlist)
- Artlist licence: [Artlist licence page](https://artlist.io/help-center/privacy-terms/artlist-license), [licence explained (third party)](https://www.cchound.com/artlist/artlist-license/)
- Storyblocks: [API](https://www.storyblocks.com/api), [PricingSaaS](https://pricingsaas.com/companies/storyblocks)
- Free footage for monetised YouTube: [FluxNote guide](https://fluxnote.io/guides/best-stock-footage-sites-creators-2026)
