# Design Tokens — "Ironhold"

Every value the AzothMC site is allowed to use. These are implemented in
`public/assets/azoth.css` — edit that file rather than re-declaring tokens
elsewhere, and reference them by name in component rules instead of literal
values.

Ironhold is the shipped theme and occupies `:root`. Alternate palettes live in
`public/assets/themes.css` and override semantic roles only; see "Themes" at the
end of this file.

## Color

### Palette scales

Raw scale values. Components should prefer the **semantic roles** below, not
these directly.

```css
/* Steel — near-neutral, hue ~210 at very low saturation. The stage, not
   the subject. Colder and flatter than a navy; it must not read as blue. */
--steel-950: #08090a;
--steel-900: #0e0f11;
--steel-850: #16181b;
--steel-800: #1d2024;
--steel-750: #262a2f;
--steel-700: #33383e;

/* Rust — heat, hazard, the primary action. Hue ~15. */
--rust-200: #ffd0bd;
--rust-300: #ffab8a;
--rust-400: #ff8a5c;
--rust-500: #e0562a;
--rust-600: #b8431f;
--rust-700: #8f3316;

/* Brass — currency and value. Coin against steel. Hue ~39. */
--brass-200: #f5e2b0;
--brass-300: #ecd189;
--brass-400: #d9a441;
--brass-500: #b8862d;
--brass-600: #8f671f;
```

### Semantic roles

```css
/* Surfaces */
--surface-base:    var(--steel-900);   /* page background */
--surface-sunken:  var(--steel-950);   /* wells, code blocks, inset areas */
--surface-raised:  var(--steel-850);   /* cards, panels, product rows */
--surface-overlay: var(--steel-800);   /* scrolled header, popovers, menus */
--surface-hover:   var(--steel-750);   /* raised surface under cursor */

/* Borders — alpha so they work over artwork as well as flat surfaces */
--border-subtle:  rgba(226, 232, 240, 0.08);
--border-default: rgba(226, 232, 240, 0.16);
--border-strong:  rgba(226, 232, 240, 0.28);
--border-focus:   var(--rust-400);

/* Text */
--text-primary:   #eceef0;  /* headings, high-emphasis body     16.49:1 */
--text-secondary: #b0b6bc;  /* default prose                     9.37:1 */
--text-tertiary:  #838a92;  /* meta, timestamps, captions        5.49:1 */
--text-disabled:  #5a6169;  /* disabled controls ONLY            3.06:1 */
--text-inverse:   #0e0f11;  /* on rust/brass fills               5.05:1 */
--text-link:      var(--rust-400);

/* Brand */
--accent:          var(--rust-500);   /* 5.05:1 as a fill vs --text-inverse */
--accent-hover:    #f06a3d;
--accent-active:   var(--rust-600);
--accent-text:     var(--rust-400);   /* rust as text on dark     8.26:1 */
--accent-soft:     rgba(224, 86, 42, 0.14);
--accent-ring:     rgba(224, 86, 42, 0.34);

/* Value — prices, savings, market data, positive deltas */
--value:      var(--brass-400);   /* 8.53:1 on base */
--value-soft: rgba(217, 164, 65, 0.12);

/* Status */
--success: #5cc98d;  /*  9.31:1 */
--warning: #ffd23f;  /* 13.28:1 */
--danger:  #f2555f;  /*  5.70:1 */
--info:    #6ba8d8;  /*  7.50:1 */

--success-soft: rgba(92, 201, 141, 0.12);
--warning-soft: rgba(255, 210, 63, 0.12);
--danger-soft:  rgba(242, 85, 95, 0.12);
--info-soft:    rgba(107, 168, 216, 0.12);
```

Contrast ratios above are measured against `--surface-base` (`#0e0f11`).
`--text-inverse` is measured on `--accent`. When adding a color, verify it and
record the ratio in the comment — do not estimate. `styleguide.html` re-measures
all of these from the live tokens at load, so a wrong comment here will disagree
with the gallery.

**`--danger` must not equal `--accent`.** Rust is hue 15 and crimson is hue 356.
They were briefly the same value, which made `.btn--danger` and `.btn--primary`
render identically. `--warning` is likewise held apart from `--value`: same
family of hues, but warning is much lighter (13.28:1 vs 8.53:1) so a caution
notice cannot be misread as a price.

