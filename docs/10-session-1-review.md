# Session 1 Review: Template System and the Norway Sample

*13 November 2026. Covers "Session 1" of `08-build-plan.md`. Nothing here is the full video, and making the sample is not approval of the script.*

## Where everything is

| What | File |
|---|---|
| **The sample** (77 seconds, 1920×1080): the hook and context of the Norway video | `out/norway-fund-sample.mp4` |
| **The vertical Short** (46 seconds, 1080×1920): "the well nobody wanted to drill" | `out/norway-fund-short-last-well.mp4` |
| Contact sheets (a frame every 2 seconds) | `out/norway-fund-sample-contact-sheet.jpg`, `out/norway-fund-short-last-well-contact-sheet.jpg` |
| **Voice test clips** (the same 30 seconds in four voices) | `out/voice-tests/` |
| **Sound reports** | `out/norway-fund-sample-sound-report.txt`, `out/norway-fund-short-last-well-sound-report.txt` |
| Credits to paste into a description | `out/norway-fund-sample-credits.txt`, `out/norway-fund-short-last-well-credits.txt` |
| The storyboard for the sample and the Short | `projects/norway-fund/script.json` |
| Every template once, with made-up figures | `projects/template-gallery/script.json` (build it to watch it) |
| How to write a storyboard, and the template list | `pipeline/README.md` |
| Sound and music licences | `pipeline/audio/LICENCES.md` |
| This review | `docs/10-session-1-review.md` |

## The most important caveat (same as the demo)

**I still can't watch or listen the way you can.** I checked still frames and audio measurements. New this time: the pipeline listens to its own narration with a speech recogniser and tells me which words it didn't hear back as written. That catches some mispronunciations, but it is not an ear. The music, the sound effects and the voices have only been measured, never heard. **Your ears are the test for all three.**

## What was built

1. **Storyboard format.** A video is now one file: the words, plus a template and settings for each scene, pauses, and sound roles. The Norway sample, the Short and the template gallery all build from their script alone, with no scene code.
2. **17 scene templates**, each with a wide and a vertical layout: title, chapter, big number, bars, line chart, timeline, map, photo, split screen, icon row, question, answer, quote, name wall, flow diagram, subscribe moment, end card.
3. **Sound director.** Scripts ask for a role (transition, pop, impact, draw, tick, reveal). The director picks the file, rotates variants, and enforces your rules. A build that breaks a rule fails.
4. **Real photos** from Wikimedia Commons with the licence and credit recorded and shown on screen.
5. **Two voice engines** (Kokoro and Chatterbox), scripted pauses that work with both, and the listening check.
6. **Cuts:** a sample or a vertical Short is a named list of scenes in the same script, so Shorts re-use scenes and are laid out for phones, not cropped.

## The sample against your five improvements

| You asked for | What the sample does | My honest view |
|---|---|---|
| **Story** | Opens on the line in the sea, both countries finding oil, the two outcomes, then the question, a 1.3-second silence, and the title. The context tells the Phillips story as a chain of decisions. | The script does the work here, and I think the hook is strong. The question → beat → title is the one use of that device in the sample. |
| **Natural writing** | Full sentences, "you", contractions. One line changed (see below). | Reads naturally on paper. Whether the *voice* delivers it naturally is your call. |
| **Sound variety and restraint** | Seven effects in 77 seconds, about one every 11 seconds (the demo had roughly one every 2–3 seconds). No file plays twice. One reveal sound, on the title. Silence for the beat. Counter silent. | The rules are met by measurement. Whether these sounds are *pleasant* I can't tell you. |
| **Voice** | Sample uses the demo's voice (Kokoro "Heart") a little slower. Four test clips to choose from. | See "Voice test" below. |
| **Visual variety** | Nine scenes, eight different templates, no template twice in a row: map → split screen → question → title → chapter → timeline → icon row → photo → map. The kind of picture changes every 5–15 seconds. | Better than the demo for variety. Only one real photo, though (see weak moments). |

## The three weakest moments

1. **0:33–0:39, the "01 Before the oil" chapter card.** This was meant to be a real photograph of Stavanger harbour in 1960 (the file is chosen and its licence is fine). Wikimedia refused downloads from this machine for the whole session, so a chapter card stands in. It puts two text cards back to back (title, then chapter), and it is the flattest six seconds in the sample.
2. **0:39–0:54, the timeline.** Nearly fifteen seconds on one graphic with three labels. Each label arrives on its spoken word, but between arrivals not much moves. It needs either a second visual (a rig photo, or dry wells appearing on the map) or a tighter script.
3. **0:54–1:05, the icon row** ("licence, penalty, rig"). The icons are emoji, and the "rig" is a construction crane because the emoji set has no oil rig. It reads as a slide more than the scenes around it do. A real photo of a 1960s drilling rig, or drawn icons, would lift it.

