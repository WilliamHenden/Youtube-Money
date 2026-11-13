"""Find and download real photos (and music) from Wikimedia Commons, with the licence and credit for each.

  python pipeline/media/commons.py search "Ekofisk oil platform"          list photos that are safe to use
  python pipeline/media/commons.py search "Kevin MacLeod calm" --audio    list audio files
  python pipeline/media/commons.py fetch <project-id>                     download every photo the script asks for
  python pipeline/media/commons.py get "File:Name.jpg" out.jpg            download one file and print its credit

A project lists its photos in script.json:
  "photos": { "ekofisk": { "file": "File:Ekofisk complex.jpg" },          an exact Commons file
              "coast":   { "search": "Norway coast fishing village" } }   or the first safe search result
`fetch` saves projects/<id>/photos/<key>.jpg and projects/<id>/photos/credits.json. Files already there are kept.

Licence rule: only public domain, CC0 and CC BY (credit required) are accepted. Share-alike (CC BY-SA) files are
skipped by default, because putting one in a video may oblige the whole video to carry the same licence; non-commercial
and no-derivatives files are never accepted. No API key is needed. Commons limits how fast it can be asked, so every
request waits and retries politely.
"""
import sys, os, re, json, time, html, urllib.request, urllib.parse, urllib.error

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
API = "https://commons.wikimedia.org/w/api.php"
UA = "ExplainerVideoPipeline/0.2 (licence-checked media fetch; python-urllib)"
_last = [0.0]


def _open(url, tries=7):
    for attempt in range(tries):
        wait = 1.5 - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(int(e.headers.get("retry-after") or 8) + 2 + attempt * 5)
                continue
            raise
    raise SystemExit("Wikimedia Commons is still rate-limiting this machine. Try again in a few minutes.")


def api(**p):
    return json.load(_open(API + "?" + urllib.parse.urlencode(dict(p, format="json"))))


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()


def licence_ok(short, allow_sa=False):
    """(usable, needs_credit) for a Commons short licence name."""
    s = (short or "").lower().replace("-", " ")
    if not s or "nc" in s.split() or "nd" in s.split() or "fair use" in s or "gfdl" in s or "gpl" in s:
        return False, False
    if "sa" in s.split():
        return allow_sa, True
    if s.startswith("cc0") or "public domain" in s or s.startswith("pd") or "no restrictions" in s or "pdm" in s:
        return True, False
    if s.startswith("cc by"):
        return True, True
    return False, False


def describe(page, width=2560):
    ii = page["imageinfo"][0]
    em = {k: v.get("value", "") for k, v in ii.get("extmetadata", {}).items()}
    lic = clean(em.get("LicenseShortName"))
    author = clean(em.get("Artist")) or clean(em.get("Credit")) or "Unknown author"
    author = re.sub(r"^(Photo(graph)?( by)?|Author|Photographer|Creator)\s*:\s*", "", author)[:90]
    ok, needs_credit = licence_ok(lic)
    title = page["title"]
    credit = f"{author}, {lic}, via Wikimedia Commons" if needs_credit else f"{author} ({lic}), via Wikimedia Commons"
    return {"title": title, "licence": lic, "licence_url": em.get("LicenseUrl", ""), "author": author, "credit": credit,
            "page": ii.get("descriptionurl", ""), "url": ii.get("thumburl") or ii["url"], "original": ii["url"],
            "width": ii.get("width", 0), "height": ii.get("height", 0), "size": ii.get("size", 0), "mime": ii.get("mime", ""),
            "date": clean(em.get("DateTimeOriginal"))[:40], "about": clean(em.get("ImageDescription"))[:160],
            "usable": ok, "needs_credit": needs_credit}


# 3840 is one of the standard thumbnail widths Commons asks automated tools to use.
INFO = dict(prop="imageinfo", iiprop="url|size|mime|extmetadata", iiurlwidth=3840,
            iiextmetadatafilter="LicenseShortName|LicenseUrl|Artist|Credit|DateTimeOriginal|ImageDescription")


def search(query, audio=False, limit=30, allow_sa=False):
    q = f"{query} filetype:{'audio' if audio else 'bitmap'}"
    d = api(action="query", generator="search", gsrsearch=q, gsrnamespace=6, gsrlimit=limit, **INFO)
    pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    out = [describe(p) for p in pages if "imageinfo" in p]
    for o in out:
        o["usable"] = licence_ok(o["licence"], allow_sa)[0]
    return out


def lookup(title):
    if not title.startswith("File:"):
        title = "File:" + title
    d = api(action="query", titles=title, **INFO)
    page = next(iter(d["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise SystemExit(f"Commons has no file called {title}")
    return describe(page)


def download(info, dest, original=False, max_side=2560):
    with _open(info["original"] if original else info["url"]) as r, open(dest, "wb") as f:
        f.write(r.read())
    if not original and info.get("mime", "").startswith("image/"):
        try:  # keep photos a sensible size for the repo and the renderer
            from PIL import Image
            im = Image.open(dest).convert("RGB")
            if max(im.size) > max_side:
                im.thumbnail((max_side, max_side))
                im.save(dest, quality=88)
        except ImportError:
            pass


def fetch(project):
    pdir = os.path.join(ROOT, "projects", project)
    script = json.load(open(os.path.join(pdir, "script.json")))
    wanted = script.get("photos", {})
    out = os.path.join(pdir, "photos")
    os.makedirs(out, exist_ok=True)
    cpath = os.path.join(out, "credits.json")
    credits = json.load(open(cpath)) if os.path.exists(cpath) else {}
    for key, spec in wanted.items():
        dest = os.path.join(out, key + ".jpg")
        if "pexels" in spec or (os.path.exists(dest) and key in credits):  # Pexels photos are fetched by pexels.py
            continue
        if "file" in spec:
            info = lookup(spec["file"])
            if not info["usable"]:
                raise SystemExit(f"{key}: {info['title']} is licensed {info['licence'] or 'unknown'}, which this channel can't use.")
        else:
            hits = [h for h in search(spec["search"]) if h["usable"] and h["width"] >= 1600 and h["mime"] == "image/jpeg"]
            if not hits:
                raise SystemExit(f"{key}: no usable photo found for \"{spec['search']}\". Try other words, or name an exact file.")
            info = hits[0]
        download(info, dest)
        credits[key] = {k: info[k] for k in ("title", "author", "licence", "licence_url", "credit", "page", "needs_credit")}
        print(f"  photo {key}: {info['title']}  [{info['licence']}]")
    for key in list(credits):
        if key not in wanted:
            del credits[key]
    json.dump(credits, open(cpath, "w"), indent=1, ensure_ascii=False)
    return credits


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "search":
        for h in search(a[1], audio="--audio" in a, allow_sa="--all" in a):
            if h["usable"] or "--all" in a:
                print(f"{'OK ' if h['usable'] else 'NO '}{h['licence']:<15} {h['width']}x{h['height']} {h['size'] / 1e6:5.1f}MB  {h['title']}\n     {h['author'][:50]} | {h['date']} | {h['about'][:110]}")
    elif len(a) >= 2 and a[0] == "fetch":
        fetch(a[1])
    elif len(a) >= 3 and a[0] == "get":
        info = lookup(a[1])
        download(info, a[2], original="--original" in a)
        print(json.dumps({k: info[k] for k in ("title", "author", "licence", "licence_url", "credit", "page", "usable")}, indent=1))
    else:
        print(__doc__)
