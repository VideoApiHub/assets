#!/usr/bin/env bash
# Adds randomized background music to each rendered SaaS demo MP4.
# Music is randomly chosen per-video between Escape_Eveningland and yellowbirdbeats-banger.
# Tracks are looped to cover the full video length and faded out at the end.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MUSIC_DIR="../samples/audio"
TRACKS=("Escape_Eveningland" "yellowbirdbeats-banger")
VIDEOS=(halfquill mealtimevideo realsightreader appvideostudio)
OUT_DIR="out/saas-music"
mkdir -p "$OUT_DIR"

for name in "${VIDEOS[@]}"; do
  in_file="out/${name}.mp4"
  if [[ ! -f "$in_file" ]]; then
    echo "Skip ${name}: ${in_file} not found"
    continue
  fi

  # Randomly pick a track for this video
  track="${TRACKS[RANDOM % ${#TRACKS[@]}]}"
  music="${MUSIC_DIR}/${track}.mp3"

  dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in_file")"
  fade_start="$(awk "BEGIN{d=$dur-2; if(d<0)d=0; print d}")"

  out_file="${OUT_DIR}/${name}.mp4"
  echo "=== ${name}  +  ${track}  (${dur}s) ==="

  ffmpeg -y -i "$in_file" -stream_loop -1 -i "$music" \
    -filter_complex "[1:a]volume=0.5,afade=t=out:st=${fade_start}:d=2[bg]" \
    -map 0:v -map "[bg]" \
    -c:v copy -c:a aac -b:a 192k -shortest "$out_file" \
    -loglevel error
  echo "  -> ${out_file}"
done

echo "Done. Music-mixed videos in ${OUT_DIR}/"