Also worth knowing:
- **The photo "depth" is a slow push and drift, not a true cut-out.** The standards describe photos "cut out and animated with depth". Cutting a subject out of its background needs an extra tool I didn't add this session. The Ekofisk shot moves, but it's the classic documentary slow zoom.
- **The dividing line on the map is drawn from the 1965 agreement's coordinates as I remember them.** It is in the right place to the eye, but treat it as a schematic until it's checked against the treaty text in session 2.
- **The Short's first frame** shows the number already on screen ("$2.3 trillion"), which is right for Shorts, but its opening line is new writing that you haven't approved: "Norway's two point three trillion dollar oil fund began with a well that the oil company didn't even want to drill."

## Sound report (sample)

```
SOUND REPORT: norway-fund (sample), 77.0 seconds

Music: deliberate-thought at 22 LU under the voice
Effects played: 7 (one every 11s on average). Requests dropped by the rules: 5.

Played:
    time  role       file                          level  scene
     3.5  draw       writing-marker-draw          -4.0dB  the-line (line), under speech
    13.0  transition whoosh-medium-soft           -3.0dB  two-outcomes (scene change)
    19.9  impact     impact-medium-soft           -6.0dB  two-outcomes (britain), under speech
    29.7  reveal     shimmer-medium-bright        -1.0dB  title (scene change)
    38.8  transition whoosh-slow-soft             -5.0dB  dry-wells (scene change), under speech
    53.5  transition reverse-whoosh-medium-soft   -6.0dB  one-more-well (scene change), under speech
    64.6  impact     impact-medium-firm           -3.0dB  ekofisk (scene change)

How often each file played:
  1x  writing-marker-draw
  1x  whoosh-medium-soft
  1x  impact-medium-soft
  1x  shimmer-medium-bright
  1x  whoosh-slow-soft
  1x  reverse-whoosh-medium-soft
  1x  impact-medium-firm

Dropped:
    11.3  pop        the-line (oil): within 6s of the transition at 13.0s
    23.0  transition the-question (scene change): within 6s of the impact at 19.9s
    33.2  transition no-oil (scene change): within 6s of the reveal at 29.7s
    59.3  pop        one-more-well (rig): within 6s of the impact at 64.6s
    69.4  transition near-the-line (scene change): within 6s of the impact at 64.6s

Checks:
  PASS  No file repeated within 30 seconds (no file played twice)
  PASS  At most one sound every 6 seconds (closest two sounds 6.9s apart)
  PASS  Reveal sounds only on major moments (1 reveal(s): title at 29.7s)
  PASS  Silence during every scripted beat (1 beat(s): 28.3-29.6s)
  PASS  Counters silent (no tick sounds were asked for)
```

Loudness: sample **−14.0 LUFS, true peak −1.0 dBTP**, Short **−14.0 LUFS, true peak −1.0 dBTP** (target −14 LUFS, true peak at or below −1 dBTP).

**About the sound library.** You asked for professionally recorded effects. What I could reach and verify as free for commercial use is the SFX Kit by Wyzowl (an explainer-video company): 320 sounds, CC0, level-matched, each with a sync point. I use 27 of the soft, voiceover-friendly ones. But by its makers' own description it is **synthesised by code, not recorded with microphones**. It should be a clear step up from the demo's home-made sounds, and it may still sound "designed" to you. If it does, the fix is easy: download recorded effects by hand from Pixabay (free, no credit) and I map them onto the same roles.

**Levels.** Effects sit roughly 6 to 12 dB under the voice, and I set them by measurement. If they're too quiet or too loud, it's one number in the script, and `pipeline/remix.sh` re-does the sound in under a minute without rendering the pictures again.

**About the music.** "Deliberate Thought" by Kevin MacLeod, 22 LU under the voice (quiet, about the same as the demo), dropping out for the beat and lifting slightly under the title card. It is CC BY 4.0, so the credit in the credits file **must** go in the description. His music is on a great many YouTube videos; if you'd like something less familiar, pick a track from the YouTube Audio Library in YouTube Studio and send me the file.

## Voice test

Four clips of the same passage from Act 2, including the scripted pause before "Around three percent":

| Clip | Voice | Notes from measurement |
|---|---|---|
| `1-kokoro-heart-US-female_CURRENT.mp3` | The demo voice, at 95% speed | About 185 words a minute. Every word heard back correctly. |
| `2-kokoro-george-UK-male.mp3` | Kokoro's British male | Noticeably slower, about 160 words a minute. Every word heard back correctly. |
| `3-chatterbox-default.mp3` | Chatterbox, standard setting | About 170 words a minute. Every word heard back correctly. |
| `4-chatterbox-more-expressive.mp3` | Chatterbox, expression turned up | Faster, about 195 words a minute: turning expression up also speeds this voice up. Every word heard back correctly. |

