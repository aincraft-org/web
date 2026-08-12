# AzothMC Webstore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/store` donation/perk webstore to the existing AzothMC Vite + React landing page, with catalog browsing and secretless Tebex package deep links.

**Architecture:** Same SPA; `react-router-dom` adds a `/store` route rendering a new `StoreApp`, sharing the existing `SiteHeader`/`SiteFooter` and design tokens. Catalog is a static JS module; every Buy button is a permanent public `https://store.azothmc.com/package/{slug}` link opened in a new tab. No cart, no checkout modal, no backend, no secrets.

**Tech Stack:** Vite 8, React 19, react-router-dom 7.18.2 (pin exact), Playwright (existing). Existing design system in `styles.css` (`--ink-*`, `--paper-*`, `--accent`, `--mint`, `--orange`, mono/sans fonts).

## Global Constraints

- Root: `/home/jlo/dev/azothmc-web` (git root is `/home/jlo/dev`; commit only files under `azothmc-web/`, using `cd /home/jlo/dev/azothmc-web`).
- React-router-dom version PINNED to `7.18.2` (React 19 compatible).
- NO secrets anywhere in the repo: never write `X-Tebex-Secret`, a Tebex secret key, or a `plugin.tebex.io` call. All Buy links are `https://store.azothmc.com/package/{slug}`.
- NO cart, NO checkout modal, NO IGN capture on our site, NO "order success" copy. IGN entry and payment happen on Tebex. Copy must never claim success.
- `STORE_ORIGIN = 'https://store.azothmc.com'` is the ONE store constant, defined in `src/store/config.js`; catalog `buyUrl`s are built from it (never duplicated).
- Reuse existing patterns/tokens from `styles.css` and `src/content.js` — do not introduce a second design convention.
- Every task's Playwright run uses: `npx playwright test --project=chromium` from `azothmc-web` (config already boots Vite dev server on 127.0.0.1:4173).

---

### Task 1: Router shell + split App into layout and LandingPage

**Files:**
- Modify: `src/main.jsx`
- Create: `src/App.jsx` (full rewrite — export default component)
- Create: `src/LandingPage.jsx`

