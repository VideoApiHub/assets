import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AbsoluteFill, Sequence, spring, interpolate, useCurrentFrame, useVideoConfig, } from 'remotion';
export const defaultProps = {
    company: 'NORTHWIND',
    period: 'Fiscal Year 2026',
    tagline: 'A record year, by every measure.',
    metrics: [
        { label: 'Revenue', value: 4.82, format: 'currency', suffix: 'B', change: 27, decimals: 2, accent: '#F97316' },
        { label: 'Net Earnings', value: 1.34, format: 'currency', suffix: 'B', change: 41, decimals: 2, accent: '#FB923C' },
        { label: 'Operating Margin', value: 31.5, format: 'percent', change: 6.2, decimals: 1, accent: '#EA580C' },
        { label: 'Active Customers', value: 18.6, format: 'plain', suffix: 'M', change: 19, decimals: 1, accent: '#F59E0B' },
    ],
    hero: { label: 'Total Revenue', value: 4.82, format: 'currency', suffix: 'B', change: 27, decimals: 2, accent: '#F97316' },
    trend: [
        { label: 'FY22', value: 2.1 },
        { label: 'FY23', value: 2.8 },
        { label: 'FY24', value: 3.4 },
        { label: 'FY25', value: 3.8 },
        { label: 'FY26', value: 4.82 },
    ],
    outro: 'Built for what comes next.',
};
/* ------------------------------------------------------------------ *
 *  THEME — White & Orange
 * ------------------------------------------------------------------ */
const ACCENT = '#F97316'; // orange-500
const ACCENT_DEEP = '#EA580C'; // orange-600
const ACCENT_LIGHT = '#FB923C'; // orange-400
const BACKDROP = '#FFFFFF';
const SURFACE = 'rgba(255, 247, 237, 0.9)'; // warm card surface
const BORDER = 'rgba(120, 113, 108, 0.16)';
const TEXT = '#1C1917'; // stone-900
const TEXT_MUTED = '#78716C'; // stone-500
const TEXT_FAINT = '#A8A29E'; // stone-400
const FONT = 'Inter, "Segoe UI", Arial, sans-serif';
const UP = '#16A34A';
const DOWN = '#DC2626';
/* ------------------------------------------------------------------ *
 *  SCENE TIMELINE (frames @ 30fps)
 * ------------------------------------------------------------------ */
const SCENES = {
    intro: { from: 0, durationInFrames: 90 },
    metrics: { from: 90, durationInFrames: 150 },
    hero: { from: 240, durationInFrames: 120 },
    trend: { from: 360, durationInFrames: 135 },
    outro: { from: 495, durationInFrames: 90 },
};
export const getTotalDuration = () => Object.values(SCENES).reduce((max, s) => Math.max(max, s.from + s.durationInFrames), 0);
/* ------------------------------------------------------------------ *
 *  HELPERS
 * ------------------------------------------------------------------ */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
