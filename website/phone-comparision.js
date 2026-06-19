import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig, } from 'remotion';
const ACCENT = '#2563EB';
const BACKDROP = '#040712';
const PANEL = 'rgba(7, 13, 28, 0.76)';
const BORDER = 'rgba(148, 163, 184, 0.18)';
const FONT = 'Inter, "Segoe UI", Arial, sans-serif';
const CARD_LABELS = ['Testing', 'Automation', 'GenAI', 'Agents', 'Scale'];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const glowStyle = (color, intensity = 1) => ({
    boxShadow: `0 0 ${18 * intensity}px ${color}, 0 0 ${36 * intensity}px rgba(37, 99, 235, 0.18)`,
});
function buildParticles(frame) {
    return Array.from({ length: 28 }, (_, index) => {
        const time = frame / 24 + index * 0.18;
        const angle = time * 0.9 + (index % 5) * 0.5;
        const radius = 160 + (index % 7) * 50 + (index % 3) * 35;
        const drift = (index % 2 === 0 ? 1 : -1) * (20 + (index % 4) * 10);
        const x = 960 + Math.cos(angle) * radius + Math.sin(time * 0.5 + index) * drift;
        const y = 540 + Math.sin(angle * 1.2) * (radius * 0.6) + Math.cos(time * 0.6 + index) * 24;
        const size = 2 + (index % 4) * 1.4;
        const opacity = 0.15 + (index % 5) * 0.04 + Math.sin(time * 1.2 + index) * 0.06;
        const hue = index % 3 === 0 ? 'rgba(37,99,235,' : index % 3 === 1 ? 'rgba(56,189,248,' : 'rgba(129,140,248,';
        return { x, y, size, opacity, color: hue, index };
    });
}
function useSpring(frame, fps, offset = 0, stiffness = 140, damping = 14) {
    return spring({
        frame: frame - offset,
        fps,
        config: { stiffness, damping },
    });
}
function SceneBackground() {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const pulse = 0.45 + Math.sin(frame / 24) * 0.1;
    const sweep = interpolate(frame, [0, 180, 450], [0, 1, 0.1], { extrapolateRight: 'clamp' });
    const parallaxX = interpolate(frame, [0, 160, 450], [0, 18, 36]);
    return (_jsxs(AbsoluteFill, { style: { background: `linear-gradient(135deg, ${BACKDROP} 0%, #020617 45%, #030712 100%)`, overflow: 'hidden' }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 30% 20%, rgba(37, 99, 235, ${0.12 + pulse * 0.12}) 0, transparent 35%), radial-gradient(circle at 70% 35%, rgba(56, 189, 248, ${0.08 + pulse * 0.06}) 0, transparent 28%), radial-gradient(circle at 50% 80%, rgba(99, 102, 241, ${0.18 + pulse * 0.08}) 0, transparent 32%)`,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    left: -100 + parallaxX,
                    top: 0,
                    width: width + 200,
                    height: height,
                    background: `linear-gradient(90deg, rgba(37, 99, 235, ${0.03 + sweep * 0.05}) 0, transparent 18%, transparent 82%, rgba(56, 189, 248, ${0.03 + sweep * 0.05}) 100%)`,
                    filter: 'blur(40px)',
                    opacity: 0.5,
                } }), buildParticles(frame).map((particle) => (_jsx("div", { style: {
                    position: 'absolute',
                    left: particle.x,
                    top: particle.y,
                    width: particle.size,
                    height: particle.size,
                    borderRadius: '999px',
                    background: `${particle.color}${particle.opacity})`,
                    filter: 'blur(0.4px)',
                    ...glowStyle(ACCENT, 0.65),
                } }, `particle-${particle.index}`))), _jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    border: `1px solid rgba(148, 163, 184, ${0.08 + pulse * 0.02})`,
                } })] }));
}
function TitleText({ text, size, color = 'white', align = 'center', opacity = 1, transform = 'none' }) {
    return (_jsx("div", { style: {
            position: 'absolute',
            width: '100%',
            display: 'flex',
            justifyContent: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
            pointerEvents: 'none',
            textAlign: align,
            opacity,
            transform,
        }, children: _jsx("span", { style: {
                fontFamily: FONT,
                fontSize: size,
                lineHeight: 0.98,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color,
                textShadow: `0 0 18px rgba(37, 99, 235, 0.25), 0 0 52px rgba(30, 41, 59, 0.45)`,
                whiteSpace: 'pre-wrap',
            }, children: text }) }));
}
function GlassCard({ label, accent, index }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const orbit = useSpring(frame, fps, 180 + index * 2, 120, 18);
    const x = interpolate(orbit, [0, 1], [0, 1]);
    const y = interpolate(orbit, [0, 1], [0, 1]);
    const wobble = Math.sin(frame / 22 + index) * 6;
    const angle = (frame / 35 + index * 0.9) * (index % 2 === 0 ? 1 : -1);
    const radius = 260 + index * 13;
    const cardX = 960 + Math.cos(angle) * radius + x * 18;
    const cardY = 540 + Math.sin(angle * 1.1) * (radius * 0.68) + y * 10 + wobble;
    const scale = 1 + Math.sin(frame / 24 + index) * 0.02;
    return (_jsxs("div", { style: {
            position: 'absolute',
            left: cardX - 120,
            top: cardY - 58,
            width: 240,
            height: 116,
            borderRadius: 28,
            border: `1px solid ${BORDER}`,
            background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.84), rgba(8, 15, 30, 0.6))',
            backdropFilter: 'blur(18px)',
            boxShadow: `0 28px 60px rgba(8, 15, 33, 0.45), 0 0 18px ${accent}35`,
            transform: `scale(${scale}) rotate(${Math.cos(frame / 30 + index) * 2}deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    inset: 'auto 14px 12px 14px',
                    height: 2,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                    opacity: 0.45,
                } }), _jsx("span", { style: {
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 26,
                    color: 'white',
                    letterSpacing: '-0.03em',
                }, children: label })] }));
}
export default function Component() {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const scene = frame < 60
        ? 'one'
        : frame < 120
            ? 'two'
            : frame < 180
                ? 'three'
                : frame < 270
                    ? 'four'
                    : frame < 360
                        ? 'five'
                        : 'six';
    const zoom = interpolate(frame, [0, 40, 90], [1, 1.3, 1.08], { extrapolateRight: 'clamp' });
    const globalTilt = interpolate(frame, [0, 120, 450], [0, 6, -4]);
    const cameraX = interpolate(frame, [0, 120, 240, 450], [0, -6, 8, 0]);
    const cameraY = interpolate(frame, [0, 120, 320, 450], [0, 12, -10, 0]);
    const sceneOneSpring = useSpring(frame, fps, 0, 160, 16);
    const sceneTwoSpring = useSpring(frame, fps, 60, 160, 14);
    const sceneThreeSpring = useSpring(frame, fps, 120, 180, 14);
    const sceneFourSpring = useSpring(frame, fps, 180, 160, 12);
    const sceneFiveSpring = useSpring(frame, fps, 270, 160, 14);
    const sceneSixSpring = useSpring(frame, fps, 360, 180, 16);
    const sceneOneScale = interpolate(sceneOneSpring, [0, 1], [0.82, 1.05]);
    const sceneTwoScale = interpolate(sceneTwoSpring, [0, 1], [0.94, 1.08]);
    const sceneThreeScale = interpolate(sceneThreeSpring, [0, 1], [0.96, 1.04]);
    const sceneFourScale = interpolate(sceneFourSpring, [0, 1], [0.88, 1.04]);
    const sceneFiveScale = interpolate(sceneFiveSpring, [0, 1], [0.94, 1.02]);
    const sceneSixScale = interpolate(sceneSixSpring, [0, 1], [0.96, 1.06]);
    const ring = interpolate(frame, [360, 390, 420, 450], [0, 1.1, 1.35, 1.8], { extrapolateRight: 'clamp' });
    const sweepLine = interpolate(frame, [360, 390, 420], [0, 1, 0], { extrapolateRight: 'clamp' });
    const heroGlow = 0.55 + Math.sin(frame / 20) * 0.12;
    return (_jsxs(AbsoluteFill, { style: { background: BACKDROP, overflow: 'hidden', fontFamily: FONT }, children: [_jsx(SceneBackground, {}), _jsxs("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    transform: `translate(${cameraX}px, ${cameraY}px) scale(${zoom}) rotateX(${globalTilt * 0.02}deg) rotateY(${globalTilt * 0.01}deg)`,
                    transformOrigin: 'center center',
                    willChange: 'transform',
                }, children: [scene === 'one' && (_jsxs(_Fragment, { children: [_jsx("div", { style: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7, 13, 26, 0.08), rgba(2, 6, 23, 0.4))' } }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(-50%, -50%) scale(${sceneOneScale}) rotate(-4deg)`,
                                    filter: 'blur(0.2px)',
                                    textShadow: '0 0 24px rgba(37,99,235,0.35), 0 0 70px rgba(37,99,235,0.18)',
                                }, children: _jsx(TitleText, { text: "2026", size: 260, color: "white" }) }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    width: 360,
                                    height: 360,
                                    transform: 'translate(-50%, -50%)',
                                    borderRadius: '50%',
                                    border: `1px solid rgba(37,99,235,0.45)`,
                                    boxShadow: `0 0 50px rgba(37,99,235,0.28), inset 0 0 40px rgba(37,99,235,0.15)`,
                                    opacity: 0.6,
                                    filter: 'blur(1px)',
                                } })] })), scene === 'two' && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '44%',
                                    transform: `translate(-50%, -50%) scale(${sceneTwoScale + Math.sin(frame / 18) * 0.02}) rotate(-1deg)`,
                                    textShadow: '0 0 30px rgba(37,99,235,0.35), 0 0 60px rgba(15,23,42,0.55)',
                                }, children: _jsx(TitleText, { text: "THE BIGGEST", size: 120, color: "white" }) }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '56%',
                                    width: 70,
                                    height: 70,
                                    transform: `translate(-50%, -50%) rotate(${Math.sin(frame / 10) * 8}deg) scale(${1 + sceneTwoScale * 0.1})`,
                                    borderRadius: 24,
                                    background: `linear-gradient(135deg, ${ACCENT}, #60a5fa)`,
                                    boxShadow: `0 0 30px rgba(37,99,235,0.35)`,
                                    opacity: 0.8,
                                } }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    width: '110%',
                                    height: '120%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'linear-gradient(180deg, rgba(3,7,18,0.06), rgba(15,23,42,0.12))',
                                    filter: 'blur(10px)',
                                    opacity: 0.4,
                                } })] })), scene === 'three' && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '42%',
                                    transform: `translate(-50%, -50%) scale(${sceneThreeScale})`,
                                    letterSpacing: '-0.06em',
                                }, children: _jsx(TitleText, { text: "STAGE", size: 150, color: "white" }) }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '58%',
                                    transform: `translate(-50%, -50%) scale(${sceneThreeScale})`,
                                    letterSpacing: '-0.06em',
                                }, children: _jsx(TitleText, { text: "OF 2026", size: 88, color: "#bfdbfe" }) }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: `${52 + (frame - 120) * 0.02}%`,
                                    top: `${30 + Math.sin(frame / 24) * 6}%`,
                                    width: 140,
                                    height: 140,
                                    borderRadius: 32,
                                    background: 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(56,189,248,0.04))',
                                    border: '1px solid rgba(147, 197, 253, 0.2)',
                                    filter: 'blur(0.4px)',
                                    boxShadow: '0 0 24px rgba(37,99,235,0.12)',
                                } })] })), scene === 'four' && (_jsxs(_Fragment, { children: [_jsx("div", { style: { position: 'absolute', left: '50%', top: '28%', transform: 'translate(-50%, -50%)', opacity: 0.18, filter: 'blur(34px)', width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT}, transparent 65%)` } }), _jsx("div", { style: { position: 'absolute', left: '50%', top: '32%', transform: 'translate(-50%, -50%)', opacity: 0.35, filter: 'blur(60px)', width: 560, height: 140, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` } }), _jsx("div", { style: { position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%, -50%)', opacity: 0.15, filter: 'blur(18px)', width: '100%', height: 140, background: 'linear-gradient(90deg, transparent, rgba(147,197,253,0.25), transparent)' } }), [['BUILDING', 0], ['PRODUCTION READY', 1], ['AI', 2]].map(([label, index]) => {
                                const show = clamp((frame - (180 + Number(index) * 20)) / 16, 0, 1);
                                const scale = interpolate(show, [0, 0.25, 1], [0.65, 1.08, 1.18]);
                                const y = interpolate(show, [0, 1], [40, 0]);
                                const intensity = index === 2 ? 1.35 : 1;
                                const color = index === 2 ? '#eff6ff' : 'white';
                                const size = index === 2 ? 180 : 64 + Number(index) * 8;
                                const top = index === 0 ? '28%' : index === 1 ? '46%' : '64%';
                                return (_jsx("div", { style: {
                                        position: 'absolute',
                                        left: '50%',
                                        top,
                                        transform: `translate(-50%, -50%) translateY(${y}px) scale(${scale})`,
                                        opacity: show,
                                        textAlign: 'center',
                                        filter: index === 2 ? 'drop-shadow(0 0 22px rgba(37,99,235,0.65))' : 'none',
                                    }, children: _jsx("span", { style: {
                                            fontFamily: FONT,
                                            fontSize: size,
                                            lineHeight: 1,
                                            fontWeight: 900,
                                            letterSpacing: index === 2 ? '-0.08em' : '-0.04em',
                                            color,
                                            textShadow: index === 2
                                                ? '0 0 24px rgba(37,99,235,0.8), 0 0 72px rgba(96,165,250,0.45)'
                                                : '0 0 18px rgba(148,163,184,0.2)',
                                            ...glowStyle(ACCENT, intensity),
                                        }, children: label }) }, `word-${label}`));
                            })] })), scene === 'five' && (_jsxs(_Fragment, { children: [_jsx("div", { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 520, height: 520, borderRadius: '50%', border: '1px solid rgba(148,163,184,0.12)', boxShadow: '0 0 50px rgba(37,99,235,0.08)' } }), CARD_LABELS.map((label, index) => (_jsx(GlassCard, { label: label, accent: index % 2 === 0 ? 'rgba(37,99,235,0.9)' : 'rgba(56,189,248,0.9)', index: index }, label))), _jsx("div", { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 280, height: 280, borderRadius: '50%', border: `1px solid rgba(37,99,235,0.35)`, boxShadow: '0 0 30px rgba(37,99,235,0.18)' } }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%) scale(1 + Math.sin(frame / 32) * 0.02)',
                                    fontFamily: FONT,
                                    fontSize: 70,
                                    fontWeight: 800,
                                    color: '#eff6ff',
                                    letterSpacing: '-0.05em',
                                    opacity: 0.9,
                                }, children: "ORBITAL SYSTEM" })] })), scene === 'six' && (_jsxs(_Fragment, { children: [_jsx("div", { style: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4, 8, 18, 0.5), rgba(2, 6, 23, 0.94))' } }), _jsx("div", { style: { position: 'absolute', left: '50%', top: '28%', transform: 'translate(-50%, -50%) scale(1.08)', opacity: 0.18, filter: 'blur(60px)', width: 760, height: 760, borderRadius: '50%', background: `radial-gradient(circle, rgba(37,99,235,0.65), transparent 60%)` } }), _jsx("div", { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 820 + ring * 160, height: 820 + ring * 160, borderRadius: '50%', border: `2px solid rgba(96,165,250,${0.35 + ring * 0.25})`, boxShadow: `0 0 ${30 + ring * 40}px rgba(37,99,235,${0.15 + ring * 0.2})`, opacity: 0.85 } }), _jsx("div", { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: 2, background: `linear-gradient(90deg, transparent, rgba(96,165,250,${0.45 + sweepLine * 0.35}), transparent)`, filter: 'blur(2px)', opacity: 0.7 } }), _jsxs("div", { style: { position: 'absolute', left: '50%', top: '18%', transform: 'translate(-50%, -50%) scale(1.05)', color: '#eff6ff', textAlign: 'center' }, children: [_jsx("div", { style: { fontFamily: FONT, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.35em', color: '#bfdbfe', opacity: 0.82 }, children: "BrowserStack" }), _jsx("div", { style: { fontFamily: FONT, fontSize: 82, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.055em', marginTop: 8 }, children: "Leadership Summit" }), _jsx("div", { style: { fontFamily: FONT, fontSize: 30, fontWeight: 600, color: '#dbeafe', marginTop: 16 }, children: "22 July 2026" })] }), _jsx("div", { style: { position: 'absolute', left: '50%', top: '72%', transform: 'translate(-50%, -50%) scale(1.02)', textAlign: 'center' }, children: _jsx("span", { style: { fontFamily: FONT, fontSize: 56, fontWeight: 900, letterSpacing: '-0.05em', color: '#eff6ff', textShadow: '0 0 30px rgba(37,99,235,0.35)' }, children: "REGISTER NOW" }) }), _jsx("div", { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 0.12, filter: 'blur(18px)', fontFamily: FONT, fontSize: 240, fontWeight: 900, letterSpacing: '-0.08em', color: 'white', textAlign: 'center' }, children: "AI" }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '53%',
                                    transform: 'translate(-50%, -50%)',
                                    color: '#eff6ff',
                                    fontFamily: FONT,
                                    fontSize: 180,
                                    fontWeight: 900,
                                    letterSpacing: '-0.08em',
                                    textShadow: '0 0 28px rgba(37,99,235,0.65), 0 0 65px rgba(96,165,250,0.35)',
                                    opacity: sceneSixScale,
                                }, children: "AI" }), _jsx("div", { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 160, background: 'linear-gradient(180deg, transparent, rgba(2,6,23,0.94))' } })] }))] }), _jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, rgba(2,6,23,0.05) 0%, rgba(2,6,23,0.18) 33%, rgba(2,6,23,0.32) 66%, rgba(2,6,23,0.55) 100%)`,
                    mixBlendMode: 'screen',
                    opacity: heroGlow,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, rgba(37,99,235,0.06), transparent 25%, transparent 75%, rgba(56,189,248,0.04))`,
                    opacity: 0.25,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    backgroundImage: `linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)`,
                    backgroundSize: '120px 120px',
                    opacity: 0.18,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 120,
                    background: 'linear-gradient(180deg, transparent, rgba(2,6,23,0.88))',
                } })] }));
}
export const VerticalPhoneComparison = Component;
export const getTotalDuration = () => 15 * 30;
