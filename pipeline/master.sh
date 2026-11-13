#!/usr/bin/env bash
# Final audio master + review sheet for a rendered video.
#   pipeline/master.sh <name>        name is the project id, or <project>-<cut>
# Takes out/<name>-raw.mp4, normalises loudness to YouTube's level (-14 LUFS, -1 dBTP, two-pass),
# writes out/<name>.mp4 and out/<name>-contact-sheet.jpg (one frame every 2 seconds).
set -euo pipefail
cd "$(dirname "$0")/.."
ID="$1"; RAW="out/$ID-raw.mp4"; FINAL="out/$ID.mp4"

STATS=$(ffmpeg -hide_banner -i "$RAW" -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
val() { echo "$STATS" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
echo "measured: I=$(val input_i) LUFS, TP=$(val input_tp) dBTP, LRA=$(val input_lra)"
ffmpeg -hide_banner -loglevel error -y -i "$RAW" -c:v copy \
  -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$(val input_i):measured_TP=$(val input_tp):measured_LRA=$(val input_lra):measured_thresh=$(val input_thresh):offset=$(val target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 256k -movflags +faststart "$FINAL"
echo "final:    $(ffmpeg -hide_banner -i "$FINAL" -af loudnorm=I=-14:TP=-1.0:print_format=summary -f null - 2>&1 | grep -E 'Input Integrated|Input True Peak' | tr -s ' ' | tr '\n' ' ')"
read -r W H DUR <<< "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of default=nw=1:nk=1 "$FINAL" | tr '\n' ' ')"
if [ "$H" -gt "$W" ]; then COLS=10; SW=216; else COLS=7; SW=384; fi
ROWS=$(python3 -c "import math; print(max(1, math.ceil(math.ceil($DUR / 2) / $COLS)))")
ffmpeg -hide_banner -loglevel error -y -i "$FINAL" -vf "fps=1/2,scale=$SW:-1,tile=${COLS}x${ROWS}:padding=4:color=white" -frames:v 1 -q:v 3 "out/$ID-contact-sheet.jpg"
ls -la "$FINAL" "out/$ID-contact-sheet.jpg"
