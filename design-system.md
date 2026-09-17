# Seynox IT Solutions — Design System

A living reference for the typography, spacing, color, and component
patterns used across the site. Updated to match `index.html` exactly —
if this file and the code ever disagree, the code is correct and this
needs updating.

---

## 1. What this site is

A 12-page marketing site built as a **single self-contained HTML file**
using a client-side hash router — there is no build step, no bundler,
no framework. Everything (HTML, CSS, JS) lives in `index.html`. Pages:

- `/` — Home
- `/managed-it`, `/cloud-m365`, `/cybersecurity`, `/it-consulting` — the 4 services
- `/industries/legal`, `/healthcare`, `/financial`, `/construction`, `/real-estate`, `/manufacturing` — the 6 industries
- `/contact` — dedicated page with a working (client-side only) form

`/promise`, `/pricing`, `/insights`, `/services`, `/industries` are not
separate pages — they're **aliases** that route to `/` and then
smooth-scroll to that section. This matters if you ever split pages
apart later (see §6).

---

## 2. Typography

**Fonts** (both loaded from Google Fonts, no self-hosting)
- **Display / headings** — `Plus Jakarta Sans` (weights 500/600/700, italic 500/600), applied via `.font-display` and on all `h1`-`h4` by default
- **Body / UI** — `IBM Plex Sans` (400/500/600/700), the page default

### Type scale (largest to smallest)

| Role | Classes | Used for |
|---|---|---|
| Flagship hero H1 | `text-4xl sm:text-5xl lg:text-[3.2rem]` | Homepage hero only |
| Flagship CTA headline | `text-3xl sm:text-5xl` / `text-3xl sm:text-[2.5rem]` | Global closing CTA, Transparency Promise headline |
| Sub-page H1 | `text-3xl sm:text-4xl lg:text-[2.75rem]` | All 10 service/industry pages + Contact - kept identical across all 11 |
| Section H2 | `text-2xl sm:text-[2rem] font-semibold tracking-tight` | Every standard content section |
| Per-page closing CTA H2 | `text-white text-2xl sm:text-3xl` | Mini CTA at the bottom of each service/industry page |
| Card heading (h3) | `1.02rem-1.1rem`, semibold | Bento cards, industry cards, journey step cards |
| Body copy | `0.92rem-0.95rem`, `text-slate-500`, `leading-relaxed` | Section intros, card descriptions |
| Small label / eyebrow | `0.78rem`, bold, uppercase, tracking-wide, 16px accent dash prefix | Every section eyebrow site-wide |
| Micro text | `0.7rem-0.82rem` | Badges, breadcrumbs, footer fine print |

**Rule going forward:** any new section heading is
`text-2xl sm:text-[2rem] font-semibold tracking-tight`, followed by
`mt-4` before its intro paragraph (`text-slate-500 leading-relaxed`,
`0.92-0.95rem`). Don't introduce a new near-duplicate size for the same
role - reuse one of the above.

---

## 3. Spacing

| Tier | Classes | When to use |
|---|---|---|
| Standard | `py-16 sm:py-20` | Default for any full content section |
| Tight-follow | `py-6 sm:py-10` / `py-10 sm:py-14` | A section immediately following another visually-dense one (avoids doubled whitespace) |
| Closing CTA (per-page) | `pb-6 sm:pb-10` | The small CTA band at the end of each service/industry page |
| Closing CTA (global) | generous, deliberately the most open-feeling | The one site-wide closing CTA + footer band |

- Heading to intro paragraph: `mt-4`
- Intro paragraph to content grid: `mt-10` (majority pattern)
- Card padding: `p-6`-`p-7`; grid gaps: `gap-4 lg:gap-5` (3-up) or `gap-5` (2-up)
- Containers: `max-w-6xl` (default), `max-w-xl`/`max-w-2xl` (intros, hero copy), `max-w-3xl` (FAQ), `max-w-4xl` (service "What's Included")

---

## 4. Color tokens

