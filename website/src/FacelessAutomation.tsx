import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fontFamily as poppinsFontFamily, loadFont } from '@remotion/google-fonts/Poppins';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, useGLTF } from '@react-three/drei';

loadFont('normal', {
  weights: ['800'],
  subsets: ['latin'],
});

type MoveType = 'static' | 'kenBurns' | 'panLeft' | 'panRight' | 'pushIn' | 'floatRotate';
type TransitionType = 'whip' | 'slideLeft' | 'slideRight' | 'zoom' | 'flash';
type OverlayType = 'money' | 'growth' | 'business' | 'investing' | 'none';

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const SUBTITLE_MAX_WORDS = 8;
const MIN_SCENES_PER_MINUTE = 8;
const MAX_SCENES_PER_MINUTE = 12;
const MAX_SCENE_SECONDS = 8;
const TRANSITION_FRAMES = 12;
const FONT_STACK = `"${poppinsFontFamily}", "Poppins", "Segoe UI", sans-serif`;

export type FacelessAutomationProps = {
  audioUrl: string;
  images: string[];
  script: string;
  captionsUrl?: string;
  subtitleFadeOutFrames?: number;
  imageSceneCount?: number;
  enable3DLayer?: boolean;
  threeDOnlyMode?: boolean;
  sceneModelUrl?: string;
  primaryCharacterModelUrl?: string;
  secondaryCharacterModelUrl?: string;
};

type SubtitleCue = {
  startSeconds: number;
  endSeconds: number;
  text: string;
};

type SceneSubtitleCue = {
  from: number;
  durationInFrames: number;
  text: string;
};

const defaultScript = [
  'Most people think wealth is built with one lucky move, but in reality it is built through systems.',
  'While everyone else is chasing headlines, the smartest founders are compounding attention, trust, and cash flow.',
  'They protect downside first, then place aggressive bets only when the odds are asymmetric.',
  'That is why their revenue curve bends upward when competitors flatten out.',
  'They reinvest into distribution, they hire operators before problems become expensive, and they measure everything weekly.',
  'The result is simple: better decisions, faster execution, and predictable growth that investors pay a premium for.',
  'If you want extraordinary outcomes, stop optimizing for short-term applause and start building long-term leverage.',
  'Because in business, consistency is the closest thing to a superpower.',
].join(' ');

