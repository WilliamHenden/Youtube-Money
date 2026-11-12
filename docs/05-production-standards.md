# Production Standards

*Started 12 November 2026 from the owner's feedback on the Costco demo. Every video and every pipeline change should follow this file. Update it whenever a decision changes.*

## 1. Channel direction (decisions so far)

- **Theme:** business explainers. Self-improvement comes in as the takeaway of each video ("what this teaches you about money, work or decisions"), not as standalone motivation videos.
- **Format:** long-form videos of 8+ minutes, each also producing vertical Shorts.
- **Name:** undecided. "Business Made Easy" is the idea, but the handles @BusinessMadeEasy, @BizMadeEasy and @BusinessMadeSimple are taken on YouTube. Shortlist with free YouTube handles (checked 12 Nov 2026): The Eight Minute MBA, Sofa MBA / Couch MBA, Business Makes Cents, Business Bitesized, Easy Business Stories, The Profit Fable, Flip Side of Money, Story of Profit.
- **Mascot: parked.** The owner didn't like the three sketches in `design/mascots/` (too clunky). No mascot runs through the videos. If one returns later, with a better design, it is only for the intro, the outro and the short subscribe moment. The first 8-minute video is made without one.
- **AI-generated cinematic clips:** not for now. Revisit only if the first 8-minute video feels flat.
- **Quality bar:** nobody who watched the demo suspected it was AI-made. Keep it that way.

## 2. Story and script

The demo's weakness was the story, not the look. Viewers said "I already knew that", and the narration told them facts without making them want the answer first.

### 2.1 Topic test (before any script is written)
- **The "already knew that" test:** if a typical viewer could guess the answer from the title, the topic needs a sharper angle or gets dropped.
- Every idea must state: the central question, the surprising answer, and why a viewer would care.

### 2.2 The core device: question → beat → payoff
- Pose a real question the viewer wants answered, hold it for a moment, then deliver the answer with emphasis (a pause in the narration, the biggest visual, a reserved sound).
- Example: "So how does Costco really earn six billion dollars a year?" … pause … "Not from anything on the shelves."
- **Use it sparingly: 3 or 4 times per video** (the opening, and the main reveal of each act). Overused, it becomes a tic.
- The pause is real: the script marks it and the pipeline inserts the silence.

### 2.3 Blueprint for an 8-minute video (about 1,150–1,250 spoken words)

| Time | Section | Job |
|---|---|---|
| 0:00–0:20 | **Hook** | The central question, one concrete surprising fact, and what's at stake. Confirms what the title and thumbnail promised. No logo, no "welcome back". |
| 0:20–1:15 | **Context** | Just enough background to make the question matter: who, what, how big. Plant one or two open loops ("we'll come back to why that nearly destroyed them"). |
| 1:15–3:00 | **Act 1: the obvious answer, and why it's wrong** | First mini-payoff by about 2:00, then a complication ("but…"). The short subscribe ritual goes after this payoff. |
| ~3:00 | **Re-hook** | Restate the bigger question with higher stakes. Retention commonly dips here. |
| 3:00–5:30 | **Act 2: how it really works** | The mechanism, step by step. Second mini-payoff. Include a setback, a rival or a counter-argument. |
| 5:30–7:15 | **Act 3: the main payoff** | The answer the viewer came for, delivered as question → beat → payoff, with the video's strongest visual. |
| 7:15–7:50 | **The takeaway** | What this teaches the viewer. One clear lesson. |
| 7:50–8:10 | **Lead-out** | Tease a specific next video over the end screen. No "thanks for watching". |

### 2.4 Writing rules
- **"But" and "therefore", never "and then".** Each beat must be caused by, or clash with, the one before.
- **Every section ends on an open loop** that the next section closes.
- **Something new every 20–40 seconds:** a fact, a turn, a visual mode change.
- **Specifics beat generalities:** names, dates, exact numbers.
- **One main idea per sentence,** but sentences flow into each other. Written to be spoken, not read.
- **Cut anything that doesn't serve the central question.**
- **No abbreviations with dots** ("the US", never "the U.S."), and numbers written the way they're spoken.

### 2.5 Sound like a person telling a story

Owner feedback: AI-written narration is often too sharp and clipped, as if an AI is talking to itself. The audience is ordinary people who want a story, not eight minutes of facts thrown at them.

- **Full, flowing sentences.** No strings of clipped fragments. The demo's "The cheap groceries. The cheap fuel. The one-fifty hot dog." is the style to avoid.
- **Talk to one person.** Say "you", use contractions and everyday words, the way you'd explain it to a friend.
- **Carry the facts inside the story.** Who did what, why they did it, and what happened next. People and decisions first, figures second.
- **Go easy on numbers:** one or two per passage, each one given a moment to land.
- **Vary the rhythm.** Mostly medium-length sentences. A short one for emphasis is fine when it's rare.
- **No stock AI phrases:** "here's the thing", "but here's the strange part", "let that sink in", "it's not X, it's Y", and lists of three punchy items.
- **Read-aloud test:** every script is checked line by line. If a line wouldn't sound natural said out loud to a friend, it's rewritten.
- **The voice follows the writing:** natural pace, commas where a person would breathe, and no rushing between sentences.

