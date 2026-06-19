---
name: saas-demo-props
description: Generate a SaasDemoProps config (a JSON file by default, or a typed .tsx module on request) for the reusable Remotion SaaS Demo template (website/src/SaasDemo.tsx). Use when the user wants a product demo video for a new SaaS — you only need this file, not the component source.
allowed-tools: Read, Write, Edit, Glob, AskUserQuestion
---

# SaaS Demo — Props Generator

You generate a single typed config object (`SaasDemoProps`) that drives the reusable
`SaasDemo` Remotion composition in `website/src/SaasDemo.tsx`. You do **not** need to read
the component — everything required to produce a correct, great-looking config is here.

The video plays these scenes in order, all auto-timed:

```
Intro (animated logo lockup)  →  one scene per `screens[]` entry
  →  Feature grid  →  Outro (CTA)  →  Promo ("made in under a minute") [optional]
```

A persistent watermark sits top-right the whole time. The duration is computed
automatically from the number of screens — never hardcode it.

---

## Output format

Produce a **`.json`** file (preferred) containing the `SaasDemoProps` object, saved as
`website/src/saas-demo-props/<brand>.json`. Plain JSON keeps the config data-only,
portable and easy to feed into a render API. Assets referenced by path live under
`website/public/` (e.g. `'saas/<brand>/logo.png'` → `public/saas/<brand>/logo.png`).
Images may also be a full `https://…` URL or a `data:`/`blob:` URI.

```json
{
  "brandName": "Acme",
  "logo": "saas/acme/logo-white.png"
}
```

JSON rules: double-quoted keys/strings, no comments, no trailing commas, and write
numeric `aspect` as a decimal (e.g. `1.7777`) since JSON has no expressions like `1440 / 900`.

If the user explicitly wants a typed TS module instead, emit a `.tsx`/`.ts` file that
exports the object:

```ts
import type { SaasDemoProps } from '../SaasDemo';

export const acmeDemo: SaasDemoProps = { /* …generated… */ };
```

To register it for rendering, the user adds a `<Composition>` in their Remotion Root using
`getSaasDemoDuration(props)` for `durationInFrames` (1920×1080, fps 30). JSON props can be
imported directly (`import acme from './saas-demo-props/acme.json'`). Mention this but
don't invent file paths you haven't confirmed.

### Placeholder screenshots

If real screenshots aren't supplied, generate **PNG placeholders** under
`website/public/saas/<brand>/` so every `screen.image` path resolves. Match each
placeholder's real pixel dimensions to the `aspect` you declare (e.g. 1600×900 → `1.7777`).

---

## Type schema (authoritative)

