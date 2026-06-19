import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const captionsDir = path.join(root, 'public', 'captions');
const audioDir = path.join(root, 'public', 'audio');
const outDir = path.join(root, 'out');
const outPath = path.join(outDir, 'final-captions.srt');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const toSeconds = (stamp) => {
  const [hms, ms] = stamp.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + Number(ms) / 1000;
};

const toSrtTime = (seconds) => {
  const totalMs = Math.max(0, Math.floor(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

const getDuration = (audioPath) => {
  const res = spawnSync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=nk=1:nw=1',
    audioPath,
  ]);
  if (res.status !== 0) {
    throw new Error(`ffprobe failed for ${audioPath}`);
  }
  return Number(res.stdout.toString().trim() || 0);
};

const tags = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

let globalIndex = 1;
let offset = 0;
let merged = '';

for (const tag of tags) {
  const srtPath = path.join(captionsDir, `wealth-minute-${tag}.srt`);
  const audioPath = path.join(audioDir, `wealth-minute-${tag}.mp3`);

  if (!fs.existsSync(srtPath) || !fs.existsSync(audioPath)) {
    continue;
  }

  const raw = fs.readFileSync(srtPath, 'utf8');
  const blocks = raw
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;
    const timeLine = lines[1];
    const text = lines.slice(2).join(' ');
    const [startRaw, endRaw] = timeLine.split(' --> ');
    const start = toSeconds(startRaw) + offset;
    const end = toSeconds(endRaw) + offset;

    merged += `${globalIndex}\n${toSrtTime(start)} --> ${toSrtTime(end)}\n${text}\n\n`;
    globalIndex++;
  }

  offset += getDuration(audioPath);
}

fs.writeFileSync(outPath, merged, 'utf8');
console.log(`Generated ${path.relative(root, outPath)}`);