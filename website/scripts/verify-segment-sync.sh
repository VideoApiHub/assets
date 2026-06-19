#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUDIO_DIR="$ROOT_DIR/public/audio"
SRC_DIR="$ROOT_DIR/src"
FPS=30

printf "Segment sync report (fps=%s)\n" "$FPS"
printf "================================\n"

for tsx in "$SRC_DIR"/WealthMinute*.tsx; do
  [ -e "$tsx" ] || continue

  base="$(basename "$tsx")"
  tag="$(echo "$base" | sed -E 's/WealthMinute([0-9]{2})\.tsx/\1/')"
  wav="$AUDIO_DIR/wealth-minute-${tag}.wav"

  if [ ! -f "$wav" ]; then
    printf "WealthMinute%s: missing audio file %s\n" "$tag" "$(basename "$wav")"
    continue
  fi

  dur="$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$wav")"
  frames="$(awk -v d="$dur" -v fps="$FPS" 'BEGIN { printf "%d", (d*fps)+0.999 }')"

  printf "WealthMinute%s | audio: %7.3fs | frames: %4s\n" "$tag" "$dur" "$frames"
done

if command -v whisper >/dev/null 2>&1; then
  printf "\nWhisper detected. You can verify transcript timing with:\n"
  printf "whisper public/audio/wealth-minute-01.wav --model tiny --output_format srt\n"
else
  printf "\nWhisper CLI not found. Install with: pip install openai-whisper\n"
fi
