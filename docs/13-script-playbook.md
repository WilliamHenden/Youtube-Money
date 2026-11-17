# Script Playbook

*Written 17 November 2026 while drafting the Norway script (draft v2). Every script follows this file, together with section 2 of `05-production-standards.md`. Update it whenever the owner's feedback or the channel's own retention graphs teach us something.*

## How good is the evidence?

I looked for research on three things: what keeps viewers watching, how to write for the ear, and what makes narration sound machine-made.

- **Retention advice** comes mostly from creator blogs and tool vendors. They agree with each other, but none of it is measured data we can check. Treat it as a sensible starting point. The channel's own retention graphs replace it once videos are live.
- **Writing for the ear** is the best-founded part. Broadcast journalism has taught the same rules for decades (CBC, university journalism courses, radio producers).
- **"AI tells"** is opinion, but consistent: listeners notice sentence patterns and structure more than single words.
- **ElevenLabs guidance** is from ElevenLabs' own documentation and its connector's model guide.

## 1. Shape: what keeps people listening

1. **The first sentence keeps the title's promise** and carries the most surprising true fact. No greeting, no "in this video".
2. **The hook ends on one clear question** the whole video answers. Keep the hook under about 45 seconds.
3. **Pay off in stages.** Give a real answer every 60 to 90 seconds, and let each answer raise the next question (early payoff, deeper question, next payoff).
4. **Every section ends on an open loop** that the next section closes.
5. **Change something every 60 to 90 seconds:** a new person, a new place, a direct question, a detour. In the Norway script these are the last well, the geologist from Iraq, the Britain detour and the 1986 crash.
6. **Re-hook around one third and one half of the way through.** Restate what is still unexplained.
7. **Answer the opening question out loud** near the end, in a few sentences, then give one lesson for the viewer. The outro that follows only teases the next video.
8. **"But" and "so", not "and then".** Each beat is caused by the one before or clashes with it.

## 2. Audio first (owner's rule, 17 November 2026)

Some people will only listen. The video has to work with the screen off.

- **Narration is close to continuous.** Scripted pauses are about a second. The only longer gap is the three-second intro sting, which has music.
- **Never rely on the picture to carry a fact.** No "as you can see" or "this chart shows". Say the number.
- **Use the question → pause → payoff device two or three times,** with short pauses.

## 3. Writing for the ear

- **One idea per sentence.** Most sentences run 10 to 25 words. A short one now and then for emphasis. The Norway draft averages 16 words, with only two over 30.
- **Full sentences that flow into each other.** No strings of clipped fragments.
- **Keep the subject and its verb together.** Don't park a long clause between them: the listener can't re-read.
- **Put the important thing at the end of the sentence,** where the voice naturally lands on it.
- **Go easy on numbers:** one or two per sentence, rounded, written as they are spoken ("two point three trillion dollars"). Give a big number something human to stand on ("about four hundred thousand dollars for every person").
- **Repeat a name** instead of using "it" or "they" when a few sentences have passed.
- **Talk to one person.** "You", contractions, everyday words.
- **Read every line aloud.** If you stumble or run out of breath, rewrite it.

## 4. Sounding like a person who knows the subject

- **Tell it through people and decisions.** Who did what, why, and what happened next. Figures come second.
- **Have a point of view, lightly.** A narrator who says "it's only fair to say why" or "the numbers start to look absurd" sounds like someone thinking, not reciting.
- **Be fair to the other side.** It is more convincing and it protects the channel.
- **Admit what isn't known.** "Their answers run anywhere from…" is stronger than a false precise figure.
- **Use the narrator's own idiom.** The channel's voice is a calm British storyteller, so British phrasing: "had had enough", "pack up and go home", "the taxman", "a fright".
- **Concrete over grand.** "The fund sat completely empty for six years" beats "the fund had humble beginnings".

## 5. Phrases and patterns that give a script away

Never use these. One alone is harmless; a cluster is what listeners notice.

- **Stock connectors:** "here's the thing", "but here's the strange part", "that said", "it's important to note", "let that sink in", "fast forward to", "little did they know".
- **Stock hooks:** "you won't believe", "in today's video", "stop scrolling", "what happened next will…".
- **Stock vocabulary:** "delve", "dive into", "game-changer", "supercharge", "changed everything", "something remarkable".
- **The flip:** "it's not X, it's Y", as a flourish. Answering a real question with a contrast is fine.
- **Punchy lists of three fragments** ("The cheap groceries. The cheap fuel. The hot dog.").
- **One-word rhetorical questions** ("The result?").
- **A neat slogan at the end of every paragraph,** and paragraphs that are all the same length.
- **Dashes used as dramatic pauses.** Use a comma or a full stop.

