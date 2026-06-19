import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const FONT = 'Space Grotesk';

const fontLink = `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap`;

const FontLoader = () => (
  <style dangerouslySetInnerHTML={{ __html: `@import url('${fontLink}');` }} />
);

/*
VIDEO SETTINGS
1080 x 1920 (9:16)
30 FPS
*/

type Winner = 'left' | 'right' | 'neutral';
type Spec = [string, string, string, Winner];
type Section = { title: string; emoji: string; specs: Spec[] };
type PhoneInfo = { name: string; short: string; color: string; image: string };

export interface PhoneComparisonProps {
  left: PhoneInfo;
  right: PhoneInfo;
  intro: {
    tagline: string;
    subtitle: string;
  };
  sections: Section[];
  verdict: {
    title: string;
    leftSummary: string;
    rightSummary: string;
    cta: string;
  };
  framesPerSection: number;
  finalSlideDuration: number;
}

const winnerColor = '#22C55E';

const countWins = (sections: Section[]) => {
  let leftWins = 0;
  let rightWins = 0;
  let ties = 0;
  for (const section of sections) {
    for (const spec of section.specs) {
      if (spec[3] === 'left') leftWins++;
      else if (spec[3] === 'right') rightWins++;
      else ties++;
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

  return (
    <AbsoluteFill style={{ background: '#05000a', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(0,210,255,${pulse1 * 0.12}) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(139,92,246,${pulse2 * 0.12}) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(236,72,153,${pulse3 * 0.06}) 0%, transparent 60%)
          `,
        }}
      />
      {neonLines.map((line, i) => {
        const xPos = ((frame + line.delay) * line.speed * 4) % 1600 - 400;
        const glow = 0.3 + Math.sin((frame + line.delay) / 12) * 0.15;
        return (
          <div
            key={`nh-${i}`}
            style={{
              position: 'absolute',
              top: line.y,
              left: xPos,
              width: line.width,
              height: 2,
              background: `linear-gradient(90deg, transparent, rgba(${line.color},${glow}), rgba(${line.color},${glow * 1.5}), rgba(${line.color},${glow}), transparent)`,
              boxShadow: `0 0 12px rgba(${line.color},${glow * 0.6}), 0 0 30px rgba(${line.color},${glow * 0.3})`,
              borderRadius: 2,
            }}
          />
        );
      })}
      {vertLines.map((line, i) => {
        const yPos = ((frame + line.delay) * line.speed * 3) % 2200 - 300;
        const glow = 0.25 + Math.sin((frame + line.delay) / 14) * 0.12;
        return (
          <div
            key={`nv-${i}`}
            style={{
              position: 'absolute',
              left: line.x,
              top: yPos,
              width: 2,
              height: line.height,
              background: `linear-gradient(180deg, transparent, rgba(${line.color},${glow}), rgba(${line.color},${glow * 1.5}), rgba(${line.color},${glow}), transparent)`,
              boxShadow: `0 0 10px rgba(${line.color},${glow * 0.5}), 0 0 25px rgba(${line.color},${glow * 0.25})`,
              borderRadius: 2,
            }}
          />
        );
      })}
      {[0, 1, 2].map((i) => {
        const cx = [200, 880, 540][i];
        const cy = [400, 1200, 1700][i];
        const size = [120, 100, 140][i];
        const rot = frame / (3 + i) + i * 60;
        const colors = ['0,210,255', '139,92,246', '236,72,153'];
        const opacity = 0.08 + Math.sin(frame / 18 + i * 2) * 0.04;
        return (
          <div
            key={`hex-${i}`}
            style={{
              position: 'absolute',
              left: cx - size / 2,
              top: cy - size / 2,
              width: size,
              height: size,
              border: `1px solid rgba(${colors[i]},${opacity})`,
              borderRadius: 12,
              transform: `rotate(${rot}deg)`,
              boxShadow: `0 0 15px rgba(${colors[i]},${opacity * 0.5}), inset 0 0 15px rgba(${colors[i]},${opacity * 0.3})`,
            }}
          />
        );
      })}
      {particles.map((p) => (
        <div
          key={`np-${p.i}`}
          style={{
            position: 'absolute',
            left: p.cx,
            top: p.cy,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: `rgba(${p.color},${p.opacity})`,
            boxShadow: `0 0 ${p.size * 3}px rgba(${p.color},${p.opacity * 0.8}), 0 0 ${p.size * 6}px rgba(${p.color},${p.opacity * 0.3})`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 539,
          width: 2,
          height: '100%',
          background: `linear-gradient(180deg, transparent 0%, rgba(139,92,246,${0.04 + Math.sin(frame / 20) * 0.02}) 30%, rgba(139,92,246,${0.04 + Math.sin(frame / 20) * 0.02}) 70%, transparent 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 3,
          height: '100%',
          background: `linear-gradient(180deg, transparent, rgba(0,210,255,${pulse1 * 0.25}), transparent 40%, transparent 60%, rgba(139,92,246,${pulse2 * 0.2}), transparent)`,
          boxShadow: `3px 0 20px rgba(0,210,255,${pulse1 * 0.1})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 3,
          height: '100%',
          background: `linear-gradient(180deg, transparent, rgba(139,92,246,${pulse2 * 0.25}), transparent 40%, transparent 60%, rgba(0,210,255,${pulse1 * 0.2}), transparent)`,
          boxShadow: `-3px 0 20px rgba(139,92,246,${pulse2 * 0.1})`,
        }}
      />
    </AbsoluteFill>
  );
};

const IntroSlide = ({ left, right, intro }: { left: PhoneInfo; right: PhoneInfo; intro: PhoneComparisonProps['intro'] }) => {
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

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'absolute',
          top: 160,
          width: '100%',
          textAlign: 'center',
          opacity: taglinePop,
          transform: `translateY(${interpolate(taglinePop, [0, 1], [-30, 0])}px)`,
        }}
      >
        <div style={{ color: '#60A5FA', fontSize: 38, letterSpacing: 10, fontWeight: 800, fontFamily: FONT }}>
          {intro.tagline}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, marginTop: -60 }}>
        <div style={{ transform: `translateX(${leftX}px) translateY(${Math.sin(frame / 16) * 10}px)`, opacity: leftSlide }}>
          <div
            style={{
              width: 280,
              height: 440,
              borderRadius: 44,
              overflow: 'hidden',
              border: `3px solid ${left.color}`,
              boxShadow: `0 0 60px ${left.color}66, inset 0 0 30px rgba(0,0,0,0.3)`,
            }}
          >
            <Img src={left.image} style={{ width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center', transform: 'rotate(-5deg) scale(1.1)' }} />
          </div>
        </div>

        <div style={{ position: 'absolute', zIndex: 10, transform: `scale(${vsScale}) rotate(${vsRotate}deg)` }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444 0%, #F97316 50%, #EAB308 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 ${vsGlow}px rgba(239,68,68,0.6), 0 0 ${vsGlow * 2}px rgba(239,68,68,0.3)`,
            }}
          >
            <div style={{ color: 'white', fontSize: 56, fontWeight: 900, fontFamily: FONT, textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
              VS
            </div>
          </div>
        </div>

        <div style={{ transform: `translateX(${rightX}px) translateY(${Math.cos(frame / 16) * 10}px)`, opacity: rightSlide }}>
          <div
            style={{
              width: 280,
              height: 440,
              borderRadius: 44,
              overflow: 'hidden',
              border: `3px solid ${right.color}`,
              boxShadow: `0 0 60px ${right.color}66, inset 0 0 30px rgba(0,0,0,0.3)`,
            }}
          >
            <Img src={right.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 500,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 60,
          opacity: namesReveal,
          transform: `translateY(${interpolate(namesReveal, [0, 1], [40, 0])}px)`,
        }}
      >
        <div style={{ color: left.color, fontSize: 46, fontWeight: 900, fontFamily: FONT, textShadow: `0 0 20px ${left.color}55` }}>
          {left.name}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 40, fontWeight: 700, fontFamily: FONT }}>vs</div>
        <div style={{ color: right.color, fontSize: 46, fontWeight: 900, fontFamily: FONT, textShadow: `0 0 20px ${right.color}55` }}>
          {right.name}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 380,
          width: '100%',
          textAlign: 'center',
          opacity: subtitleReveal,
          transform: `translateY(${interpolate(subtitleReveal, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 36, fontWeight: 600, fontFamily: FONT, padding: '0 60px' }}>
          {intro.subtitle}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 260,
          width: '100%',
          textAlign: 'center',
          opacity: interpolate(subtitleReveal, [0, 1], [0, 0.6]),
        }}
      >
        <div style={{ color: 'white', fontSize: 28, fontWeight: 600, fontFamily: FONT, transform: `translateY(${Math.sin(frame / 10) * 6}px)` }}>
          ▼ LET THE BATTLE BEGIN ▼
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PhoneHeader = ({ left, right }: { left: PhoneInfo; right: PhoneInfo }) => {
  const frame = useCurrentFrame();

  return (
    <>
      <div style={{ position: 'absolute', top: 70, left: 50, width: 260, textAlign: 'center' }}>
        <div
          style={{
            width: 220,
            height: 340,
            margin: '0 auto',
            borderRadius: 40,
            overflow: 'hidden',
            border: `2px solid ${left.color}`,
            boxShadow: `0 0 40px ${left.color}55`,
            transform: `translateY(${Math.sin(frame / 18) * 8}px)`,
          }}
        >
          <Img
            src={left.image}
            style={{ width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center', transform: 'rotate(-5deg) scale(1.1)' }}
          />
        </div>
        <div style={{ marginTop: 18, color: 'white', fontSize: 28, fontWeight: 800, fontFamily: FONT }}>
          {left.short}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 70, right: 50, width: 260, textAlign: 'center' }}>
        <div
          style={{
            width: 220,
            height: 340,
            margin: '0 auto',
            borderRadius: 40,
            overflow: 'hidden',
            border: `2px solid ${right.color}`,
            boxShadow: `0 0 40px ${right.color}55`,
            transform: `translateY(${Math.cos(frame / 18) * 8}px)`,
          }}
        >
          <Img src={right.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ marginTop: 18, color: 'white', fontSize: 28, fontWeight: 800, fontFamily: FONT }}>
          {right.short}
        </div>
      </div>
    </>
  );
};

const WinnerBadge = ({ winner, progress }: { winner: string; progress: number }) => {
  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const badgeOpacity = interpolate(progress, [0, 1], [0, 1]);

  if (winner === 'neutral') {
    return (
      <div
        style={{
          padding: '8px 18px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          color: 'white',
          fontSize: 18,
          fontWeight: 700,
          fontFamily: FONT,
          opacity: badgeOpacity,
          transform: `scale(${scale})`,
        }}
      >
        EVEN
      </div>
    );
  }

  return (
    <div
      style={{
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
      }}
    >
      WINNER
    </div>
  );
};

const SpecRow = ({ spec, index }: { spec: Spec; index: number }) => {
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

  const lerpColor = (from: string, to: string, t: number) => {
    const parseRgba = (s: string) => {
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

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ color: '#A5B4FC', fontSize: 26, fontWeight: 800, fontFamily: FONT }}>{spec[0]}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 6, minHeight: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {(leftIsWinner || winner === 'neutral') && <WinnerBadge winner={winner} progress={winnerReveal} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {(rightIsWinner || winner === 'neutral') && <WinnerBadge winner={winner} progress={winnerReveal} />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: lerpColor(neutralBg, winBg, leftBg),
            border: `1px solid ${lerpColor(neutralBorder, winBorder, leftBg)}`,
            boxShadow: leftIsWinner ? `0 0 ${20 * winnerReveal}px rgba(34,197,94,${0.2 * winnerReveal})` : 'none',
          }}
        >
          <div style={{ color: lerpColor('rgba(255,255,255,1)', 'rgba(34,197,94,1)', leftBg), fontSize: 30, fontWeight: 800, fontFamily: FONT }}>
            {spec[1]}
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: lerpColor(neutralBg, winBg, rightBg),
            border: `1px solid ${lerpColor(neutralBorder, winBorder, rightBg)}`,
            boxShadow: rightIsWinner ? `0 0 ${20 * winnerReveal}px rgba(34,197,94,${0.2 * winnerReveal})` : 'none',
          }}
        >
          <div style={{ color: lerpColor('rgba(255,255,255,1)', 'rgba(34,197,94,1)', rightBg), fontSize: 30, fontWeight: 800, fontFamily: FONT }}>
            {spec[2]}
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonSlide = ({ section, left, right }: { section: Section; left: PhoneInfo; right: PhoneInfo }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <PhoneHeader left={left} right={right} />

      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 310,
          right: 310,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 160,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 40,
            fontWeight: 900,
            fontFamily: FONT,
            textAlign: 'center',
            lineHeight: 1.2,
            transform: `scale(${1 + Math.sin(frame / 18) * 0.02})`,
            textShadow: '0 0 20px rgba(96,165,250,0.3)',
          }}
        >
          {section.title}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 460, left: 40, right: 40, bottom: 220 }}>
        {section.specs.map((spec, i) => (
          <SpecRow key={i} spec={spec} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SECTION_TITLE_DURATION = 40;

const SectionTitleSlide = ({ title, emoji, index }: { title: string; emoji: string; index: number }) => {
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

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', opacity: numOpacity, transform: `translateY(${floatY}px)` }}>
        <div style={{ color: 'rgba(255,255,255,0.06)', fontSize: 400, fontWeight: 900, fontFamily: FONT, lineHeight: 1 }}>
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '38%',
          width: lineWidth,
          height: 3,
          background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent)',
          borderRadius: 2,
        }}
      />

      <div style={{ opacity: emojiOpacity, transform: `scale(${emojiScale}) translateY(${floatY - 10}px)`, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 100, lineHeight: 1.2 }}>{emoji}</div>
      </div>

      <div style={{ opacity: titleOpacity, transform: `scale(${titleScale}) translateY(${floatY}px)`, textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: 96, fontWeight: 900, fontFamily: FONT, textShadow: '0 0 40px rgba(96,165,250,0.3)' }}>
          {title}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '38%',
          width: lineWidth,
          height: 3,
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)',
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

const FinalSlide = ({ left, right, sections, verdict }: { left: PhoneInfo; right: PhoneInfo; sections: Section[]; verdict: PhoneComparisonProps['verdict'] }) => {
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

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 50 }}>
      <div
        style={{
          position: 'absolute',
          top: 120,
          width: '100%',
          textAlign: 'center',
          opacity: pop,
          transform: `translateY(${interpolate(pop, [0, 1], [-20, 0])}px)`,
        }}
      >
        <div style={{ color: '#60A5FA', fontSize: 30, letterSpacing: 6, fontWeight: 700, fontFamily: FONT }}>FINAL VERDICT</div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 200,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: imageOpacity,
          transform: `scale(${imageScale})`,
        }}
      >
        <div
          style={{
            width: 300,
            height: 460,
            borderRadius: 48,
            overflow: 'hidden',
            border: `4px solid ${winnerColor}`,
            boxShadow: `0 0 ${glowPulse}px rgba(34,197,94,0.5), 0 0 ${glowPulse * 2}px rgba(34,197,94,0.2)`,
          }}
        >
          <Img src={winnerPhone.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 700,
          width: '100%',
          textAlign: 'center',
          opacity: scoreReveal,
          transform: `translateY(${interpolate(scoreReveal, [0, 1], [30, 0])}px)`,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
        <div style={{ color: winnerColor, fontSize: 64, fontWeight: 900, fontFamily: FONT, textShadow: '0 0 30px rgba(34,197,94,0.4)', marginBottom: 16 }}>
          {winnerPhone.name}
        </div>
        <div style={{ color: winnerColor, fontSize: 36, fontWeight: 800, fontFamily: FONT, marginBottom: 40 }}>
          WINS {winnerWins} – {loserWins}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 980,
          left: 50,
          right: 50,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          opacity: scoreReveal,
          transform: `translateY(${interpolate(scoreReveal, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ padding: 24, borderRadius: 24, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div style={{ color: winnerColor, fontSize: 22, fontWeight: 800, fontFamily: FONT, marginBottom: 8 }}>{winnerPhone.short}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, fontFamily: FONT, lineHeight: 1.4 }}>
            {overallWinner === 'left' ? verdict.leftSummary : verdict.rightSummary}
          </div>
        </div>

        <div style={{ padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: loserPhone.color, fontSize: 22, fontWeight: 800, fontFamily: FONT, marginBottom: 8 }}>{loserPhone.short}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, fontFamily: FONT, lineHeight: 1.4 }}>
            {overallWinner === 'left' ? verdict.rightSummary : verdict.leftSummary}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 300,
          width: '100%',
          textAlign: 'center',
          opacity: ctaReveal,
          transform: `scale(${interpolate(ctaReveal, [0, 1], [0.8, 1])})`,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '20px 40px',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
            color: 'white',
            fontSize: 32,
            fontWeight: 800,
            fontFamily: FONT,
          }}
        >
          {verdict.cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const sectionDuration = (specCount: number) => {
  const base = 40;
  const perRow = 18;
  const winnerBuffer = 12;
  const viewingTime = 30;
  return base + (specCount - 1) * perRow + winnerBuffer + viewingTime;
};

const INTRO_DURATION = 90;
const SECTION_PAUSE = 9;

export const getPhoneComparisonDuration = (props: PhoneComparisonProps) => {
  let total = INTRO_DURATION;
  for (const section of props.sections) {
    total += SECTION_TITLE_DURATION;
    total += sectionDuration(section.specs.length) + SECTION_PAUSE;
  }
  total += props.finalSlideDuration;
  return total;
};

export default function PhoneComparisonVideo(props: PhoneComparisonProps) {
  const { left, right, sections, intro, verdict, finalSlideDuration } = props;

  const titleStarts: number[] = [];
  const compStarts: number[] = [];
  let cursor = INTRO_DURATION;
  for (const section of sections) {
    titleStarts.push(cursor);
    cursor += SECTION_TITLE_DURATION;
    compStarts.push(cursor);
    cursor += sectionDuration(section.specs.length) + SECTION_PAUSE;
  }

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <FontLoader />
      <Background />

      <Sequence from={0} durationInFrames={INTRO_DURATION}>
        <IntroSlide left={left} right={right} intro={intro} />
      </Sequence>

      {sections.map((section, i) => (
        <React.Fragment key={i}>
          <Sequence from={titleStarts[i]} durationInFrames={SECTION_TITLE_DURATION}>
            <SectionTitleSlide title={section.title} emoji={section.emoji} index={i} />
          </Sequence>
          <Sequence from={compStarts[i]} durationInFrames={sectionDuration(section.specs.length)}>
            <ComparisonSlide section={section} left={left} right={right} />
          </Sequence>
        </React.Fragment>
      ))}

      <Sequence from={cursor} durationInFrames={finalSlideDuration}>
        <FinalSlide left={left} right={right} sections={sections} verdict={verdict} />
      </Sequence>
    </AbsoluteFill>
  );
}
