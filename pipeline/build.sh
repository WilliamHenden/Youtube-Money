#!/usr/bin/env bash
# Build a whole video from its script: narration -> music -> render -> master.
#   pipeline/build.sh <project-id> [--voice af_heart] [--speed 1.0]
# Needs: projects/<id>/script.json and a video registered in pipeline/video/src/Root.tsx
set -euo pipefail
cd "$(dirname "$0")/.."
ID="$1"; shift
PY=.venv/bin/python
[ -d pipeline/audio/sfx ] && ls pipeline/audio/sfx/*.wav >/dev/null 2>&1 || $PY pipeline/audio/make_audio.py sfx
echo "== 1/4 narration";  $PY pipeline/voice/tts.py "$ID" "$@" 2>&1 | grep -vi warn
echo "== 2/4 music";      $PY pipeline/audio/make_audio.py music "$ID"
echo "== 3/4 render";     (cd pipeline/video && node scripts/render.mjs "$ID" 2>&1 | grep -v -i "memory\|docker\|^$")
echo "== 4/4 master";     pipeline/master.sh "$ID"
