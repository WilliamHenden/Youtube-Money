"""YouTube search research: top results with view counts for each query.

Usage: python3 tools/yt_search.py "why norway is so rich" "another query"
Needs www.youtube.com allowed in the environment. Reads public search pages only.
Use it to check demand for a topic and to spot clusters of tiny copycat channels.
"""
import sys, re, json, urllib.parse, subprocess
def search(q, n=6):
    url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(q) + "&hl=en&gl=US"
    html = subprocess.run(["curl", "-s", "-m", "20", "-L", "-H", "Accept-Language: en-US,en", "-H", "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36", url], capture_output=True, text=True).stdout
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
    if not m: return [("NO DATA len=%d" % len(html), "", "", "", "")]
    out = []
    def walk(o):
        if isinstance(o, dict):
            if "videoRenderer" in o:
                v = o["videoRenderer"]
                g = lambda k: (v.get(k, {}).get("simpleText") or "".join(r.get("text", "") for r in v.get(k, {}).get("runs", [])))
                out.append((g("title"), g("viewCountText"), g("publishedTimeText"), g("lengthText"), g("ownerText")))
            else:
                for x in o.values(): walk(x)
        elif isinstance(o, list):
            for x in o: walk(x)
    walk(json.loads(m.group(1)))
    return out[:n]
for q in sys.argv[1:]:
    print(f"\n## {q}")
    for t, v, a, l, c in search(q):
        print(f"  {v:>18} | {a:<13} | {l:>7} | {c[:22]:<22} | {t[:70]}")
