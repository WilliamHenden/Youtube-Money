"""Builds the owner's decision page for the Norway video: docs/decision-page/index.html

  python3 docs/decision-page/build.py

The script text is read from projects/norway-fund/brief.md (section 3), so the page always shows the current draft.
The page is published as a private Artifact; its media files (videos, voice clips, music excerpts) are published
alongside it and are not kept in the repo, apart from out/voice-tests/ and out/music-samples/.
"""
import os, re, html

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
brief = open(os.path.join(ROOT, "projects/norway-fund/brief.md"), encoding="utf-8").read()
body = brief[brief.index("### Hook"): brief.index("## 4. Notes for the owner")]

TIMES = {"Hook": "0:00 to 0:25", "Context": "0:25 to 1:20", "Act 1: who owns the oil": "1:20 to 2:50", "Subscribe moment": "2:50 to 3:00",
         "Re-hook": "3:00 to 3:15", "Act 2: spend or save": "3:15 to 5:20", "Act 3: the payoff": "5:20 to 7:00", "Takeaway": "7:00 to 7:40", "Lead-out": "7:40 to 8:00"}

# The two lines with a suggested rewording. Shown inline with a choice.
SWAPS = {
    "There was just one problem. Its licence required one more well, and walking away meant paying a penalty.":
        ("line1", "But its licence still required one more well, and walking away meant paying a penalty.",
         "The original opens with a stock phrase your writing rules ask me to avoid. The sample already uses the new wording."),
    "In other words, Norway doesn't spend its oil money. It spends what the oil money earns.":
        ("line2", "In other words, Norway only ever spends what its oil money earns.",
         "The original is the \"it's not X, it's Y\" pattern your writing rules rule out. It is also the heart of the video, so this one is your call."),
}


def para(text):
    out = html.escape(text, quote=False)
    out = out.replace("`[beat]`", '<span class="beat">pause</span>')
    out = out.replace("`[figure to confirm]`", '<span class="todo">figure to confirm on publish day</span>')
    out = out.replace(" ⚠", '<span class="check" title="This fact is checked before recording">to check</span>')
    return out


parts = []
for block in re.split(r"\n\s*\n", body.strip()):
    block = block.strip()
    if block.startswith("### "):
        name = block[4:].strip()
        parts.append(f'<h3 class="act"><span>{html.escape(name)}</span><span class="when">{TIMES.get(name, "")}</span></h3>')
    elif block.startswith("*(") or block == "---":
        if block != "---":
            parts.append(f'<p class="stage">{html.escape(block.strip("*()"))}</p>')
    else:
        done = False
        for old, (key, new, why) in SWAPS.items():
            if old in block:
                before, after = block.split(old)
                parts.append(f"""<div class="swap">
<p class="line">{para(before)}<mark>{para(old)}</mark>{para(after)}</p>
<div class="suggest"><p class="why"><strong>Suggested change.</strong> {html.escape(why, quote=False)}</p>
<p class="new">{html.escape(new)}</p>
<div class="chips" role="radiogroup" aria-label="Which wording">
<label><input type="radio" name="{key}" id="{key}-new" value="Use the suggestion"><span>Use the suggestion</span></label>
<label><input type="radio" name="{key}" id="{key}-old" value="Keep my original"><span>Keep my original</span></label>
</div></div></div>""")
                done = True
        if not done:
            parts.append(f'<p class="line">{para(block)}</p>')
words = len(re.findall(r"[A-Za-z0-9'’-]+", re.sub(r"###.*|\*\(.*\)\*|`\[.*?\]`", "", body)))

page = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
page = page.replace("<!--SCRIPT-->", "\n".join(parts)).replace("<!--WORDS-->", f"{round(words, -1):,}")
open(os.path.join(HERE, "index.html"), "w", encoding="utf-8").write(page)
print(f"wrote docs/decision-page/index.html ({len(page) // 1024} KB, script about {words} words)")
