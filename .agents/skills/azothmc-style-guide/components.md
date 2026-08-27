# Component Specifications

Every interactive component defines five states: **rest, hover, active,
`:focus-visible`, disabled**. A component missing one is incomplete.

All values reference tokens from `tokens.md`.

## Buttons

### Base

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: none;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.btn:active { transform: translateY(1px); }

.btn:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-offset);
}

.btn:disabled,
.btn[aria-disabled="true"] {
  color: var(--text-disabled);
  background: var(--surface-raised);
  border-color: var(--border-subtle);
  box-shadow: none;
  transform: none;
  cursor: not-allowed;
  pointer-events: none;
}
```

Disabled must clear `box-shadow` and `transform` as well as color. Opacity alone
leaves a button that still looks pressable.

### Sizes

Minimum touch target is 40px; `--sm` is for dense toolbars only, never as the
sole action on a page.

| Size | Padding | Font | Height |
|---|---|---|---|
| `.btn--sm` | `var(--space-2) var(--space-3)` | `--text-sm` | 32px |
| `.btn` (default) | `var(--space-3) var(--space-5)` | `--text-base` | 40px |
| `.btn--lg` | `var(--space-4) var(--space-8)` | `--text-md` | 48px |

### Variants

**Primary** — rust fill. One per view. The single most important action.

| State | Treatment |
|---|---|
| Rest | `--accent` fill, `--text-inverse` label, `--glow-accent` |
| Hover | `--accent-hover` fill, glow grows to `0 14px 32px var(--accent-ring)` |
| Active | `--accent-active` fill, `translateY(1px)`, glow removed |
| Focus | `--focus-ring` at 2px offset |
| Disabled | base disabled treatment |

A flat fill, not a gradient. The current gradient reads as a 2013 web button and
muddies the ink-colored label.

**Secondary** — raised surface with a visible border. The default for supporting
actions.

| State | Treatment |
|---|---|
| Rest | `--surface-raised`, `--border-default`, `--text-primary` |
| Hover | `--surface-hover`, `--border-strong` |
| Active | `--surface-overlay`, `translateY(1px)` |
| Focus | `--focus-ring` |

**Ghost** — transparent with a border. For use over artwork; needs
`backdrop-filter: blur(6px)` for legibility over the hero.

| State | Treatment |
|---|---|
| Rest | transparent, `--border-strong`, `--text-primary` |
| Hover | `rgba(255,255,255,0.07)` fill, border to `rgba(255,255,255,0.42)` |
| Active | `rgba(255,255,255,0.04)`, `translateY(1px)` |
| Focus | `--focus-ring` |

**Quiet** — text only, no border or fill. Inline and tertiary actions.

| State | Treatment |
|---|---|
| Rest | `--accent-text`, no background |
| Hover | `--accent-soft` background, `--rust-200` label |
| Active | `--surface-hover` background |
| Focus | `--focus-ring` |

**Danger** — destructive only. Never for emphasis.

| State | Treatment |
|---|---|
| Rest | `--danger-soft` fill, `--danger` border and label |
| Hover | `--danger` fill, `--text-inverse` label |
| Active | `#d94f45` fill, `translateY(1px)` |
| Focus | ring switches to `--danger` |

### Loading

Set `aria-busy="true"` and keep the label in place — never swap the text for a
spinner, since the button collapses and the surrounding layout shifts. Add a
12px spinner in the leading `gap` slot and apply `pointer-events: none`.

## Links

```css
a {
  color: var(--text-link);
  text-decoration-color: rgba(255, 220, 168, 0.4);
  text-underline-offset: 0.18em;
  transition: color var(--duration-fast) var(--ease-out);
}
a:hover { color: var(--rust-200); text-decoration-color: currentColor; }
a:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-offset); border-radius: var(--radius-sm); }
```

Links inside prose keep their underline — color alone is not a sufficient
affordance. Navigation and card links may drop it.

## Form Fields

Applies to `input`, `select`, and `textarea` alike.

```css
.field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-sunken);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}
```

| State | Treatment |
|---|---|
| Rest | sunken surface, `--border-default` |
| Hover | `--border-strong` |
| Focus | `--border-focus` + `box-shadow: 0 0 0 3px var(--accent-ring)`, outline suppressed since the ring replaces it |
| Disabled | `--surface-raised`, `--text-disabled`, `cursor: not-allowed` |
| Invalid | `--danger` border, `--danger-soft` ring, message in `--danger` at `caption` |
| Placeholder | `--text-tertiary` — never `--text-disabled`, which fails contrast |

Inputs use a **sunken** surface while cards are **raised**. That inversion is
what tells the eye a field accepts input.

Labels use the `label` role and sit above the field with `--space-2`. Never rely
on placeholder text as the label. Help text uses `caption` and is wired up with
`aria-describedby`; error text replaces it and adds `aria-invalid="true"`.

### Search

Search is a `.field` with `--radius-pill`, a leading icon inset by
`--space-3`, and left padding increased to `var(--space-10)` to clear it.

### Checkbox and radio

