#!/usr/bin/env bash
# Build a whole video from its script: photos -> narration -> sound -> render -> master.
#   pipeline/build.sh <project> [--cut NAME] [--engine kokoro|chatterbox] [--voice NAME] [--speed X] [--no-render]
# A project is projects/<id>/script.json. If every scene names a template, nothing else is needed.
# --cut builds one of the script's "cuts" (a sample, a vertical Short) instead of the whole video.
set -euo pipefail
cd "$(dirname "$0")/.."
ID="$1"; shift
PY=.venv/bin/python
CUT=full; RENDER=1; TTS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --cut) CUT="$2"; shift 2;;
    --no-render) RENDER=0; shift;;
    *) TTS+=("$1"); shift;;
  esac
done
NAME="$ID"; [ "$CUT" = full ] || NAME="$ID-$CUT"

if ! grep -q '"template"' "projects/$ID/script.json"; then
  # An older, hand-built video (the Costco demo): its own scenes, synthesised sound.
  [ -d pipeline/audio/sfx ] && ls pipeline/audio/sfx/*.wav >/dev/null 2>&1 || $PY pipeline/audio/make_audio.py sfx
  echo "== 1/4 narration";  $PY pipeline/voice/tts.py "$ID" "${TTS[@]}" 2>&1 | grep -vi warn
  echo "== 2/4 music";      $PY pipeline/audio/make_audio.py music "$ID"
  echo "== 3/4 render";     (cd pipeline/video && node scripts/render.mjs "$ID" 2>&1 | grep -v -i "memory\|docker\|^$")
  echo "== 4/4 master";     pipeline/master.sh "$ID"
  exit 0
fi

echo "== 1/5 photos";     $PY pipeline/media/commons.py fetch "$ID"
echo "== 2/5 narration";  $PY pipeline/voice/tts.py "$ID" --cut "$CUT" "${TTS[@]}" 2>&1 | grep -vi warn
echo "== 3/5 sound";      $PY pipeline/audio/director.py "$ID" --cut "$CUT"
cp "projects/$ID/build/$CUT/sound-report.txt" "out/$NAME-sound-report.txt"
$PY pipeline/media/credits.py "$ID" --cut "$CUT"
[ "$RENDER" = 1 ] || { echo "stopped before rendering (--no-render). Check stills with: cd pipeline/video && node scripts/render.mjs $ID --cut $CUT --sheet 2"; exit 0; }
echo "== 4/5 render";     (cd pipeline/video && node scripts/render.mjs "$ID" --cut "$CUT" 2>&1 | grep -v -i "memory\|docker\|^$")
echo "== 5/5 master";     pipeline/master.sh "$NAME"
