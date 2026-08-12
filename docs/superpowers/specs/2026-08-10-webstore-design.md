# AzothMC Webstore — Design Spec

Date: 2026-08-10
Status: Approved (architecture + checkout flow)

## 1. Context

AzothMC is a Minecraft MMORPG community server. The repo `azothmc-web` currently ships a
Vite + React 19 single-page landing page (hero, feature journal, join/play section, copy-IP)
with a shared design system in `styles.css` (Midnight Campaign mood: dark navy ink, ember
orange, cool cyan, carved-wood tabs, `--ink-*`/`--paper-*` tokens) and Playwright tests.

This spec adds a **donation / perk webstore** (`/store`) to the same SPA. Players buy ranks,
crates, cosmetics, coins, and bundles with real money; Tebex is the Merchant of Record and
fulfills automatically into the game via the official Tebex plugin.

No runtime backend exists or is being added to this repo. The store is a pure static
frontend; checkout and delivery are delegated to Tebex.

## 2. Goals / Non-Goals

### Goals
- A polished `/store` page in the same design language as the landing page.
- Catalog of AzothMC perks grouped by category, with client-side category filter + search.
- Honest, secure checkout: every "Buy" is a deep link to a Tebex package page. No secrets
  ever enter the browser bundle.
- A "How delivery works" explainer so players know what happens after they pay.
- Fully automatic in-game delivery via the official Tebex plugin (poll paid orders, run
  configured commands offline-safe, `{username}`-based).

### Non-Goals (explicitly out of scope)
- Cart/basket persisted in localStorage. A client-side cart would imply Tebex honors it; it
  does not. The honest basket is Tebex-side (single-package deep link).
- Checkout modal with IGN capture, or any "Order success" screen. IGN entry and payment
  happen on Tebex; we must not claim success we cannot verify.
- Backend, serverless function, or order database. Nothing to secure, nothing to operate.
- Player account linking / "Link your account" UI (Tebex panel / Discord-side feature).
- Admin/CMS for the catalog. Operator edits `src/store/catalog.js` (Tebex remains source of
  truth for pricing/commands).
- Physical goods, accounts/keys, or in-game-emerald marketplace.

## 3. Architecture

```
azothmc-web (Vite + React SPA)
├── /            landing page (existing, extended routing only)
├── /store       webstore
│    ├── StoreHero        — storefront banner (title, subtitle, delivery note CTA)
│    ├── CategoryTabs     — category filter (All / Rank / Crate / Cosmetic / Coin / Bundle)
│    ├── SearchField      — client-side name search over the static catalog
│    ├── ProductGrid      — package cards (name, price, description, perks, Buy)
│    ├── DeliveryNote     — "How delivery works" panel (IGN on Tebex, 1–2 min, offline-safe)
│    └── FooterNote       — store-specific footnote (MoR, support)
└── src/store/
     ├── catalog.js       — static catalog: { slug, name, category, price, description,
     │                      perks[], featured?, buyUrl }.
     │                      buyUrl = https://store.azothmc.com/package/{slug-or-id}
     └── StoreApp.jsx     — route component, owns filter/search state
```

- **Routing:** add `react-router-dom`; `App` becomes a router with `routes`:
  - `/` → existing landing (wrapped in existing shell)
  - `/store` → `StoreApp`, reusing `SiteHeader`/`SiteFooter` (with a store-aware nav item)
  - Unknown paths → landing (`*` fallback to `/`)
- **Catalog data:** static JSON import (single source for the store page). Fields are
  display-only; Tebex panel is authority for price/commands. `buyUrl` is a permanent public
  deep link (no secret).
- **No cart, no checkout modal, no success state.** Each package card's Buy button is a
  normal `<a href={buyUrl} target="_blank" rel="noopener noreferrer">`.
- **Filter/search:** pure client-side over `catalog.js`; persisted in the URL query string
  (`?category=ranks&q=ember`) so results survive reload/share — no backend.
- **Delivery note:** static copy; no polling, no webhook, no "success".