**Retired:** the old `--cyan` (`#5cc4d8`) is gone. Nothing in the site copy
justified a cool accent; live/status indicators now use `--success`, and
informational callouts use `--info`.

## Typography

### Families

Self-hosted variable fonts, vendored in `public/assets/fonts/`. No CDN, no build
step — consistent with Rust owning delivery. The `@font-face` rules live in
`fonts/fonts.css`, which must be imported before `azoth.css`.

```css
--font-display: "Oswald", "Oswald Fallback", "Arial Narrow", sans-serif;
--font-sans:    "Inter", "Inter Fallback", ui-sans-serif, system-ui, sans-serif;
--font-mono:    "JetBrains Mono", "JetBrains Mono Fallback", ui-monospace, monospace;
```

Shipped files — latin subset only, 228 KB total. Ironhold only downloads the
first three (106 KB); the rest are fetched only if a page selects the theme that
uses them, because an unreferenced `@font-face` is never requested.

| File | Family | Axes (read from the file) | Size | Used by | License |
|---|---|---|---|---|---|
| `oswald-latin-var.woff2` | Oswald | `wght` 200–700 | 28 KB | **Ironhold** display | `OFL-Oswald.txt` |
| `inter-latin-var.woff2` | Inter | `wght` 100–900 | 47 KB | all themes, UI | `OFL-Inter.txt` |
| `jetbrains-mono-latin-var.woff2` | JetBrains Mono | `wght` 400–800 | 31 KB | all themes, numerals | `OFL-JetBrainsMono.txt` |
| `fraunces-latin-var.woff2` | Fraunces | `opsz` 9–144, `wght` 100–900 | 66 KB | Chronicle, Verdance | `OFL-Fraunces.txt` |
| `cinzel-latin-var.woff2` | Cinzel | `wght` 400–900 | 25 KB | Parchment | `OFL-Cinzel.txt` |
| `space-grotesk-latin-var.woff2` | Space Grotesk | `wght` 300–700 | 22 KB | Aetherium | `OFL-SpaceGrotesk.txt` |

All six are SIL Open Font License 1.1, which permits redistribution alongside
the site. Keep the license file next to any font you add.

- **Oswald** — condensed grotesque, display only. **Its axis stops at 700**, so
  there is no 800/900 for display roles. Its tight counters are why the display
  face is barred below `--text-xl`.
- **Inter** — variable UI sans. Everything functional.
- **JetBrains Mono** — tabular figures for prices, the server address, and dates.
  **Its axis floor is 400**, so mono text cannot render lighter than regular.
- **Fraunces** (alternates only) — its `opsz` axis is driven by
  `font-optical-sizing: auto` on `body`; do not set `font-variation-settings`
  by hand or you defeat it. Its file default weight is 900, so always state
  `font-weight` explicitly.

Only the latin subset is vendored (`U+0000-00FF` plus common punctuation and
symbols; see the `unicode-range` in `fonts.css`). Cyrillic, Greek, and Vietnamese
glyphs fall through to the fallback face. If the site ever needs them, vendor the
matching subsets rather than widening the range on the existing files.

Each `@font-face` sets `font-display: swap`. Each family also has a
metric-matched `* Fallback` face whose `ascent-override`, `descent-override`, and
`line-gap-override` are the real webfont's own hhea metrics (Oswald
119.30/28.90/0%, Inter 96.88/24.12/0%, JetBrains Mono 102.00/30.00/0%, Fraunces
97.80/25.50/0%, Cinzel 97.60/37.20/0%, Space Grotesk 98.40/29.20/0%), so the
swap does not change line box height. Oswald's matters most, since it carries
the largest text on the page; its fallback resolves to a condensed local face
(Arial Narrow, Liberation Sans Narrow) rather than a default sans. `size-adjust` is deliberately not set: it
would need the width metrics of whichever local font actually resolves, which
differs per platform and cannot be pinned from here.

### Scale

Fluid where it benefits from it, fixed where predictability matters.

