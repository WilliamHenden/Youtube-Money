"""Find and download free stock photos and video clips from Pexels.

  python pipeline/media/pexels.py search "oil rig north sea"            list photos
  python pipeline/media/pexels.py search "london regent street" --video list video clips (with their length)
  python pipeline/media/pexels.py fetch <project-id>                    download everything the script asks for

A project names what it wants in script.json, by the id shown in a search:
  "photos": { "street": { "pexels": 1234567 } }
  "clips":  { "rig":    { "pexels": 7654321 } }
`fetch` saves projects/<id>/photos/<key>.jpg and projects/<id>/clips/<key>.mp4, with a credits.json beside each.
Use a clip in a storyboard with the "clip" template: "props": { "clip": "rig", "start": 2, "caption": "…" }.

Licence: everything on Pexels is under the Pexels Licence: free for commercial use, no credit required.
The pipeline still records and shows the creator's name, which Pexels asks for as a courtesy.

Key: Pexels needs a free API key (pexels.com/api). It is NOT stored in the repo. In the cloud environment the owner
saves it once through the secure credential form for the host api.pexels.com, and it is added to requests
automatically. On another machine, set the PEXELS_API_KEY environment variable.

STATUS 13 Nov 2026: written but not yet run against Pexels, because there was no key. Expect small fixes on first use.
"""
import sys, os, json, urllib.request, urllib.parse, urllib.error

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
API = "https://api.pexels.com"
UA = "ExplainerVideoPipeline/0.2"


def call(path, **params):
    url = f"{API}{path}?{urllib.parse.urlencode(params)}"
    # with no key of our own, send a stand-in: the environment replaces it with the saved credential
    req = urllib.request.Request(url, headers={"Authorization": os.environ.get("PEXELS_API_KEY", "set-by-environment"), "User-Agent": UA})
    try:
        return json.load(urllib.request.urlopen(req, timeout=60))
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            raise SystemExit("Pexels refused the request: there is no API key yet. Ask the owner to save one for api.pexels.com (see the top of this file).")
        raise


def best_file(video, max_w=1920):
    files = [f for f in video["video_files"] if f.get("file_type") == "video/mp4" and f.get("width")]
    ok = [f for f in files if f["width"] <= max_w] or files
    return max(ok, key=lambda f: f["width"])


def search(query, video=False, n=15):
    if video:
        d = call("/videos/search", query=query, per_page=n, orientation="landscape")
        return [{"id": v["id"], "by": v["user"]["name"], "size": f"{v['width']}x{v['height']}", "seconds": v["duration"], "page": v["url"]} for v in d.get("videos", [])]
    d = call("/v1/search", query=query, per_page=n, orientation="landscape")
    return [{"id": p["id"], "by": p["photographer"], "size": f"{p['width']}x{p['height']}", "about": p.get("alt", ""), "page": p["url"]} for p in d.get("photos", [])]


def save(url, dest):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=300) as r, open(dest, "wb") as f:
        f.write(r.read())


def credit(name, page, kind):
    return {"title": f"Pexels {kind} by {name}", "author": name, "licence": "Pexels Licence", "licence_url": "https://www.pexels.com/license/",
            "credit": f"{name} / Pexels", "page": page, "needs_credit": False}


def fetch(project):
    pdir = os.path.join(ROOT, "projects", project)
    script = json.load(open(os.path.join(pdir, "script.json")))
    for kind, ext in (("photos", "jpg"), ("clips", "mp4")):
        wanted = {k: v for k, v in script.get(kind, {}).items() if "pexels" in v}
        if not wanted:
            continue
        out = os.path.join(pdir, kind)
        os.makedirs(out, exist_ok=True)
        cpath = os.path.join(out, "credits.json")
        credits = json.load(open(cpath)) if os.path.exists(cpath) else {}
        for key, spec in wanted.items():
            dest = os.path.join(out, f"{key}.{ext}")
            if os.path.exists(dest) and key in credits:
                continue
            if kind == "photos":
                p = call(f"/v1/photos/{spec['pexels']}")
                save(p["src"]["large2x"], dest)
                credits[key] = credit(p["photographer"], p["url"], "photo")
            else:
                v = call(f"/videos/videos/{spec['pexels']}")
                save(best_file(v)["link"], dest)
                credits[key] = credit(v["user"]["name"], v["url"], "video")
            print(f"  {kind[:-1]} {key}: {credits[key]['credit']}")
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