function useSpring(frame, fps, offset = 0, stiffness = 140, damping = 14) {
    return spring({ frame: frame - offset, fps, config: { stiffness, damping } });
}
function formatMetric(value, m) {
    const decimals = m.decimals ?? 0;
    const num = value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    const prefix = m.format === 'currency' ? '$' : '';
    const tail = m.format === 'percent' ? '%' : m.suffix ?? '';
    return `${prefix}${num}${tail}`;
}
/** Animated count-up that eases to the target over `frames`. */
function useCountUp(target, startFrame, frames = 45) {
    const frame = useCurrentFrame();
    const progress = clamp((frame - startFrame) / frames, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    return target * eased;
}
/* ------------------------------------------------------------------ *
 *  BACKGROUND
 * ------------------------------------------------------------------ */
function buildParticles(frame) {
    return Array.from({ length: 26 }, (_, index) => {
        const time = frame / 24 + index * 0.18;
        const angle = time * 0.9 + (index % 5) * 0.5;
        const radius = 180 + (index % 7) * 48 + (index % 3) * 32;
        const drift = (index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 9);
        const x = 960 + Math.cos(angle) * radius + Math.sin(time * 0.5 + index) * drift;
        const y = 540 + Math.sin(angle * 1.2) * (radius * 0.6) + Math.cos(time * 0.6 + index) * 22;
        const size = 2 + (index % 4) * 1.3;
        const opacity = 0.1 + (index % 5) * 0.03 + Math.sin(time * 1.2 + index) * 0.04;
        const hue = index % 3 === 0 ? 'rgba(249,115,22,' : index % 3 === 1 ? 'rgba(251,146,60,' : 'rgba(245,158,11,';
        return { x, y, size, opacity, color: hue, index };
    });
}
function SceneBackground() {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const pulse = 0.45 + Math.sin(frame / 24) * 0.1;
    const sweep = interpolate(frame, [0, 240, 585], [0, 1, 0.1], { extrapolateRight: 'clamp' });
    const parallaxX = interpolate(frame, [0, 200, 585], [0, 18, 36]);
    return (_jsxs(AbsoluteFill, { style: { background: `linear-gradient(135deg, ${BACKDROP} 0%, #FFF7ED 55%, #FFFBF5 100%)`, overflow: 'hidden' }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 28% 22%, rgba(249, 115, 22, ${0.1 + pulse * 0.1}) 0, transparent 35%), radial-gradient(circle at 72% 32%, rgba(251, 146, 60, ${0.08 + pulse * 0.05}) 0, transparent 28%), radial-gradient(circle at 50% 82%, rgba(245, 158, 11, ${0.1 + pulse * 0.06}) 0, transparent 34%)`,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    left: -100 + parallaxX,
                    top: 0,
                    width: width + 200,
                    height,
                    background: `linear-gradient(90deg, rgba(249, 115, 22, ${0.03 + sweep * 0.05}) 0, transparent 18%, transparent 82%, rgba(251, 146, 60, ${0.03 + sweep * 0.05}) 100%)`,
                    filter: 'blur(40px)',
                    opacity: 0.55,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(120,113,108,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,0.06) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                    maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)',
                    opacity: 0.7,
                } }), buildParticles(frame).map((p) => (_jsx("div", { style: {
                    position: 'absolute',
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    borderRadius: 999,
                    background: `${p.color}${p.opacity})`,
                    boxShadow: `0 0 12px ${ACCENT}40`,
                    filter: 'blur(0.4px)',
                } }, `p-${p.index}`)))] }));
}
/* ------------------------------------------------------------------ *
 *  SHARED UI
 * ------------------------------------------------------------------ */
function Eyebrow({ children, delay = 0 }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = useSpring(frame, fps, delay, 160, 18);
    return (_jsxs("div", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 22px',
            borderRadius: 999,
            border: `1px solid ${ACCENT}33`,
            background: 'rgba(255, 247, 237, 0.85)',
            backdropFilter: 'blur(14px)',
            boxShadow: `0 8px 24px ${ACCENT}1A`,
            opacity: s,
            transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
        }, children: [_jsx("span", { style: { width: 8, height: 8, borderRadius: 999, background: ACCENT, boxShadow: `0 0 12px ${ACCENT}` } }), _jsx("span", { style: { fontFamily: FONT, fontWeight: 600, fontSize: 24, letterSpacing: '0.28em', color: ACCENT_DEEP }, children: children })] }));
}
function ChangeBadge({ change, size = 24 }) {
    if (change === undefined)
        return null;
    const positive = change >= 0;
    const color = positive ? UP : DOWN;
    return (_jsxs("span", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: size,
            color,
            padding: '4px 12px',
            borderRadius: 999,
            background: `${color}14`,
            border: `1px solid ${color}33`,
        }, children: [positive ? '▲' : '▼', " ", Math.abs(change).toLocaleString('en-US', { maximumFractionDigits: 1 }), "%"] }));
}
/* ------------------------------------------------------------------ *
 *  SCENE 1 — INTRO
 * ------------------------------------------------------------------ */
function IntroScene({ company, period, tagline }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const titleSpring = useSpring(frame, fps, 8, 150, 16);
    const taglineSpring = useSpring(frame, fps, 28, 160, 18);
    const ring = interpolate(frame, [0, 60], [0.6, 1.05], { extrapolateRight: 'clamp' });
    return (_jsxs(AbsoluteFill, { style: { alignItems: 'center', justifyContent: 'center' }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    width: 720,
                    height: 720,
                    borderRadius: '50%',
                    border: `1px solid ${ACCENT}3A`,
                    boxShadow: `0 0 80px ${ACCENT}1F, inset 0 0 60px ${ACCENT}12`,
                    transform: `scale(${ring})`,
                    opacity: 0.6,
                } }), _jsx("div", { style: { marginBottom: 36 }, children: _jsx(Eyebrow, { delay: 2, children: period.toUpperCase() }) }), _jsx("div", { style: {
                    fontFamily: FONT,
                    fontSize: 188,
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                    color: TEXT,
                    lineHeight: 0.95,
                    textShadow: `0 0 40px ${ACCENT}1A`,
                    transform: `scale(${interpolate(titleSpring, [0, 1], [0.82, 1])})`,
                    opacity: titleSpring,
                }, children: company }), _jsx("div", { style: {
                    marginTop: 28,
                    fontFamily: FONT,
                    fontSize: 40,
                    fontWeight: 500,
                    color: TEXT_MUTED,
                    letterSpacing: '-0.01em',
                    opacity: taglineSpring,
                    transform: `translateY(${interpolate(taglineSpring, [0, 1], [22, 0])}px)`,
                }, children: tagline })] }));
}
/* ------------------------------------------------------------------ *
 *  SCENE 2 — METRICS GRID
 * ------------------------------------------------------------------ */
function MetricCard({ metric, index }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const delay = 6 + index * 8;
    const s = useSpring(frame, fps, delay, 150, 15);
    const accent = metric.accent ?? ACCENT;
    const current = useCountUp(metric.value, delay + 6, 42);
    const barProgress = clamp(s, 0, 1);
    return (_jsxs("div", { style: {
            position: 'relative',
            width: 540,
            height: 280,
            borderRadius: 32,
            border: `1px solid ${BORDER}`,
            background: 'linear-gradient(160deg, #FFFFFF, #FFF7ED)',
            boxShadow: `0 30px 70px rgba(120, 113, 108, 0.15), 0 0 0 1px ${accent}12, inset 0 0 40px ${accent}08`,
            padding: '38px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            opacity: s,
            transform: `translateY(${interpolate(s, [0, 1], [44, 0])}px) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
            overflow: 'hidden',
        }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: '100%',
                    background: `linear-gradient(180deg, ${accent}, transparent)`,
                } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontFamily: FONT, fontSize: 28, fontWeight: 600, color: TEXT_MUTED, letterSpacing: '0.04em' }, children: metric.label }), _jsx(ChangeBadge, { change: metric.change })] }), _jsx("div", { style: {
                    fontFamily: FONT,
                    fontSize: 96,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: TEXT,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                }, children: formatMetric(current, metric) }), _jsx("div", { style: { height: 8, borderRadius: 999, background: 'rgba(120,113,108,0.12)', overflow: 'hidden' }, children: _jsx("div", { style: {
                        width: `${barProgress * 100}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
                        boxShadow: `0 0 16px ${accent}66`,
                    } }) })] }));
}
function MetricsScene({ metrics }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const header = useSpring(frame, fps, 0, 160, 18);
    return (_jsxs(AbsoluteFill, { style: { alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 56 }, children: [_jsx("div", { style: {
                    fontFamily: FONT,
                    fontSize: 52,
                    fontWeight: 800,
                    color: TEXT,
                    letterSpacing: '-0.03em',
                    opacity: header,
                    transform: `translateY(${interpolate(header, [0, 1], [-20, 0])}px)`,
                }, children: "The Headline Numbers" }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '540px 540px',
                    gap: 40,
                }, children: metrics.slice(0, 4).map((m, i) => (_jsx(MetricCard, { metric: m, index: i }, m.label))) })] }));
}
/* ------------------------------------------------------------------ *
 *  SCENE 3 — HERO STAT
 * ------------------------------------------------------------------ */
function HeroScene({ hero }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const labelSpring = useSpring(frame, fps, 4, 160, 18);
    const numberSpring = useSpring(frame, fps, 14, 130, 13);
    const accent = hero.accent ?? ACCENT;
    const current = useCountUp(hero.value, 18, 55);
    const glow = 0.5 + Math.sin(frame / 16) * 0.14;
    return (_jsxs(AbsoluteFill, { style: { alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    width: 1100,
                    height: 1100,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent}1F 0%, transparent 62%)`,
                    opacity: glow,
                } }), _jsx("div", { style: {
                    fontFamily: FONT,
                    fontSize: 36,
                    fontWeight: 600,
                    letterSpacing: '0.32em',
                    color: TEXT_MUTED,
                    textTransform: 'uppercase',
                    opacity: labelSpring,
                    transform: `translateY(${interpolate(labelSpring, [0, 1], [20, 0])}px)`,
                }, children: hero.label }), _jsx("div", { style: {
                    fontFamily: FONT,
                    fontSize: 320,
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                    color: TEXT,
                    lineHeight: 0.92,
                    marginTop: 12,
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: `0 0 60px ${accent}33`,
                    transform: `scale(${interpolate(numberSpring, [0, 1], [0.7, 1])})`,
                    opacity: numberSpring,
                }, children: formatMetric(current, hero) }), _jsx("div", { style: { marginTop: 28, transform: `scale(${interpolate(numberSpring, [0, 1], [0.8, 1])})`, opacity: numberSpring }, children: _jsx(ChangeBadge, { change: hero.change, size: 40 }) })] }));
}
/* ------------------------------------------------------------------ *
 *  SCENE 4 — TREND BARS
 * ------------------------------------------------------------------ */
