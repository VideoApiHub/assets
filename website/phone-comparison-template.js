import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, } from 'remotion';
const FONT = 'Space Grotesk';
const fontLink = `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap`;
const FontLoader = () => (_jsx("style", { dangerouslySetInnerHTML: { __html: `@import url('${fontLink}');` } }));
const winnerColor = '#22C55E';
const countWins = (sections) => {
    let leftWins = 0;
    let rightWins = 0;
    let ties = 0;
    for (const section of sections) {
        for (const spec of section.specs) {
            if (spec[3] === 'left')
                leftWins++;
            else if (spec[3] === 'right')
                rightWins++;
            else
                ties++;
        }
    }
    return { leftWins, rightWins, ties };
};
const Background = () => {
    const frame = useCurrentFrame();
    const pulse1 = 0.3 + Math.sin(frame / 20) * 0.15;
    const pulse2 = 0.25 + Math.cos(frame / 15) * 0.12;
    const pulse3 = 0.2 + Math.sin(frame / 25 + 1) * 0.1;
    const neonLines = [
        { y: 180, color: '0,210,255', speed: 2, width: 350, delay: 0 },
        { y: 480, color: '139,92,246', speed: -1.5, width: 280, delay: 30 },
        { y: 780, color: '0,210,255', speed: 1.8, width: 320, delay: 60 },
        { y: 1080, color: '236,72,153', speed: -2.2, width: 260, delay: 10 },
        { y: 1380, color: '139,92,246', speed: 1.6, width: 300, delay: 45 },
        { y: 1700, color: '0,210,255', speed: -1.9, width: 340, delay: 20 },
    ];
    const vertLines = [
        { x: 80, color: '139,92,246', speed: 3, height: 200, delay: 0 },
        { x: 1000, color: '0,210,255', speed: -2.5, height: 180, delay: 25 },
        { x: 540, color: '236,72,153', speed: 2, height: 240, delay: 50 },
    ];
    const particles = Array.from({ length: 12 }, (_, i) => {
        const angle = (frame / (30 + i * 5) + i * 0.52) % (Math.PI * 2);
        const radius = 200 + i * 60;
        const cx = 540 + Math.cos(angle) * radius * 0.6;
        const cy = 960 + Math.sin(angle) * radius;
        const size = 3 + Math.sin(frame / 10 + i) * 2;
        const colors = ['0,210,255', '139,92,246', '236,72,153'];
        const color = colors[i % 3];
        const opacity = 0.3 + Math.sin(frame / 8 + i * 2) * 0.2;
        return { cx, cy, size, color, opacity, i };
    });
    return (_jsxs(AbsoluteFill, { style: { background: '#05000a', overflow: 'hidden' }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: `
            radial-gradient(ellipse at 30% 20%, rgba(0,210,255,${pulse1 * 0.12}) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(139,92,246,${pulse2 * 0.12}) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(236,72,153,${pulse3 * 0.06}) 0%, transparent 60%)
          `,
                } }), neonLines.map((line, i) => {
                const xPos = ((frame + line.delay) * line.speed * 4) % 1600 - 400;
                const glow = 0.3 + Math.sin((frame + line.delay) / 12) * 0.15;
                return (_jsx("div", { style: {
                        position: 'absolute',
                        top: line.y,
                        left: xPos,
                        width: line.width,
                        height: 2,
                        background: `linear-gradient(90deg, transparent, rgba(${line.color},${glow}), rgba(${line.color},${glow * 1.5}), rgba(${line.color},${glow}), transparent)`,
                        boxShadow: `0 0 12px rgba(${line.color},${glow * 0.6}), 0 0 30px rgba(${line.color},${glow * 0.3})`,
                        borderRadius: 2,
                    } }, `nh-${i}`));
            }), vertLines.map((line, i) => {
                const yPos = ((frame + line.delay) * line.speed * 3) % 2200 - 300;
                const glow = 0.25 + Math.sin((frame + line.delay) / 14) * 0.12;
                return (_jsx("div", { style: {
                        position: 'absolute',
                        left: line.x,
                        top: yPos,
                        width: 2,
                        height: line.height,
                        background: `linear-gradient(180deg, transparent, rgba(${line.color},${glow}), rgba(${line.color},${glow * 1.5}), rgba(${line.color},${glow}), transparent)`,
                        boxShadow: `0 0 10px rgba(${line.color},${glow * 0.5}), 0 0 25px rgba(${line.color},${glow * 0.25})`,
                        borderRadius: 2,
                    } }, `nv-${i}`));
            }), [0, 1, 2].map((i) => {
                const cx = [200, 880, 540][i];
                const cy = [400, 1200, 1700][i];
                const size = [120, 100, 140][i];
                const rot = frame / (3 + i) + i * 60;
                const colors = ['0,210,255', '139,92,246', '236,72,153'];
                const opacity = 0.08 + Math.sin(frame / 18 + i * 2) * 0.04;
                return (_jsx("div", { style: {
                        position: 'absolute',
                        left: cx - size / 2,
                        top: cy - size / 2,
                        width: size,
                        height: size,
                        border: `1px solid rgba(${colors[i]},${opacity})`,
                        borderRadius: 12,
                        transform: `rotate(${rot}deg)`,
                        boxShadow: `0 0 15px rgba(${colors[i]},${opacity * 0.5}), inset 0 0 15px rgba(${colors[i]},${opacity * 0.3})`,
                    } }, `hex-${i}`));
            }), particles.map((p) => (_jsx("div", { style: {
                    position: 'absolute',
                    left: p.cx,
                    top: p.cy,
                    width: p.size,
                    height: p.size,
                    borderRadius: '50%',
                    background: `rgba(${p.color},${p.opacity})`,
                    boxShadow: `0 0 ${p.size * 3}px rgba(${p.color},${p.opacity * 0.8}), 0 0 ${p.size * 6}px rgba(${p.color},${p.opacity * 0.3})`,
                } }, `np-${p.i}`))), _jsx("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: 539,
                    width: 2,
                    height: '100%',
                    background: `linear-gradient(180deg, transparent 0%, rgba(139,92,246,${0.04 + Math.sin(frame / 20) * 0.02}) 30%, rgba(139,92,246,${0.04 + Math.sin(frame / 20) * 0.02}) 70%, transparent 100%)`,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 3,
                    height: '100%',
                    background: `linear-gradient(180deg, transparent, rgba(0,210,255,${pulse1 * 0.25}), transparent 40%, transparent 60%, rgba(139,92,246,${pulse2 * 0.2}), transparent)`,
                    boxShadow: `3px 0 20px rgba(0,210,255,${pulse1 * 0.1})`,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 3,
                    height: '100%',
                    background: `linear-gradient(180deg, transparent, rgba(139,92,246,${pulse2 * 0.25}), transparent 40%, transparent 60%, rgba(0,210,255,${pulse1 * 0.2}), transparent)`,
                    boxShadow: `-3px 0 20px rgba(139,92,246,${pulse2 * 0.1})`,
                } })] }));
};
const IntroSlide = ({ left, right, intro }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const taglinePop = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
    const leftSlide = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 80 } });
    const rightSlide = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 80 } });
    const vsPop = spring({ frame: frame - 25, fps, config: { damping: 10, stiffness: 140 } });
    const namesReveal = spring({ frame: frame - 35, fps, config: { damping: 12, stiffness: 100 } });
    const subtitleReveal = spring({ frame: frame - 50, fps, config: { damping: 14, stiffness: 80 } });
    const vsGlow = 15 + Math.sin(frame / 8) * 10;
    const leftX = interpolate(leftSlide, [0, 1], [-400, 0]);
    const rightX = interpolate(rightSlide, [0, 1], [400, 0]);
    const vsScale = interpolate(vsPop, [0, 1], [0, 1]);
    const vsRotate = interpolate(vsPop, [0, 1], [180, 0]);
    return (_jsxs(AbsoluteFill, { style: { justifyContent: 'center', alignItems: 'center' }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    top: 160,
                    width: '100%',
                    textAlign: 'center',
                    opacity: taglinePop,
                    transform: `translateY(${interpolate(taglinePop, [0, 1], [-30, 0])}px)`,
                }, children: _jsx("div", { style: { color: '#60A5FA', fontSize: 38, letterSpacing: 10, fontWeight: 800, fontFamily: FONT }, children: intro.tagline }) }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, marginTop: -60 }, children: [_jsx("div", { style: { transform: `translateX(${leftX}px) translateY(${Math.sin(frame / 16) * 10}px)`, opacity: leftSlide }, children: _jsx("div", { style: {
                                width: 280,
                                height: 440,
                                borderRadius: 44,
                                overflow: 'hidden',
                                border: `3px solid ${left.color}`,
                                boxShadow: `0 0 60px ${left.color}66, inset 0 0 30px rgba(0,0,0,0.3)`,
                            }, children: _jsx(Img, { src: left.image, style: { width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center', transform: 'rotate(-5deg) scale(1.1)' } }) }) }), _jsx("div", { style: { position: 'absolute', zIndex: 10, transform: `scale(${vsScale}) rotate(${vsRotate}deg)` }, children: _jsx("div", { style: {
                                width: 140,
                                height: 140,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #EF4444 0%, #F97316 50%, #EAB308 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 ${vsGlow}px rgba(239,68,68,0.6), 0 0 ${vsGlow * 2}px rgba(239,68,68,0.3)`,
                            }, children: _jsx("div", { style: { color: 'white', fontSize: 56, fontWeight: 900, fontFamily: FONT, textShadow: '0 2px 10px rgba(0,0,0,0.4)' }, children: "VS" }) }) }), _jsx("div", { style: { transform: `translateX(${rightX}px) translateY(${Math.cos(frame / 16) * 10}px)`, opacity: rightSlide }, children: _jsx("div", { style: {
                                width: 280,
                                height: 440,
                                borderRadius: 44,
                                overflow: 'hidden',
                                border: `3px solid ${right.color}`,
                                boxShadow: `0 0 60px ${right.color}66, inset 0 0 30px rgba(0,0,0,0.3)`,
                            }, children: _jsx(Img, { src: right.image, style: { width: '100%', height: '100%', objectFit: 'cover' } }) }) })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    bottom: 500,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 60,
                    opacity: namesReveal,
                    transform: `translateY(${interpolate(namesReveal, [0, 1], [40, 0])}px)`,
                }, children: [_jsx("div", { style: { color: left.color, fontSize: 46, fontWeight: 900, fontFamily: FONT, textShadow: `0 0 20px ${left.color}55` }, children: left.name }), _jsx("div", { style: { color: 'rgba(255,255,255,0.3)', fontSize: 40, fontWeight: 700, fontFamily: FONT }, children: "vs" }), _jsx("div", { style: { color: right.color, fontSize: 46, fontWeight: 900, fontFamily: FONT, textShadow: `0 0 20px ${right.color}55` }, children: right.name })] }), _jsx("div", { style: {
                    position: 'absolute',
                    bottom: 380,
                    width: '100%',
                    textAlign: 'center',
                    opacity: subtitleReveal,
                    transform: `translateY(${interpolate(subtitleReveal, [0, 1], [20, 0])}px)`,
                }, children: _jsx("div", { style: { color: 'rgba(255,255,255,0.6)', fontSize: 36, fontWeight: 600, fontFamily: FONT, padding: '0 60px' }, children: intro.subtitle }) }), _jsx("div", { style: {
                    position: 'absolute',
                    bottom: 260,
                    width: '100%',
                    textAlign: 'center',
                    opacity: interpolate(subtitleReveal, [0, 1], [0, 0.6]),
                }, children: _jsx("div", { style: { color: 'white', fontSize: 28, fontWeight: 600, fontFamily: FONT, transform: `translateY(${Math.sin(frame / 10) * 6}px)` }, children: "\u25BC LET THE BATTLE BEGIN \u25BC" }) })] }));
};
const PhoneHeader = ({ left, right }) => {
    const frame = useCurrentFrame();
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: { position: 'absolute', top: 70, left: 50, width: 260, textAlign: 'center' }, children: [_jsx("div", { style: {
                            width: 220,
                            height: 340,
                            margin: '0 auto',
                            borderRadius: 40,
                            overflow: 'hidden',
                            border: `2px solid ${left.color}`,
                            boxShadow: `0 0 40px ${left.color}55`,
                            transform: `translateY(${Math.sin(frame / 18) * 8}px)`,
                        }, children: _jsx(Img, { src: left.image, style: { width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center', transform: 'rotate(-5deg) scale(1.1)' } }) }), _jsx("div", { style: { marginTop: 18, color: 'white', fontSize: 28, fontWeight: 800, fontFamily: FONT }, children: left.short })] }), _jsxs("div", { style: { position: 'absolute', top: 70, right: 50, width: 260, textAlign: 'center' }, children: [_jsx("div", { style: {
                            width: 220,
                            height: 340,
                            margin: '0 auto',
                            borderRadius: 40,
                            overflow: 'hidden',
                            border: `2px solid ${right.color}`,
                            boxShadow: `0 0 40px ${right.color}55`,
                            transform: `translateY(${Math.cos(frame / 18) * 8}px)`,
                        }, children: _jsx(Img, { src: right.image, style: { width: '100%', height: '100%', objectFit: 'cover' } }) }), _jsx("div", { style: { marginTop: 18, color: 'white', fontSize: 28, fontWeight: 800, fontFamily: FONT }, children: right.short })] })] }));
};
const WinnerBadge = ({ winner, progress }) => {
    const scale = interpolate(progress, [0, 1], [0.5, 1]);
    const badgeOpacity = interpolate(progress, [0, 1], [0, 1]);
    if (winner === 'neutral') {
        return (_jsx("div", { style: {
                padding: '8px 18px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: 18,
                fontWeight: 700,
                fontFamily: FONT,
                opacity: badgeOpacity,
                transform: `scale(${scale})`,
            }, children: "EVEN" }));
    }
    return (_jsx("div", { style: {
            padding: '8px 18px',
            borderRadius: 999,
            background: 'rgba(34,197,94,0.18)',
            border: '1px solid rgba(34,197,94,0.4)',
            color: winnerColor,
            fontSize: 18,
            fontWeight: 800,
            fontFamily: FONT,
            opacity: badgeOpacity,
            transform: `scale(${scale})`,
        }, children: "WINNER" }));
};
const SpecRow = ({ spec, index }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const rowDelay = index * 18;
    const winnerDelay = rowDelay + 12;
    const reveal = spring({ frame: frame - rowDelay, fps, config: { damping: 14, stiffness: 120 } });
    const winnerReveal = spring({ frame: frame - winnerDelay, fps, config: { damping: 12, stiffness: 100 } });
    const translateY = interpolate(reveal, [0, 1], [60, 0]);
    const opacity = interpolate(reveal, [0, 1], [0, 1]);
    const winner = spec[3];
    const leftIsWinner = winner === 'left';
    const rightIsWinner = winner === 'right';
    const leftBg = interpolate(leftIsWinner ? winnerReveal : 0, [0, 1], [0, 1]);
    const rightBg = interpolate(rightIsWinner ? winnerReveal : 0, [0, 1], [0, 1]);
    const lerpColor = (from, to, t) => {
        const parseRgba = (s) => {
            const m = s.match(/[\d.]+/g);
            return m ? m.map(Number) : [0, 0, 0, 0];
        };
        const f = parseRgba(from);
        const tt = parseRgba(to);
        return `rgba(${f.map((v, i) => v + (tt[i] - v) * t).join(',')})`;
    };
    const neutralBg = 'rgba(255,255,255,0.05)';
    const neutralBorder = 'rgba(255,255,255,0.06)';
    const winBg = 'rgba(34,197,94,0.16)';
    const winBorder = 'rgba(34,197,94,0.35)';
    return (_jsxs("div", { style: {
            opacity,
            transform: `translateY(${translateY}px)`,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: 16,
            marginBottom: 12,
        }, children: [_jsx("div", { style: { textAlign: 'center', marginBottom: 10 }, children: _jsx("div", { style: { color: '#A5B4FC', fontSize: 26, fontWeight: 800, fontFamily: FONT }, children: spec[0] }) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 6, minHeight: 32 }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'center' }, children: (leftIsWinner || winner === 'neutral') && _jsx(WinnerBadge, { winner: winner, progress: winnerReveal }) }), _jsx("div", { style: { display: 'flex', justifyContent: 'center' }, children: (rightIsWinner || winner === 'neutral') && _jsx(WinnerBadge, { winner: winner, progress: winnerReveal }) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsx("div", { style: {
                            padding: 14,
                            borderRadius: 18,
                            background: lerpColor(neutralBg, winBg, leftBg),
                            border: `1px solid ${lerpColor(neutralBorder, winBorder, leftBg)}`,
                            boxShadow: leftIsWinner ? `0 0 ${20 * winnerReveal}px rgba(34,197,94,${0.2 * winnerReveal})` : 'none',
                        }, children: _jsx("div", { style: { color: lerpColor('rgba(255,255,255,1)', 'rgba(34,197,94,1)', leftBg), fontSize: 30, fontWeight: 800, fontFamily: FONT }, children: spec[1] }) }), _jsx("div", { style: {
                            padding: 14,
                            borderRadius: 18,
                            background: lerpColor(neutralBg, winBg, rightBg),
                            border: `1px solid ${lerpColor(neutralBorder, winBorder, rightBg)}`,
                            boxShadow: rightIsWinner ? `0 0 ${20 * winnerReveal}px rgba(34,197,94,${0.2 * winnerReveal})` : 'none',
                        }, children: _jsx("div", { style: { color: lerpColor('rgba(255,255,255,1)', 'rgba(34,197,94,1)', rightBg), fontSize: 30, fontWeight: 800, fontFamily: FONT }, children: spec[2] }) })] })] }));
};
const ComparisonSlide = ({ section, left, right }) => {
    const frame = useCurrentFrame();
    return (_jsxs(AbsoluteFill, { children: [_jsx(PhoneHeader, { left: left, right: right }), _jsx("div", { style: {
                    position: 'absolute',
                    top: 160,
                    left: 310,
                    right: 310,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 160,
                }, children: _jsx("div", { style: {
                        color: 'white',
                        fontSize: 40,
                        fontWeight: 900,
                        fontFamily: FONT,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        transform: `scale(${1 + Math.sin(frame / 18) * 0.02})`,
                        textShadow: '0 0 20px rgba(96,165,250,0.3)',
                    }, children: section.title }) }), _jsx("div", { style: { position: 'absolute', top: 460, left: 40, right: 40, bottom: 220 }, children: section.specs.map((spec, i) => (_jsx(SpecRow, { spec: spec, index: i }, i))) })] }));
};
const SECTION_TITLE_DURATION = 40;
const SectionTitleSlide = ({ title, emoji, index }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const lineReveal = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
    const emojiPop = spring({ frame: frame - 3, fps, config: { damping: 10, stiffness: 140 } });
    const titlePop = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 100 } });
    const numReveal = spring({ frame: frame - 3, fps, config: { damping: 14, stiffness: 120 } });
    const emojiScale = interpolate(emojiPop, [0, 1], [0, 1]);
    const emojiOpacity = interpolate(emojiPop, [0, 1], [0, 1]);
    const titleScale = interpolate(titlePop, [0, 1], [0.6, 1]);
    const titleOpacity = interpolate(titlePop, [0, 1], [0, 1]);
    const lineWidth = interpolate(lineReveal, [0, 1], [0, 500]);
    const numOpacity = interpolate(numReveal, [0, 1], [0, 0.4]);
    const floatY = Math.sin(frame / 12) * 4;
    return (_jsxs(AbsoluteFill, { style: { justifyContent: 'center', alignItems: 'center' }, children: [_jsx("div", { style: { position: 'absolute', opacity: numOpacity, transform: `translateY(${floatY}px)` }, children: _jsx("div", { style: { color: 'rgba(255,255,255,0.06)', fontSize: 400, fontWeight: 900, fontFamily: FONT, lineHeight: 1 }, children: String(index + 1).padStart(2, '0') }) }), _jsx("div", { style: {
                    position: 'absolute',
                    top: '38%',
                    width: lineWidth,
                    height: 3,
                    background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent)',
                    borderRadius: 2,
                } }), _jsx("div", { style: { opacity: emojiOpacity, transform: `scale(${emojiScale}) translateY(${floatY - 10}px)`, textAlign: 'center', marginBottom: 20 }, children: _jsx("div", { style: { fontSize: 100, lineHeight: 1.2 }, children: emoji }) }), _jsx("div", { style: { opacity: titleOpacity, transform: `scale(${titleScale}) translateY(${floatY}px)`, textAlign: 'center' }, children: _jsx("div", { style: { color: 'white', fontSize: 96, fontWeight: 900, fontFamily: FONT, textShadow: '0 0 40px rgba(96,165,250,0.3)' }, children: title }) }), _jsx("div", { style: {
                    position: 'absolute',
                    bottom: '38%',
                    width: lineWidth,
                    height: 3,
                    background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)',
                    borderRadius: 2,
                } })] }));
};
const FinalSlide = ({ left, right, sections, verdict }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { leftWins, rightWins } = countWins(sections);
    const overallWinner = leftWins >= rightWins ? 'left' : 'right';
    const winnerPhone = overallWinner === 'left' ? left : right;
    const loserPhone = overallWinner === 'left' ? right : left;
    const winnerWins = Math.max(leftWins, rightWins);
    const loserWins = Math.min(leftWins, rightWins);
    const pop = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
    const imageReveal = spring({ frame: frame - 15, fps, config: { damping: 12, stiffness: 80 } });
    const scoreReveal = spring({ frame: frame - 30, fps, config: { damping: 14, stiffness: 100 } });
    const ctaReveal = spring({ frame: frame - 50, fps, config: { damping: 14, stiffness: 80 } });
    const imageScale = interpolate(imageReveal, [0, 1], [0.5, 1]);
    const imageOpacity = interpolate(imageReveal, [0, 1], [0, 1]);
    const glowPulse = 30 + Math.sin(frame / 8) * 15;
    return (_jsxs(AbsoluteFill, { style: { justifyContent: 'center', alignItems: 'center', padding: 50 }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    top: 120,
                    width: '100%',
                    textAlign: 'center',
                    opacity: pop,
                    transform: `translateY(${interpolate(pop, [0, 1], [-20, 0])}px)`,
                }, children: _jsx("div", { style: { color: '#60A5FA', fontSize: 30, letterSpacing: 6, fontWeight: 700, fontFamily: FONT }, children: "FINAL VERDICT" }) }), _jsx("div", { style: {
                    position: 'absolute',
                    top: 200,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: imageOpacity,
                    transform: `scale(${imageScale})`,
                }, children: _jsx("div", { style: {
                        width: 300,
                        height: 460,
                        borderRadius: 48,
                        overflow: 'hidden',
                        border: `4px solid ${winnerColor}`,
                        boxShadow: `0 0 ${glowPulse}px rgba(34,197,94,0.5), 0 0 ${glowPulse * 2}px rgba(34,197,94,0.2)`,
                    }, children: _jsx(Img, { src: winnerPhone.image, style: { width: '100%', height: '100%', objectFit: 'cover' } }) }) }), _jsxs("div", { style: {
                    position: 'absolute',
                    top: 700,
                    width: '100%',
                    textAlign: 'center',
                    opacity: scoreReveal,
                    transform: `translateY(${interpolate(scoreReveal, [0, 1], [30, 0])}px)`,
                }, children: [_jsx("div", { style: { fontSize: 48, marginBottom: 12 }, children: "\uD83D\uDC51" }), _jsx("div", { style: { color: winnerColor, fontSize: 64, fontWeight: 900, fontFamily: FONT, textShadow: '0 0 30px rgba(34,197,94,0.4)', marginBottom: 16 }, children: winnerPhone.name }), _jsxs("div", { style: { color: winnerColor, fontSize: 36, fontWeight: 800, fontFamily: FONT, marginBottom: 40 }, children: ["WINS ", winnerWins, " \u2013 ", loserWins] })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    top: 980,
                    left: 50,
                    right: 50,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 20,
                    opacity: scoreReveal,
                    transform: `translateY(${interpolate(scoreReveal, [0, 1], [20, 0])}px)`,
                }, children: [_jsxs("div", { style: { padding: 24, borderRadius: 24, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }, children: [_jsx("div", { style: { color: winnerColor, fontSize: 22, fontWeight: 800, fontFamily: FONT, marginBottom: 8 }, children: winnerPhone.short }), _jsx("div", { style: { color: 'rgba(255,255,255,0.7)', fontSize: 22, fontFamily: FONT, lineHeight: 1.4 }, children: overallWinner === 'left' ? verdict.leftSummary : verdict.rightSummary })] }), _jsxs("div", { style: { padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }, children: [_jsx("div", { style: { color: loserPhone.color, fontSize: 22, fontWeight: 800, fontFamily: FONT, marginBottom: 8 }, children: loserPhone.short }), _jsx("div", { style: { color: 'rgba(255,255,255,0.5)', fontSize: 22, fontFamily: FONT, lineHeight: 1.4 }, children: overallWinner === 'left' ? verdict.rightSummary : verdict.leftSummary })] })] }), _jsx("div", { style: {
                    position: 'absolute',
                    bottom: 300,
                    width: '100%',
                    textAlign: 'center',
                    opacity: ctaReveal,
                    transform: `scale(${interpolate(ctaReveal, [0, 1], [0.8, 1])})`,
                }, children: _jsx("div", { style: {
                        display: 'inline-flex',
                        padding: '20px 40px',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                        color: 'white',
                        fontSize: 32,
                        fontWeight: 800,
                        fontFamily: FONT,
                    }, children: verdict.cta }) })] }));
};
const sectionDuration = (specCount) => {
    const base = 40;
    const perRow = 18;
    const winnerBuffer = 12;
    const viewingTime = 30;
    return base + (specCount - 1) * perRow + winnerBuffer + viewingTime;
};
const INTRO_DURATION = 90;
const SECTION_PAUSE = 9;
export const getPhoneComparisonDuration = (props) => {
    let total = INTRO_DURATION;
    for (const section of props.sections) {
        total += SECTION_TITLE_DURATION;
        total += sectionDuration(section.specs.length) + SECTION_PAUSE;
    }
    total += props.finalSlideDuration;
    return total;
};
export default function PhoneComparisonVideo(props) {
    const { left, right, sections, intro, verdict, finalSlideDuration } = props;
    const titleStarts = [];
    const compStarts = [];
    let cursor = INTRO_DURATION;
    for (const section of sections) {
        titleStarts.push(cursor);
        cursor += SECTION_TITLE_DURATION;
        compStarts.push(cursor);
        cursor += sectionDuration(section.specs.length) + SECTION_PAUSE;
    }
    return (_jsxs(AbsoluteFill, { style: { fontFamily: FONT }, children: [_jsx(FontLoader, {}), _jsx(Background, {}), _jsx(Sequence, { from: 0, durationInFrames: INTRO_DURATION, children: _jsx(IntroSlide, { left: left, right: right, intro: intro }) }), sections.map((section, i) => (_jsxs(React.Fragment, { children: [_jsx(Sequence, { from: titleStarts[i], durationInFrames: SECTION_TITLE_DURATION, children: _jsx(SectionTitleSlide, { title: section.title, emoji: section.emoji, index: i }) }), _jsx(Sequence, { from: compStarts[i], durationInFrames: sectionDuration(section.specs.length), children: _jsx(ComparisonSlide, { section: section, left: left, right: right }) })] }, i))), _jsx(Sequence, { from: cursor, durationInFrames: finalSlideDuration, children: _jsx(FinalSlide, { left: left, right: right, sections: sections, verdict: verdict }) })] }));
}
