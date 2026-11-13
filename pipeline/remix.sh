#!/usr/bin/env bash
# Change the sound of a video that is already rendered, without rendering the pictures again.
#   pipeline/remix.sh <project> [--cut NAME]
# Use after changing the music track, the music level or the effects level ("sound": {"trim": -6}) in script.json.
# It does not re-time anything: if the words changed, run pipeline/build.sh instead.
set -euo pipefail
cd "$(dirname "$0")/.."
ID="$1"; CUT=full; [ "${2:-}" = --cut ] && CUT="$3"
NAME="$ID"; [ "$CUT" = full ] || NAME="$ID-$CUT"
.venv/bin/python pipeline/audio/director.py "$ID" --cut "$CUT"
cp "projects/$ID/build/$CUT/sound-report.txt" "out/$NAME-sound-report.txt"
ffmpeg -hide_banner -loglevel error -y -i "out/$NAME-raw.mp4" -i "projects/$ID/build/$CUT/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest "out/$NAME-remix.mp4"
mv "out/$NAME-remix.mp4" "out/$NAME-raw.mp4"
pipeline/master.sh "$NAME"