const svgPanel = (seed: number, top: string, bottom: string, accent: string) => {
  const shift = 40 + seed * 8;
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='${top}'/>
      <stop offset='100%' stop-color='${bottom}'/>
    </linearGradient>
    <radialGradient id='glow' cx='70%' cy='28%' r='48%'>
      <stop offset='0%' stop-color='${accent}' stop-opacity='0.45'/>
      <stop offset='100%' stop-color='${accent}' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <rect width='1920' height='1080' fill='url(#bg)'/>
  <rect width='1920' height='1080' fill='url(#glow)'/>
  <g opacity='0.25'>
    <circle cx='260' cy='220' r='180' fill='#ffffff'/>
    <circle cx='1720' cy='860' r='240' fill='#ffffff'/>
  </g>
  <g opacity='0.35'>
    <rect x='0' y='${640 - shift}' width='1920' height='440' fill='#0b1220'/>
  </g>
  <g transform='translate(${720 + seed * 16}, ${160 + seed * 10})'>
    <circle cx='260' cy='170' r='112' fill='#f1f5f9'/>
    <rect x='130' y='278' width='270' height='350' rx='40' fill='#e2e8f0'/>
    <rect x='95' y='330' width='80' height='210' rx='34' fill='#e2e8f0'/>
    <rect x='360' y='330' width='80' height='210' rx='34' fill='#e2e8f0'/>
    <rect x='180' y='430' width='170' height='130' rx='22' fill='${accent}' opacity='0.65'/>
  </g>
  <g stroke='rgba(255,255,255,0.2)' stroke-width='2'>
    <path d='M120 ${860 - seed * 4} C560 ${780 + seed * 6}, 900 ${940 - seed * 8}, 1400 ${810 + seed * 5} C1600 ${760 - seed * 3}, 1760 ${780}, 1840 ${740}'/>
  </g>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const defaultImages = [
  staticFile('images/scene1.png'),
  staticFile('images/scene2.png'),
  staticFile('images/scene3.png'),
  staticFile('images/scene4.png'),
];

export const defaultProps: FacelessAutomationProps = {
  audioUrl: staticFile('audio/breaking-news.mp3'),
  images: defaultImages,
  script: defaultScript,
};

export const getDurationFromAudio = async (audioUrl: string, fps = FPS) => {
  const durationInSeconds = await getAudioDurationInSeconds(audioUrl);
  return Math.max(fps * 6, Math.ceil(durationInSeconds * fps));
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toSentences = (script: string) => {
  return script
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const splitIntoSubtitleChunks = (sentence: string, maxWords: number) => {
  const words = sentence.split(' ').filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
};

const srtTimeToSeconds = (time: string) => {
  const [hms, ms] = time.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + Number(ms) / 1000;
};

const parseSrt = (srt: string): SubtitleCue[] => {
  const blocks = srt
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const cues: SubtitleCue[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;
    const timeline = lines[1];
    const [startRaw, endRaw] = timeline.split(' --> ');
    if (!startRaw || !endRaw) continue;
    cues.push({
      startSeconds: srtTimeToSeconds(startRaw),
      endSeconds: srtTimeToSeconds(endRaw),
      text: lines.slice(2).join(' '),
    });
  }
  return cues;
};

const buildSrtAlignedBoundaries = (
  sceneCount: number,
  durationInFrames: number,
  cues: SubtitleCue[]
) => {
  if (sceneCount <= 1) return [0, durationInFrames];

  const cueStarts = Array.from(
    new Set(
      cues
        .map((cue) => clamp(Math.floor(cue.startSeconds * FPS), 0, Math.max(0, durationInFrames - 1)))
        .sort((a, b) => a - b)
    )
  );

  const boundaries = [0];
  const used = new Set<number>();
  const windowSize = Math.max(1, Math.floor(durationInFrames / (sceneCount * 2)));

  for (let i = 1; i < sceneCount; i++) {
    const target = Math.floor((i * durationInFrames) / sceneCount);
    const candidate = cueStarts
      .filter((start) => !used.has(start) && start > boundaries[boundaries.length - 1] && start < durationInFrames)
      .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];

    if (candidate !== undefined && Math.abs(candidate - target) <= windowSize * 2) {
      boundaries.push(candidate);
      used.add(candidate);
    } else {
      boundaries.push(target);
    }
  }

  boundaries.push(durationInFrames);
  return boundaries.sort((a, b) => a - b);
};

const keywordOverlay = (text: string): OverlayType => {
  const lower = text.toLowerCase();
  if (/(revenue|cash|money|profit|income|dollar)/.test(lower)) return 'money';
  if (/(growth|scale|compound|upward|increase|momentum)/.test(lower)) return 'growth';
  if (/(business|founder|operator|team|company|strategy)/.test(lower)) return 'business';
  if (/(invest|portfolio|asset|market|risk|return)/.test(lower)) return 'investing';
  return 'none';
};

const moveForIndex = (index: number): MoveType => {
  const sequence: MoveType[] = ['static', 'kenBurns', 'panLeft', 'static', 'pushIn', 'panRight', 'kenBurns', 'floatRotate'];
  return sequence[index % sequence.length];
};

const transitionForIndex = (index: number): TransitionType => {
  const sequence: TransitionType[] = ['whip', 'slideLeft', 'zoom', 'flash', 'slideRight'];
  return sequence[index % sequence.length];
};

const CameraMove: React.FC<{
  move: MoveType;
  progress: number;
  depth?: number;
  motionMultiplier?: number;
}> = ({ move, progress, depth = 1, motionMultiplier = 1 }) => {
  const p = clamp(progress, 0, 1);
  const zoom = interpolate(p, [0, 1], [1.03, 1.03 + 0.09 * motionMultiplier]);
  const xPan = interpolate(p, [0, 1], [0, 70 * depth * motionMultiplier]);
  const yPan = interpolate(p, [0, 1], [0, -30 * depth * motionMultiplier]);
  const rot = interpolate(p, [0, 1], [0, 1.4 * depth * motionMultiplier]);

  let transform = `scale(${zoom})`;
  if (move === 'static') transform = 'scale(1)';
  if (move === 'panLeft') transform = `translateX(${-xPan}px) scale(${1.08}) rotate(${-1.0 * depth}deg)`;
  if (move === 'panRight') transform = `translateX(${xPan}px) scale(${1.08}) rotate(${1.0 * depth}deg)`;
  if (move === 'pushIn') transform = `translateY(${yPan}px) scale(${interpolate(p, [0, 1], [1.0, 1.18])})`;
  if (move === 'floatRotate') transform = `translate(${xPan * 0.3}px, ${Math.sin(p * Math.PI * 2) * 10}px) scale(1.07) rotate(${rot}deg)`;
  if (move === 'kenBurns') transform = `translate(${xPan * 0.25}px, ${yPan * 0.25}px) scale(${zoom})`;

  return <div style={{ position: 'absolute', inset: 0, transform, transformOrigin: 'center center' }} />;
};

const AnimatedImage: React.FC<{
  src: string;
  sceneFrame: number;
  sceneDuration: number;
  move: MoveType;
  blurDuringTransition: number;
  layer?: number;
  motionMultiplier?: number;
}> = ({ src, sceneFrame, sceneDuration, move, blurDuringTransition, layer = 1, motionMultiplier = 1 }) => {
  const progress = clamp(sceneFrame / Math.max(1, sceneDuration), 0, 1);
  const floatY = Math.sin(sceneFrame / 28 + layer) * (5 + layer * 2);
  const breathe = 1 + Math.sin(sceneFrame / 32 + layer) * 0.01;
  const blurPx = interpolate(blurDuringTransition, [0, 1], [0, 6], { extrapolateRight: 'clamp' });

  const cam = (() => {
    const zoom = interpolate(progress, [0, 1], [1.02, 1.02 + 0.1 * motionMultiplier]);
    const xPan = interpolate(progress, [0, 1], [0, 70 * layer * motionMultiplier]);
    const yPan = interpolate(progress, [0, 1], [0, -26 * layer * motionMultiplier]);
    const rot = interpolate(progress, [0, 1], [0, 1.3 * layer * motionMultiplier]);
    if (move === 'static') return `scale(${1 + Math.sin(sceneFrame / 65 + layer) * 0.003})`;
    if (move === 'panLeft') return `translateX(${-xPan}px) scale(1.08) rotate(${-0.8 * layer}deg)`;
    if (move === 'panRight') return `translateX(${xPan}px) scale(1.08) rotate(${0.8 * layer}deg)`;
    if (move === 'pushIn') return `translateY(${yPan}px) scale(${interpolate(progress, [0, 1], [1.0, 1.2])})`;
    if (move === 'floatRotate') return `translate(${xPan * 0.25}px, ${Math.sin(progress * Math.PI * 2) * 8}px) scale(1.07) rotate(${rot}deg)`;
    return `translate(${xPan * 0.2}px, ${yPan * 0.2}px) scale(${zoom})`;
  })();

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
      }}
    >
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `${cam} translateY(${floatY}px) scale(${breathe})`,
          filter: `blur(${blurPx}px) saturate(${1.05 + layer * 0.03}) contrast(1.04)`,
          willChange: 'transform, filter',
        }}
      />
    </AbsoluteFill>
  );
};

