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

TIMES = {"Hook": "0:00", "Intro sting": "0:43", "Context: the last well": "0:48", "Act 1: who owns the oil": "2:00", "Subscribe moment": "3:10",
         "Re-hook": "3:15", "The Britain detour": "3:27", "Act 2: the fright, and the rule": "5:00", "Act 3: what the rule built": "6:35",
         "The answer, and the takeaway": "7:45", "Outro": "8:40"}

# Lines offered with a suggested rewording, shown inline with a choice. Draft v2 has none.
SWAPS = {}


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
        parts.append(f'<h3 class="act"><span>{html.escape(name)}</span><span class="when">{("from about " + TIMES[name]) if name in TIMES else ""}</span></h3>')
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
