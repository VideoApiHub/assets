import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  Easing,
} from 'remotion';
import { fontFamily as poppins, loadFont } from '@remotion/google-fonts/Poppins';

loadFont('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

const FONT = `"${poppins}", "Poppins", "Segoe UI", system-ui, sans-serif`;

/* ============================================================================
 * SaaS Demo — a reusable, single-page product demo template for Remotion.
 *
 * To reuse for another product, just pass a different `SaasDemoProps` object
 * (see `pillarDemoDefaults` at the bottom for a complete example):
 *   - brand colors (primary / primaryDark / bg / text)
 *   - logo image (light version, shown on the dark intro + outro)
 *   - headline / subheadline / eyebrow copy
 *   - an array of product `screens` (screenshot + caption + device type)
 *   - a feature list and a closing CTA
 * Images can be a remote URL, a data URI, or a path inside /public.
 * ==========================================================================*/

export type DeviceType = 'desktop' | 'phone';

export type DemoScreen = {
  /** URL / data-uri / public path of the screenshot */
  image: string;
  device: DeviceType;
  /** width / height ratio of the screenshot — used to show it fully, never cropped */
  aspect: number;
  /** small uppercase label shown above the title */
  eyebrow: string;
  title: string;
  subtitle: string;
  /** small pill captions floating beside the device */
  chips?: string[];
  /** optional glowing callout that points to a region of the screenshot.
   *  x / y are 0–1 fractions of the screenshot (0,0 = top-left). */
  hotspot?: {
    x: number;
    y: number;
    label: string;
  };
  /** optional animated count-up stats shown beside the device */
  stats?: {
    /** numeric target the counter ticks up to */
    value: number;
    label: string;
    /** text shown before the number, e.g. "$" */
    prefix?: string;
    /** text shown after the number, e.g. "%" or "k" */
    suffix?: string;
    /** decimal places (default 0) */
    decimals?: number;
  }[];
};

export type SaasDemoProps = {
  brandName: string;
  /** light/white logo, displayed on the dark intro & outro cards */
  logo: string;
  primary: string;
  primaryDark: string;
  bg: string;
  text: string;
  /** intro */
  eyebrow: string;
  headline: string;
  subheadline: string;
  /** product showcase scenes */
  screens: DemoScreen[];
  /** outro */
  features: string[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  url: string;

  /* ---- branding / motion options (all optional, sensible defaults) -------- */
  /** secondary accent colour used across gradients, beams, shapes & promo */
  accent?: string;
  /** brand wordmark revealed next to the logo in the animated intro lockup */
  brandWordmark?: string;
  /** set true when the logo image already contains the brand name, so the
   *  separate animated wordmark text is suppressed in the intro lockup */
  logoHasWordmark?: boolean;
  /** intro logo width in px — tweak per-brand for wide / tall logos */
  logoWidth?: number;

  /** product showcase reveal: frame at which the screenshot finishes gliding
   *  into its slot and the text starts animating (default 38) */
  screenRevealHold?: number;
  /** how long (frames) the screenshot sits BIG & centred before it starts
   *  gliding into its slot (default 28) */
  screenCenterHold?: number;
  /** how large the screenshot is during its centre-stage "hero" moment
   *  before it settles (default 1.32 = 132%) */
  screenHeroScale?: number;

  /** persistent watermark shown top-right on every frame */
  watermark?: {
    enabled?: boolean;
    /** text label (usually your product URL) */
    label?: string;
    /** optional small logo mark shown before the label */
    mark?: string;
  };

  /** closing promo card ("made in under a minute with …") */
  promo?: {
    enabled?: boolean;
    badge?: string;
    title?: string;
    /** word inside `title` painted in the accent colour */
    highlight?: string;
    brand?: string;
    cta?: string;
    url?: string;
  };
};

const FPS = 30;

/* ---------- timeline -------------------------------------------------------*/
const INTRO = 150;
const SCREEN = 168;
const GRID = 96;
const OUTRO = 112;
const PROMO = 120;
const OVERLAP = 18;

const buildTimeline = (screenCount: number, withPromo: boolean) => {
  const durations = [
    INTRO,
    ...Array(screenCount).fill(SCREEN),
    GRID,
    OUTRO,
    ...(withPromo ? [PROMO] : []),
  ];
  const starts: number[] = [];
  let cursor = 0;
  durations.forEach((d, i) => {
    starts.push(cursor);
    cursor += d - (i < durations.length - 1 ? OVERLAP : 0);
  });
  const total = cursor;
  return { durations, starts, total };
};

const promoEnabled = (props: SaasDemoProps) => props.promo?.enabled !== false;

export const getSaasDemoDuration = (props: SaasDemoProps): number =>
  buildTimeline(props.screens.length, promoEnabled(props)).total;

/* ---------- helpers --------------------------------------------------------*/
const resolveSrc = (src: string) =>
  /^(https?:|data:|blob:)/.test(src) ? src : staticFile(src);

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/* ---------- numeric count-up helper ---------------------------------------*/
const useCountUp = (
  target: number,
  startFrame: number,
  durationFrames = 40,
  decimals = 0,
) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const value = target * t;
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/* ---------- screenshot region spotlight (hotspot callout) -----------------*/
const Hotspot: React.FC<{
  x: number;
  y: number;
  label: string;
  primary: string;
  accent: string;
  delay: number;
}> = ({ x, y, label, primary, accent, delay }) => {
  const frame = useCurrentFrame();
  const appear = spring({ frame: frame - delay, fps: FPS, config: { damping: 16, mass: 0.8 } });
  const ringPulse = ((frame - delay) % 50) / 50; // 0..1 looping
  const ringScale = 1 + ringPulse * 1.4;
  const ringFade = (1 - ringPulse) * 0.5 * appear;
  const onRight = x < 0.5; // place the label on whichever side has room
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity: appear,
      }}
    >
      {/* expanding pulse ring */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 46,
          height: 46,
          marginLeft: -23,
          marginTop: -23,
          borderRadius: '50%',
          border: `2px solid ${accent}`,
          transform: `scale(${ringScale})`,
          opacity: ringFade,
        }}
      />
      {/* solid centre dot */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: accent,
          border: '3px solid #fff',
          boxShadow: `0 0 18px ${rgba(accent, 0.9)}`,
          transform: `scale(${0.6 + appear * 0.4})`,
        }}
      />
      {/* connector + label pill */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          [onRight ? 'left' : 'right']: 26,
          transform: `translateY(-50%) translateX(${(1 - appear) * (onRight ? -14 : 14)}px)`,
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            padding: '8px 15px',
            borderRadius: 999,
            background: rgba('#0b0e17', 0.9),
            border: `1px solid ${rgba(accent, 0.6)}`,
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
            backdropFilter: 'blur(6px)',
            boxShadow: `0 10px 30px -10px ${rgba(primary, 0.6)}`,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

/* ---------- animated stat count-up card -----------------------------------*/
const StatCard: React.FC<{
  stat: NonNullable<DemoScreen['stats']>[number];
  primary: string;
  accent: string;
  delay: number;
}> = ({ stat, primary, accent, delay }) => {
  const frame = useCurrentFrame();
  const appear = spring({ frame: frame - delay, fps: FPS, config: { damping: 18, mass: 0.9 } });
  const num = useCountUp(stat.value, delay + 4, 44, stat.decimals ?? 0);
  return (
    <div
      style={{
        padding: '16px 22px',
        borderRadius: 16,
        background: rgba('#ffffff', 0.06),
        border: `1px solid ${rgba('#ffffff', 0.12)}`,
        backdropFilter: 'blur(8px)',
        textAlign: 'left',
        transform: `translateY(${(1 - appear) * 24}px) scale(${0.9 + appear * 0.1})`,
        opacity: appear,
        boxShadow: `0 20px 50px -24px ${rgba(accent, 0.6)}`,
      }}
    >
      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: -1,
          lineHeight: 1,
          background: `linear-gradient(90deg, #fff, ${accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {stat.prefix ?? ''}{num}{stat.suffix ?? ''}
      </div>
      <div style={{ marginTop: 6, fontSize: 16, fontWeight: 500, color: rgba('#ffffff', 0.65) }}>
        {stat.label}
      </div>
    </div>
  );
};

/* ---------- persistent corner watermark -----------------------------------*/
const Watermark: React.FC<{ label: string; mark?: string; primary: string }> = ({
  label,
  mark,
  primary,
}) => {
  const frame = useCurrentFrame();
  const intro = spring({ frame: frame - 8, fps: FPS, config: { damping: 16, mass: 0.7 } });
  const pulse = 0.85 + Math.sin(frame / 18) * 0.15;
  return (
    <div
      style={{
        position: 'absolute',
        top: 30,
        right: 38,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 15px 8px 11px',
        borderRadius: 999,
        background: rgba('#000000', 0.32),
        border: `1px solid ${rgba('#ffffff', 0.16)}`,
        backdropFilter: 'blur(8px)',
        fontFamily: FONT,
        transform: `translateY(${(1 - intro) * -24}px)`,
        opacity: intro * 0.92,
        pointerEvents: 'none',
      }}
    >
      {mark ? (
        <Img src={resolveSrc(mark)} style={{ height: 20, display: 'block' }} />
      ) : (
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: primary,
            boxShadow: `0 0 ${10 * pulse}px ${rgba(primary, 0.9)}`,
          }}
        />
      )}
      <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: 0.3, color: '#fff' }}>
        {label}
      </span>
    </div>
  );
};

/* ---------- animated logo + wordmark lockup --------------------------------*/
const LogoLockup: React.FC<{
  logo: string;
  wordmark?: string;
  primary: string;
  accent: string;
  logoWidth: number;
}> = ({ logo, wordmark, primary, accent, logoWidth }) => {
  const frame = useCurrentFrame();
  // phase 1: logo punches in big & settles (slowed for a smoother feel)
  const punch = spring({ frame, fps: FPS, config: { damping: 16, mass: 1.2, stiffness: 80 } });
  const zoom = interpolate(frame, [0, 46], [2.1, 1], { extrapolateRight: 'clamp', easing: ease });
  const spin = interpolate(frame, [0, 46], [-12, 0], { extrapolateRight: 'clamp', easing: ease });
  // phase 2: wordmark wipes in to the right (which re-centres the lockup)
  const reveal = spring({ frame: frame - 48, fps: FPS, config: { damping: 22, mass: 1 } });
  const ringScale = interpolate(frame, [0, 42], [0.3, 1.25], { extrapolateRight: 'clamp', easing: ease });
  const ringFade = interpolate(frame, [0, 22, 48], [0, 0.5, 0], { extrapolateRight: 'clamp' });
  const ringSize = logoWidth * 1.1;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}
    >
      {/* energy ring burst behind the logo */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          borderRadius: '50%',
          border: `3px solid ${rgba(accent, 0.7)}`,
          transform: `scale(${ringScale})`,
          opacity: ringFade,
        }}
      />
      <Img
        src={resolveSrc(logo)}
        style={{
          width: logoWidth,
          display: 'block',
          filter: `drop-shadow(0 20px 60px ${rgba(primary, 0.4)})`,
          transform: `scale(${zoom * (0.6 + punch * 0.4)}) rotate(${spin}deg)`,
          opacity: punch,
        }}
      />
      {wordmark && (
        <div
          style={{
            overflow: 'hidden',
            maxWidth: reveal * 900,
            marginLeft: reveal * 22,
            opacity: reveal,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontSize: logoWidth * 0.42,
              fontWeight: 800,
              letterSpacing: -1,
              transform: `translateX(${(1 - reveal) * -40}px)`,
              display: 'inline-block',
              background: `linear-gradient(90deg,#fff 55%, ${accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {wordmark}
          </span>
        </div>
      )}
    </div>
  );
};