```ts
type DeviceType = 'desktop' | 'phone';

type DemoScreen = {
  image: string;        // public path / URL / data-uri of the screenshot
  device: DeviceType;   // 'desktop' → browser chrome; 'phone' → phone frame
  aspect: number;       // width / height of the screenshot (e.g. 1440 / 900). REQUIRED & must match the real image or it distorts.
  eyebrow: string;      // short UPPERCASE kicker, e.g. 'COMMAND CENTER'
  title: string;        // 3–6 word benefit-led headline
  subtitle: string;     // one sentence, ~10–18 words
  chips?: string[];     // 2–4 tiny feature tags
  hotspot?: {           // optional glowing callout pinned to a region of the screenshot
    x: number;          // 0–1 fraction from left
    y: number;          // 0–1 fraction from top
    label: string;      // short, e.g. 'Live revenue'
  };
  stats?: {             // optional count-up stat cards beside the device
    value: number;      // numeric target the counter ticks up to
    label: string;      // what it measures
    prefix?: string;    // e.g. '$'
    suffix?: string;    // e.g. '%' or 'k'
    decimals?: number;  // default 0
  }[];
};

type SaasDemoProps = {
  // --- required ---
  brandName: string;
  logo: string;          // LIGHT/WHITE logo (shown on dark intro & outro)
  primary: string;       // brand hex, e.g. '#F47C20'
  primaryDark: string;   // darker shade of primary
  bg: string;            // dark background hex, e.g. '#0A0E1A'
  text: string;          // body text hex, usually '#FFFFFF'
  eyebrow: string;       // intro kicker (UPPERCASE)
  headline: string;      // intro headline (6–10 words)
  subheadline: string;   // intro supporting line (~12–20 words)
  screens: DemoScreen[]; // 3–5 recommended
  features: string[];    // 4 or 8 items render cleanest (4-col grid)
  ctaTitle: string;      // outro headline, e.g. 'Start free for 14 days'
  ctaSubtitle: string;   // outro subline, e.g. 'No credit card required.'
  ctaButton: string;     // button text, e.g. 'Request a demo'
  url: string;           // product URL, e.g. 'acme.com' (also shown in browser bar)

  // --- optional branding / motion (sensible defaults) ---
  accent?: string;            // secondary accent; defaults to `primary`. Use a lighter tint of primary.
  brandWordmark?: string;     // text revealed next to the logo in the intro lockup
  logoHasWordmark?: boolean;  // true if the logo image ALREADY contains the brand name → suppresses the separate wordmark text
  logoWidth?: number;         // intro logo width in px. Default 480 (or 300 when a separate brandWordmark is shown)

  screenRevealHold?: number;  // frame at which the screenshot finishes gliding into its slot & text starts. Default = screenCenterHold + 34
  screenCenterHold?: number;  // frames the screenshot sits BIG & centred before gliding. Default 28
  screenHeroScale?: number;   // size during the centre-stage "hero" moment. Default 1.32

  watermark?: {               // persistent top-right badge
    enabled?: boolean;        // default true if label/mark provided
    label?: string;           // usually your product/host URL
    mark?: string;            // optional small logo image before the label
  };

  promo?: {                   // closing "made in under a minute" card
    enabled?: boolean;        // default true; set false to drop the promo scene
    badge?: string;           // e.g. 'MADE IN UNDER A MINUTE'
    title?: string;           // e.g. 'This video was created in under a minute'
    highlight?: string;       // a word inside `title` painted in the accent colour
    brand?: string;           // big gradient brand line, e.g. 'videoapihub.com'
    cta?: string;             // e.g. 'Try it today — free'
    url?: string;             // small url line under the CTA
  };
};
```

---

## Authoring rules (follow these for a premium result)

1. **`aspect` must be real.** It is `width / height` of the actual screenshot, written as a
   plain decimal in JSON (e.g. `1.7777` for 1600×900). Getting this wrong stretches the image.
   If you don't know the real dimensions, tell the user to confirm, or read the file
   dimensions — never guess silently. When you generate placeholder PNGs, size them to match
   the `aspect` you declare.
2. **`logo` is the light/white version** — it sits on a dark background. If only a colored logo
   exists, say so.
3. **Colors:** `bg` should be dark (near-black, slightly tinted toward the brand). `primary` is the
   brand color; `accent` should be a *lighter tint* of `primary` for glows/highlights. `primaryDark`
   is a deeper shade. Ensure `primary`/`accent` are bright enough to read on `bg`.
4. **Screens:** 3–5 is ideal. Alternate value: at least one `phone` screen if the product has a
   mobile/PWA story. Add `stats`/`hotspot` to your 1–2 strongest screens, not all of them.
5. **`features`:** prefer exactly 4 or 8 (renders as a clean 4-column grid). Each ≤ 3 words.
6. **Copy voice:** benefit-led, concrete, no fluff. Titles are short; subtitles are one plain sentence.
7. **`logoHasWordmark`:** set `true` when the PNG already shows the name (then omit/ignore
   `brandWordmark`). Set `brandWordmark` only when the logo is just a mark/icon.
8. **Watermark vs promo branding** are independent — the watermark is the host/tool
   (e.g. `videoapihub.com`); the product URL is `url`. Keep them distinct unless the user says otherwise.
9. **Never set the total duration** — it's derived via `getSaasDemoDuration(props)`.

---

## Interview (only ask what you can't infer)