16px box, `--radius-sm` (radio: `--radius-pill`), `--border-strong` at rest.
Checked fills with `--accent` and marks with `--text-inverse`. The focus ring
goes on the visual box via `:focus-visible + label`, never removed with
`appearance: none` and left unreplaced.

## Filter Pill (toggle)

Used by the store toolbar. It is a toggle, so it must expose state to assistive
tech with `aria-pressed`, not by class alone.

| State | Treatment |
|---|---|
| Rest | transparent, `--border-default`, `--text-secondary`, `--radius-pill` |
| Hover | `--surface-hover`, `--border-strong` |
| Selected | `--accent-soft` fill, `--accent` border, `--accent-text` label |
| Focus | `--focus-ring` |
| Disabled | `--text-disabled`, no hover |

Label uses the `label` role — uppercase, `--tracking-caps`.

## Tags and Badges

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-pill);
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
```

Variants pair a `*-soft` fill with the matching solid border and text:
`.tag--live` (success, plus a 6px pulsing dot), `.tag--new` (accent),
`.tag--warning`, `.tag--danger`, `.tag--info`.

The `.tag--live` dot animation must be suppressed under reduced motion.

## Cards

```css
.card {
  padding: var(--space-6);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
  box-shadow: var(--shadow-sm);
  transition:
    border-color var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}
.card:hover {
  border-color: var(--border-default);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
```

Only cards that are themselves links or contain a primary action get the hover
lift. A static informational card that rises under the cursor promises
interactivity it does not have.

Card titles use the `title` role — sans, never the display face. Card body uses `body-sm` in
`--text-secondary`. Numbered step cards render the numeral with `numeric` in
`--accent-text`.

When a whole card is clickable, use a stretched-link pseudo-element over the
title anchor rather than wrapping the card in `<a>`, so the accessible name stays
the title rather than the entire card's text.

## Panels

Same surface as cards, but no hover state and `--radius-lg`. Panel headings use
`heading-3`. Panels are containers, not targets.

## Notices and Callouts

```css
.notice {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-6);
  border: 1px solid var(--border-default);
  border-left: 3px solid var(--info);
  border-radius: var(--radius-lg);
  background: var(--info-soft);
}
```

Variants swap the left border and background: `.notice--info`,
`.notice--success`, `.notice--warning`, `.notice--danger`. Title uses `title`,
body uses `body-sm` in `--text-secondary`.

Notices communicating an error or a result must carry `role="status"` (polite)
or `role="alert"` (assertive) so screen readers announce them.

## Price and Numeric Display

Prices use `numeric` with `tabular-nums`. The amount takes `--text-xl` in
`--text-primary`; the currency or period suffix takes `body-sm` in
`--text-tertiary`. Savings and market gains use `--value` — brass reads as coin
against steel, which is the point of the token. Note the in-game currency is
still emeralds; the token colors the number, not the noun.

**Never render a price in the display face.** `tabular-nums` only does anything
if the font ships a `tnum` feature or has uniform digit advances, and the display
faces have neither — so figures silently fail to align in a column. Measured
from the vendored files:

| Family | `tnum` | Digit advances | Safe for `numeric` |
|---|---|---|---|
| JetBrains Mono | — | 600, uniform | **Yes** (uniform by construction) |
| Inter | yes | 833–1323 | **Yes** |
| Space Grotesk | yes | 404–638 | **Yes** |
| Oswald | no | 378–517 | **No** |
| Cinzel | no | 344–596 | **No** |
| Fraunces | no | 1024–1461 | **No** |

This is why `numeric` is a mono role and why `heading-*` must never wrap a
figure that appears in a column.

## Server Address Chip

Pill-shaped, `--surface-overlay` at 55% alpha with `backdrop-filter: blur(10px)`
so it holds up over the hero art. Address uses `numeric`. The copy button is
`.btn--primary.btn--sm` inset within the pill.

On copy, the button swaps its label to "Copied" for 2 seconds. That confirmation
must also be announced — put it in an `aria-live="polite"` region, since a purely
visual change strands screen-reader and keyboard users.

## Masthead

Transparent at scroll position 0 over the hero; on scroll it gains
`--surface-overlay` at 80% alpha, `backdrop-filter: blur(12px)`, and a
`--border-subtle` bottom border. Height is `--header-h`, `z-index: --z-sticky`.

Nav links use `body-sm` at `--weight-medium` in `--text-secondary`; hover goes to
`--text-primary`. The current page is marked with `aria-current="page"` and gets
`--text-primary` plus a 2px `--accent` underline.

The skip link sits at `--z-skip` and must become visible on focus.

## Checklist for a New Component

1. Uses only tokens — no literal hex, px font sizes, or off-scale spacing
2. Defines all five interaction states
3. `:focus-visible` ring present and not suppressed
4. Contrast verified against the surface it actually sits on
5. Transitions name their properties and respect reduced motion
6. Correct semantic element; state exposed via ARIA, not class names alone
7. Touch target at least 40px unless in a dense toolbar
8. Works at 320px width and at 200% zoom