/* ---------- animated background -------------------------------------------*/
const GlowBackground: React.FC<{ primary: string; bg: string }> = ({ primary, bg }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const x1 = 28 + Math.sin(t * 0.6) * 10;
  const y1 = 26 + Math.cos(t * 0.5) * 8;
  const x2 = 74 + Math.cos(t * 0.4) * 9;
  const y2 = 70 + Math.sin(t * 0.45) * 9;
  const [r, g, b] = hexToRgb(bg);
  const darker = `rgb(${Math.max(0, r - 6)},${Math.max(0, g - 6)},${Math.max(0, b - 8)})`;
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 55% at ${x1}% ${y1}%, ${rgba(primary, 0.32)} 0%, transparent 60%),
                       radial-gradient(50% 55% at ${x2}% ${y2}%, ${rgba(primary, 0.16)} 0%, transparent 62%),
                       linear-gradient(160deg, ${bg} 0%, ${darker} 100%)`,
        }}
      />
      {/* subtle dotted grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${rgba('#ffffff', 0.05)} 1px, transparent 1px)`,
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(70% 70% at 50% 45%, #000 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(70% 70% at 50% 45%, #000 0%, transparent 100%)',
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- motion graphics: drifting orbs, shapes & beams -----------------*/
const SHAPES = [
  { x: 12, y: 22, s: 150, type: 'ring', sp: 0.5, drift: 30 },
  { x: 84, y: 30, s: 90, type: 'tri', sp: 0.7, drift: 26 },
  { x: 22, y: 78, s: 70, type: 'square', sp: 0.6, drift: 34 },
  { x: 90, y: 74, s: 120, type: 'ring', sp: 0.45, drift: 28 },
  { x: 50, y: 16, s: 54, type: 'square', sp: 0.8, drift: 22 },
  { x: 68, y: 86, s: 64, type: 'tri', sp: 0.55, drift: 30 },
  { x: 6, y: 52, s: 80, type: 'ring', sp: 0.65, drift: 24 },
];

const MotionGraphics: React.FC<{ primary: string }> = ({ primary }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      {/* sweeping diagonal light beams */}
      {[0, 1, 2].map((i) => {
        const x = ((t * (14 + i * 6) + i * 700) % 2600) - 600;
        return (
          <div
            key={`beam-${i}`}
            style={{
              position: 'absolute',
              top: -200,
              left: x,
              width: 3,
              height: 1600,
              background: `linear-gradient(${rgba(primary, 0)}, ${rgba(primary, 0.18)}, ${rgba(primary, 0)})`,
              transform: 'rotate(18deg)',
              filter: 'blur(1px)',
            }}
          />
        );
      })}

      {/* drifting geometric shapes */}
      {SHAPES.map((sh, i) => {
        const dx = Math.sin(t * sh.sp + i) * sh.drift;
        const dy = Math.cos(t * sh.sp * 0.8 + i) * sh.drift;
        const rot = (t * sh.sp * 18 + i * 40) % 360;
        const opacity = 0.16 + Math.sin(t * 0.6 + i) * 0.06;
        const common: React.CSSProperties = {
          position: 'absolute',
          left: `${sh.x}%`,
          top: `${sh.y}%`,
          width: sh.s,
          height: sh.s,
          transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
          opacity,
        };
        if (sh.type === 'ring') {
          return (
            <div
              key={i}
              style={{ ...common, borderRadius: '50%', border: `2px solid ${rgba(primary, 0.5)}` }}
            />
          );
        }
        if (sh.type === 'square') {
          return (
            <div
              key={i}
              style={{
                ...common,
                borderRadius: 10,
                border: `2px solid ${rgba('#ffffff', 0.22)}`,
              }}
            />
          );
        }
        // triangle
        return (
          <div
            key={i}
            style={{
              ...common,
              width: 0,
              height: 0,
              borderLeft: `${sh.s / 2}px solid transparent`,
              borderRight: `${sh.s / 2}px solid transparent`,
              borderBottom: `${sh.s}px solid ${rgba(primary, 0.16)}`,
            }}
          />
        );
      })}

      {/* floating particles */}
      {Array.from({ length: 26 }).map((_, i) => {
        const seed = i * 1.618;
        const baseX = (i / 26) * 100;
        const x = (baseX + Math.sin(t * 0.4 + seed) * 4) % 100;
        const y = (100 - ((t * (4 + (i % 5)) + seed * 90) % 120)) ;
        const size = 2 + (i % 3);
        const op = 0.15 + (i % 4) * 0.05;
        return (
          <div
            key={`p-${i}`}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 3 === 0 ? primary : '#ffffff',
              opacity: op,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- scene wrapper with crossfade -----------------------------------*/
const Scene: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, OVERLAP, duration - OVERLAP, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/* ---------- pill ----------------------------------------------------------*/
const Pill: React.FC<{
  children: React.ReactNode;
  primary: string;
  delay?: number;
  filled?: boolean;
}> = ({ children, primary, delay = 0, filled }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - delay, fps: FPS, config: { damping: 18, mass: 0.9 } });
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 999,
        fontSize: 20,
        fontWeight: 600,
        letterSpacing: 0.2,
        color: filled ? '#0b0e17' : '#fff',
        background: filled ? primary : rgba('#ffffff', 0.07),
        border: `1px solid ${filled ? primary : rgba('#ffffff', 0.14)}`,
        backdropFilter: 'blur(6px)',
        transform: `translateY(${(1 - p) * 16}px) scale(${0.9 + p * 0.1})`,
        opacity: p,
        whiteSpace: 'nowrap',
      }}
    >
      {!filled && (
        <span style={{ width: 8, height: 8, borderRadius: 999, background: primary }} />
      )}
      {children}
    </span>
  );
};

/* ---------- word-by-word headline -----------------------------------------*/
const KineticHeadline: React.FC<{
  text: string;
  size: number;
  primary: string;
  delay?: number;
  highlight?: string;
  center?: boolean;
}> = ({ text, size, primary, delay = 0, highlight, center }) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  return (
    <h1
      style={{
        margin: 0,
        fontSize: size,
        lineHeight: 1.04,
        fontWeight: 800,
        letterSpacing: -1,
        color: '#fff',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: center ? 'center' : 'flex-start',
        gap: `0 ${size * 0.26}px`,
      }}
    >
      {words.map((w, i) => {
        const p = spring({
          frame: frame - delay - i * 6,
          fps: FPS,
          config: { damping: 20, mass: 1 },
        });
        const isHi = highlight && w.toLowerCase().replace(/[^a-z]/g, '').includes(highlight.toLowerCase());
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - p) * size * 0.6}px)`,
              opacity: p,
              color: isHi ? primary : '#fff',
            }}
          >
            {w}
          </span>
        );
      })}
    </h1>
  );
};

/* ---------- device frame (browser / phone) --------------------------------*/
const DeviceFrame: React.FC<{
  screen: DemoScreen;
  primary: string;
  accent: string;
  url: string;
  hotspotDelay: number;
}> = ({ screen, primary, accent, url, hotspotDelay }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 20, mass: 1 } });
  // gentle, full-frame "breathing" zoom that never crops the screenshot
  const zoom = interpolate(frame, [0, 90], [1, 1.035], {
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const float = Math.sin(frame / 26) * 5;

  if (screen.device === 'phone') {
    // size the phone screen to the screenshot aspect so the whole shot is visible
    const screenW = 384;
    const screenH = Math.round(screenW / screen.aspect);
    const pad = 14;
    return (
      <div
        style={{
          width: screenW + pad * 2,
          height: screenH + pad * 2,
          borderRadius: 46,
          padding: pad,
          background: 'linear-gradient(160deg,#1c2233,#0c0f18)',
          border: `1px solid ${rgba('#ffffff', 0.12)}`,
          boxShadow: `0 50px 120px -30px ${rgba('#000000', 0.7)}, 0 0 0 1px ${rgba(primary, 0.18)}`,
          transform: `translateY(${(1 - enter) * 80 + float}px) scale(${(0.92 + enter * 0.08) * zoom}) rotateY(${(1 - enter) * -10}deg)`,
          opacity: enter,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 34,
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          <Img
            src={resolveSrc(screen.image)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {screen.hotspot && (
            <Hotspot
              {...screen.hotspot}
              primary={primary}
              accent={accent}
              delay={hotspotDelay}
            />
          )}
        </div>
      </div>
    );
  }

  // desktop browser window — sized to the screenshot aspect (full image, no crop)
  const header = 46;
  const maxW = 980;
  const maxContentH = 720;
  let contentW = maxW;
  let contentH = contentW / screen.aspect;
  if (contentH > maxContentH) {
    contentH = maxContentH;
    contentW = contentH * screen.aspect;
  }
  return (
    <div
      style={{
        width: contentW,
        borderRadius: 18,
        overflow: 'hidden',
        background: '#0d1119',
        border: `1px solid ${rgba('#ffffff', 0.12)}`,
        boxShadow: `0 60px 140px -40px ${rgba('#000000', 0.75)}, 0 0 0 1px ${rgba(primary, 0.15)}`,
        transform: `perspective(1800px) translateY(${(1 - enter) * 70 + float}px) scale(${(0.95 + enter * 0.05) * zoom}) rotateX(${(1 - enter) * 8}deg)`,
        opacity: enter,
      }}
    >
      <div
        style={{
          height: header,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 18px',
          background: 'linear-gradient(180deg,#161b27,#0f131c)',
          borderBottom: `1px solid ${rgba('#ffffff', 0.08)}`,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: 999, background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            maxWidth: 360,
            margin: '0 auto',
            height: 26,
            borderRadius: 999,
            background: rgba('#ffffff', 0.06),
            border: `1px solid ${rgba('#ffffff', 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: rgba('#ffffff', 0.55),
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {url}
        </div>
        <div style={{ width: 54 }} />
      </div>
      <div style={{ height: contentH, overflow: 'hidden', background: '#fff', position: 'relative' }}>
        <Img
          src={resolveSrc(screen.image)}
          style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
        />
        {screen.hotspot && (
          <Hotspot
            {...screen.hotspot}
            primary={primary}
            accent={accent}
            delay={hotspotDelay}
          />
        )}
      </div>
    </div>
  );
};

/* ---------- intro ---------------------------------------------------------*/
const IntroScene: React.FC<{ p: SaasDemoProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const accent = p.accent ?? p.primary;
  const lineW = interpolate(frame, [60, 92], [0, 220], { extrapolateRight: 'clamp', easing: ease });
  const eyebrowP = spring({ frame: frame - 66, fps: FPS, config: { damping: 20, mass: 1 } });
  const subP = spring({ frame: frame - 92, fps: FPS, config: { damping: 20, mass: 1 } });
  const logoWidth = p.logoWidth ?? (p.brandWordmark && !p.logoHasWordmark ? 300 : 480);
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: FONT,
        textAlign: 'center',
        padding: 80,
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <LogoLockup
          logo={p.logo}
          wordmark={p.logoHasWordmark ? undefined : p.brandWordmark}
          primary={p.primary}
          accent={accent}
          logoWidth={logoWidth}
        />
      </div>
      <div style={{ height: 4, width: lineW, borderRadius: 999, background: accent, marginBottom: 30 }} />
      <div style={{ marginBottom: 26, opacity: eyebrowP }}>
        <Pill primary={p.primary} delay={66}>{p.eyebrow}</Pill>
      </div>
      <div style={{ maxWidth: 1200 }}>
        <KineticHeadline text={p.headline} size={70} primary={accent} delay={74} center />
      </div>
      <p
        style={{
          marginTop: 30,
          maxWidth: 820,
          fontSize: 26,
          lineHeight: 1.5,
          fontWeight: 400,
          color: rgba('#ffffff', 0.7),
          transform: `translateY(${(1 - subP) * 20}px)`,
          opacity: subP,
        }}
      >
        {p.subheadline}
      </p>
    </AbsoluteFill>
  );
};

/* ---------- product showcase ----------------------------------------------*/
/* frame at which the device has finished gliding into its slot and the text
 * begins to animate in. Tune via `screenRevealHold` on the props.            */
const ShowcaseScene: React.FC<{ p: SaasDemoProps; screen: DemoScreen; index: number }> = ({
  p,
  screen,
  index,
}) => {
  const frame = useCurrentFrame();
  const textLeft = index % 2 === 0;

  // ---- cinematic device reveal ---------------------------------------------
  // phase 1: screenshot lands BIG & centred, then HOLDS for a beat
  // phase 2: it glides + scales down into its column slot
  const centerHold = p.screenCenterHold ?? 28;
  const hold = p.screenRevealHold ?? (centerHold + 34);
  // entrance pop while it's centre-stage
  const enter = spring({ frame, fps: FPS, config: { damping: 18, mass: 1 } });
  // the glide into the slot only begins AFTER the centre hold
  const place = spring({
    frame: frame - centerHold,
    fps: FPS,
    config: { damping: 26, mass: 1.4, stiffness: 55 },
  });
  // extra zoom while it's centre-stage, easing down to 1 as it settles
  const heroScale = interpolate(place, [0, 1], [p.screenHeroScale ?? 1.32, 1]) * (0.85 + enter * 0.15);
  // slide from screen-centre toward the device column
  const centerShift = (1 - place) * (textLeft ? -360 : 360);
  const heroLift = (1 - place) * -8;
  const heroGlow = (1 - place) * 0.5;

  // ---- text waits for the device to land -----------------------------------
  const colP = spring({ frame: frame - hold, fps: FPS, config: { damping: 22, mass: 1 } });
  const headP = spring({ frame: frame - hold - 6, fps: FPS, config: { damping: 20 } });
  const subP = spring({ frame: frame - hold - 14, fps: FPS, config: { damping: 20 } });
  const colSlide = (1 - colP) * (textLeft ? -40 : 40);

  const TextCol = (
    <div
      style={{
        flex: '0 0 38%',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        transform: `translateX(${colSlide}px)`,
        opacity: colP,
      }}
    >
      <Pill primary={p.primary} filled delay={hold + 2}>{screen.eyebrow}</Pill>
      <h2
        style={{
          margin: 0,
          fontSize: 56,
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: -1,
          color: '#fff',
          transform: `translateY(${(1 - headP) * 28}px)`,
          opacity: headP,
        }}
      >
        {screen.title}
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: 25,
          lineHeight: 1.5,
          fontWeight: 400,
          color: rgba('#ffffff', 0.68),
          transform: `translateY(${(1 - subP) * 22}px)`,
          opacity: subP,
        }}
      >
        {screen.subtitle}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
        {(screen.chips ?? []).map((c, i) => (
          <Pill key={c} primary={p.primary} delay={hold + 18 + i * 5}>{c}</Pill>
        ))}
      </div>
      {screen.stats && screen.stats.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
          {screen.stats.map((s, i) => (
            <StatCard
              key={s.label}
              stat={s}
              primary={p.primary}
              accent={p.accent ?? p.primary}
              delay={hold + 26 + i * 8}
            />
          ))}
        </div>
      )}
    </div>
  );

  const DeviceCol = (
    <div
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
      }}
    >
      <div
        style={{
          transform: `translateX(${centerShift}px) translateY(${heroLift}px) scale(${heroScale})`,
          filter: heroGlow > 0.01
            ? `drop-shadow(0 40px 120px ${rgba(p.accent ?? p.primary, heroGlow)})`
            : 'none',
          willChange: 'transform',
        }}
      >
        <DeviceFrame
          screen={screen}
          primary={p.primary}
          accent={p.accent ?? p.primary}
          url={p.url}
          hotspotDelay={hold + 10}
        />
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 70,
        padding: '0 110px',
      }}
    >
      {textLeft ? (
        <>
          {TextCol}
          {DeviceCol}
        </>
      ) : (
        <>
          {DeviceCol}
          {TextCol}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- feature grid --------------------------------------------------*/
const FeatureGridScene: React.FC<{ p: SaasDemoProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const headP = spring({ frame, fps: FPS, config: { damping: 18 } });
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: 90,
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <Pill primary={p.primary} filled>One platform, every workflow</Pill>
      </div>
      <h2
        style={{
          margin: '0 0 48px',
          fontSize: 60,
          fontWeight: 800,
          letterSpacing: -1,
          color: '#fff',
          transform: `translateY(${(1 - headP) * 24}px)`,
          opacity: headP,
          maxWidth: 1200,
        }}
      >
        Everything you need to run the business
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          maxWidth: 1500,
        }}
      >
        {p.features.map((f, i) => {
          const n = p.features.length;
          const fp = spring({ frame: frame - 10 - i * 5, fps: FPS, config: { damping: 15, mass: 0.8 } });
          const angle = (i / n) * Math.PI * 2;
          const ox = Math.cos(angle) * 70 * (1 - fp);
          const oy = Math.sin(angle) * 50 * (1 - fp);
          const scale = interpolate(fp, [0, 1], [1.5, 1]);
          const rot = (1 - fp) * (i % 2 ? 7 : -7);
          const accent = p.accent ?? p.primary;
          return (
            <div
              key={f}
              style={{
                padding: '26px 22px',
                borderRadius: 18,
                background: rgba('#ffffff', 0.05),
                border: `1px solid ${rgba('#ffffff', 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontSize: 23,
                fontWeight: 600,
                color: '#fff',
                textAlign: 'left',
                transform: `translate(${ox}px, ${oy}px) scale(${scale}) rotate(${rot}deg)`,
                opacity: Math.min(1, fp * 1.4),
                boxShadow: `0 24px 60px -30px ${rgba(accent, 0.6 * fp)}`,
              }}
            >
              <span
                style={{
                  flex: '0 0 auto',
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: p.primary,
                  boxShadow: `0 0 16px ${rgba(p.primary, 0.8)}`,
                  transform: `scale(${0.4 + fp * 0.6})`,
                }}
              />
              {f}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- outro ---------------------------------------------------------*/
const OutroScene: React.FC<{ p: SaasDemoProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const logoP = spring({ frame, fps: FPS, config: { damping: 13, mass: 0.9 } });
  const shine = interpolate(frame, [10, 44], [-60, 160], { extrapolateRight: 'clamp', easing: ease });
  const ctaP = spring({ frame: frame - 24, fps: FPS, config: { damping: 18 } });
  const btnP = spring({ frame: frame - 34, fps: FPS, config: { damping: 14 } });
  const urlP = spring({ frame: frame - 44, fps: FPS, config: { damping: 18 } });
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: 80,
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 44 }}>
        <Img
          src={resolveSrc(p.logo)}
          style={{
            width: 560,
            filter: `drop-shadow(0 24px 70px ${rgba(p.primary, 0.4)})`,
            transform: `scale(${0.8 + logoP * 0.2})`,
            opacity: logoP,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${shine}%`,
            width: '30%',
            height: '100%',
            background: `linear-gradient(100deg, transparent, ${rgba('#ffffff', 0.45)}, transparent)`,
            transform: 'skewX(-18deg)',
            mixBlendMode: 'overlay',
          }}
        />
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: 70,
          fontWeight: 800,
          letterSpacing: -1.5,
          color: '#fff',
          transform: `translateY(${(1 - ctaP) * 26}px)`,
          opacity: ctaP,
        }}
      >
        {p.ctaTitle}
      </h2>
      <p
        style={{
          margin: '16px 0 36px',
          fontSize: 27,
          fontWeight: 400,
          color: rgba('#ffffff', 0.7),
          transform: `translateY(${(1 - ctaP) * 20}px)`,
          opacity: ctaP,
        }}
      >
        {p.ctaSubtitle}
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          transform: `translateY(${(1 - btnP) * 24}px) scale(${0.9 + btnP * 0.1})`,
          opacity: btnP,
        }}
      >
        <div
          style={{
            padding: '20px 44px',
            borderRadius: 999,
            background: p.primary,
            color: '#0b0e17',
            fontSize: 26,
            fontWeight: 700,
            boxShadow: `0 18px 50px -12px ${rgba(p.primary, 0.7)}`,
          }}
        >
          {p.ctaButton}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: '#fff',
            opacity: urlP,
            letterSpacing: 0.4,
          }}
        >
          {p.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- promo outro ("made in under a minute with …") -----------------*/
const PromoScene: React.FC<{ p: SaasDemoProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const accent = p.accent ?? p.primary;
  const promo = p.promo ?? {};
  const badge = promo.badge ?? 'MADE IN UNDER A MINUTE';
  const title = promo.title ?? 'This video was created in under a minute';
  const brand = promo.brand ?? promo.url ?? p.url;
  const cta = promo.cta ?? 'Try it today — free';
  const url = promo.url ?? brand;

  const badgeP = spring({ frame, fps: FPS, config: { damping: 16 } });
  const brandP = spring({ frame: frame - 34, fps: FPS, config: { damping: 14, mass: 0.9 } });
  const ctaP = spring({ frame: frame - 52, fps: FPS, config: { damping: 16 } });
  const ringRot = (frame / FPS) * 40;
  const pulse = 0.9 + Math.sin(frame / 10) * 0.1;

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: 90,
      }}
    >
      {/* rotating conic halo */}
      <div
        style={{
          position: 'absolute',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          background: `conic-gradient(from ${ringRot}deg, ${rgba(accent, 0)}, ${rgba(accent, 0.22)}, ${rgba(p.primary, 0)}, ${rgba(accent, 0.22)}, ${rgba(accent, 0)})`,
          filter: 'blur(40px)',
          opacity: 0.7,
        }}
      />

      <div
        style={{
          position: 'relative',
          marginBottom: 28,
          transform: `translateY(${(1 - badgeP) * 24}px)`,
          opacity: badgeP,
        }}
      >
        <Pill primary={accent} filled>{badge}</Pill>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 1100 }}>
        <KineticHeadline
          text={title}
          size={58}
          primary={accent}
          highlight={promo.highlight}
          delay={12}
          center
        />
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 30,
          fontSize: 64,
          fontWeight: 900,
          letterSpacing: -1,
          background: `linear-gradient(90deg, ${p.primary}, ${accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transform: `translateY(${(1 - brandP) * 30}px) scale(${0.7 + brandP * 0.3})`,
          opacity: brandP,
          filter: `drop-shadow(0 0 ${30 * pulse}px ${rgba(accent, 0.5)})`,
        }}
      >
        {brand}
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          transform: `translateY(${(1 - ctaP) * 24}px) scale(${0.9 + ctaP * 0.1})`,
          opacity: ctaP,
        }}
      >
        <div
          style={{
            padding: '20px 46px',
            borderRadius: 999,
            background: accent,
            color: '#0b0e17',
            fontSize: 27,
            fontWeight: 800,
            boxShadow: `0 18px 50px -12px ${rgba(accent, 0.7)}`,
          }}
        >
          {cta}
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, color: '#fff', letterSpacing: 0.4 }}>
          {url}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- root composition ----------------------------------------------*/
export const SaasDemo: React.FC<SaasDemoProps> = (props) => {
  const withPromo = promoEnabled(props);
  const { durations, starts } = buildTimeline(props.screens.length, withPromo);

  let idx = 0;
  const introStart = starts[idx];
  const introDur = durations[idx++];

  const screenBlocks = props.screens.map((screen, i) => {
    const start = starts[idx];
    const dur = durations[idx++];
    return { screen, start, dur, i };
  });

  const gridStart = starts[idx];
  const gridDur = durations[idx++];
  const outroStart = starts[idx];
  const outroDur = durations[idx++];
  const promoStart = withPromo ? starts[idx] : 0;
  const promoDur = withPromo ? durations[idx++] : 0;

  const wm = props.watermark;
  const showWatermark = wm?.enabled !== false && !!(wm?.label || wm?.mark);

  return (
    <AbsoluteFill style={{ backgroundColor: props.bg, fontFamily: FONT }}>
      <GlowBackground primary={props.primary} bg={props.bg} />
      <MotionGraphics primary={props.accent ?? props.primary} />

      <Sequence from={introStart} durationInFrames={introDur}>
        <Scene duration={introDur}>
          <IntroScene p={props} />
        </Scene>
      </Sequence>

      {screenBlocks.map(({ screen, start, dur, i }) => (
        <Sequence key={i} from={start} durationInFrames={dur}>
          <Scene duration={dur}>
            <ShowcaseScene p={props} screen={screen} index={i} />
          </Scene>
        </Sequence>
      ))}

      <Sequence from={gridStart} durationInFrames={gridDur}>
        <Scene duration={gridDur}>
          <FeatureGridScene p={props} />
        </Scene>
      </Sequence>

      <Sequence from={outroStart} durationInFrames={outroDur}>
        <Scene duration={outroDur}>
          <OutroScene p={props} />
        </Scene>
      </Sequence>

      {withPromo && (
        <Sequence from={promoStart} durationInFrames={promoDur}>
          <Scene duration={promoDur}>
            <PromoScene p={props} />
          </Scene>
        </Sequence>
      )}

      {showWatermark && (
        <Watermark label={wm?.label ?? ''} mark={wm?.mark} primary={props.accent ?? props.primary} />
      )}
    </AbsoluteFill>
  );
};

/* ============================================================================
 * Pillar FSM — example config. Copy this object, swap the values, and you have
 * a brand-new demo. (Assets live in /public/saas/pillar.)
 * ==========================================================================*/
const BASE =
  'https://raw.githubusercontent.com/VideoApiHub/assets/refs/heads/main/website/public/';

export const pillarDemoDefaults: SaasDemoProps = {
  brandName: 'Pillar',
  logo: `${BASE}saas/pillar/logo-white.png`,
  primary: '#F47C20',
  primaryDark: '#E2620E',
  bg: '#0A0E1A',
  text: '#FFFFFF',
  accent: '#FFB066',
  brandWordmark: 'Pillar',
  // If your logo PNG already includes the brand name, set this true to hide
  // the separate animated wordmark text in the intro:
  // logoHasWordmark: true,
  watermark: { enabled: true, label: 'videoapihub.com' },
  promo: {
    enabled: true,
    badge: 'MADE IN UNDER A MINUTE',
    title: 'This video was created in under a minute',
    highlight: 'minute',
    brand: 'videoapihub.com',
    cta: 'Try it today — free',
    url: 'videoapihub.com',
  },
  eyebrow: 'FIELD SERVICE MANAGEMENT',
  headline: 'Manage every job, from first call to final invoice',
  subheadline:
    'One platform for technicians in the field and managers in the office. Built for the trades.',
  screens: [
    {
      image: `${BASE}saas/pillar/dashboard.png`,
      device: 'desktop',
      aspect: 1441 / 1266,
      eyebrow: 'COMMAND CENTER',
      title: 'One dashboard. Total command.',
      subtitle: 'Revenue, today’s schedule, profit margins and alerts — all in a single view.',
      chips: ['Revenue tracking', 'Today’s schedule', 'Business alerts'],
      hotspot: { x: 0.27, y: 0.22, label: 'Live revenue' },
      stats: [
        { value: 128400, label: 'Revenue this month', prefix: '$' },
        { value: 42, label: 'Jobs scheduled today' },
      ],
    },
    {
      image: `${BASE}saas/pillar/calendar.png`,
      device: 'desktop',
      aspect: 1898 / 906,
      eyebrow: 'SCHEDULING',
      title: 'Drag-and-drop scheduling',
      subtitle: 'Spot conflicts before you double-book, across month, week and day views.',
      chips: ['Conflict detection', 'Multi-technician', 'Color-coded'],
    },
    {
      image: `${BASE}saas/pillar/mobile-jobs.png`,
      device: 'phone',
      aspect: 420 / 656,
      eyebrow: 'MOBILE TECHNICIANS',
      title: 'The office in their pocket',
      subtitle: 'Schedules, job details, checklists and signatures — installable on any phone.',
      chips: ['Daily schedule', 'Clock in / out', 'Offline ready'],
    },
    {
      image: `${BASE}saas/pillar/profitability.png`,
      device: 'desktop',
      aspect: 1284 / 1088,
      eyebrow: 'ANALYTICS',
      title: 'Know which jobs make you money',
      subtitle: 'Revenue, labor costs and margins for every job — exportable to CSV.',
      chips: ['Job profitability', 'Labor variance', 'CSV export'],
      hotspot: { x: 0.72, y: 0.34, label: 'Margin per job' },
      stats: [
        { value: 38.5, label: 'Avg. profit margin', suffix: '%', decimals: 1 },
        { value: 1240, label: 'Jobs analysed' },
      ],
    },
  ],
  features: [
    'Jobs & Scheduling',
    'Dispatch & Routing',
    'Estimates & Approvals',
    'Invoicing & Payments',
    'Customer Portal',
    'Mobile PWA',
    'Analytics & Reporting',
    'White-Label Branding',
  ],
  ctaTitle: 'Start free for 14 days',
  ctaSubtitle: 'No credit card required.',
  ctaButton: 'Request a demo',
  url: 'pillarfsm.com',
};

export default SaasDemo;
