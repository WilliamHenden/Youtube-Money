"""Collects the credits a video owes into one block for the YouTube description.

  python pipeline/media/credits.py <project> [--cut NAME]   -> out/<name>-credits.txt

It lists every photo the cut actually shows (from each photo's licence record), the music track, and the sound
effects. Paste the block into the video description: CC BY material must be credited wherever the video is published.
"""
import sys, os, json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def main():
    a = sys.argv[1:]
    project = a[0]
    cut = a[a.index("--cut") + 1] if "--cut" in a else "full"
    pdir = os.path.join(ROOT, "projects", project)
    tm = json.load(open(os.path.join(pdir, "build", cut, "timings.json")))
    script = json.load(open(os.path.join(pdir, "script.json")))
    used = [s["props"].get("clip") or s["props"]["photo"] for s in tm["scenes"] if s.get("template") in ("photo", "clip")]
    L = []
    if used:
        L.append("Photos and footage:")
        for key in dict.fromkeys(used):
            c = tm["photos"].get(key)
            if not c:
                raise SystemExit(f"The photo \"{key}\" has no licence record. Run: python pipeline/media/commons.py fetch {project}")
            L.append(f"- {c['title'].replace('File:', '')}: {c['credit']}. {c['page']}")
    track = {**script.get("music", {}), **script.get("cuts", {}).get(cut, {}).get("music", {})}.get("track")
    tracks = json.load(open(os.path.join(ROOT, "pipeline/audio/library/music/tracks.json")))
    if track and os.path.exists(os.path.join(ROOT, f"pipeline/audio/library/music/{track}.mp3")):
        L += ["", "Music:", f"- {tracks[track]['credit']}"]
    L += ["", "Sound effects: SFX Kit by Wyzowl (CC0, no credit required).", "Maps: made with Natural Earth (public domain)."]
    name = project if cut == "full" else f"{project}-{cut}"
    out = os.path.join(ROOT, "out", f"{name}-credits.txt")
    open(out, "w").write("\n".join(L) + "\n")
    print(f"credits: {out}")


if __name__ == "__main__":
    main()