function TrendScene({ trend }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const header = useSpring(frame, fps, 0, 160, 18);
    const maxValue = Math.max(...trend.map((t) => t.value));
    const baseHeight = 560;
    return (_jsxs(AbsoluteFill, { style: { alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 64 }, children: [_jsx("div", { style: {
                    fontFamily: FONT,
                    fontSize: 52,
                    fontWeight: 800,
                    color: TEXT,
                    letterSpacing: '-0.03em',
                    opacity: header,
                    transform: `translateY(${interpolate(header, [0, 1], [-20, 0])}px)`,
                }, children: "Five Years of Growth" }), _jsx("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 56, height: baseHeight }, children: trend.map((t, i) => {
                    const delay = 8 + i * 10;
                    const s = useSpring(frame, fps, delay, 150, 15);
                    const isLast = i === trend.length - 1;
                    const accent = isLast ? ACCENT : ACCENT_LIGHT;
                    const h = (t.value / maxValue) * baseHeight * clamp(s, 0, 1);
                    const value = useCountUp(t.value, delay + 4, 36);
                    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }, children: [_jsx("span", { style: {
                                    fontFamily: FONT,
                                    fontSize: 38,
                                    fontWeight: 800,
                                    color: isLast ? ACCENT_DEEP : TEXT_MUTED,
                                    opacity: s,
                                    fontVariantNumeric: 'tabular-nums',
                                }, children: value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }), _jsx("div", { style: {
                                    width: 130,
                                    height: h,
                                    borderRadius: '18px 18px 6px 6px',
                                    background: isLast
                                        ? `linear-gradient(180deg, ${ACCENT_LIGHT}, ${ACCENT_DEEP})`
                                        : 'linear-gradient(180deg, rgba(251,146,60,0.85), rgba(253,186,116,0.55))',
                                    boxShadow: isLast ? `0 0 40px ${ACCENT}66, inset 0 2px 0 rgba(255,255,255,0.45)` : 'inset 0 2px 0 rgba(255,255,255,0.35)',
                                    border: `1px solid ${isLast ? accent : 'rgba(249,115,22,0.25)'}`,
                                } }), _jsx("span", { style: { fontFamily: FONT, fontSize: 30, fontWeight: 600, color: TEXT_FAINT, opacity: s }, children: t.label })] }, t.label));
                }) })] }));
}
/* ------------------------------------------------------------------ *
 *  SCENE 5 — OUTRO
 * ------------------------------------------------------------------ */