### Checkout contract (evidence-backed)
| Path | What | Secret | Availability |
|---|---|---|---|
| `/package/{id}` deep link (public store) | Player lands on Tebex package page, adds to basket, enters IGN, pays | None | Yes, permanent |
| `POST plugin.tebex.io/checkout` (auto basket) | Needs `X-Tebex-Secret` | Yes | Backend-only — out of scope |
| Checkout API / headless `Tebex.js` | Requires compliance approval + ~$60k revenue | Per-project | Not available to us |

Direct package links are the correct, secretless contract. Delivery: official Tebex plugin
polls paid orders every 1–2 min, runs configured commands offline-safe, `{username}`-based.
Tebex is Merchant of Record (tax/fraud/chargebacks handled).

## 4. Data Model

```js
// src/store/catalog.js
export const storeCategories = [
  { id: 'all',   label: 'All' },
  { id: 'rank',  label: 'Ranks' },
  { id: 'crate', label: 'Crates' },
  { id: 'cosmetic', label: 'Cosmetics' },
  { id: 'coin',  label: 'Coins' },
  { id: 'bundle', label: 'Bundles' },
];

export const storePackages = [
  {
    slug: 'adventurer-rank',
    name: 'Adventurer Rank',
    category: 'rank',
    price: 9.99,           // display only; Tebex panel is authority
    description: 'Step into Azoth with a head start.',
    perks: ['/kit adventurer', '+2 homes', 'access: /sethome'],
    featured: true,
    buyUrl: 'https://store.azothmc.com/package/adventurer-rank',
  },
  // …
];
```

- `category` references `storeCategories[].id`. `featured` optionally promotes a card.
- `buyUrl` is built from the single `STORE_ORIGIN` constant in `src/store/config.js` (e.g.
  `https://store.azothmc.com`) + `/package/` + `package.identifier` (slug when enabled,
  else numeric package ID). Catalog entries import `STORE_ORIGIN` rather than duplicating
  the origin, so the two never drift.

## 5. Behavior / UX

- `/store` renders above the fold: StoreHero with title, subtitle, and a "How delivery
  works" anchor.
- CategoryTabs: horizontal segmented control; selecting updates `?category=` + re-renders
  the grid (client-side filter). "All" shows everything.
- SearchField: filters by name/description substring client-side; updates `?q=`. Tabs and
  search compose (AND).
- ProductGrid: cards show name, price, description, perks list, Buy button. Featured card
  visually distinct (accent border / "Featured" chip).
- Buy = `<a target="_blank" rel="noopener noreferrer" href={buyUrl}>`. New tab, so the
  player keeps the AzothMC tab open with the catalog.
- DeliveryNote panel: explains 1) enter your Minecraft name on Tebex, 2) payment is
  instant, 3) the server delivers in-game within ~1–2 min (offline-safe), 4) if you've
  linked your account, purchases go to your linked name. Never claims a success state.
- FooterNote: "Payments processed by Tebex (Merchant of Record). Support via Discord."
- Empty states: no packages match filter → friendly "No perks match" + clear-filter button.
- Mobile: grid collapses to 1 column; tabs scroll horizontally; header/nav reflow like
  landing page.

## 6. Error Handling

- **Buy link down / Tebex store unreachable:** it's a normal link (new tab). If the store
  is down, the browser shows the network error — no app-level failure state needed. Do not
  wrap in `fetch`/`try`; there is nothing to catch client-side.
- **No packages in a category:** handled by empty state above.
- **Config typos in `catalog.js`:** a development-only invariant — every `category` must
  reference a known `storeCategories` id, and every package must have a non-empty `buyUrl`
  starting with the configured store origin. Fail fast at module load (throw) in dev, and
  Playwright smoke-asserts it so the store can't silently ship broken links.

## 7. Testing

Playwright (existing `tests/` infra, `webServer` runs Vite on 4173):

- **store loads with zero page errors** — goto `/store`, assert StoreHero/ProductGrid
  visible, title matches `/AzothMC Store/`.
- **catalog filters by category** — click a tab, assert grid shows only that category's
  packages, URL query updated (`?category=rank`).