### 2.6 Process
1. Claude proposes ideas with the three statements from 2.1. The owner picks one.
2. Claude writes **five hook options** and an outline against the blueprint. The owner picks a hook.
3. Claude writes the full script and fact sheet (every claim sourced). The owner approves or edits.
4. Only then does production start.

*These timings are working rules drawn from widely used creator practice, not YouTube-published figures. The channel's own retention graphs replace them once videos are live. A common creator benchmark is 65–70% or more of viewers still watching at 30 seconds.*

## 3. Sound

Owner feedback: the sounds worked as emphasis, but the same few were repeated until they became annoying (the "ding", the counter "cranking", the transition "swoosh"). More variety, less repetition, and let pauses and timing do more of the work.

### 3.1 Rules
- **Fewer sounds overall.** Roughly one accent sound every 6–8 seconds at most. Many moves get no sound.
- **Reserve the big sounds.** The "reveal" sound plays only on the 2–4 biggest moments in a video. If everything dings, nothing does.
- **Silence is a tool.** Drop the music and effects for the beat before a major payoff.
- **Counters are quiet or silent** by default. No rattling on every number.
- **Transitions:** a sound only on scene changes, rotating between several different ones. Small in-scene moves are silent.
- **Cooldown:** the same sound file cannot play twice within 30 seconds.

### 3.2 How the pipeline enforces it
- Sounds are requested by **role** (reveal, pop, transition, impact, tick), not by file. Each role has 3–5 variants and the pipeline rotates them.
- The pipeline applies the cooldown and the density limit automatically, and drops the lower-priority sound when two collide.
- Every build prints a **sound report** (how many times each sound played) for review.

### 3.3 Better sounds
- Replace the synthesised set with a larger library of professionally recorded effects that are free for commercial use, each one's licence recorded.
- Replace the synthesised music loop with licensed tracks (the YouTube Audio Library is the safe free source).

## 4. Voice

- **Fixed:** "U.S." was read as "U. … S." with a sentence-length pause. The narrator now converts dotted abbreviations before speaking, and warns when a line has more long pauses than punctuation.
- **Pauses are scripted.** Each line can set its own gap, which is how the question → beat → payoff timing is made. This works with any voice engine.
- **Voice engine: undecided.** The free voice (Kokoro) is clear but has limited expression, which matters more now that delivery carries the storytelling. Next step is a side-by-side test of the same 30-second passage:
  1. Kokoro (current, free)
  2. A more expressive free model (now downloadable; may be slow here without a graphics card)
  3. ElevenLabs (paid, about £17/month; samples can be heard on their site first)
  The owner chooses by ear. The pipeline times everything from the audio, so switching engines doesn't affect the visuals.
- **One consistent narrator voice** per channel. A second voice is allowed only for the subscribe ritual.

## 5. Calls to action and the outro

- **No ask in the first 30 seconds.**
- **One subscribe moment per video,** under five seconds, after the first payoff (about a third of the way in). The same short line and the same look every time. A different voice is fine here, including the owner's own. A mascot could deliver it later if a design the owner likes is found.
- **No "press the bell".**
- **The ending sells the next video.** Narration runs to the end and teases a specific video ("Tomorrow: how … became …") over YouTube's end screen (next video + subscribe button). The end-card layout is identical in every video.
- Check the retention graph at the ritual's timestamp after the first few videos, and shorten or move it if viewers drop there.

## 6. Visuals

- **Rotate between visual modes** so the kind of image changes every 20–40 seconds:
  1. Data graphics (charts, counters, comparisons)
  2. Maps and timelines
  3. Real photos, cut out and animated with depth
  4. Bold text moments (the question, the answer, a key quote)
- **No mascot in the body of the video** (see section 1).
- **Scene templates first.** Most scenes come from reusable templates filled in from the script. Custom scenes are saved for the two or three key moments.
- **Every template has a vertical layout** so Shorts are rendered properly for phones, not cropped.
- Style guide (colours, fonts, motion) stays as built in `pipeline/video/src/lib/theme.ts`.

## 7. Sources consulted for section 2
- [OutlierKit: YouTube script template for long-form and Shorts](https://outlierkit.com/resources/youtube-script-template/)
- [OutlierKit: hooks and holding retention mid-video](https://outlierkit.com/resources/youtube-hooks-and-retention/)
- [OutlierKit: scriptwriting methods compared](https://outlierkit.com/resources/youtube-scriptwriting-methods-compared/)
- [OverseerOS: hook framework, seven openings](https://www.overseeros.com/blog/youtube-hook-framework-7-openings-that-keep-viewers-watching)
- [Hooked: writing a script that hooks viewers](https://www.hooked.so/blog/script-for-youtube-video)

These are creator blogs and template vendors, so their timings are heuristics, not measured facts.