function OutroScene({ company, outro }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = useSpring(frame, fps, 6, 150, 16);
    const sub = useSpring(frame, fps, 24, 160, 18);
    const sweep = interpolate(frame, [10, 45], [0, 1], { extrapolateRight: 'clamp' });
    return (_jsxs(AbsoluteFill, { style: { alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }, children: [_jsx("div", { style: {
                    fontFamily: FONT,
                    fontSize: 96,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: TEXT,
                    textAlign: 'center',
                    maxWidth: 1400,
                    lineHeight: 1.04,
                    opacity: s,
                    transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
                    textShadow: `0 0 50px ${ACCENT}1A`,
                }, children: outro }), _jsx("div", { style: {
                    marginTop: 44,
                    width: interpolate(sweep, [0, 1], [0, 320]),
                    height: 4,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                    boxShadow: `0 0 20px ${ACCENT}`,
                } }), _jsx("div", { style: {
                    marginTop: 40,
                    fontFamily: FONT,
                    fontSize: 40,
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    color: ACCENT_DEEP,
                    opacity: sub,
                }, children: company })] }));
}
/* ------------------------------------------------------------------ *
 *  ROOT COMPOSITION
 * ------------------------------------------------------------------ */
export default function CompanyNumbers(props) {
    const p = { ...defaultProps, ...props };
    return (_jsxs(AbsoluteFill, { style: { background: BACKDROP, fontFamily: FONT }, children: [_jsx(SceneBackground, {}), _jsx(Sequence, { from: SCENES.intro.from, durationInFrames: SCENES.intro.durationInFrames, children: _jsx(IntroScene, { company: p.company, period: p.period, tagline: p.tagline }) }), _jsx(Sequence, { from: SCENES.metrics.from, durationInFrames: SCENES.metrics.durationInFrames, children: _jsx(MetricsScene, { metrics: p.metrics }) }), _jsx(Sequence, { from: SCENES.hero.from, durationInFrames: SCENES.hero.durationInFrames, children: _jsx(HeroScene, { hero: p.hero }) }), _jsx(Sequence, { from: SCENES.trend.from, durationInFrames: SCENES.trend.durationInFrames, children: _jsx(TrendScene, { trend: p.trend }) }), _jsx(Sequence, { from: SCENES.outro.from, durationInFrames: SCENES.outro.durationInFrames, children: _jsx(OutroScene, { company: p.company, outro: p.outro }) })] }));
}
