# Artwork — Design

Date: 2026-08-19

Follows `2026-08-19-visual-redesign-design.md` and
`2026-08-19-store-revision-design.md`. Those two gave the site a design system
and fixed the store's content. The artwork was the last thing still making the
page look unfinished, and it had two unrelated problems.

## Problem

### Baked-in canvas, measured not guessed

`character-mage.png` and `dragon.png` were cut out of a white canvas with a hard
threshold. Flood fill from outside a figure cannot reach white trapped inside it,
so canvas survived between the mage's legs and behind its cape, and between the
dragon's wings, tail, and feet. The dragon also stood on a pale drop-shadow
ellipse that made sense on white and read as a grey smear on a dark panel.

The pockets were provably not paint. The mage's largest was 20,315 px averaging
(246.9, 246.8, 246.5) with a standard deviation of 4 — flat and neutral. The
staff's glow nearby averaged (247.6, 243.2, 227.7), warm by 20 points of blue.
Neutrality separated artifact from art; the shadow plate was separable in turn by
being flat, neutral, wider than tall by a factor of 7, and sitting at 94% of the
frame height, where the mage's grey rock produced no candidate region at all.

Alpha was also effectively binary — 3,446 partial pixels out of 880,900 — so
edges kept the white they were blended with and the outline stairstepped.

### One page, five unrelated pictures

The five raster images had been generated independently and spanned midday pastel
to lava red. Against a near-black page they did not read as a set, and the hero
was the worst case: a sunny cartoon landscape with a blue sky and white clouds
sitting directly behind white display type.

## Approach

The two problems have one root cause — assets produced in isolation without
reference to where they would sit — so the fix was to produce them as a set.

Five replacement images were generated against a single style brief: painterly
matte painting, near-black navy base, warm ember light sources, cool cyan
moonlight, deep shadows, no cel shading. The compositions echo the copy they sit
beside (a lit hill town for history, a vault of relics for loot, rune-lit ruins
for quests, a chained fortress for endgame).

Fixing the two cutouts was attempted first, and worked: the pockets and plate
came out cleanly, dropping neutral-bright pixels from 25,776 to 2,720 on the mage
and 69,058 to 1,423 on the dragon. That work was then discarded, because once the
backgrounds were painterly the remaining problem with a cel-shaded cartoon
character was not its edges. Both cutouts were replaced with opaque art.

That choice removes the defect class rather than patching it. **No page artwork
carries an alpha channel any more**, so trapped canvas and matte fringing cannot
recur. The one remaining PNG is `logo.png`, which needs its transparency.

The closing dragon is painted on a near-black field (mean luma 2.7) and composited
with `mix-blend-mode: screen`, so its background disappears into the panel and
only the ember-lit edges show. That gets a soft-edged decorative element with no
alpha channel and no hard image boundary.

### Weight

Sizing each image near its display size rather than shipping source resolution
cut the artwork from 4,056 KB to 964 KB. The two discarded cutouts alone were
1,684 KB. `logo.png` was 527 KB to display at 56×26 px; at 384 px wide it is 112
KB, and downscaling with premultiplied alpha anti-aliased its previously
hard-cut edges as a side effect.

## Testing

The Rust suite already asserted that every referenced asset exists on disk, which
is why the renamed assets could not be forgotten. That check cannot catch an
asset that exists but fails to decode, which is close to the earlier bug where
every image 404ed while the tests passed on element presence alone. A Playwright
case now polls until every image on the landing page reports `complete` and a
non-zero `naturalWidth`, and asserts no response returned 4xx or 5xx. It was
verified to fail by removing an asset.

## Out of scope

`logo.png` is unchanged as a design: it was only resized and re-encoded. It is
now the one bright, cel-shaded element left on the page, so it is the obvious
next thing to look at, but a logo is brand identity and not a refactor decision.