```css
--text-2xs:  0.6875rem;  /* 11px — overlines */
--text-xs:   0.75rem;    /* 12px — captions, tags */
--text-sm:   0.8125rem;  /* 13px — labels, dense UI */
--text-base: 0.9375rem;  /* 15px — buttons, inputs, compact UI */
--text-md:   1.0625rem;  /* 17px — body prose */
--text-lg:   clamp(1.0625rem, 0.55vw + 0.94rem, 1.25rem);   /* lead */
--text-xl:   clamp(1.25rem, 0.6vw + 1.1rem, 1.5rem);        /* h3 */
--text-2xl:  clamp(1.75rem, 1.6vw + 1.35rem, 2.6rem);       /* h2 */
--text-3xl:  clamp(2.25rem, 3vw + 1.4rem, 3.5rem);          /* display-2 */
--text-4xl:  clamp(2.6rem, 4.6vw + 1.35rem, 5.25rem);       /* display-1 */
```

### Weights, line height, tracking

```css
--weight-regular:  400;
--weight-medium:   500;
--weight-semibold: 600;
--weight-bold:     700;

--leading-tight:   1.06;  /* display */
--leading-snug:    1.2;   /* headings */
--leading-normal:  1.45;  /* titles, UI */
--leading-relaxed: 1.65;  /* body prose */

--tracking-tight:  -0.02em;
--tracking-snug:   -0.01em;
--tracking-normal: 0;
--tracking-wide:   0.08em;
--tracking-caps:   0.16em;   /* uppercase labels */
```

Display and heading tuning is separate, because a condensed uppercase face and a
literary serif want opposite treatment and a theme must be able to swap both
without rewriting the type roles:

```css
--display-weight:    600;
--display-tracking:  0.01em;   /* positive: uppercase needs air */
--display-transform: uppercase;
--heading-weight:    500;
--heading-tracking:  0.02em;
```

Chronicle sets these to `600 / -0.02em / none / 600 / -0.01em` — a serif at
display size needs negative tracking, the exact opposite. Set the tokens, never
`text-transform` or `letter-spacing` on a role directly.

Numeric weights resolve against the variable axes, so intermediate values like
`550` are legitimate here — unlike in the current stylesheet, where no variable
font is loaded and they silently round.

### Roles

Do not compose ad-hoc combinations; use a role.

| Role | Family | Size | Weight | Leading | Tracking | Color |
|---|---|---|---|---|---|---|
| `display-1` | display | `--text-4xl` | `--display-weight` | tight | `--display-tracking` | `--text-primary` |
| `display-2` | display | `--text-3xl` | `--display-weight` | tight | `--display-tracking` | `--text-primary` |
| `heading-1` | display | `--text-2xl` | `--heading-weight` | snug | `--heading-tracking` | `--text-primary` |
| `heading-2` | display | `--text-xl` | `--heading-weight` | snug | `--heading-tracking` | `--text-primary` |
| `heading-3` | sans | `--text-lg` | 600 | normal | normal | `--text-primary` |
| `title` | sans | `--text-md` | 600 | normal | normal | `--text-primary` |
| `lead` | sans | `--text-lg` | 400 | relaxed | normal | `--text-secondary` |
| `body` | sans | `--text-md` | 400 | relaxed | normal | `--text-secondary` |
| `body-sm` | sans | `--text-base` | 400 | relaxed | normal | `--text-secondary` |
| `label` | sans | `--text-sm` | 600 | normal | caps + uppercase | `--text-tertiary` |
| `overline` | sans | `--text-2xs` | 700 | normal | caps + uppercase | `--accent-text` |
| `caption` | sans | `--text-xs` | 400 | normal | wide | `--text-tertiary` |
| `numeric` | mono | inherit | 500 | normal | normal | inherit |

`display-*` and `heading-1/2` are the only roles that use `--font-display`, and
`display-1/2` additionally apply `--display-transform` (uppercase under
Ironhold). `heading-3` drops to sans because below roughly 20px a condensed face
closes up against dark backgrounds — the same threshold held when the display
face was a serif, for the opposite reason.

`numeric` must also set `font-variant-numeric: tabular-nums` so prices and stats
align in columns.

Prose blocks (`.prose`, news articles) cap at `68ch`; `--lead` caps at `58ch`.

## Spacing

4px base unit. Nothing outside this scale.