Use AskUserQuestion to gather, in one batch:
- Brand name, product URL, one-line positioning
- Brand primary color (or logo to derive from) + whether the logo already includes the name
- The list of screenshots (path + what each shows) and their real pixel dimensions
- Closing CTA (offer + button text)
- Watermark label (default `videoapihub.com`) and whether to keep the promo outro

If the user gives a website, you may fetch it to infer copy/colors, then confirm.

---

## Minimal valid example (JSON)

```json
{
  "brandName": "Acme",
  "logo": "saas/acme/logo-white.png",
  "primary": "#5B8DEF",
  "primaryDark": "#3E6BC4",
  "bg": "#0A0E1A",
  "text": "#FFFFFF",
  "accent": "#9DBDF7",
  "brandWordmark": "Acme",
  "watermark": { "enabled": true, "label": "videoapihub.com" },
  "eyebrow": "ANALYTICS PLATFORM",
  "headline": "Turn raw events into decisions",
  "subheadline": "Real-time dashboards your whole team can actually understand.",
  "screens": [
    {
      "image": "saas/acme/dashboard.png",
      "device": "desktop",
      "aspect": 1.6,
      "eyebrow": "OVERVIEW",
      "title": "Every metric, one screen",
      "subtitle": "Live KPIs, trends and alerts the moment they happen.",
      "chips": ["Realtime", "Custom KPIs", "Alerts"],
      "hotspot": { "x": 0.3, "y": 0.25, "label": "Live users" },
      "stats": [
        { "value": 1240000, "label": "Events / day" },
        { "value": 99.9, "label": "Uptime", "suffix": "%", "decimals": 1 }
      ]
    },
    {
      "image": "saas/acme/mobile.png",
      "device": "phone",
      "aspect": 0.4667,
      "eyebrow": "ON THE GO",
      "title": "Your numbers in your pocket",
      "subtitle": "Push alerts and dashboards on any device.",
      "chips": ["Push alerts", "Offline", "PWA"]
    },
    {
      "image": "saas/acme/reports.png",
      "device": "desktop",
      "aspect": 1.6,
      "eyebrow": "REPORTING",
      "title": "Share insight in one click",
      "subtitle": "Scheduled reports exported to PDF or CSV.",
      "chips": ["PDF / CSV", "Scheduled", "Shareable"]
    }
  ],
  "features": [
    "Realtime Streams",
    "Custom Dashboards",
    "Smart Alerts",
    "Team Sharing",
    "Data Export",
    "API Access",
    "Role Permissions",
    "White-Label"
  ],
  "ctaTitle": "Start free for 14 days",
  "ctaSubtitle": "No credit card required.",
  "ctaButton": "Get started",
  "url": "acme.com",
  "promo": {
    "enabled": true,
    "badge": "MADE IN UNDER A MINUTE",
    "title": "This video was created in under a minute",
    "highlight": "minute",
    "brand": "videoapihub.com",
    "cta": "Try it today — free",
    "url": "videoapihub.com"
  }
}
```

> `aspect` is `width / height` pre-computed as a decimal (`1440/900 → 1.6`,
> `420/900 → 0.4667`). Set `logoHasWordmark: true` and drop `brandWordmark` when the
> logo image already contains the brand name.

---

## Checklist before you hand off

- [ ] Output is valid JSON (double quotes, no comments, no trailing commas) unless TS was requested
- [ ] Every `screen.aspect` matches the real screenshot dimensions (decimal in JSON)
- [ ] Placeholder PNGs created for any missing `screen.image` paths, sized to the declared aspect
- [ ] `logo` is the light/white variant; `logoHasWordmark`/`brandWordmark` set correctly
- [ ] `primary`/`accent` readable on `bg`; `accent` is a lighter tint of `primary`
- [ ] 3–5 screens; `stats`/`hotspot` only on the strongest 1–2
- [ ] `features` length is 4 or 8, each ≤ 3 words
- [ ] Watermark label ≠ product `url` (unless intended)
- [ ] No hardcoded duration anywhere