| Token | Value | Use |
|---|---|---|
| `ink` | `#14193B` | Primary text-on-light, dark UI fills |
| `inkline` | `#1E2450` | Hover state for ink-filled elements |
| `accent` (Tailwind config **and** `--accent` CSS var) | `#F5821F` | Brand orange - CTAs, active states, eyebrow dashes |
| Dark band bg | `#08080a` | Hero and the global closing band |
| Page bg | `#F8F9FA` | Default light page background |
| Card border (light) | `#e8eaef` / `slate-200/80` | White card outlines |

`--accent` is defined once in `:root`. Any hand-written CSS rule
referencing orange should use `var(--accent)`, not a hardcoded hex -
Tailwind's own `bg-accent`/`text-accent` utilities read from the
separate `tailwind.config` block and don't need the variable, but
custom CSS does. **This was a real bug once already** (nav button
silently had no color because `--accent` wasn't defined yet) - don't
reintroduce a second undefined variable the same way.

---

## 5. Components

- **Buttons**: pill-shaped, accent-orange fill with `#14193B` text everywhere it's a primary action (nav CTA, hero CTA, closing CTA) - hover lightens to `#FDBA74`, never white or navy.
- **Eyebrow label**: `w-4 h-0.5 bg-accent` dash + uppercase bold `0.78rem` text, identical pattern in every section.
- **Cards**: white, `rounded-3xl`/`22px`, `border-slate-200/80`, `shadow-soft -> shadow-softhover` on hover, usually `translateY(-4px)` lift.
- **Nav / mega-menu**: floating `position:fixed` glass pill, dark-glass over the hero (10% white bg, 22% border, 88% white text) -> light-glass once scrolled past it. Dropdowns are plain children of each `.menu-item` (not detached elsewhere in the DOM - that was tried and reverted, see SS7), left-aligned under their trigger, `clip-path` grow-from-top reveal with staggered item entrance.
- **FAQ accordion**: `grid-template-rows: 0fr -> 1fr`, no JS height math. Border glows accent color when open.
- **Client Journey**: full-width dot-grid background with centered `max-w-6xl` content; an SVG "silk wave" (3 strands + a traveling glow dot via `offset-path`) forms a staircase connecting 4 alternating step cards, widens gracefully near its end, then fades out before the Transparency Promise band below it.
- **Dark canvas bands**: the reusable "silk-curtain" canvas animation now appears in exactly **2** places - the homepage hero, and the global closing CTA+footer band. (It was previously also on the Transparency Promise card; that instance was removed by request - the card is now a static gradient, no motion.)

---

## 6. Known simplifications (read before extending)

- **Hash-alias sections**: `/promise`, `/pricing`, `/insights` etc. aren't real pages. If you later give any of these their own URL, update the `HOME_ANCHORS` map in the router and double-check every internal link pointing at them.
- **The wave-to-Promise handoff was deliberately simplified.** Several rounds were spent trying to make the Journey wave's curve mathematically terminate on the exact pixel of the Promise section's eyebrow dash (via live `getBoundingClientRect()` measurement and dynamically rewritten SVG paths). It was reverted - it added real fragility (cross-section z-index fights, a JS-rebuilt path with no way to visually verify it) for a payoff that's genuinely hard to get right blind. **Do not re-attempt automatic cross-section pixel-matching between the wave and Promise's DOM content** without the ability to see it rendered - it cost several iterations for exactly this reason. The current, working version: the wave curves and widens smoothly, then fades out via a `mask-image` gradient before it would overlap Promise at all.
- **No build process, on purpose.** Tailwind and both Google Fonts load from CDN at runtime. This is fine for a marketing site at this scale; if it ever needs a real build (bundling, purging unused CSS, self-hosted fonts for performance/privacy), that's a deliberate future step, not an oversight.

---

## 7. Files in this delivery

- `index.html` - the complete site, ready to deploy as-is
- `design-system.md` - this document
- `README.md` - how to actually put it online via git

See `README.md` for deployment steps and notes on the eventual WordPress migration.