**Interfaces:**
- Consumes: existing `src/components/{HeroSection,IntroSection,JournalSection,JoinSection,SiteHeader,SiteFooter}.jsx`, `src/content.js`, `src/clipboard.js`.
- Produces:
  - `App` (default export): renders `<SiteHeader copies={copiedButtons} activeSection={activeSection} onCopy={handleCopy} />`, `<main id="main"><Routes>…</Routes></main>`, `<SiteFooter />`. Holds copy state (`copiedButtons`, `feedback`, `lastCopiedIp`, `feedbackTimers`) — moved verbatim from today's `App.jsx` — plus the `data-last-copied-ip` effect. Routes: `/` → `<LandingPage …/>`; `/store` → `<StoreApp/>` (imported in Task 3; for now render a placeholder `<h1>Store</h1>` so this task is testable); `*` → `<Navigate to="/" replace />`.
  - `LandingPage` (default export): props `{ copiedButtons, feedback, onCopy }`; renders HeroSection/IntroSection/journalSections/JoinSection and owns the IntersectionObserver + `data-active-section` effect (moved from today's App). Sections render exactly as today.

- [ ] **Step 1: Install react-router-dom**

```bash
cd /home/jlo/dev/azothmc-web && npm install react-router-dom@7.18.2 --save-exact
```

Expected: added to `dependencies` as `"react-router-dom": "7.18.2"`.

- [ ] **Step 2: Write `src/LandingPage.jsx`** — move the landing render + observer effect out of today's App. Content: imports `useEffect`; props `copiedButtons`, `feedback`, `onCopy`; the IntersectionObserver effect verbatim from current `App.jsx`; render block verbatim (HeroSection, IntroSection, `journalSections.map(JournalSection)`, JoinSection) with the copy props threaded.

- [ ] **Step 3: Rewrite `src/App.jsx`** — router shell. Keep the copy-state hooks and `data-last-copied-ip` effect from today's file; add `BrowserRouter`-less structure (router lives in `main.jsx`), so `App` uses `Routes`/`Route`/`Navigate` from `react-router-dom`. Render `<SiteHeader>`/`<SiteFooter>` once around `<main id="main">`. `/` route renders `<LandingPage copiedButtons={copiedButtons} feedback={feedback} onCopy={handleCopy} />`; `/store` renders a temporary `<h1 data-testid="store-placeholder">Store</h1>`; `*` → `<Navigate to="/" replace />`.

- [ ] **Step 4: Wrap with router in `src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 5: Run existing landing suite (regression gate)**

```bash
cd /home/jlo/dev/azothmc-web && npx playwright test --project=chromium tests/landing.spec.ts
```

Expected: all 4 landing tests PASS (nav copy/play, hero paint, copy-IP, no errors). If the nav test asserts an exact set that changes later (Task 4), Task 4 updates it.

- [ ] **Step 6: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/main.jsx src/App.jsx src/LandingPage.jsx package.json package-lock.json && git commit -m "feat: add client routing shell for webstore"
```

---

### Task 2: Store config + static catalog (placeholder)

**Files:**
- Create: `src/store/config.js`
- Create: `src/store/catalog.js`

**Interfaces:**
- Produces:
  - `export const STORE_ORIGIN = 'https://store.azothmc.com';` and `export function packageUrl(slug) { return \`${STORE_ORIGIN}/package/${slug}\`; }` in `config.js`.
  - `storeCategories`: array of `{ id, label }` — `all/All`, `rank/Ranks`, `crate/Crates`, `cosmetic/Cosmetics`, `coin/Coins`, `bundle/Bundles`.
  - `storePackages`: array of `{ slug, name, category, price, description, perks: string[], featured? }` (NO `buyUrl` field — the grid calls `packageUrl(slug)`). Category values reference `storeCategories[].id` exactly.
  - `validateCatalog()`: dev-only; throws on unknown category or slug with non `[a-z0-9-]` chars.

- [ ] **Step 1: Write `src/store/config.js`** with `STORE_ORIGIN` and `packageUrl` exactly as above.

- [ ] **Step 2: Write `src/store/catalog.js`** — 12 placeholder packages (display-only pricing; Tebex panel is authority). Categories: 4 ranks, 2 crates, 2 cosmetics, 2 coin packs, 2 bundles. Ship these exact entries (perks illustrative):

```js
import { packageUrl } from './config.js';

export const storeCategories = [
  { id: 'all', label: 'All' },
  { id: 'rank', label: 'Ranks' },
  { id: 'crate', label: 'Crates' },
  { id: 'cosmetic', label: 'Cosmetics' },
  { id: 'coin', label: 'Coins' },
  { id: 'bundle', label: 'Bundles' },
];

export const storePackages = [
  { slug: 'adventurer-rank', name: 'Adventurer Rank', category: 'rank', price: 9.99, description: 'Step into Azoth with a head start.', perks: ['/kit adventurer', '+2 homes', 'Access: /sethome'], featured: true },
  { slug: 'ember-knight-rank', name: 'Ember Knight Rank', category: 'rank', price: 19.99, description: 'March with the Ember Guard of the frontier.', perks: ['/kit ember-knight', '+5 homes', 'Access: /hat, /workbench'], featured: true },
  { slug: 'arcane-scholar-rank', name: 'Arcane Scholar Rank', category: 'rank', price: 29.99, description: 'Unlock forgotten tomes and crafting stations.', perks: ['/kit arcane-scholar', '+8 homes', 'Access: /anvil, /grindstone', 'Scholar chat tag'] },
  { slug: 'sovereign-rank', name: 'Sovereign Rank', category: 'rank', price: 49.99, description: 'Rule the provinces. The pinnacle of Azoth.', perks: ['/kit sovereign', 'Unlimited homes', 'Access: /enderchest, /nick', 'Sovereign chat tag'], featured: true },
  { slug: 'relic-crate', name: 'Relic Crate', category: 'crate', price: 4.99, description: 'A weathered chest of lost artifacts.', perks: ['1x Relic Crate key', 'Common-to-rare loot'] },
  { slug: 'vault-crate', name: 'Vault Crate', category: 'crate', price: 9.99, description: 'Sealed vaults holding legendary gear.', perks: ['1x Vault Crate key', 'Rare-to-legendary loot'] },
  { slug: 'familiar-whisper', name: 'Familiar Whisper', category: 'cosmetic', price: 6.99, description: 'A spectral fox that trails your steps.', perks: ['Cosmetic pet: Spectral Fox'] },
  { slug: 'rune-trail', name: 'Rune Trail', category: 'cosmetic', price: 3.99, description: 'Leave a trail of glowing runes.', perks: ['Particle effect: Rune Trail'] },
  { slug: 'emerald-pouch-500', name: 'Emerald Pouch (500)', category: 'coin', price: 5.0, description: '500 emeralds for the player-driven trade market.', perks: ['+500 emeralds in-game'] },
  { slug: 'emerald-pouch-1200', name: 'Emerald Pouch (1200)', category: 'coin', price: 10.0, description: '1200 emeralds. Best value per emerald.', perks: ['+1200 emeralds in-game'] },
  { slug: 'starter-bundle', name: 'Starter Bundle', category: 'bundle', price: 14.99, description: 'Everything a new adventurer needs.', perks: ['Adventurer Rank', 'Relic Crate key x2', 'Familiar Whisper'], featured: true },
  { slug: 'raid-bundle', name: 'Raid Bundle', category: 'bundle', price: 24.99, description: 'Gear up your guild for endgame raids.', perks: ['Vault Crate key x3', 'Emerald Pouch (500)', 'Rune Trail'] },
];
```

- [ ] **Step 3: Add `validateCatalog`** to `catalog.js` — `validateCatalog()` throws when: a package `category` isn't in `storeCategories`, or a `slug` matches `/[^a-z0-9-]/`. Call it at module load (top-level) so a bad catalog fails fast in dev/build.

- [ ] **Step 4: Smoke-check module shape**

```bash
cd /home/jlo/dev/azothmc-web && node -e "import('./src/store/catalog.js').then(m => { m.validateCatalog(); console.log(m.storePackages.length, 'packages', m.storeCategories.map(c=>c.id).join(',') ); })"
```

Expected: `12 packages all,rank,crate,cosmetic,coin,bundle` and no throw.

- [ ] **Step 5: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/store/config.js src/store/catalog.js && git commit -m "feat: add webstore config and static catalog"
```

---

### Task 3: StoreApp + store components (failing spec first)

**Files:**
- Create: `src/store/StoreApp.jsx`
- Create: `src/store/components/StoreHero.jsx`
- Create: `src/store/components/CategoryTabs.jsx`
- Create: `src/store/components/SearchField.jsx`
- Create: `src/store/components/ProductGrid.jsx`
- Create: `src/store/components/DeliveryNote.jsx`
- Create: `tests/store.spec.ts`
- Modify: `src/App.jsx` (swap placeholder for real `<StoreApp/>`)

**Interfaces:**
- Consumes: `storeCategories`, `storePackages`, `validateCatalog` (Task 2); `packageUrl`; `SiteHeader`/`SiteFooter` already rendered by App.
- Produces:
  - `StoreApp` (default export): owns `search` + `category` state mirrored to URL search params (`?category=…&q=…`) via the `useSearchParams` hook. Filters `storePackages` (client-side, AND). Renders: `<StoreHero/>`, `<CategoryTabs value={category} onChange={setCategory}/>`, `<SearchField value={search} onChange={setSearch}/>`, `<ProductGrid packages={filtered}/>`, `<DeliveryNote/>`. Sets `document.title = 'Store | AzothMC'` on mount (restoring the prior title on unmount).
  - Component testids (asserted by the spec): `store-hero`, `store-tabs` (buttons `data-category`), `store-search` (input), `store-grid` (cards `data-testid="product-card"`, Buy link `data-testid="product-buy"` with `data-slug`), `store-empty` (empty state), `delivery-note`. Store page sections use `<section data-testid>` (no `id` needed).

- [ ] **Step 1: Write the failing spec `tests/store.spec.ts`**

```ts
import { test, expect, type Page } from '@playwright/test';

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('AzothMC webstore', () => {
  test('loads with catalog, zero page errors', async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Store.*AzothMC|AzothMC.*Store/i);
    await expect(page.getByTestId('store-hero')).toBeVisible();
    await expect(page.getByTestId('store-tabs')).toBeVisible();
    await expect(page.getByTestId('store-grid')).toBeVisible();
    await expect(page.getByTestId('product-card').first()).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(12);
    expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('category tabs filter the grid and update the URL', async ({ page }) => {
    await page.goto('/store');
    await page.getByTestId('store-tabs').getByRole('button', { name: /Ranks/i }).click();
    await expect(page).toHaveURL(/category=rank/);
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(4);
    await expect(page.getByTestId('store-tabs').getByRole('button', { name: /All/i })).toHaveAttribute('aria-pressed', 'false');
    await page.getByTestId('store-tabs').getByRole('button', { name: /All/i }).click();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(12);
  });

  test('search filters the grid and updates the URL', async ({ page }) => {
    await page.goto('/store');
    await page.getByTestId('store-search').fill('ember');
    await expect(page).toHaveURL(/q=ember/);
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1);
    await expect(page.getByTestId('product-card')).toContainText(/Ember Knight Rank/i);
  });

  test('search with no matches shows empty state', async ({ page }) => {
    await page.goto('/store');
    await page.getByTestId('store-search').fill('zzzzzz');
    await expect(page.getByTestId('store-empty')).toBeVisible();
  });

  test('every buy link is a secretless package deep link in a new tab', async ({ page }) => {
    await page.goto('/store');
    const links = page.getByTestId('product-buy');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const href = (await link.getAttribute('href')) ?? '';
      expect(href).toMatch(/^https:\/\/store\.azothmc\.com\/package\/[a-z0-9-]+$/);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = (await link.getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
    const html = await page.content();
    expect(html).not.toContain('plugin.tebex.io');
    expect(html).not.toContain('X-Tebex-Secret');
  });

  test('delivery note explains delivery without claiming success', async ({ page }) => {
    await page.goto('/store');
    const note = page.getByTestId('delivery-note');
    await expect(note).toBeVisible();
    await expect(note).toContainText(/1-2 min/i);
    await expect(note).toContainText(/offline/i);
    await expect(note).not.toContainText(/order success|payment success|your order has been|order complete/i);
  });
});
```

- [ ] **Step 2: Run spec — expect FAIL on store route**

```bash
cd /home/jlo/dev/azothmc-web && npx playwright test --project=chromium tests/store.spec.ts
```

Expected: FAIL (Task 1 placeholder renders, so `store-hero`/`product-card` missing; title mismatch). This is the red test.

- [ ] **Step 3: Write `src/store/components/StoreHero.jsx`** — `<section className="store-hero" data-testid="store-hero">` with an `h1` "AzothMC Store", subtitle ("Support the realm. Unlock perks, ranks, and treasures in-game."), and a link to `#delivery-note` ("How delivery works").

- [ ] **Step 4: Write `src/store/components/CategoryTabs.jsx`** — props `{ categories, value, onChange }`, renders `<nav className="store-tabs" data-testid="store-tabs" aria-label="Filter by category">` of buttons (type="button", `data-category={id}`, `aria-pressed={value===id}`, onClick → `onChange(id)`), labels from `categories[].label`.

- [ ] **Step 5: Write `src/store/components/SearchField.jsx`** — props `{ value, onChange }`; `<input className="store-search" data-testid="store-search" type="search" aria-label="Search packages" placeholder="Search packages…" value={value} onChange={(e) => onChange(e.target.value)} />`.

- [ ] **Step 6: Write `src/store/components/ProductGrid.jsx`** — props `{ packages, categories }`; if empty → `<p className="store-empty" data-testid="store-empty">No perks match. Try a different search or category.</p>`; else `<ul className="store-grid" data-testid="store-grid">` of `<li className="store-card{featured ? ' is-featured' : ''}" data-testid="product-card" data-category={pkg.category} key={pkg.slug}>` with: `<h2>{name}</h2>`, price line `$${price.toFixed(2)}` (display only), description `<p>`, perks `<ul>` (map `perks`), Buy link `<a className="store-buy" data-testid="product-buy" data-slug={pkg.slug} href={packageUrl(pkg.slug)} target="_blank" rel="noopener noreferrer">Buy</a>`, and a "Featured" chip when `featured`. Card category label shown from `categories`.

- [ ] **Step 7: Write `src/store/components/DeliveryNote.jsx`** — `<section className="delivery-note" id="delivery-note" data-testid="delivery-note">` with heading "How delivery works" and ordered list: (1) "Head to Tebex, our secure checkout partner, and enter your Minecraft username." (2) "Complete payment — Tebex processes it securely." (3) "Your perks are delivered in-game within about 1-2 minutes, even if you're offline." (4) "Already linked your account? Purchases go to your linked name." Footer line: "Payments processed by Tebex (Merchant of Record). Support via Discord." Contains no success-claim words (per spec regex).

- [ ] **Step 8: Write `src/store/StoreApp.jsx`** — compose the above; `useSearchParams`-driven state:

```jsx
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storeCategories, storePackages, validateCatalog } from './catalog.js';
import { StoreHero } from './components/StoreHero.jsx';
import { CategoryTabs } from './components/CategoryTabs.jsx';
import { SearchField } from './components/SearchField.jsx';
import { ProductGrid } from './components/ProductGrid.jsx';
import { DeliveryNote } from './components/DeliveryNote.jsx';

validateCatalog();

export default function StoreApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'all';
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  useEffect(() => {
    const previous = document.title;
    document.title = 'Store | AzothMC';
    return () => { document.title = previous; };
  }, []);

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'all') next.delete('category'); else next.set('category', id);
    setSearchParams(next);
  };

  const setQuery = (q) => {
    const next = new URLSearchParams(searchParams);
    if (q) next.set('q', q); else next.delete('q');
    setSearchParams(next);
  };

  const filtered = useMemo(() => storePackages.filter((pkg) =>
    (category === 'all' || pkg.category === category) &&
    (!query || `${pkg.name} ${pkg.description} ${pkg.perks.join(' ')}`.toLowerCase().includes(query))
  ), [category, query]);

  return (
    <div className="store-page">
      <StoreHero />
      <CategoryTabs categories={storeCategories} value={category} onChange={setCategory} />
      <SearchField value={query} onChange={setQuery} />
      <ProductGrid packages={filtered} categories={storeCategories} />
      <DeliveryNote />
    </div>
  );
}
```

- [ ] **Step 9: Wire real store in `src/App.jsx`** — replace the `/store` placeholder with `<StoreApp />` (import at top).

- [ ] **Step 10: Run store spec — expect PASS**

```bash
cd /home/jlo/dev/azothmc-web && npx playwright test --project=chromium tests/store.spec.ts
```

Expected: all 6 store tests PASS.

- [ ] **Step 11: Run landing regression**

```bash
cd /home/jlo/dev/azothmc-web && npx playwright test --project=chromium tests/landing.spec.ts
```

Expected: all 4 landing tests PASS.

- [ ] **Step 12: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/store tests/store.spec.ts src/App.jsx && git commit -m "feat: add webstore page with catalog, filters, and secretless buy links"
```

---

### Task 4: Store styling in the shared design system

**Files:**
- Modify: `styles.css` (append `/* Store */` block at end)

**Global constraint:** reuse `--ink-*`, `--paper-*`, `--accent`, `--mint`, `--orange`, `--radius`, `--mono`, `--shadow-small`, `--ease` — no new palette.

- [ ] **Step 1: Append store styles** — scoped under `.store-page`:

```css
/* Store */
.store-page { width: min(100%, 1200px); margin: 0 auto; padding: clamp(24px, 5vw, 64px) clamp(16px, 4vw, 56px) 40px; }
.store-hero { padding: clamp(24px, 5vw, 56px) 0 40px; }
.store-hero h1 { margin: 0 0 10px; font-size: clamp(2rem, 5vw, 3.4rem); letter-spacing: 0.02em; }
.store-hero p { max-width: 60ch; color: var(--muted); font-size: 1.05rem; }
.store-hero a { color: var(--accent); border-bottom: 1px solid rgba(216, 242, 107, 0.4); }
.store-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 18px; }
.store-tabs button { padding: 8px 14px; border: 1px solid rgba(216, 242, 107, 0.24); border-radius: var(--radius); color: var(--muted); background: rgba(21, 50, 56, 0.5); font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.08em; cursor: pointer; transition: color var(--ease), border-color var(--ease), background var(--ease); }
.store-tabs button:hover { color: var(--white); border-color: rgba(216, 242, 107, 0.5); }
.store-tabs button[aria-pressed="true"] { color: var(--ink-950); border-color: var(--accent); background: var(--accent); }
.store-search { width: 100%; max-width: 420px; margin-bottom: 26px; padding: 11px 14px; border: 1px solid rgba(216, 242, 107, 0.24); border-radius: var(--radius); color: var(--white); background: rgba(21, 50, 56, 0.5); font: inherit; }
.store-search:focus { outline: 2px solid var(--accent); outline-offset: 2px; }
.store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 18px; list-style: none; margin: 0; padding: 0; }
.store-card { position: relative; display: flex; flex-direction: column; gap: 10px; padding: 20px; border: 1px solid rgba(222, 240, 221, 0.16); border-radius: calc(var(--radius) * 2); background: linear-gradient(160deg, rgba(16, 39, 43, 0.85), rgba(7, 19, 22, 0.9)); box-shadow: var(--shadow-small); }
.store-card.is-featured { border-color: rgba(216, 242, 107, 0.55); }
.store-card .store-featured-chip { position: absolute; top: 12px; right: 12px; padding: 3px 8px; border: 1px solid rgba(243, 176, 100, 0.6); border-radius: 999px; color: var(--orange); font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.1em; }
.store-card h2 { margin: 0; font-size: 1.18rem; }
.store-card .store-price { color: var(--accent); font-family: var(--mono); font-size: 1.05rem; }
.store-card .store-desc { margin: 0; color: var(--muted); font-size: 0.92rem; }
.store-card .store-perks { margin: 6px 0 0; padding-left: 18px; color: var(--paper-deep); font-size: 0.87rem; }
.store-card .store-perks li { margin: 3px 0; }
.store-buy { margin-top: auto; display: block; text-align: center; padding: 10px 16px; border-radius: var(--radius); color: var(--ink-950); background: var(--accent); font-weight: 700; transition: background var(--ease); }
.store-buy:hover { background: #e5f98e; }
.store-buy:focus-visible { outline: 2px solid var(--white); outline-offset: 2px; }
.store-empty { padding: 40px 20px; border: 1px dashed rgba(222, 240, 221, 0.24); border-radius: calc(var(--radius) * 2); color: var(--muted); text-align: center; }
.delivery-note { margin-top: 48px; padding: 26px; border: 1px solid rgba(131, 212, 192, 0.3); border-radius: calc(var(--radius) * 2); background: rgba(16, 39, 43, 0.6); }
.delivery-note h2 { margin: 0 0 12px; font-size: 1.2rem; }
.delivery-note ol { margin: 0 0 8px; padding-left: 20px; color: var(--paper-deep); }
.delivery-note li { margin: 6px 0; }
.delivery-note .delivery-foot { color: var(--muted); font-size: 0.85rem; }
@media (max-width: 640px) { .store-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: Verify visual + no regressions**

```bash
cd /home/jlo/dev/azothmc-web && npx playwright test --project=chromium
```

Expected: all store + landing tests PASS (full suite). Take a screenshot of `/store` (dev server on 4173) and confirm the design language matches the landing page.

- [ ] **Step 3: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add styles.css && git commit -m "style: add webstore styles to the shared design system"
```

---

### Task 5: Store nav tab + landing nav regression

**Files:**
- Modify: `src/content.js` (navItems)
- Modify: `src/components/SiteHeader.jsx`
- Modify: `styles.css` (nav active rule)

**Interfaces:**
- Consumes: react-router `NavLink` (added in Task 1); existing `navItems` shape.
- Produces: store tab in the primary nav, active via `aria-current="page"` on the `/store` route.

- [ ] **Step 1: Add store entry to `navItems`** in `src/content.js` (keep anchors intact):

```js
  { to: '/store', section: 'store', index: 'SHOP', label: 'Store', ariaLabel: 'Store' },
```

Append after the existing join item (or before it — after keeps the Join CTA last).

- [ ] **Step 2: Render route links in `SiteHeader`** — import `NavLink` from `react-router-dom`; in the `navItems.map`, branch:

```jsx
{navItems.map((item) =>
  item.to ? (
    <NavLink
      key={item.section}
      to={item.to}
      className={`nav-tab${activeSection === item.section ? ' is-active' : ''}`}
      aria-label={item.ariaLabel}
    >
      <span className="nav-tab-face">
        <span className="nav-tab-index">{item.index}</span>
        <span className="nav-tab-label">{item.label}</span>
      </span>
    </NavLink>
  ) : (
    <a key={item.section} href={item.href} className={…existing…} data-section={item.section} aria-label={item.ariaLabel}>
      …
    </a>
  )
)}
```

Keep the existing anchor JSX byte-for-byte for non-route items (no `data-section` on the route item; NavLink supplies `aria-current="page"` when active).

- [ ] **Step 3: Add active-style CSS for the store tab** (append to the nav block in `styles.css`):

```css
.nav-tab[aria-current="page"] .nav-tab-face { color: var(--white); border-color: rgba(216, 242, 107, 0.2); background: rgba(216, 242, 107, 0.07); }
.nav-tab[aria-current="page"]::after { opacity: 1; transform: scaleX(1); }
```

- [ ] **Step 4: Add a nav test to `tests/store.spec.ts`** — click the nav Store link from the landing page and assert the route:

```ts
test('header nav link navigates to the store', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('site-nav').getByRole('link', { name: /Store/i }).click();
  await expect(page).toHaveURL(/\/store/);
  await expect(page.getByTestId('store-hero')).toBeVisible();
});
```

- [ ] **Step 5: Run full suite**

```bash
cd /home/jlo/dev/azothmc-web && npx playwright test --project=chromium
```

Expected: ALL tests pass (landing 4 + store 7). If any landing nav assertion enumerated exact items (it does not today — it checks by name), update it.

- [ ] **Step 6: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/content.js src/components/SiteHeader.jsx styles.css tests/store.spec.ts && git commit -m "feat: add Store tab to primary nav"
```

---

### Task 6: Final verification + secret audit + ops note

**Files:**
- Create: `README.webshop.md` (ops note — explicitly requested config: SPA rewrite + Tebex custom domain; states this repo contains no secrets)

- [ ] **Step 1: Run build**

```bash
cd /home/jlo/dev/azothmc-web && npm run build
```

Expected: `vite build` succeeds, `dist/` produced.

- [ ] **Step 2: Preview + deep-link refresh check**

```bash
cd /home/jlo/dev/azothmc-web && npx vite preview --host 127.0.0.1 --port 4173 &
```

Then in the browser: open `http://127.0.0.1:4173/store` directly (deep link), refresh on `/store`, and confirm no 404 and the store renders (vite preview SPA-fallback). Kill the preview server after.

- [ ] **Step 3: Secret audit** — grep the repo for any forbidden patterns (expect NO matches):

```bash
cd /home/jlo/dev/azothmc-web && npx grep -riE "X-Tebex-Secret|plugin\.tebex\.io|api_key|apiKey|secret" src tests index.html 2>/dev/null || echo "CLEAN: no secrets or secret API surface"
```

Expected: `CLEAN`. (Legitimate non-secret uses: nothing — the word "secret" should not appear in `src/`.)

- [ ] **Step 4: Write `README.webshop.md`** — 5-10 lines: what the store is; where the catalog lives (`src/store/catalog.js`); the single config constant (`src/store/config.js` `STORE_ORIGIN`); the one hosting requirement ("rewrite `/store` and all client routes to `index.html` (SPA fallback) — e.g. `/* -> /index.html` except `/assets/*`"); Tebex custom domain `store.azothmc.com` (DNS CNAME + Tebex Plus); delivery note (official Tebex plugin, poll every 1-2 min, offline-safe); explicit line: "This repo contains no payment secrets. The Tebex plugin secret is configured server-side only."

- [ ] **Step 5: Full suite + commit**

```bash
cd /home/jlo/dev/azothmc-web && npx playwright test --project=chromium
```

Expected: all green. Then:

```bash
cd /home/jlo/dev/azothmc-web && git add README.webshop.md && git commit -m "docs: add webstore ops and config note"
```

---

## Self-Review

**Spec coverage:**
- §3 architecture (routes, components, catalog, no-cart/no-secret) → Tasks 1-5 ✓ job
- §4 data model (`storeCategories`/`storePackages`, `STORE_ORIGIN` origin constant) → Task 2 ✓
- §5 behavior (tabs, search AND, URL query, empty state, delivery note copy, mobile) → Tasks 3-4 ✓
- §6 error handling (empty state, dev catalog invariant, no fetch wrapper) → Tasks 2-3 ✓
- §7 testing (store spec: load, filters, search, secretless links, delivery note; landing regression) → Tasks 3, 5 ✓
- §8 a11y (aria-pressed, aria-label search, ul/li grid, focus styles, featured chip text) → Tasks 3-4 ✓
- §9 ops (SPA rewrite + custom domain, no secrets) → Task 6 README ✓
- §10 open items (placeholder catalog, Store nav item SHOP, router v7) → Tasks 2, 5, 1 ✓
- §12 acceptance (build passes, store spec + landing pass, no secrets audit, ops step documented) → Task 6 ✓

**Placeholder scan:** no TBD/TODO; every code step has full code; every run step has exact command + expected output. Catalog "placeholder" is the approved intentional content, not an unfinished step.

**Type consistency:** `packageUrl(slug)` (Task 2) used in ProductGrid (Task 3) ✓; `storeCategories[].id` values `all|rank|crate|cosmetic|coin|bundle` consistent across catalog, tabs, tests, and CSS ✓; testids (`store-hero`, `store-tabs`, `store-search`, `store-grid`, `product-card`, `product-buy`, `store-empty`, `delivery-note`) match between components (Task 3) and tests (Tasks 3, 5) ✓; `data-category` on cards asserted with `/category=rank/` URL in the tab test ✓ (category `rank` yields `?category=rank`).
