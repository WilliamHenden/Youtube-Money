#!/usr/bin/env bash
# Reads the same passage (projects/voice-test/script.json) in each voice and saves MP3s to out/voice-tests/.
#   pipeline/voice/voice_test.sh
# Add a line below to try another voice. The [beat] pause is inserted by the pipeline, so it is the same in all of them.
set -euo pipefail
cd "$(dirname "$0")/../.."
PY=.venv/bin/python
mkdir -p out/voice-tests
one() { # name, then tts.py options
  local name="$1"; shift
  $PY pipeline/voice/tts.py voice-test "$@" 2>&1 | grep -E "^voice=|listening check|script \"|extra words" || true
  ffmpeg -hide_banner -loglevel error -y -i projects/voice-test/build/narration.wav -af loudnorm=I=-16:TP=-1.5 -ar 48000 -b:a 160k "out/voice-tests/$name.mp3"
  echo "saved out/voice-tests/$name.mp3"
}
one 1-kokoro-heart-US-female_CURRENT      --engine kokoro --voice af_heart --speed 0.95
one 2-kokoro-george-UK-male               --engine kokoro --voice bm_george --speed 0.95
one 3-chatterbox-default                  --engine chatterbox --exaggeration 0.5
one 4-chatterbox-more-expressive          --engine chatterbox --exaggeration 0.7