const GLBActor: React.FC<{
  src: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}> = ({ src, position, rotation, scale }) => {
  const gltf = useGLTF(src);
  const cloned = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  return <primitive object={cloned} position={position} rotation={rotation} scale={scale} />;
};

const ThreeMinuteStage: React.FC<{
  sceneFrame: number;
  sceneDuration: number;
  sceneIndex: number;
  sceneCount: number;
  sceneModelUrl: string;
  primaryCharacterModelUrl: string;
  secondaryCharacterModelUrl: string;
}> = ({
  sceneFrame,
  sceneDuration,
  sceneIndex,
  sceneCount,
  sceneModelUrl,
  primaryCharacterModelUrl,
  secondaryCharacterModelUrl,
}) => {
  const CameraLookAtController: React.FC<{ target: [number, number, number] }> = ({ target }) => {
    const { camera } = useThree();
    useFrame(() => {
      camera.lookAt(target[0], target[1], target[2]);
    });
    return null;
  };

  const t = clamp(sceneFrame / Math.max(1, sceneDuration), 0, 1);
  const cameraSetups: Array<{ pos: [number, number, number]; target: [number, number, number] }> = [
    { pos: [4.2, 2.1, 6.0], target: [0, 1, 0] },
    { pos: [2.7, 1.8, 3.2], target: [0.2, 1.1, 0] },
    { pos: [1.9, 2.0, 2.8], target: [0, 1.25, 0.2] },
    { pos: [3.4, 1.6, 4.8], target: [0, 1.05, -0.2] },
  ];

  const setup = cameraSetups[sceneIndex % cameraSetups.length];
  const nextSetup = cameraSetups[(sceneIndex + 1) % cameraSetups.length];
  const blend = clamp(t * 0.75, 0, 1);

  const cameraPosition: [number, number, number] = [
    interpolate(blend, [0, 1], [setup.pos[0], nextSetup.pos[0]]),
    interpolate(blend, [0, 1], [setup.pos[1], nextSetup.pos[1]]),
    interpolate(blend, [0, 1], [setup.pos[2], nextSetup.pos[2]]),
  ];

  const cameraTarget: [number, number, number] = [
    interpolate(blend, [0, 1], [setup.target[0], nextSetup.target[0]]),
    interpolate(blend, [0, 1], [setup.target[1], nextSetup.target[1]]),
    interpolate(blend, [0, 1], [setup.target[2], nextSetup.target[2]]),
  ];

  const stageOpacity = interpolate(t, [0, 0.08, 0.9, 1], [0, 0.8, 0.85, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const orbitPulse = Math.sin((sceneFrame / 28) * Math.PI) * 0.16;
  const primaryTurn = (sceneFrame / 80) * Math.PI * 2;
  const secondaryTurn = -(sceneFrame / 92) * Math.PI * 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: stageOpacity,
        pointerEvents: 'none',
      }}
    >
      <Canvas gl={{ antialias: false, alpha: true }} dpr={1}>
        <PerspectiveCamera makeDefault position={cameraPosition} fov={35} near={0.1} far={100} />
        <CameraLookAtController target={cameraTarget} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 6, 4]} intensity={1.25} color="#dbeafe" />
        <directionalLight position={[-4, 3, -3]} intensity={0.8} color="#fef3c7" />
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#86efac" />
        <group position={[0, -0.75, 0]}>
          <GLBActor
            src={sceneModelUrl}
            position={[0, -0.2, -1.2]}
            rotation={[0, Math.PI * 0.38 + orbitPulse * 0.2, 0]}
            scale={[0.34, 0.34, 0.34]}
          />

          <GLBActor
            src={primaryCharacterModelUrl}
            position={[0.9, -0.05, 0.35]}
            rotation={[0, primaryTurn * 0.18 + Math.PI * 1.05, 0]}
            scale={[1.1, 1.1, 1.1]}
          />

          <GLBActor
            src={secondaryCharacterModelUrl}
            position={[-0.95, -0.02, 0.1]}
            rotation={[0, secondaryTurn * 0.15 + Math.PI * 0.75, 0]}
            scale={[0.55, 0.55, 0.55]}
          />
        </group>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 58%, rgba(15,23,42,0.08) 0, rgba(15,23,42,0.24) 42%, rgba(2,6,23,0.45) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '72%',
          width: 620,
          height: 160,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(59,130,246,0.24), transparent 72%)',
          filter: 'blur(12px)',
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 48,
          top: 44,
          fontFamily: FONT_STACK,
          letterSpacing: '0.14em',
          fontSize: 20,
          fontWeight: 700,
          color: 'rgba(219, 234, 254, 0.88)',
          textTransform: 'uppercase',
        }}
      >
        3D Explain Scene {sceneIndex + 1}/{sceneCount}
      </div>
    </div>
  );
};

