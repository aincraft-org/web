---
name: azothmc-style-guide
description: Use when writing or reviewing any CSS, HTML, or Rust template markup for the AzothMC site — adding a page, styling a button, form field, card, or badge, picking a color or font size, or judging whether a visual change fits the design system.
---

# AzothMC Style Guide — "Ironhold"

## Overview

AzothMC is a handcrafted high-fantasy Minecraft MMORPG. The visual system is
**Ironhold**: a frontier that keeps score. Cold steel underfoot, rust for the
one action that matters in a view, and brass for anything a player counts, set
in a condensed face that reads like a stamped plate.

**Core principle:** every visual decision is a token. If you are typing a raw
hex code, a raw pixel value, or a one-off `font-size` into a component, you are
working around the system instead of in it.

## When to Use

Read this before:

- Adding or restyling any component (button, input, card, panel, badge, notice)
- Choosing a color, font, size, spacing value, radius, shadow, or transition
- Adding a new page or section to the Rust templates
- Reviewing a diff that touches `public/assets/styles.css`

Skip it for pure logic changes in `market.rs`, `news.rs` routing, or the JSON API.

## Seeing It

Start the server and open the gallery — it renders every token, type role, and
component state from the real stylesheet:

```sh
cargo run --manifest-path server/Cargo.toml
# then open http://127.0.0.1:8787/assets/styleguide.html
# theme comparison:  http://127.0.0.1:8787/assets/themes.html
```

Both pages live under `public/assets/` deliberately: the router only exposes
`/assets/{*path}`, so a file anywhere else in `public/` is unreachable. Look at
the gallery before styling anything; it is faster than reading the tables and
shows what a component should actually look like. When you add a component, add
it to both `azoth.css` and the gallery.

The gallery reads its own swatch hexes and contrast ratios from the live tokens
at load time rather than hardcoding them, so it re-measures instead of drifting
when a value changes. Keep it that way — the previous hand-typed values went
stale the first time the palette moved.

## The Theme in One Paragraph

The site reads like a frontier ledger. Backgrounds are cold neutral steel so the
cinematic artwork carries the color. Rust is heat and hazard — it marks the
single most important action in any view. Brass is money: prices, gains, the
market, anything the player counts. Display type is condensed uppercase Oswald
for hero and section headings; everything functional is Inter, because a
condensed face at 14px in a filter pill closes up and stops being legible.
Corners are near-square (2–6px), and that hard geometry is load-bearing: round
a card to 16px and the industrial character is gone.

## Non-Negotiable Rules

1. **Tokens only.** No raw hex, `px` font sizes, or magic spacing in component
   rules. Add a token if one is missing. See `tokens.md`.
2. **The display face is for display only.** `--font-display` on `h1`/`h2` and
   hero numerals. Card titles, panel headings, buttons, labels, and all UI text
   use `--font-sans`. Never set the display face below `--text-xl`.
3. **One rust action per view.** `.btn--primary` is the single most important
   action on the page. A screen with three rust buttons has no primary action.
4. **Brass means value.** Prices, savings, market rates, positive deltas. Never
   use it for generic decoration or as a second brand color.
5. **Danger stays off-hue from the accent.** Rust sits at 15°, crimson at 356°.
   When `--danger` and `--accent` match, a destructive button and the primary
   action become the same color and only the label separates them. Same reason
   `--warning` is pulled brighter than `--value`.
6. **Every interactive element defines five states** — rest, hover, active,
   `:focus-visible`, and disabled. A component missing `:focus-visible` is
   incomplete, not "to be added later".
7. **Text contrast is verified, not guessed.** Body text meets 4.5:1, large text
   and UI boundaries meet 3:1. `--text-disabled` is 3.06:1 and is *only* valid
   for disabled controls, never for content.
8. **Motion is optional.** Every transition and reveal must be neutralized under
   `prefers-reduced-motion: reduce`.

## Quick Reference

| Need | Use |
|---|---|
| Page background | `--surface-base` |
| Card / raised panel | `--surface-raised` + `--border-subtle` |
| Body copy | `--text-secondary` |
| Headings | `--text-primary` |
| Timestamps, meta | `--text-tertiary` |
| Links, inline emphasis | `--accent-text` (`--rust-400`) |
| Primary action | `.btn` `.btn--primary` |
| Secondary action | `.btn` `.btn--secondary` |
| Tertiary / on artwork | `.btn` `.btn--ghost` |
| Price, savings, market | `--value` (`--brass-400`) |
| Live / online status | `.tag--live` |
| Destructive action | `.btn--danger` |

Full values in `tokens.md`. Full component specs, including all five states, in
`components.md`.

## Typography Roles

Thirteen roles, no improvising. Full specs in `tokens.md`.

