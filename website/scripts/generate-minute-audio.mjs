import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const outDir = path.join(root, 'public', 'audio');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const extractScript = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/script:\s*"([\s\S]*?)",/);
  if (!match) {
    throw new Error(`Could not extract script from ${filePath}`);
  }
  return JSON.parse(`"${match[1]}"`);
};

const minuteFiles = fs
  .readdirSync(srcDir)
  .filter((name) => /^WealthMinute\d{2}\.tsx$/.test(name))
  .sort((a, b) => {
    const aNum = Number(a.match(/\d{2}/)?.[0] ?? '0');
    const bNum = Number(b.match(/\d{2}/)?.[0] ?? '0');
    return aNum - bNum;
  });

for (const minuteFile of minuteFiles) {
  const minuteTag = minuteFile.match(/\d{2}/)?.[0];
  if (!minuteTag) {
    continue;
  }
  const tsx = path.join(srcDir, minuteFile);
  const script = extractScript(tsx);

  const txtPath = path.join(outDir, `wealth-minute-${minuteTag}.txt`);
  const aiffPath = path.join(outDir, `wealth-minute-${minuteTag}.aiff`);
  const wavPath = path.join(outDir, `wealth-minute-${minuteTag}.wav`);

  fs.writeFileSync(txtPath, script, 'utf8');

  const say = spawnSync('say', ['-v', 'Samantha', '-r', '172', '-f', txtPath, '-o', aiffPath], {
    stdio: 'inherit',
  });

  if (say.status !== 0) {
    throw new Error(`say failed for minute ${minuteTag}`);
  }

  const convert = spawnSync('ffmpeg', ['-y', '-i', aiffPath, '-ar', '48000', '-ac', '2', wavPath], {
    stdio: 'inherit',
  });

  if (convert.status !== 0) {
    throw new Error(`ffmpeg conversion failed for minute ${minuteTag}`);
  }

  console.log(`Generated ${path.relative(root, wavPath)}`);
}

console.log('Done.');