const Subtitle: React.FC<{
  text: string;
  localFrame: number;
  chunkDuration: number;
  subtitleFadeOutFrames: number;
}> = ({ text, localFrame, chunkDuration, subtitleFadeOutFrames }) => {
  const words = text.split(' ').filter(Boolean);
  const safeFadeOutFrames = Number.isFinite(subtitleFadeOutFrames) ? subtitleFadeOutFrames : 8;
  const enter = spring({
    frame: localFrame,
    fps: FPS,
    config: { damping: 16, stiffness: 130 },
  });
  const leaveStart = Math.max(0, chunkDuration - safeFadeOutFrames);
  const leave = interpolate(localFrame, [leaveStart, chunkDuration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(enter, [0, 1], [24, 0]);

  const wordIndex = clamp(Math.floor((localFrame / Math.max(1, chunkDuration)) * words.length), 0, Math.max(0, words.length - 1));

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 92,
        transform: `translateX(-50%) translateY(${y}px)`,
        opacity: enter * leave,
        maxWidth: 1540,
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          background: 'rgba(0, 0, 0, 0.52)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: 18,
          padding: '18px 28px',
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 54,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'white',
          textShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}
      >
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            style={{
              color: i === wordIndex ? '#ffd166' : '#ffffff',
              textShadow: i === wordIndex ? '0 0 18px rgba(255, 209, 102, 0.8)' : undefined,
              marginRight: i === words.length - 1 ? 0 : 10,
            }}
          >
            {word}
          </span>
        ))}
      </span>
    </div>
  );
};

const MotionBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = Math.sin(frame / 60) * 30;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: -120,
          background:
            'radial-gradient(circle at 10% 10%, rgba(96,165,250,0.14), transparent 32%), radial-gradient(circle at 82% 20%, rgba(167,139,250,0.14), transparent 36%), radial-gradient(circle at 46% 88%, rgba(52,211,153,0.12), transparent 38%)',
          transform: `translateX(${drift}px)`,
          filter: 'blur(32px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '70px 70px',
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.32) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const MoneyOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const streams = Array.from({ length: 8 }).map((_, i) => {
    const x = 130 + i * 235 + Math.sin(frame / 36 + i) * 18;
    const yBase = (frame * (0.85 + i * 0.06) + i * 120) % (HEIGHT + 180);
    const y = yBase - 120;
    const scale = 0.82 + (i % 3) * 0.18 + Math.sin(frame / 28 + i) * 0.04;
    const rotate = Math.sin(frame / 24 + i * 1.8) * 14;
    const alpha = 0.38 + (i % 4) * 0.08;
    return { x, y, scale, rotate, alpha, i };
  });

  const pulses = Array.from({ length: 4 }).map((_, i) => {
    const centerX = 320 + i * 420;
    const centerY = 180 + (i % 2) * 220;
    const life = ((frame + i * 18) % 45) / 45;
    const radius = 24 + life * 60;
    const opacity = (1 - life) * 0.26;
    return { centerX, centerY, radius, opacity, i };
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '62%',
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(163,230,53,0.4), transparent)',
          opacity: 0.55,
          filter: 'blur(0.5px)',
        }}
      />

      {pulses.map((pulse) => (
        <div
          key={`money-pulse-${pulse.i}`}
          style={{
            position: 'absolute',
            left: pulse.centerX - pulse.radius,
            top: pulse.centerY - pulse.radius,
            width: pulse.radius * 2,
            height: pulse.radius * 2,
            borderRadius: '50%',
            border: `1px solid rgba(163,230,53,${pulse.opacity})`,
            boxShadow: `0 0 20px rgba(163,230,53,${pulse.opacity * 0.8})`,
          }}
        />
      ))}

      {streams.map((stream) => (
        <div
          key={`money-stream-${stream.i}`}
          style={{
            position: 'absolute',
            left: stream.x,
            top: stream.y,
            fontFamily: FONT_STACK,
            fontWeight: 800,
            fontSize: 34 + (stream.i % 3) * 8,
            color: `rgba(163,230,53,${stream.alpha})`,
            transform: `translate(-50%, -50%) rotate(${stream.rotate}deg) scale(${stream.scale})`,
            textShadow: '0 0 14px rgba(163,230,53,0.45), 0 0 28px rgba(163,230,53,0.25)',
            filter: 'saturate(1.1)',
          }}
        >
          $
        </div>
      ))}
    </AbsoluteFill>
  );
};

const GrowthOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const p = clamp(frame / 90, 0, 1);
  const line = `M 80 820 C 320 760, 580 680, 860 620 C 1150 530, 1400 420, 1820 260`;
  return (
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0 }}>
        <path d={line} stroke='rgba(34,197,94,0.75)' strokeWidth={10} fill='none' strokeLinecap='round' pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <polygon points='1780,228 1860,258 1788,310' fill='rgba(34,197,94,0.82)' />
      </svg>
    </AbsoluteFill>
  );
};

const BusinessOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <AbsoluteFill>
      {['OPS', 'TEAM', 'SYSTEM', 'BRAND'].map((label, i) => {
        const wobble = Math.sin(frame / 20 + i) * 8;
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: 150 + i * 430,
              top: 140 + (i % 2) * 180 + wobble,
              width: 300,
              height: 120,
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(15,23,42,0.52)',
              color: '#cbd5e1',
              fontFamily: FONT_STACK,
              fontWeight: 800,
              fontSize: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {label}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const InvestingOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 180, top: 160, right: 180, bottom: 240, border: '1px solid rgba(148,163,184,0.3)', borderRadius: 22, background: 'rgba(2,6,23,0.4)' }} />
      {Array.from({ length: 16 }).map((_, i) => {
        const h = 80 + (i % 6) * 38 + Math.sin(frame / 16 + i) * 10;
        const positive = i % 3 !== 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 230 + i * 92,
              top: 620 - h / 2,
              width: 30,
              height: h,
              borderRadius: 6,
              background: positive ? 'rgba(34,197,94,0.78)' : 'rgba(248,113,113,0.78)',
              boxShadow: positive ? '0 0 12px rgba(34,197,94,0.5)' : '0 0 12px rgba(248,113,113,0.5)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const SceneTransition: React.FC<{
  type: TransitionType;
  localFrame: number;
}> = ({ type, localFrame }) => {
  const p = clamp(localFrame / TRANSITION_FRAMES, 0, 1);
  if (localFrame > TRANSITION_FRAMES) return null;

  if (type === 'flash') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'white',
          opacity: interpolate(p, [0, 0.25, 1], [0, 0.9, 0], { extrapolateRight: 'clamp' }),
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
    );
  }

  if (type === 'zoom') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: 'inset 0 0 80px rgba(125,211,252,0.2)',
          transform: `scale(${interpolate(p, [0, 1], [1.08, 1])})`,
          opacity: interpolate(p, [0, 1], [0.28, 0]),
          pointerEvents: 'none',
        }}
      />
    );
  }

  if (type === 'whip') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 48%, transparent 100%)',
          transform: `translateX(${interpolate(p, [0, 1], [-WIDTH, WIDTH])}px)`,
          filter: 'blur(12px)',
          pointerEvents: 'none',
        }}
      />
    );
  }

  const fromLeft = type === 'slideLeft';
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '42%',
        background:
          'linear-gradient(90deg, rgba(255,255,255,0), rgba(125,211,252,0.22), rgba(255,255,255,0))',
        transform: `translateX(${interpolate(p, [0, 1], [fromLeft ? -WIDTH * 0.5 : WIDTH, fromLeft ? WIDTH : -WIDTH * 0.5])}px)`,
        filter: 'blur(1px)',
        pointerEvents: 'none',
      }}
    />
  );
};

const SceneOverlay: React.FC<{ type: OverlayType; frame: number }> = ({ type, frame }) => {
  if (type === 'money') return <MoneyOverlay frame={frame} />;
  if (type === 'growth') return <GrowthOverlay frame={frame} />;
  if (type === 'business') return <BusinessOverlay frame={frame} />;
  if (type === 'investing') return <InvestingOverlay frame={frame} />;
  return null;
};