- `display-1`, `display-2` — condensed, **uppercase**, hero only, one per page
- `heading-1`, `heading-2` — condensed, mixed case, section titles
- `heading-3` — **sans**; below ~20px the condensed face closes up on dark
- `title` — sans semibold, card and panel headings
- `lead` — larger body for section intros, `--text-secondary`
- `body`, `body-sm` — default prose
- `label` — sans, uppercase, tracked, for eyebrows and form labels
- `overline` — smallest uppercase marker, `--accent-text`
- `caption` — small meta text, `--text-tertiary`
- `numeric` — mono with tabular figures: prices, IP address, dates, stats

Display uppercasing is a token (`--display-transform`), not a hardcoded rule, so
a theme that wants mixed-case display can switch it without touching the roles.

## Themes

Ironhold is the shipped theme and lives in `:root` of `public/assets/azoth.css`.
`public/assets/themes.css` holds four alternates — Chronicle, Parchment,
Aetherium, Verdance — plus a restatement of Ironhold so it can be named
explicitly when scoping a subtree.

Each alternate overrides tokens only; no theme block redefines a component rule.
Apply one with `data-theme` on `<html>` or on any subtree. Every theme's text
colors are verified against its own `--surface-base`.

If you change an Ironhold value in `:root`, change the `[data-theme="ironhold"]`
restatement to match — they are duplicated on purpose so scoping works, which
means they can drift.

## Implementation Status

Read this before assuming a rule is already enforced anywhere.

| Artifact | State |
|---|---|
| `public/assets/fonts/` — 6 woff2 + 6 OFL licenses | **Shipped** |
| `public/assets/fonts/fonts.css` — `@font-face` + metric-matched fallbacks | **Shipped** |
| `public/assets/azoth.css` — tokens + components, Ironhold in `:root` | **Shipped** |
| `public/assets/themes.css` — four alternate palettes | **Shipped** |
| `public/assets/styleguide.html` — live gallery | **Shipped** |
| `public/assets/themes.html` — theme comparison | **Shipped** |
| `content_type` in `site.rs` — `html` and `woff2` types | **Shipped** |
| `public/assets/styles.css` — the live site's stylesheet | **Not migrated** |
| Rust templates in `server/src/` | **Not migrated** |

The live site still renders from the old `styles.css`. Until that migration
happens, this system governs new work and the two preview pages — it does not
yet describe what a visitor sees.

## Known Defect This System Fixes

`public/assets/styles.css` — still live — declares a **local-only** display
stack:

```css
--font-display: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
```

It loads no webfont. macOS users get Iowan Old Style, Windows gets Palatino
Linotype, and Linux/Android fall back to Georgia or a generic serif. **The
intended typography has never shipped to most visitors.**

`azoth.css` fixes this by self-hosting every family from `public/assets/fonts/`,
so headings render identically everywhere and the page makes no third-party font
request. Each family also has a metric-matched fallback face
(`ascent-override`/`descent-override`/`line-gap-override`) so the swap does not
reflow the masthead. When migrating `styles.css`, import `fonts/fonts.css`
first. Never reintroduce a stack that depends on locally installed fonts.

Related: the old CSS uses `font-weight: 650` and `550`, which only resolve
correctly against a variable font and silently round to 700/500 otherwise.
Against the vendored variable fonts they are real weights — with two limits:
**JetBrains Mono's axis starts at 400**, so mono text cannot go lighter than
regular, and **Oswald's axis stops at 700**, so the display face has no 800/900.
Inter and Fraunces both span 100–900.

## Common Mistakes

| Mistake | Fix |
|---|---|
| New component invents its own padding scale | Use `--space-*` |
| Display face used on a card title | Card titles are `title` role — sans |
| `outline: none` on a custom control | Replace the ring, never remove it |
| Rust used for a "learn more" link *and* the buy button | Demote one to `.btn--secondary` |
| `--danger` set to the accent color | Destructive and primary must not share a hue |
| Card rounded to 12–16px | Ironhold radii top out at 6px; soft corners kill the theme |
| Cyan copied from old rules | Cyan is retired; use `--value` or `--info` |
| Hover-only affordance | Must also be reachable by keyboard focus |
| `transition: all` | Name the properties; `all` animates layout and janks |
| Disabled state done with only `opacity` | Also set `cursor` and remove hover/transform |

## Theme Assumptions (revisable)

The genre read was inferred from the landing copy in `server/src/site.rs`, not
confirmed by the owner. Revisit if the server's positioning differs:

- **Colder and harsher than the copy alone suggests.** The landing text ("The
  realm", "Chronicles", "handcrafted kingdoms") reads warm and literary, and the
  first direction — Chronicle, gold on ink in a literary serif — followed it
  directly. Ironhold was chosen over it deliberately, so the system now leans
  harder on hazard and industry than the prose does. If the copy is ever
  rewritten to match, that is the direction to push it.
- **Brass as the value color, emerald as the in-game currency.** The copy's
  "emerald economy" and "player-driven emerald market" name the item players
  trade; they do not require the UI to be green. Prices render in brass because
  it reads as coin against steel. Keep the copy's "emerald" wording — it is the
  world's currency, not a color instruction.
- **Dark-only in production.** Parchment exists as a light alternate and its
  contrast is verified, but every page is built over dark cinematic artwork, and
  no production surface assumes a light background.