- **Chatterbox is the "more expressive free model".** It runs here at about a third of real-time speed, so the full 8-minute video would take about 25 minutes to speak. That is acceptable. Its model is 3.3 GB and has to be downloaded at the start of a session that uses it.
- **ElevenLabs** (about £17 a month) is the paid option and isn't in the clips. Listen to samples on their site and compare with clips 3 and 4.
- The pause is identical in all four, because the pipeline inserts it.
- **For a story about Britain and Norway, a British narrator may suit the channel better.** That's a taste call for you.

## Words the listening check flagged in the sample

| Line | Script says | Recogniser heard | What I think |
|---|---|---|---|
| "Britain's side has turned into no fund at all" | fund | "fun" | **Please listen to this one.** If the "d" is swallowed, the fix is a small rewording ("no fund whatsoever", or "nothing at all"). |
| "It sat close to the line…" | It sat | "It's that" | Probably the recogniser, but worth a listen. |
| "a field called Ekofisk" | Ekofisk | "echofisc" | That is roughly how it should sound (EH-ko-fisk). Fine if it sounds right to you. |
| "…paying a penalty." | (nothing) | extra words after the sentence | A false alarm. I checked the audio: it ends where the sentence ends. |

## Checks against the build plan

| Check | Result |
|---|---|
| A new project builds from script and storyboard alone | **Pass.** Three projects do: `norway-fund`, `template-gallery`, `voice-test`. |
| No file repeated within 30 seconds; reveal only on marked moments | **Pass** in both sound reports. |
| Every template renders in 16:9 and 9:16 | **Pass on stills.** All 17 were checked in both shapes in the template gallery. Only the nine in the sample and Short have been through a full render. |
| Loudness −14 LUFS, true peak ≤ −1 dBTP | **Pass.** Both videos measure −14.0 LUFS with a true peak of −1.0 dBTP. |
| Every fact on screen and in narration matches the fact sheet | **Pass**, with one note: all the sample's facts are fact-sheet rows 1, 2, 3, 17 and 23 (all verified). The Ekofisk photo is captioned "photographed after 1985" because that is its real date, not 1969. |
| The review lists the three weakest moments | Above. |

## Script notes (for when you review the draft)

- **One line changed in the sample.** "There was just one problem. Its licence required one more well…" became "But its licence still required one more well…". The original opened with a stock phrase the standards rule out. `brief.md` still has your original wording.
- **One line to look at before approval** (not in the sample): "In other words, Norway doesn't spend its oil money. It spends what the oil money earns." It's the heart of the video, but it is the "it's not X, it's Y" pattern the standards ban. I'd suggest: "In other words, Norway only ever spends what its oil money earns."
- **The script may run short of 8 minutes.** At this narrator's pace, the sample's 198 words took 77 seconds including pauses and the title card. On that basis the 1,200-word script lands at roughly 7 to 7½ minutes. Mid-video adverts need 8 minutes. Options: about 150 more words, a slower voice (the British Kokoro voice would take it past 8), or both.
- **The hook and context run long against the outline** (about 1:30 where the outline allowed 1:20). I'd leave it: it's the strongest part.

## Decisions I made without asking

- **Stopped the sample at "only four years earlier."** The last context paragraph ("Norway was suddenly an oil country…") would have taken it to 94 seconds. It's storyboarded and ready (as a quote card) for the full video.
- **Sound library and music** as described above, because the recorded libraries and the YouTube Audio Library couldn't be reached from here.
- **Photos: public domain, CC0 and CC BY only.** I excluded share-alike (CC BY-SA) photos, which are most of Wikimedia's modern photography, because using one may oblige the whole video to carry the same licence. Say if you'd rather allow them.
- **Voice for the sample:** the demo's voice at 95% speed, since you hadn't chosen yet.
- **Two additions to the cloud environment, both approved by you during the session:** the Hugging Face download address for the Chatterbox voice, and incompetech.com for the music. The environment's install script now also installs the listening check. That script change is unproven until the next fresh session starts.
- **Channel label** on screen is still the demo's "MONEY MECHANICS" placeholder.

## What didn't get done

- The Stavanger 1960 photo (blocked download; file and licence are noted in the storyboard).
- Pexels and Pixabay photo search (they need free keys from you; not needed yet).
- True cut-out photo depth.
- ElevenLabs in the voice test (paid, so not without your say).
- The `subscribe`, `end`, `names`, `flow`, `chart`, `bars`, `number`, `answer` and `quote` templates are built and checked on stills, but aren't in the sample because the hook and context don't call for them. The Short uses `number` and `quote`.

## What I need from you

1. **Watch the sample and the Short with sound on.** Tell me what you'd change about the sounds, the music, the pace and the look.
2. **Pick a voice** from `out/voice-tests/` (or ask for ElevenLabs).
3. **Approve or edit the script** in `projects/norway-fund/brief.md`, including the notes above.
4. Optional: a music track from the YouTube Audio Library, and recorded sound effects if these sound synthetic to you.

Then session 2 makes the full video.
