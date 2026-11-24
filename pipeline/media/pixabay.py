"""Find and download free stock videos and photos from Pixabay, following Pixabay's API rules.

  python pipeline/media/pixabay.py search "north sea oil platform" --video   list clips (id, length, size, creator)
  python pipeline/media/pixabay.py search "oslo harbour"                      list photos
  python pipeline/media/pixabay.py fetch <project-id>                         download everything the script asks for

A project names what it wants in script.json, by the id shown in a search:
  "clips":  { "rig":    { "pixabay": 125 } }
  "photos": { "harbour": { "pixabay": 195893 } }
`fetch` saves projects/<id>/clips/<key>.mp4 and projects/<id>/photos/<key>.jpg, with a credits.json beside each.

Pixabay's rules, and how this file keeps them (pixabay.com/api/docs):
- Say where the media comes from: every build's credits file (out/<name>-credits.txt) names Pixabay and each creator.
- Cache requests for 24 hours: every search and lookup is saved in projects/.media-cache/pixabay/ and reused for a day.
- Real human requests, no mass downloads: searches are run one at a time while storyboarding, and only the clips the
  owner picks are downloaded. There is no bulk mode, and calls are spaced out (well under 100 a minute).
- No hotlinking: files are downloaded and kept with the project.

Licence: the Pixabay Content License allows free commercial use, including monetised videos, without attribution
(the channel credits anyway). Don't use clips where a brand or an identifiable person would appear to endorse something.

Key: the owner adds it as the environment variable PIXABAY_API_KEY in the cloud environment's settings (Pixabay sends
the key in the web address, which the network-secret store can't do). Never put it in the repo or the chat.

Sizes: videos come at 1920x1080 ("medium") and often 4K ("large"); this takes the best up to 1920 wide. Photos are
1280px wide unless the account is approved for "full API access", which unlocks 1920px and originals.
"""
import sys, os, json, time, hashlib, urllib.request, urllib.parse, urllib.error

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE = os.path.join(ROOT, "projects", ".media-cache", "pixabay")
UA = "ExplainerVideoPipeline/0.2"
_last = [0.0]


def key():
    k = os.environ.get("PIXABAY_API_KEY", "").strip()
    if not k:
        raise SystemExit("No Pixabay key yet. The owner adds it as the environment variable PIXABAY_API_KEY in the cloud "
                         "environment's settings (environment menu, Edit), then starts a new session.")
    return k


def call(path, **params):
    """One API request, cached for 24 hours as Pixabay asks."""
    os.makedirs(CACHE, exist_ok=True)
    tag = hashlib.sha1(json.dumps([path, sorted(params.items())]).encode()).hexdigest()[:16]
    cpath = os.path.join(CACHE, tag + ".json")
    if os.path.exists(cpath) and time.time() - os.path.getmtime(cpath) < 24 * 3600:
        return json.load(open(cpath))
    wait = 1.0 - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    _last[0] = time.time()
    url = f"https://pixabay.com/api/{path}?" + urllib.parse.urlencode(dict(params, key=key()))
    try:
        data = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60))
    except urllib.error.HTTPError as e:
        if e.code == 429:
            raise SystemExit("Pixabay's rate limit was reached. Wait a minute and try again.")
        raise SystemExit(f"Pixabay refused the request ({e.code}): {e.read()[:200].decode(errors='replace')}")
    json.dump(data, open(cpath, "w"))
    return data


def best_video(v):
    files = [f for f in v["videos"].values() if f.get("url") and f.get("width")]
    ok = [f for f in files if f["width"] <= 1920] or files
    return max(ok, key=lambda f: f["width"])


def search(query, video=False, n=20):
    if video:
        d = call("videos/", q=query[:100], per_page=n, video_type="film", safesearch="true")
        return [{"id": h["id"], "seconds": h["duration"], "size": f"{best_video(h)['width']}x{best_video(h)['height']}", "by": h["user"], "tags": h["tags"], "page": h["pageURL"]} for h in d.get("hits", [])]
    d = call("", q=query[:100], per_page=n, image_type="photo", orientation="horizontal", safesearch="true")
    return [{"id": h["id"], "size": f"{h['imageWidth']}x{h['imageHeight']}", "by": h["user"], "tags": h["tags"], "page": h["pageURL"]} for h in d.get("hits", [])]


def credit(h, kind):
    return {"title": f"Pixabay {kind} {h['id']} by {h['user']}", "author": h["user"], "licence": "Pixabay Content License",
            "licence_url": "https://pixabay.com/service/license-summary/", "credit": f"{h['user']} / Pixabay",
            "page": h["pageURL"], "needs_credit": False}


def save(url, dest):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=300) as r, open(dest, "wb") as f:
        f.write(r.read())


def fetch(project):
    pdir = os.path.join(ROOT, "projects", project)
    script = json.load(open(os.path.join(pdir, "script.json")))
    for kind, ext in (("clips", "mp4"), ("photos", "jpg")):
        wanted = {k: v for k, v in script.get(kind, {}).items() if "pixabay" in v}
        if not wanted:
            continue
        out = os.path.join(pdir, kind)
        os.makedirs(out, exist_ok=True)
        cpath = os.path.join(out, "credits.json")
        credits = json.load(open(cpath)) if os.path.exists(cpath) else {}
        for k, spec in wanted.items():
            dest = os.path.join(out, f"{k}.{ext}")
            if os.path.exists(dest) and k in credits:
                continue
            if kind == "clips":
                hits = call("videos/", id=spec["pixabay"]).get("hits", [])
                if not hits:
                    raise SystemExit(f"{k}: Pixabay has no video {spec['pixabay']}")
                save(best_video(hits[0])["url"], dest)
                credits[k] = credit(hits[0], "video")
            else:
                hits = call("", id=spec["pixabay"]).get("hits", [])
                if not hits:
                    raise SystemExit(f"{k}: Pixabay has no photo {spec['pixabay']}")
                h = hits[0]
                save(h.get("fullHDURL") or h["largeImageURL"], dest)
                credits[k] = credit(h, "photo")
            print(f"  {kind[:-1]} {k}: {credits[k]['credit']}")
        json.dump(credits, open(cpath, "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "search":
        for h in search(a[1], video="--video" in a):
            print("  ".join(f"{k}: {v}" for k, v in h.items()))
    elif len(a) >= 2 and a[0] == "fetch":
        fetch(a[1])
    else:
        print(__doc__)
