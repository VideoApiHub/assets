import type { SaasDemoProps } from '../SaasDemo';

// Assets live in /public/saas/guardian-gaze. Served from the same GitHub raw
// base used by the other demos so the composition renders identically.
const BASE =
  'https://raw.githubusercontent.com/VideoApiHub/assets/refs/heads/main/website/public/';

export const guardianGazeDemo: SaasDemoProps = {
  brandName: 'Guardian Gaze',
  // Wide horizontal lockup that already contains the brand name → suppress the
  // separate animated wordmark text in the intro.
  logo: `${BASE}saas/guardian-gaze/logo-white.svg`,
  logoHasWordmark: true,
  logoWidth: 560,
  primary: '#5B4FE3',
  primaryDark: '#3E34B0',
  accent: '#9B8CF0',
  bg: '#0A0B1E',
  text: '#FFFFFF',
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
  eyebrow: 'WORDPRESS SECURITY',
  headline: 'Find the hidden malware your firewall can’t see',
  subheadline:
    'Detect suspicious code, hidden backdoors and database payloads — with plain-English explanations before anything is touched on your site.',
  screens: [
    {
      image: `${BASE}saas/guardian-gaze/device.png`,
      device: 'desktop',
      aspect: 572 / 345,
      eyebrow: 'SCAN DASHBOARD',
      title: 'Every threat in one view',
      subtitle:
        'Core, plugins, themes, mu-plugins and the database — scanned and surfaced in a single place.',
      chips: ['Core & plugins', 'Themes & mu-plugins', 'Database options'],
      hotspot: { x: 0.5, y: 0.4, label: 'Live scan results' },
      stats: [
        { value: 1847, label: 'Files scanned' },
        { value: 412, label: 'DB records checked' },
      ],
    },
    {
      image: `${BASE}saas/guardian-gaze/scan-card.png`,
      device: 'desktop',
      aspect: 434 / 498,
      eyebrow: 'PLAIN-ENGLISH FINDINGS',
      title: 'Know exactly what’s wrong',
      subtitle:
        'Each finding shows the file, the suspicious pattern and why it looks malicious — nothing is changed without your sign-off.',
      chips: ['Severity scored', 'Review & quarantine', 'Send to developer'],
      stats: [{ value: 2, label: 'Suspicious findings' }],
    },
  ],
  features: [
    'Code-Level Reasoning',
    'Backdoor Detection',
    'Database Payload Scans',
    'Plain-English Findings',
    'Full File-Tree Scan',
    'Review Before Action',
    'Scheduled Scans',
    'Multi-Site Dashboard',
  ],
  ctaTitle: 'Start free on WordPress.org',
  ctaSubtitle: 'No card. No commitment. Findings shown before action.',
  ctaButton: 'Get Protected Free',
  url: 'guardiangaze.com',
};

export default guardianGazeDemo;