- **search filters the grid** — type a query, assert matching subset, URL `?q=` updated.
- **Buy links are secretless deep links** — every card link has `href` starting
  `https://store.azothmc.com/package/`, `target="_blank"`, `rel="noopener noreferrer"`;
  assert no API/secret surface exists (no fetch to `plugin.tebex.io`, no `X-Tebex-Secret`).
- **delivery note does not claim success** — assert no "Order complete/success/paid" copy;
  assert "~1–2 min" and "offline" both present.
- **landing page still passes** — existing `landing.spec.ts` remains green (regression).

No unit tests for pure client-side filter/search (Playwright covers the observable
contract). No server tests (no server).

## 8. Performance & Accessibility

- Static catalog import; no runtime data fetch. Zero network dependency beyond the page
  itself.
- Accessible: tabs as buttons with `aria-pressed`/`aria-selected`, search labeled
  `aria-label`, packages rendered as a `<ul>`/`<li>` grid with `aria-labelledby` headings,
  skip-link reused (existing), keyboard navigable, focus styles consistent with landing,
  no color-only meaning (featured also has a "Featured" text chip), reduced-motion respected.

## 9. Configuration & Operations (requires external setup)

- **Tebex store** must exist with categories/packages and a custom domain
  `store.azothmc.com` (DNS CNAME + Tebex Plus for custom domains). Store URL is a single
  constant in `src/store/config.js` (e.g. `STORE_ORIGIN = 'https://store.azothmc.com'`) —
  this is the only "config surface", and it's public. **No secrets anywhere in this repo.**
- **Deploy/hosting (SPA rewrite):** production hosting must rewrite `/store` and all
  client-side paths to `index.html` so direct links/bookmarks/refreshes don't 404. Add the
  rule to the hosting config (Vite preview + static hosts: `/* → /index.html` except
  `/assets/*`). Flag this as a required ops step; not implemented in this repo (no hosting
  config exists yet).
- **Delivery setup:** official Tebex plugin installed on the server, linked with the secret
  key (never in this repo), packages configured with `{username}`-based commands on the
  Tebex panel.

## 10. Open Items / Decisions

- **Catalog content:** placeholder catalog ships with realistic AzothMC-style entries and
  clearly-marked `buyUrl`s (`store.azothmc.com/package/{slug}`), to be replaced with real
  Tebex package IDs/slugs. Operator fills `src/store/catalog.js`; layout/UX unaffected.
- **Store nav item:** add "Store" to the landing header nav (`content.js` `navItems`) with a
  distinct index label (e.g. `SHOP`), preserving the existing `isJoin` styling.
- **`react-router-dom` version:** pinned to a current stable (v7) for React 19; hash-router
  considered but rejected (ugly URLs, no server rewrite needed). SPA-rewrite hosting remains
  a requirement.

## 11. Delivery Sequence (implementation order)

1. Add `react-router-dom`, introduce `BrowserRouter` + route shell; landing keeps rendering
   at `/` (regression: `landing.spec.ts` must stay green).
2. `src/store/config.js` + `src/store/catalog.js` (placeholder catalog, dev invariant).
3. `StoreApp` + components (Hero, Tabs, Search, Grid, DeliveryNote, FooterNote).
4. Wire `Store` into header nav (`content.js`).
5. Store styles in `styles.css` (`store-*` classes, reusing `--ink-*`/`--paper-*` tokens).
6. Playwright `tests/store.spec.ts`; run full suite (`landing` + `store`) green.
7. Update landing nav test if it asserted an exact nav item set.

## 12. Acceptance Criteria

- `npm run build` passes; `npm test` (Playwright) passes with `landing.spec.ts` +
  `store.spec.ts`.
- `/store` shows a categorized, searchable catalog; every Buy button is a secretless
  `https://store.azothmc.com/package/…` deep link in a new tab.
- No cart, no checkout modal, no "success" state, no backend, no secrets anywhere in the
  repo (audit-able: grep for `tebex` secret patterns returns nothing).
- Landing page unchanged functionally; its route and tests still pass.
- Hosting operator has one documented ops step: SPA-rewrite `/store` → `index.html` and
  point Tebex custom domain at `store.azothmc.com`.