## 6. Truth in hooks and titles

- Curiosity comes from **true, specific facts**. If a claim needs "technically", it doesn't go in a title or a hook.
- A superlative ("biggest", "richest", "first") needs a source in the fact sheet and must be worded as narrowly as the source ("no country has a bigger fund", not "the richest country").
- When a fact can't be confirmed for today, write it in the tense that is confirmed ("began flowing", not "earns").

## 7. Writing for the ElevenLabs voice

The channel's narrator is ElevenLabs "James - English Story Teller" (`GrVxA7Ub86nJH91Viyiv`).

- **Measured pace:** about 190 words a minute on the Norway hook (115 words in 36.5 seconds, model `eleven_v4`). Brisker than his description suggests.
- **Length:** about **1,400 words makes roughly 8½ minutes** once pauses, the sting and the subscribe moment are added. 8 minutes is the floor for mid-video adverts, so don't go under about 1,330.
- **Punctuation is the direction.** Commas and full stops make natural pauses, so put a comma wherever a person would breathe. Ellipses make a longer, thoughtful pause; use them rarely.
- **Scripted pauses** are marked `[beat]`. The pipeline inserts exact silence itself, which is more reliable than pause tags, and too many pause tags can make the voice unstable.
- **Emphasis:** rewrite so the key word ends the sentence. Capitals for emphasis only as a last resort.
- **Audio tags** like `[warmly]` work on `eleven_v4` and `eleven_v3` only. Leave them out unless a line clearly needs one. Other models read them aloud.
- **Numbers:** scripts keep them as spoken words, which every model reads correctly. ElevenLabs says `eleven_v4` also handles ordinary figures ("$2.3 trillion"); the hook sample was sent that way.
- **Hard names:** check by ear on the first narration. If one is wrong, fix it by respelling ("EK-oh-fisk") or, on `eleven_v4`, with its pronunciation in slashes.
- **Speed:** `eleven_v4` has no speed setting. `eleven_multilingual_v2` does, if a slower or faster read is ever needed.
- **Cost:** 1 credit per character. The Norway script is about 7,800 characters per full read. The pipeline keeps every line it has made, so only changed lines cost credits again.

## 8. Method for each script

1. Start from the owner's angle and the fact sheet. Add no fact without a source.
2. Write the question the video answers, then the answer in two sentences. If the answer is dull, the angle is wrong.
3. Outline the sections with a word budget (about 1,400 in total).
4. Write the hook three ways and pick one.
5. Write the body section by section, ending each on an open loop.
6. Run the checks: section 5's list, sentence lengths, numbers per sentence, and every claim against the fact sheet.
7. Read it aloud. Then make the hook in the channel's voice and listen before the owner sees it. (Claude can't listen, so the owner's ear is the test.)
8. Offer the owner hook and outro options, and say where the script is being careful with the truth.

## Sources

- Retention and structure (creator guides, not measured data): [MySocial](https://mysocial.io/blog/make-youtube-script/), [OutlierKit](https://outlierkit.com/resources/youtube-script-writing/), [OverseerOS](https://www.overseeros.com/blog/youtube-retention-architecture-2026), [Social Media Examiner](https://www.socialmediaexaminer.com/youtube-retention)
- Writing for the ear: [CBC, The Doc Project](https://www.cbc.ca/radio/docproject/blog/the-craft-of-writing-for-radio-16-tips-from-a-veteran-script-writer-1.3562474), [University of Florida broadcast writing guide](https://edis.ifas.ufl.edu/publication/wc193), [Hearing Voices: writing for the ear](https://hearingvoices.com/tow/narration-writing-for-the-ear), [Media Helping Media](https://mediahelpingmedia.org/how-to/how-to-write-a-radio-news-script/)
- What gives a script away: [UCLA Languaged Life](https://languagedlife.ucla.edu/?p=3854), [Vidrush](https://vidrush.ai/blog/why-faceless-youtube-videos-feel-generic), [Subscribr](https://subscribr.ai/p/human-oversight-ai-youtube-content)
- ElevenLabs: [prompting best practices](https://elevenlabs.io/docs/best-practices/prompting/eleven-v3), [controls](https://elevenlabs.io/docs/best-practices/prompting/controls), and the model guide in its connector
