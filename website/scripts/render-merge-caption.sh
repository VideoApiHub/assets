#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p out/segments

for i in $(seq -w 1 12); do
  comp="WealthMinute${i}"
  out_file="out/segments/wealth-minute-${i}.mp4"
  echo "Rendering ${comp} -> ${out_file}"
  npx remotion render src/index.ts "$comp" "$out_file"
done

list_file="out/segments/concat-list.txt"
rm -f "$list_file"
for i in $(seq -w 1 12); do
  echo "file '$(pwd)/out/segments/wealth-minute-${i}.mp4'" >> "$list_file"
done

echo "Merging segments..."
ffmpeg -y -f concat -safe 0 -i "$list_file" -c copy out/final-merged.mp4

echo "Building merged captions..."
node scripts/build-merged-captions.mjs

echo "Burning captions..."
ffmpeg -y -i out/final-merged.mp4 -vf "subtitles=out/final-captions.srt" -c:a copy out/final-captioned.mp4

echo "Done: out/final-captioned.mp4"