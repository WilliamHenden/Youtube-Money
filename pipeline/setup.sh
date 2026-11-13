#!/usr/bin/env bash
# Install everything the pipeline needs. Safe to run again: it skips what is already there.
#   pipeline/setup.sh              tools, Kokoro voice, listening-check model
#   pipeline/setup.sh chatterbox   also the Chatterbox voice (3.3 GB)
set -uo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv 2>/dev/null || true
.venv/bin/pip install -q kokoro-onnx soundfile numpy scipy pyloudnorm pocketsphinx tokenizers faster-whisper pillow
(cd pipeline/video && npm install --no-audit --no-fund && node scripts/extract-icons.mjs)
get() { [ -s "$2" ] || { mkdir -p "$(dirname "$2")"; echo "downloading $2"; curl -sSL --retry 4 -o "$2" "$1" || echo "FAILED: $1"; }; }
M=pipeline/voice/models
K=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
get $K/kokoro-v1.0.onnx $M/kokoro-v1.0.onnx
get $K/voices-v1.0.bin $M/voices-v1.0.bin
W=https://huggingface.co/Systran/faster-whisper-base.en/resolve/main
for f in config.json model.bin tokenizer.json vocabulary.txt; do get $W/$f $M/whisper-base.en/$f; done
if [ "${1:-}" = chatterbox ]; then
  C=https://huggingface.co/onnx-community/chatterbox-ONNX/resolve/main
  for f in default_voice.wav tokenizer.json onnx/embed_tokens.onnx onnx/embed_tokens.onnx_data onnx/speech_encoder.onnx onnx/speech_encoder.onnx_data \
           onnx/conditional_decoder.onnx onnx/conditional_decoder.onnx_data onnx/language_model.onnx onnx/language_model.onnx_data; do get $C/$f $M/chatterbox/$f; done
fi
echo "setup done"
