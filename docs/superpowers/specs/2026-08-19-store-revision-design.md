# Store Revision — Design

Date: 2026-08-19

Follows `2026-08-19-visual-redesign-design.md`, which gave the site a design
system but left the store's content problems untouched.

## Problem

The store rendered twelve visually identical rows. Five defects, all observable
on the rendered page:

1. **Thumbnails carried no information.** Twelve packages shared six scenery
   photographs — `loot-bg.jpg` appeared four times — and none depicted the thing
   being sold. "Familiar Whisper", a spectral fox pet, showed a hill town;
   "Rune Trail", a particle effect, showed a forest ruin. Cropped to a 72px
   square, the photographs were unrecognizable as well as irrelevant.
2. **The rank ladder was invisible.** The four ranks form a progression
   ($9.99 → $19.99 → $29.99 → $49.99, with 2 → 5 → 8 → unlimited homes) but
   rendered as four rows indistinguishable from a cosmetic or a crate key.
3. **Value claims were unverifiable prose.** `price` was a `&'static str`, so
   nothing could be computed from it. "Best value per emerald" was asserted in
   copy with no supporting figure, and bundles listed their contents without
   showing any saving.
4. **The popular badge was diluted.** Four of twelve packages were `featured`.
5. **The catalog had no structure.** The default view mixed ranks, bundles,
   crates, coins, and cosmetics in one flat list, and every product name was an
   `<h2>`, flattening the document outline.

## Approach

### Prices as integer cents

`price_cents: u32` replaces the price string, which makes value derivable rather
than asserted:

- `emeralds_per_dollar` gives coin packs a comparable rate. The 500-emerald
  pouch yields 100 per dollar; the 1200 pouch yields 120. The better rate is
  found by `best_emerald_rate` and labelled "best rate" — the copy no longer
  claims it.
- Bundles declare `contents: &[(slug, quantity)]` instead of restating their
  parts as free text. `components_total_cents` sums the components' list prices
  and `savings` returns `(cents, percent)`. The Starter Bundle's "Save $11.97
  (44%)" and the Raid Bundle's "Save $13.97 (35%)" are computed from the same
  constants that price those components, so they cannot drift.

Percentages use integer division, so a displayed saving is never overstated.

### Category sigils instead of photographs

`Category` becomes an enum owning its slug, label, and blurb. Each category
renders an inline SVG sigil — a crate, a four-point sparkle, an emerald, a
ribboned bundle — in the ember palette. Ranks get a special sigil: four
chevrons with the tier's position lit, so the mark itself encodes where a rank
sits on the ladder.

Inline SVG is preferred over generated bitmaps because it is legible at 24px,
consistent across the catalog, honest about being a category mark rather than a
depiction of the product, and adds no binary assets.

### Grouped catalog with a rank ladder

`GROUPS` fixes the order — Ranks, Bundles, Crates, Coins, Cosmetics — putting
the progression first and the value plays second. Each group renders a heading,
a package count, and a one-line explanation of what the category is.

Ranks render as `tier_card`s in a comparison grid; everything else renders as
`product_row`s. Both carry identical `data-testid`, `data-category`, and
`data-search` attributes from one `card_attrs` helper, so filtering and search
behave the same regardless of which shape a package takes.

Tier cards are flex columns with the purchase button pinned by `margin-top:
auto`, keeping all four calls to action on one line no matter how many perks a
tier lists. The popular badge occupies the head slot rather than sitting above
the button, which would have added a row to one card and broken that alignment;
the tier number remains available to assistive technology through a visually
hidden label, since the sigil is `aria-hidden`.

`highlight` holds the single comparable figure per rank (the home allowance),
lifted out of the perk list so the ladder can be read across cards.

### Filtering

`store.js` additionally hides any group whose packages are all filtered out — a
heading with nothing under it reads as a rendering bug — and maintains a live
count ("Showing 2 of 12 packages"). Both rely on the existing `hidden`
attribute contract and the `[hidden] { display: none !important; }` rule.

## Testing

Rust tests cover the arithmetic and the invariants that copy used to assert:
bundle savings against hand-checked totals, that every bundle beats buying its
parts separately, that bundle contents reference real slugs, that the larger
pouch holds the better rate, that exactly one package is badged, that each
package renders exactly one card, mark, and purchase link, and that the rank
sigil lights one chevron per tier.

The Playwright suite gains a case for grouping, the computed savings and rate
text, empty-group hiding, and the empty state.

## Out of scope

Catalog pricing and copy are otherwise unchanged, as is the marketplace API.
Server-side handling of `?category=` remains a client-side concern.
