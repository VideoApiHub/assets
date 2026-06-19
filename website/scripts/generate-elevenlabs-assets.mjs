import fs from 'node:fs';
import path from 'node:path';

const apiKey = process.env.ELEVEN_LABS_API_KEY;
if (!apiKey) {
  throw new Error('ELEVEN_LABS_API_KEY is not set');
}

const root = process.cwd();
const srcDir = path.join(root, 'src');
const audioDir = path.join(root, 'public', 'audio');
const captionsDir = path.join(root, 'public', 'captions');

const voiceId = 'XrExE9yKIg1WjnnlVkGX';
const modelId = 'eleven_multilingual_v2';

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(captionsDir)) fs.mkdirSync(captionsDir, { recursive: true });

const minuteFiles = fs
  .readdirSync(srcDir)
  .filter((name) => /^WealthMinute\d{2}\.tsx$/.test(name))
  .sort((a, b) => Number(a.match(/\d{2}/)?.[0] ?? '0') - Number(b.match(/\d{2}/)?.[0] ?? '0'));

const extractScript = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/script:\s*"([\s\S]*?)",/);
  if (!match) {
    throw new Error(`Could not extract script from ${filePath}`);
  }
  return JSON.parse(`"${match[1]}"`);
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

const buildWordTimeline = (alignment) => {
  const chars = alignment?.characters ?? [];
  const starts = alignment?.character_start_times_seconds ?? [];
  const ends = alignment?.character_end_times_seconds ?? [];

  const words = [];
  let buffer = '';
  let start = null;
  let end = null;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const chStart = Number(starts[i] ?? 0);
    const chEnd = Number(ends[i] ?? chStart);

    if (/\s/.test(ch)) {
      if (buffer.length > 0 && start !== null) {
        words.push({ text: buffer, start, end: end ?? chEnd });
      }
      buffer = '';
      start = null;
      end = null;
      continue;
    }

    if (buffer.length === 0) {
      start = chStart;
    }
    buffer += ch;
    end = chEnd;
  }

  if (buffer.length > 0 && start !== null) {
    words.push({ text: buffer, start, end: end ?? start + 0.2 });
  }

  return words;
};

const wordsToCaptions = (words, maxWordsPerCaption = 7) => {
  const cues = [];
  for (let i = 0; i < words.length; i += maxWordsPerCaption) {
    const chunk = words.slice(i, i + maxWordsPerCaption);
    if (chunk.length === 0) continue;
    const start = chunk[0].start;
    const rawEnd = chunk[chunk.length - 1].end;
    const end = Math.max(rawEnd, start + 0.25);
    cues.push({ start, end, text: chunk.map((w) => w.text).join(' ') });
  }
  return cues;
};

const cuesToSrt = (cues) => {
  return cues
    .map((cue, idx) => {
      return `${idx + 1}\n${toSrtTime(cue.start)} --> ${toSrtTime(cue.end)}\n${cue.text}\n`;
    })
    .join('\n');
};

const fetchWithRetry = async (url, init, retries = 3) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body}`);
      }
      return res;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 800 * (i + 1)));
    }
  }
  throw lastError;
};

for (const minuteFile of minuteFiles) {
  const tag = minuteFile.match(/\d{2}/)?.[0];
  if (!tag) continue;

  const scriptPath = path.join(srcDir, minuteFile);
  const script = extractScript(scriptPath);
  const txtPath = path.join(audioDir, `wealth-minute-${tag}.txt`);
  const mp3Path = path.join(audioDir, `wealth-minute-${tag}.mp3`);
  const srtPath = path.join(captionsDir, `wealth-minute-${tag}.srt`);

  fs.writeFileSync(txtPath, script, 'utf8');

  const body = {
    text: script,
    model_id: modelId,
    voice_settings: {
      stability: 0.65,
      similarity_boost: 0.85,
      style: 0.2,
      use_speaker_boost: true,
    },
  };

  console.log(`Generating ElevenLabs audio+timestamps for segment ${tag}...`);
  const response = await fetchWithRetry(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  const audioBase64 = data.audio_base64;
  if (!audioBase64) {
    throw new Error(`No audio_base64 returned for segment ${tag}`);
  }

  fs.writeFileSync(mp3Path, Buffer.from(audioBase64, 'base64'));

  const alignment = data.normalized_alignment ?? data.alignment;
  const words = buildWordTimeline(alignment);
  const cues = wordsToCaptions(words, 7);
  fs.writeFileSync(srtPath, cuesToSrt(cues), 'utf8');

  console.log(`Generated ${path.relative(root, mp3Path)}`);
  console.log(`Generated ${path.relative(root, srtPath)}`);
}

console.log('All ElevenLabs assets generated.');