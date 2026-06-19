import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, } from 'remotion';
import { fontFamily as poppinsFontFamily, loadFont } from '@remotion/google-fonts/Poppins';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
loadFont('normal', {
    weights: ['800'],
    subsets: ['latin'],
});
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const SUBTITLE_MAX_WORDS = 8;
const MIN_SCENES_PER_MINUTE = 8;
const MAX_SCENES_PER_MINUTE = 12;
const MAX_SCENE_SECONDS = 8;
const TRANSITION_FRAMES = 12;
const FONT_STACK = `"${poppinsFontFamily}", "Poppins", "Segoe UI", sans-serif`;
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
const svgPanel = (seed, top, bottom, accent) => {
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
export const defaultProps = {
    audioUrl: staticFile('audio/breaking-news.mp3'),
    images: defaultImages,
    script: defaultScript,
};
export const getDurationFromAudio = async (audioUrl, fps = FPS) => {
    const durationInSeconds = await getAudioDurationInSeconds(audioUrl);
    return Math.max(fps * 6, Math.ceil(durationInSeconds * fps));
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toSentences = (script) => {
    return script
        .replace(/\s+/g, ' ')
        .trim()
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
};
const splitIntoSubtitleChunks = (sentence, maxWords) => {
    const words = sentence.split(' ').filter(Boolean);
    const chunks = [];
    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks;
};
const keywordOverlay = (text) => {
    const lower = text.toLowerCase();
    if (/(revenue|cash|money|profit|income|dollar)/.test(lower))
        return 'money';
    if (/(growth|scale|compound|upward|increase|momentum)/.test(lower))
        return 'growth';
    if (/(business|founder|operator|team|company|strategy)/.test(lower))
        return 'business';
    if (/(invest|portfolio|asset|market|risk|return)/.test(lower))
        return 'investing';
    return 'none';
};
const moveForIndex = (index) => {
    const sequence = ['kenBurns', 'panLeft', 'pushIn', 'panRight', 'floatRotate'];
    return sequence[index % sequence.length];
};
const transitionForIndex = (index) => {
    const sequence = ['whip', 'slideLeft', 'zoom', 'flash', 'slideRight'];
    return sequence[index % sequence.length];
};
const CameraMove = ({ move, progress, depth = 1 }) => {
    const p = clamp(progress, 0, 1);
    const zoom = interpolate(p, [0, 1], [1.03, 1.12]);
    const xPan = interpolate(p, [0, 1], [0, 70 * depth]);
    const yPan = interpolate(p, [0, 1], [0, -30 * depth]);
    const rot = interpolate(p, [0, 1], [0, 1.4 * depth]);
    let transform = `scale(${zoom})`;
    if (move === 'panLeft')
        transform = `translateX(${-xPan}px) scale(${1.08}) rotate(${-1.0 * depth}deg)`;
    if (move === 'panRight')
        transform = `translateX(${xPan}px) scale(${1.08}) rotate(${1.0 * depth}deg)`;
    if (move === 'pushIn')
        transform = `translateY(${yPan}px) scale(${interpolate(p, [0, 1], [1.0, 1.18])})`;
    if (move === 'floatRotate')
        transform = `translate(${xPan * 0.3}px, ${Math.sin(p * Math.PI * 2) * 10}px) scale(1.07) rotate(${rot}deg)`;
    if (move === 'kenBurns')
        transform = `translate(${xPan * 0.25}px, ${yPan * 0.25}px) scale(${zoom})`;
    return _jsx("div", { style: { position: 'absolute', inset: 0, transform, transformOrigin: 'center center' } });
};
const AnimatedImage = ({ src, sceneFrame, sceneDuration, move, blurDuringTransition, layer = 1 }) => {
    const progress = clamp(sceneFrame / Math.max(1, sceneDuration), 0, 1);
    const floatY = Math.sin(sceneFrame / 28 + layer) * (5 + layer * 2);
    const breathe = 1 + Math.sin(sceneFrame / 32 + layer) * 0.01;
    const blurPx = interpolate(blurDuringTransition, [0, 1], [0, 6], { extrapolateRight: 'clamp' });
    const cam = (() => {
        const zoom = interpolate(progress, [0, 1], [1.02, 1.12]);
        const xPan = interpolate(progress, [0, 1], [0, 70 * layer]);
        const yPan = interpolate(progress, [0, 1], [0, -26 * layer]);
        const rot = interpolate(progress, [0, 1], [0, 1.3 * layer]);
        if (move === 'panLeft')
            return `translateX(${-xPan}px) scale(1.08) rotate(${-0.8 * layer}deg)`;
        if (move === 'panRight')
            return `translateX(${xPan}px) scale(1.08) rotate(${0.8 * layer}deg)`;
        if (move === 'pushIn')
            return `translateY(${yPan}px) scale(${interpolate(progress, [0, 1], [1.0, 1.2])})`;
        if (move === 'floatRotate')
            return `translate(${xPan * 0.25}px, ${Math.sin(progress * Math.PI * 2) * 8}px) scale(1.07) rotate(${rot}deg)`;
        return `translate(${xPan * 0.2}px, ${yPan * 0.2}px) scale(${zoom})`;
    })();
    return (_jsx(AbsoluteFill, { style: {
            overflow: 'hidden',
        }, children: _jsx(Img, { src: src, style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `${cam} translateY(${floatY}px) scale(${breathe})`,
                filter: `blur(${blurPx}px) saturate(${1.05 + layer * 0.03}) contrast(1.04)`,
                willChange: 'transform, filter',
            } }) }));
};
const Subtitle = ({ text, localFrame, chunkDuration }) => {
    const words = text.split(' ').filter(Boolean);
    const enter = spring({
        frame: localFrame,
        fps: FPS,
        config: { damping: 16, stiffness: 130 },
    });
    const leaveStart = Math.max(0, chunkDuration - 8);
    const leave = interpolate(localFrame, [leaveStart, chunkDuration], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const y = interpolate(enter, [0, 1], [24, 0]);
    const wordIndex = clamp(Math.floor((localFrame / Math.max(1, chunkDuration)) * words.length), 0, Math.max(0, words.length - 1));
    return (_jsx("div", { style: {
            position: 'absolute',
            left: '50%',
            bottom: 92,
            transform: `translateX(-50%) translateY(${y}px)`,
            opacity: enter * leave,
            maxWidth: 1540,
            textAlign: 'center',
            pointerEvents: 'none',
        }, children: _jsx("span", { style: {
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
            }, children: words.map((word, i) => (_jsx("span", { style: {
                    color: i === wordIndex ? '#ffd166' : '#ffffff',
                    textShadow: i === wordIndex ? '0 0 18px rgba(255, 209, 102, 0.8)' : undefined,
                    marginRight: i === words.length - 1 ? 0 : 10,
                }, children: word }, `${word}-${i}`))) }) }));
};
const MotionBackground = ({ frame }) => {
    const drift = Math.sin(frame / 60) * 30;
    return (_jsxs(AbsoluteFill, { style: { overflow: 'hidden' }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    inset: -120,
                    background: 'radial-gradient(circle at 10% 10%, rgba(96,165,250,0.14), transparent 32%), radial-gradient(circle at 82% 20%, rgba(167,139,250,0.14), transparent 36%), radial-gradient(circle at 46% 88%, rgba(52,211,153,0.12), transparent 38%)',
                    transform: `translateX(${drift}px)`,
                    filter: 'blur(32px)',
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '70px 70px',
                    opacity: 0.45,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.32) 100%)',
                } })] }));
};
const MoneyOverlay = ({ frame }) => {
    return (_jsx(AbsoluteFill, { children: Array.from({ length: 10 }).map((_, i) => {
            const x = 80 + i * 180 + Math.sin(frame / 30 + i) * 12;
            const y = 120 + ((frame * (0.8 + i * 0.08) + i * 90) % 980);
            return (_jsx("div", { style: {
                    position: 'absolute',
                    left: x,
                    top: y,
                    fontFamily: FONT_STACK,
                    fontWeight: 800,
                    fontSize: 44,
                    color: 'rgba(163,230,53,0.72)',
                    transform: `rotate(${Math.sin(frame / 35 + i) * 8}deg)`,
                    textShadow: '0 0 14px rgba(163,230,53,0.45)',
                }, children: "$" }, i));
        }) }));
};
const GrowthOverlay = ({ frame }) => {
    const p = clamp(frame / 90, 0, 1);
    const line = `M 80 820 C 320 760, 580 680, 860 620 C 1150 530, 1400 420, 1820 260`;
    return (_jsx(AbsoluteFill, { children: _jsxs("svg", { width: WIDTH, height: HEIGHT, style: { position: 'absolute', inset: 0 }, children: [_jsx("path", { d: line, stroke: 'rgba(34,197,94,0.75)', strokeWidth: 10, fill: 'none', strokeLinecap: 'round', pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p }), _jsx("polygon", { points: '1780,228 1860,258 1788,310', fill: 'rgba(34,197,94,0.82)' })] }) }));
};
const BusinessOverlay = ({ frame }) => {
    return (_jsx(AbsoluteFill, { children: ['OPS', 'TEAM', 'SYSTEM', 'BRAND'].map((label, i) => {
            const wobble = Math.sin(frame / 20 + i) * 8;
            return (_jsx("div", { style: {
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
                }, children: label }, label));
        }) }));
};
const InvestingOverlay = ({ frame }) => {
    return (_jsxs(AbsoluteFill, { children: [_jsx("div", { style: { position: 'absolute', left: 180, top: 160, right: 180, bottom: 240, border: '1px solid rgba(148,163,184,0.3)', borderRadius: 22, background: 'rgba(2,6,23,0.4)' } }), Array.from({ length: 16 }).map((_, i) => {
                const h = 80 + (i % 6) * 38 + Math.sin(frame / 16 + i) * 10;
                const positive = i % 3 !== 0;
                return (_jsx("div", { style: {
                        position: 'absolute',
                        left: 230 + i * 92,
                        top: 620 - h / 2,
                        width: 30,
                        height: h,
                        borderRadius: 6,
                        background: positive ? 'rgba(34,197,94,0.78)' : 'rgba(248,113,113,0.78)',
                        boxShadow: positive ? '0 0 12px rgba(34,197,94,0.5)' : '0 0 12px rgba(248,113,113,0.5)',
                    } }, i));
            })] }));
};
const SceneTransition = ({ type, localFrame }) => {
    const p = clamp(localFrame / TRANSITION_FRAMES, 0, 1);
    if (localFrame > TRANSITION_FRAMES)
        return null;
    if (type === 'flash') {
        return (_jsx("div", { style: {
                position: 'absolute',
                inset: 0,
                background: 'white',
                opacity: interpolate(p, [0, 0.25, 1], [0, 0.9, 0], { extrapolateRight: 'clamp' }),
                mixBlendMode: 'screen',
                pointerEvents: 'none',
            } }));
    }
    if (type === 'zoom') {
        return (_jsx("div", { style: {
                position: 'absolute',
                inset: 0,
                background: 'rgba(2,6,23,0.9)',
                transform: `scale(${interpolate(p, [0, 1], [1.12, 1])})`,
                opacity: interpolate(p, [0, 1], [0.5, 0]),
                pointerEvents: 'none',
            } }));
    }
    if (type === 'whip') {
        return (_jsx("div", { style: {
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 48%, transparent 100%)',
                transform: `translateX(${interpolate(p, [0, 1], [-WIDTH, WIDTH])}px)`,
                filter: 'blur(12px)',
                pointerEvents: 'none',
            } }));
    }
    const fromLeft = type === 'slideLeft';
    return (_jsx("div", { style: {
            position: 'absolute',
            inset: 0,
            background: 'rgba(2,6,23,0.6)',
            transform: `translateX(${interpolate(p, [0, 1], [fromLeft ? -WIDTH : WIDTH, 0])}px)`,
            pointerEvents: 'none',
        } }));
};
const SceneOverlay = ({ type, frame }) => {
    if (type === 'money')
        return _jsx(MoneyOverlay, { frame: frame });
    if (type === 'growth')
        return _jsx(GrowthOverlay, { frame: frame });
    if (type === 'business')
        return _jsx(BusinessOverlay, { frame: frame });
    if (type === 'investing')
        return _jsx(InvestingOverlay, { frame: frame });
    return null;
};
export const FacelessAutomation = (incomingProps) => {
    const props = {
        ...defaultProps,
        ...incomingProps,
    };
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const scenes = useMemo(() => {
        const sentences = toSentences(props.script);
        const durationInSeconds = durationInFrames / FPS;
        const targetScenes = clamp(Math.round((durationInSeconds / 60) * 10), MIN_SCENES_PER_MINUTE, MAX_SCENES_PER_MINUTE);
        const sceneCount = clamp(targetScenes, 1, Math.max(1, sentences.length));
        const sentenceBuckets = Array.from({ length: sceneCount }, () => []);
        sentences.forEach((sentence, i) => {
            sentenceBuckets[i % sceneCount].push(sentence);
        });
        const maxFramesPerScene = Math.floor(MAX_SCENE_SECONDS * FPS);
        let baseFrames = Math.floor(durationInFrames / sceneCount);
        if (baseFrames > maxFramesPerScene)
            baseFrames = maxFramesPerScene;
        const output = sentenceBuckets.map((bucket, i) => {
            const text = bucket.join(' ').trim();
            const start = i * baseFrames;
            const end = i === sceneCount - 1 ? durationInFrames : Math.min(durationInFrames, start + baseFrames);
            const subtitles = splitIntoSubtitleChunks(text, SUBTITLE_MAX_WORDS);
            return {
                index: i,
                text,
                start,
                end,
                image: props.images[i % props.images.length],
                move: moveForIndex(i),
                transition: transitionForIndex(i),
                overlay: keywordOverlay(text),
                subtitles,
            };
        });
        if (output.length > 0) {
            output[output.length - 1].end = durationInFrames;
        }
        return output.filter((s) => s.start < s.end);
    }, [durationInFrames, props.images, props.script]);
    return (_jsxs(AbsoluteFill, { style: { backgroundColor: '#020617', fontFamily: FONT_STACK }, children: [_jsx(Audio, { src: props.audioUrl }), _jsx(MotionBackground, { frame: frame }), scenes.map((scene) => {
                const sceneDuration = Math.max(1, scene.end - scene.start);
                const subtitleChunkFrames = Math.max(18, Math.floor(sceneDuration / Math.max(1, scene.subtitles.length)));
                return (_jsx(Sequence, { from: scene.start, durationInFrames: sceneDuration, children: _jsx(SceneLayer, { image: scene.image, move: scene.move, transition: scene.transition, overlay: scene.overlay, subtitles: scene.subtitles, subtitleChunkFrames: subtitleChunkFrames, sceneDuration: sceneDuration }) }, `scene-${scene.index}`));
            })] }));
};
const SceneLayer = ({ image, move, transition, overlay, subtitles, subtitleChunkFrames, sceneDuration }) => {
    const localFrame = useCurrentFrame();
    const transitionProgress = interpolate(localFrame, [0, TRANSITION_FRAMES], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return (_jsxs(AbsoluteFill, { children: [_jsx(AnimatedImage, { src: image, sceneFrame: localFrame, sceneDuration: sceneDuration, move: move, blurDuringTransition: transitionProgress, layer: 1 }), _jsx(AnimatedImage, { src: image, sceneFrame: localFrame + 12, sceneDuration: sceneDuration, move: move === 'panLeft' ? 'panRight' : 'panLeft', blurDuringTransition: transitionProgress, layer: 2 }), _jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.54) 100%)',
                } }), _jsx(SceneOverlay, { type: overlay, frame: localFrame }), _jsx(CameraMove, { move: move, progress: localFrame / Math.max(1, sceneDuration), depth: 1 }), subtitles.map((chunk, i) => {
                const from = i * subtitleChunkFrames;
                const durationInFrames = subtitleChunkFrames;
                return (_jsx(Sequence, { from: from, durationInFrames: durationInFrames, children: _jsx(Subtitle, { text: chunk, localFrame: localFrame - from, chunkDuration: durationInFrames }) }, `${chunk}-${i}`));
            }), _jsx(SceneTransition, { type: transition, localFrame: localFrame })] }));
};
export default FacelessAutomation;