```css
--space-0:  0;
--space-1:  0.25rem;   /*  4px */
--space-2:  0.5rem;    /*  8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

Layout:

```css
--container:  1180px;
--container-narrow: 720px;   /* prose */
--gutter:     clamp(1.25rem, 4vw, 2.75rem);
--band-gap:   clamp(3rem, 6.5vw, 6rem);
--header-h:   68px;
```

## Radius

```css
--radius-sm:   2px;    /* tags, inline code, small inputs */
--radius-md:   3px;    /* buttons, inputs */
--radius-lg:   4px;    /* cards, panels */
--radius-xl:   6px;    /* hero surfaces, large media */
--radius-pill: 999px;  /* filter pills, IP chip, status tags */
```

The near-square geometry is load-bearing, not a detail. Rounding a card to
12–16px reads as a generic SaaS dashboard and undoes the theme on its own.
`--radius-pill` stays fully round because a pill is a shape, not a corner
treatment. Chronicle and the other alternates override the first four.

## Elevation

Dark UI reads depth from surface lightness first and shadow second. Raise the
surface token *and* apply a shadow; never a shadow alone.

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.40);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.36);
--shadow-md: 0 8px 20px rgba(0, 0, 0, 0.40);
--shadow-lg: 0 14px 30px rgba(0, 0, 0, 0.44);
--shadow-xl: 0 28px 60px rgba(0, 0, 0, 0.52);

--glow-accent: 0 10px 26px rgba(224, 86, 42, 0.28);
```

There is no `--glow-value`; it was defined but never consumed, so it was removed
rather than left to imply a component that does not exist.

## Motion

```css
--duration-instant: 90ms;    /* color/opacity swaps */
--duration-fast:    140ms;   /* hover, focus */
--duration-normal:  220ms;   /* small transforms, disclosure */
--duration-slow:    380ms;   /* scroll reveals, hero */

--ease-out:   cubic-bezier(0.22, 0.61, 0.36, 1);
--ease-in-out: cubic-bezier(0.65, 0.05, 0.36, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

Always name transitioned properties. `transition: all` animates layout
properties and causes jank.

Required, once, globally:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Focus

One ring everywhere, including custom controls:

```css
--focus-ring: 2px solid var(--border-focus);
--focus-offset: 2px;
```

`--border-focus` is `--rust-400` at 8.26:1 on the base surface, visible over both
flat surfaces and artwork. Never `outline: none` without an equivalent
replacement.

## Z-index

```css
--z-base:    0;
--z-raised:  10;
--z-sticky:  100;   /* masthead */
--z-overlay: 200;   /* dropdowns */
--z-modal:   300;
--z-toast:   400;
--z-skip:    500;   /* skip link must beat everything */
```

## Themes

Ironhold is `:root`. `public/assets/themes.css` adds four alternates, each
overriding semantic roles, the display family, the display/heading tuning, and
the first four radii. **No theme block redefines a component rule.**

| `data-theme` | Character | Display face |
|---|---|---|
| *(none)* / `ironhold` | Cold steel, rust, brass. Hard, industrial. | Oswald, uppercase |
| `chronicle` | Warm gold on deep ink, emerald value. Literary. | Fraunces |
| `parchment` | Aged paper, oxblood, forest ink. The only light theme. | Cinzel |
| `aetherium` | Arcane violet, mana cyan. Cold and luminous. | Space Grotesk |
| `verdance` | Deep forest, lantern amber. | Fraunces |

Apply with `data-theme` on `<html>`, or on any element to scope a subtree —
`themes.html` uses the latter to show all five at once. `html[data-theme="x"]`
scores (0,1,1) against `:root`'s (0,1,0), so themes win regardless of source
order.

Two things to keep true when editing:

- **Every theme resets every token it can inherit wrongly.** A theme that sets
  colors but not `--font-display` or the radii will leak Ironhold's condensed
  uppercase and square corners into a serif palette. Reset the full set.
- **`[data-theme="ironhold"]` duplicates `:root` on purpose** so Ironhold can be
  named when scoping inside another theme. Change one, change the other.

Text colors in every theme are verified against that theme's own
`--surface-base`, not Ironhold's. Body text clears 4.5:1 and disabled controls
clear 3:1 in all five.

## Preserved Rule

Carry this forward verbatim. The store filter script toggles the `hidden`
attribute, and component `display` declarations would otherwise beat the
user-agent default:

```css
[hidden] { display: none !important; }
```