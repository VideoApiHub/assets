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
import comparisonData from './phone-comparision-data.json';

/*
VIDEO SETTINGS
1080 x 1920 (9:16)
30 FPS
*/

type Winner = 'left' | 'right' | 'neutral';
type Spec = [string, string, string, Winner];
type Section = { title: string; specs: Spec[] };
type PhoneInfo = { name: string; short: string; color: string; image: string };

interface ComparisonConfig {
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

const config = comparisonData as unknown as ComparisonConfig;

const { left: leftPhone, right: rightPhone, sections } = config;

const winnerColor = '#22C55E';

// Tally wins from all sections
const countWins = () => {
  let leftWins = 0;
  let rightWins = 0;
  let ties = 0;
  for (const section of config.sections) {
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

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #020617 0%, #0F172A 45%, #020617 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.18)',
          filter: 'blur(140px)',
          top: -200,
          left: -150 + Math.sin(frame / 30) * 40,
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: 'rgba(168,85,247,0.18)',
          filter: 'blur(140px)',
          bottom: -200,
          right: -100 + Math.cos(frame / 35) * 30,
        }}
      />
    </AbsoluteFill>
  );
};

const IntroSlide = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Tagline drops in
  const taglinePop = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Left phone slides in from left
  const leftSlide = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Right phone slides in from right
  const rightSlide = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // VS badge explodes in
  const vsPop = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10, stiffness: 140 },
  });

  // Names reveal
  const namesReveal = spring({
    frame: frame - 35,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Subtitle fades in
  const subtitleReveal = spring({
    frame: frame - 50,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Pulsing glow on VS
  const vsGlow = 15 + Math.sin(frame / 8) * 10;

  const leftX = interpolate(leftSlide, [0, 1], [-400, 0]);
  const rightX = interpolate(rightSlide, [0, 1], [400, 0]);
  const vsScale = interpolate(vsPop, [0, 1], [0, 1]);
  const vsRotate = interpolate(vsPop, [0, 1], [180, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Tagline */}
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
        <div
          style={{
            color: '#60A5FA',
            fontSize: 38,
            letterSpacing: 10,
            fontWeight: 800,
            fontFamily: 'Inter',
          }}
        >
          {config.intro.tagline}
        </div>
      </div>

      {/* Phone images side by side */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          marginTop: -60,
        }}
      >
        {/* Left phone */}
        <div
          style={{
            transform: `translateX(${leftX}px) translateY(${Math.sin(frame / 16) * 10}px)`,
            opacity: leftSlide,
          }}
        >
          <div
            style={{
              width: 280,
              height: 440,
              borderRadius: 44,
              overflow: 'hidden',
              border: `3px solid ${leftPhone.color}`,
              boxShadow: `0 0 60px ${leftPhone.color}66, inset 0 0 30px rgba(0,0,0,0.3)`,
            }}
          >
            <Img
              src={leftPhone.image}
              style={{ width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center', transform: 'rotate(-5deg) scale(1.1)' }}
            />
          </div>
        </div>

        {/* VS Badge */}
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            transform: `scale(${vsScale}) rotate(${vsRotate}deg)`,
          }}
        >
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
            <div
              style={{
                color: 'white',
                fontSize: 56,
                fontWeight: 900,
                fontFamily: 'Inter',
                textShadow: '0 2px 10px rgba(0,0,0,0.4)',
              }}
            >
              VS
            </div>
          </div>
        </div>

        {/* Right phone */}
        <div
          style={{
            transform: `translateX(${rightX}px) translateY(${Math.cos(frame / 16) * 10}px)`,
            opacity: rightSlide,
          }}
        >
          <div
            style={{
              width: 280,
              height: 440,
              borderRadius: 44,
              overflow: 'hidden',
              border: `3px solid ${rightPhone.color}`,
              boxShadow: `0 0 60px ${rightPhone.color}66, inset 0 0 30px rgba(0,0,0,0.3)`,
            }}
          >
            <Img
              src={rightPhone.image}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* Phone names */}
      <div
        style={{
          position: 'absolute',
          bottom: 340,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 60,
          opacity: namesReveal,
          transform: `translateY(${interpolate(namesReveal, [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            color: leftPhone.color,
            fontSize: 46,
            fontWeight: 900,
            fontFamily: 'Inter',
            textShadow: `0 0 20px ${leftPhone.color}55`,
          }}
        >
          {leftPhone.name}
        </div>

        <div
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 40,
            fontWeight: 700,
            fontFamily: 'Inter',
          }}
        >
          vs
        </div>

        <div
          style={{
            color: rightPhone.color,
            fontSize: 46,
            fontWeight: 900,
            fontFamily: 'Inter',
            textShadow: `0 0 20px ${rightPhone.color}55`,
          }}
        >
          {rightPhone.name}
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          width: '100%',
          textAlign: 'center',
          opacity: subtitleReveal,
          transform: `translateY(${interpolate(subtitleReveal, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 36,
            fontWeight: 600,
            fontFamily: 'Inter',
            padding: '0 60px',
          }}
        >
          {config.intro.subtitle}
        </div>
      </div>

      {/* Swipe up hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          width: '100%',
          textAlign: 'center',
          opacity: interpolate(subtitleReveal, [0, 1], [0, 0.6]),
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 600,
            fontFamily: 'Inter',
            transform: `translateY(${Math.sin(frame / 10) * 6}px)`,
          }}
        >
          ▼ LET THE BATTLE BEGIN ▼
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PhoneHeader = () => {
  const frame = useCurrentFrame();

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 50,
          width: 260,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 220,
            height: 340,
            margin: '0 auto',
            borderRadius: 40,
            overflow: 'hidden',
            border: `2px solid ${leftPhone.color}`,
            boxShadow: `0 0 40px ${leftPhone.color}55`,
            transform: `translateY(${Math.sin(frame / 18) * 8}px)`,
          }}
        >
          <Img
            src={leftPhone.image}
            style={{
              width: '120%',
              height: '120%',
              objectFit: 'cover',
              objectPosition: 'center',
              transform: 'rotate(-5deg) scale(1.1)',
            }}
          />
        </div>

        <div
          style={{
            marginTop: 18,
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            fontFamily: 'Inter',
          }}
        >
          {leftPhone.short}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 70,
          right: 50,
          width: 260,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 220,
            height: 340,
            margin: '0 auto',
            borderRadius: 40,
            overflow: 'hidden',
            border: `2px solid ${rightPhone.color}`,
            boxShadow: `0 0 40px ${rightPhone.color}55`,
            transform: `translateY(${Math.cos(frame / 18) * 8}px)`,
          }}
        >
          <Img
            src={rightPhone.image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <div
          style={{
            marginTop: 18,
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            fontFamily: 'Inter',
          }}
        >
          {rightPhone.short}
        </div>
      </div>
    </>
  );
};

const WinnerBadge = ({winner, progress}: {winner: string; progress: number}) => {
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
          fontFamily: 'Inter',
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
        fontFamily: 'Inter',
        opacity: badgeOpacity,
        transform: `scale(${scale})`,
      }}
    >
      WINNER
    </div>
  );
};

const SpecRow = ({spec, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const rowDelay = index * 18;
  const winnerDelay = rowDelay + 12;

  const reveal = spring({
    frame: frame - rowDelay,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
    },
  });

  const winnerReveal = spring({
    frame: frame - winnerDelay,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const translateY = interpolate(reveal, [0, 1], [60, 0]);
  const opacity = interpolate(reveal, [0, 1], [0, 1]);

  const winner = spec[3];

  const leftIsWinner = winner === 'left';
  const rightIsWinner = winner === 'right';

  const leftBg = interpolate(
    leftIsWinner ? winnerReveal : 0,
    [0, 1],
    [0, 1],
  );
  const rightBg = interpolate(
    rightIsWinner ? winnerReveal : 0,
    [0, 1],
    [0, 1],
  );

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
        borderRadius: 28,
        padding: 24,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            fontFamily: 'Inter',
          }}
        >
          {spec[0]}
        </div>

        <WinnerBadge winner={winner} progress={winnerReveal} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div
          style={{
            padding: 18,
            borderRadius: 22,
            background: lerpColor(neutralBg, winBg, leftBg),
            border: `1px solid ${lerpColor(neutralBorder, winBorder, leftBg)}`,
            boxShadow: leftIsWinner
              ? `0 0 ${20 * winnerReveal}px rgba(34,197,94,${0.2 * winnerReveal})`
              : 'none',
          }}
        >
          <div
            style={{
              color: leftPhone.color,
              fontSize: 18,
              marginBottom: 8,
              fontWeight: 700,
              fontFamily: 'Inter',
            }}
          >
            {leftPhone.short}
          </div>

          <div
            style={{
              color: lerpColor(
                'rgba(255,255,255,1)',
                'rgba(34,197,94,1)',
                leftBg,
              ),
              fontSize: 28,
              fontWeight: 800,
              fontFamily: 'Inter',
            }}
          >
            {spec[1]}
          </div>
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 22,
            background: lerpColor(neutralBg, winBg, rightBg),
            border: `1px solid ${lerpColor(neutralBorder, winBorder, rightBg)}`,
            boxShadow: rightIsWinner
              ? `0 0 ${20 * winnerReveal}px rgba(34,197,94,${0.2 * winnerReveal})`
              : 'none',
          }}
        >
          <div
            style={{
              color: rightPhone.color,
              fontSize: 18,
              marginBottom: 8,
              fontWeight: 700,
              fontFamily: 'Inter',
            }}
          >
            {rightPhone.short}
          </div>

          <div
            style={{
              color: lerpColor(
                'rgba(255,255,255,1)',
                'rgba(34,197,94,1)',
                rightBg,
              ),
              fontSize: 28,
              fontWeight: 800,
              fontFamily: 'Inter',
            }}
          >
            {spec[2]}
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonSlide = ({section}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <PhoneHeader />

      <div
        style={{
          position: 'absolute',
          top: 480,
          left: 40,
          right: 40,
          bottom: 70,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: 54,
              fontWeight: 900,
              fontFamily: 'Inter',
              transform: `scale(${1 + Math.sin(frame / 18) * 0.02})`,
            }}
          >
            {section.title}
          </div>
        </div>

        {section.specs.map((spec, i) => (
          <SpecRow key={i} spec={spec} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FinalSlide = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
      }}
    >
      <div
        style={{
          width: '100%',
          borderRadius: 40,
          padding: 50,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          transform: `scale(${pop})`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#60A5FA',
            fontSize: 26,
            letterSpacing: 4,
            marginBottom: 20,
            fontWeight: 700,
            fontFamily: 'Inter',
          }}
        >
          FINAL VERDICT
        </div>

        <div
          style={{
            color: 'white',
            fontSize: 74,
            lineHeight: 1.1,
            fontWeight: 900,
            marginBottom: 28,
            fontFamily: 'Inter',
          }}
        >
          iPhone vs Galaxy
        </div>

        <div
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 30,
            lineHeight: 1.5,
            marginBottom: 40,
            fontFamily: 'Inter',
          }}
        >
          iPhone wins in ecosystem, optimization, and cinematic video. Galaxy
          dominates charging, zoom, AI, and gaming versatility.
        </div>

        <div
          style={{
            display: 'inline-flex',
            padding: '18px 34px',
            borderRadius: 999,
            background:
              'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            fontFamily: 'Inter',
          }}
        >
          COMMENT YOUR WINNER 👇
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default function VerticalPhoneComparison() {
  const introDuration = 90;
  const {framesPerSection, finalSlideDuration} = config;

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Inter',
      }}
    >
      <Background />

      <Sequence from={0} durationInFrames={introDuration}>
        <IntroSlide />
      </Sequence>

      {sections.map((section, i) => (
        <Sequence
          key={i}
          from={introDuration + i * framesPerSection}
          durationInFrames={framesPerSection}
        >
          <ComparisonSlide section={section} />
        </Sequence>
      ))}

      <Sequence
        from={introDuration + sections.length * framesPerSection}
        durationInFrames={finalSlideDuration}
      >
        <FinalSlide />
      </Sequence>
    </AbsoluteFill>
  );
}