export const FacelessAutomation: React.FC<Partial<FacelessAutomationProps>> = (incomingProps) => {
  const props = {
    ...defaultProps,
    ...incomingProps,
  } as FacelessAutomationProps;

  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[] | null>(null);
  const captionsHandle = useRef<number | null>(null);
  const imagesHandle = useRef<number | null>(null);
  const hasContinued = useRef(false);
  const hasImagesContinued = useRef(false);

  if (captionsHandle.current === null) {
    captionsHandle.current = delayRender('Loading SRT captions');
  }
  if (imagesHandle.current === null) {
    imagesHandle.current = delayRender('Loading scene images');
  }

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (!hasImagesContinued.current && imagesHandle.current !== null) {
        hasImagesContinued.current = true;
        continueRender(imagesHandle.current);
      }
    };

    const imageUrls = props.threeDOnlyMode
      ? props.images
      : props.images.length > 0
        ? props.images
        : defaultImages;
    const modelUrls = props.enable3DLayer
      ? [props.sceneModelUrl, props.primaryCharacterModelUrl, props.secondaryCharacterModelUrl].filter(
          (url): url is string => Boolean(url)
        )
      : [];
    const preloadUrls = [...imageUrls, ...modelUrls];

    if (preloadUrls.length === 0) {
      finish();
      return;
    }

    Promise.all(
      preloadUrls.map((src) => {
        const isGlb = src.toLowerCase().endsWith('.glb');
        if (isGlb) {
          return fetch(src)
            .then(() => undefined)
            .catch(() => undefined);
        }

        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        });
      })
    ).finally(() => {
      if (cancelled) return;
      finish();
    });

    return () => {
      cancelled = true;
    };
  }, [
    props.enable3DLayer,
    props.images,
    props.primaryCharacterModelUrl,
    props.sceneModelUrl,
    props.secondaryCharacterModelUrl,
    props.threeDOnlyMode,
  ]);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (!hasContinued.current && captionsHandle.current !== null) {
        hasContinued.current = true;
        continueRender(captionsHandle.current);
      }
    };

    if (!props.captionsUrl) {
      setSubtitleCues(null);
      finish();
      return;
    }

    fetch(props.captionsUrl)
      .then((r) => r.text())
      .then((srt) => {
        if (cancelled) return;
        setSubtitleCues(parseSrt(srt));
      })
      .catch(() => {
        if (cancelled) return;
        setSubtitleCues(null);
      })
      .finally(() => {
        if (cancelled) return;
        finish();
      });

    return () => {
      cancelled = true;
    };
  }, [props.captionsUrl]);

  const scenes = useMemo(() => {
    const safeImages = props.threeDOnlyMode
      ? props.images
      : props.images.length > 0
        ? props.images
        : defaultImages;
    const sentences = toSentences(props.script);
    const durationInSeconds = durationInFrames / FPS;
    const targetScenes = clamp(
      Math.round((durationInSeconds / 60) * 10),
      MIN_SCENES_PER_MINUTE,
      MAX_SCENES_PER_MINUTE
    );
    const requestedSceneCount = props.imageSceneCount ?? targetScenes;
    const sceneCount = clamp(requestedSceneCount, 1, Math.max(1, Math.max(sentences.length, safeImages.length)));

    const sentenceBuckets = Array.from({ length: sceneCount }, () => [] as string[]);
    sentences.forEach((sentence, i) => {
      sentenceBuckets[i % sceneCount].push(sentence);
    });

    const hasSrt = Boolean(subtitleCues && subtitleCues.length > 0);
    const boundaries = hasSrt
      ? buildSrtAlignedBoundaries(sceneCount, durationInFrames, subtitleCues as SubtitleCue[])
      : Array.from({ length: sceneCount + 1 }, (_, i) =>
          i === sceneCount ? durationInFrames : Math.floor((i * durationInFrames) / sceneCount)
        );

    const output = sentenceBuckets.map((bucket, i) => {
      const text = bucket.join(' ').trim();
      const start = boundaries[i] ?? Math.floor((i * durationInFrames) / sceneCount);
      const end = boundaries[i + 1] ?? durationInFrames;
      const subtitles = splitIntoSubtitleChunks(text, SUBTITLE_MAX_WORDS);

      let sceneSubtitleCues: SceneSubtitleCue[] = [];
      if (subtitleCues && subtitleCues.length > 0) {
        sceneSubtitleCues = subtitleCues
          .filter((cue) => {
            const cueStart = Math.floor(cue.startSeconds * FPS);
            const cueEnd = Math.ceil(cue.endSeconds * FPS);
            return cueEnd > start && cueStart < end;
          })
          .map((cue) => {
            const cueStart = Math.floor(cue.startSeconds * FPS);
            const cueEnd = Math.ceil(cue.endSeconds * FPS);
            const from = clamp(cueStart - start, 0, Math.max(0, end - start - 1));
            const durationInFrames = Math.max(8, Math.min(end - start - from, cueEnd - cueStart));
            return {
              from,
              durationInFrames,
              text: cue.text,
            };
          });
      }

      if (sceneSubtitleCues.length === 0) {
        const fallbackChunkFrames = Math.max(18, Math.floor((end - start) / Math.max(1, subtitles.length)));
        sceneSubtitleCues = subtitles.map((chunk, index) => ({
          from: index * fallbackChunkFrames,
          durationInFrames: fallbackChunkFrames,
          text: chunk,
        }));
      }

      return {
        index: i,
        text,
        start,
        end,
        image: safeImages.length > 0 ? safeImages[i % safeImages.length] : '',
        move: moveForIndex(i),
        transition: transitionForIndex(i),
        overlay: keywordOverlay(text),
        sceneSubtitleCues,
      };
    });

    if (output.length > 0) {
      output[output.length - 1].end = durationInFrames;
    }

    return output.filter((s) => s.start < s.end);
  }, [durationInFrames, props.imageSceneCount, props.images, props.script, props.threeDOnlyMode, subtitleCues]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#020617', fontFamily: FONT_STACK }}>
      <Audio src={props.audioUrl} />
      <MotionBackground frame={frame} />

      {scenes.map((scene) => {
        const sceneDuration = Math.max(1, scene.end - scene.start);

        return (
          <Sequence key={`scene-${scene.index}`} from={scene.start} durationInFrames={sceneDuration}>
            <SceneLayer
              image={scene.image}
              move={scene.move}
              transition={scene.transition}
              overlay={scene.overlay}
              subtitleCues={scene.sceneSubtitleCues}
              sceneDuration={sceneDuration}
              sceneIndex={scene.index}
              sceneCount={scenes.length}
              subtitleFadeOutFrames={props.subtitleFadeOutFrames ?? 8}
              enable3DLayer={Boolean(props.enable3DLayer)}
              threeDOnlyMode={Boolean(props.threeDOnlyMode)}
              sceneModelUrl={props.sceneModelUrl}
              primaryCharacterModelUrl={props.primaryCharacterModelUrl}
              secondaryCharacterModelUrl={props.secondaryCharacterModelUrl}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneLayer: React.FC<{
  image: string;
  move: MoveType;
  transition: TransitionType;
  overlay: OverlayType;
  subtitleCues: SceneSubtitleCue[];
  sceneDuration: number;
  sceneIndex: number;
  sceneCount: number;
  subtitleFadeOutFrames: number;
  enable3DLayer: boolean;
  threeDOnlyMode: boolean;
  sceneModelUrl?: string;
  primaryCharacterModelUrl?: string;
  secondaryCharacterModelUrl?: string;
}> = ({
  image,
  move,
  transition,
  overlay,
  subtitleCues,
  sceneDuration,
  sceneIndex,
  sceneCount,
  subtitleFadeOutFrames,
  enable3DLayer,
  threeDOnlyMode,
  sceneModelUrl,
  primaryCharacterModelUrl,
  secondaryCharacterModelUrl,
}) => {
  const localFrame = useCurrentFrame();
  const transitionProgress = interpolate(localFrame, [0, TRANSITION_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const isCaptionActive = subtitleCues.some((cue) => localFrame >= cue.from && localFrame < cue.from + cue.durationInFrames);
  const motionMultiplier = isCaptionActive ? 1 : 0.7;
  const useDualLayer = !threeDOnlyMode && move !== 'static' && move !== 'kenBurns';
  const enableCameraMove = !threeDOnlyMode && move !== 'static';

  return (
    <AbsoluteFill>
      {!threeDOnlyMode ? (
        <AnimatedImage
          src={image}
          sceneFrame={localFrame}
          sceneDuration={sceneDuration}
          move={move}
          blurDuringTransition={transitionProgress}
          layer={1}
          motionMultiplier={motionMultiplier}
        />
      ) : null}
      {useDualLayer ? (
        <AnimatedImage
          src={image}
          sceneFrame={localFrame + 12}
          sceneDuration={sceneDuration}
          move={move === 'panLeft' ? 'panRight' : 'panLeft'}
          blurDuringTransition={transitionProgress}
          layer={2}
          motionMultiplier={motionMultiplier}
        />
      ) : null}
      {!threeDOnlyMode ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.54) 100%)',
          }}
        />
      ) : null}

      {enable3DLayer && sceneModelUrl && primaryCharacterModelUrl && secondaryCharacterModelUrl ? (
        <ThreeMinuteStage
          sceneFrame={localFrame}
          sceneDuration={sceneDuration}
          sceneIndex={sceneIndex}
          sceneCount={sceneCount}
          sceneModelUrl={sceneModelUrl}
          primaryCharacterModelUrl={primaryCharacterModelUrl}
          secondaryCharacterModelUrl={secondaryCharacterModelUrl}
        />
      ) : null}

      {!threeDOnlyMode ? <SceneOverlay type={overlay} frame={localFrame} /> : null}
      {enableCameraMove ? (
        <CameraMove move={move} progress={localFrame / Math.max(1, sceneDuration)} depth={1} motionMultiplier={motionMultiplier} />
      ) : null}

      {subtitleCues.map((cue, i) => {
        const from = cue.from;
        const durationInFrames = cue.durationInFrames;
        return (
          <Sequence key={`${cue.text}-${i}-${from}`} from={from} durationInFrames={durationInFrames}>
            <Subtitle
              text={cue.text}
              localFrame={localFrame - from}
              chunkDuration={durationInFrames}
              subtitleFadeOutFrames={subtitleFadeOutFrames}
            />
          </Sequence>
        );
      })}

      {!threeDOnlyMode ? <SceneTransition type={transition} localFrame={localFrame} /> : null}
    </AbsoluteFill>
  );
};

export default FacelessAutomation;
