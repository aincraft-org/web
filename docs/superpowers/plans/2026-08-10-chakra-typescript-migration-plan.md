# AzothMC Chakra UI + TypeScript 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert every component in `azothmc-web` to idiomatic Chakra UI v3 and migrate the app to TypeScript 7, keeping all 18 existing Playwright tests green.

**Architecture:** Chakra v3 uses `createSystem(defaultConfig, …)` → `<ChakraProvider value={system}>`. Theme and global styles live in `src/theme/`. Data modules become typed `.ts`, components typed `.tsx`, with Chakra defaults leading (AzothMC tokens as accent). `styles.css` is removed incrementally behind screenshot checks. Vite 8 + TS 7 compile via `@vitejs/plugin-react`; a real `typecheck` script (`tsc --noEmit`) is added and gated into `npm run build`.

**Tech Stack:** Vite 8, React 19, react-router-dom 7.18.2, `@chakra-ui/react@3.36.1`, `@emotion/react`/`@emotion/styled` (Chakra v3 peers), `typescript@7.0.2`, `@types/react@19.2.18`, `@types/react-dom`, `@types/node`, `react-markdown@10.1.0`. No framer-motion (verified: not a peer of 3.36.1).

## Global Constraints

- Root: `/home/jlo/dev/azothmc-web` (commit only files under `azothmc-web/`).
- Pin exact: `@chakra-ui/react@3.36.1`, `typescript@7.0.2`, `@types/react@19.2.18`, `react-markdown@10.1.0`.
- **Direction approved: Idiomatic Chakra (B).** Chakra defaults lead; AzothMC tokens accent. Pages look Chakra-native — spacing, focus, buttons, tabs, inputs. Do NOT chase pixel parity; preserve brand feel via tokens.
- Chakra v3 setup: `createSystem(defaultConfig, …)` and `<ChakraProvider value={system}>` — NOT v2 `extendTheme`.
- **Zero app-source leftovers:** after migration, `git ls-files 'src/**/*.js' 'src/**/*.jsx'` must return NOTHING (all `src/` is `.ts`/`.tsx`). Verify per-task with `git ls-files src | grep -E '\.(js|jsx)$' || echo "no js leftovers"`.
- Remove `styles.css` incrementally: first move global `body` bg/fonts + keyframes into the system global styles; then remove rule groups only after a screenshot of `/`, `/store`, `/news` confirms the page still renders correctly (Chakra look expected; nothing broken/missing).
- Preserve all `data-testid`s, copy, routes, `document.title` per route, `data-section`/`data-active-section` nav attributes, the `activeSection` header prop contract, copy-IP behavior, and URL-param store behavior. Existing Playwright tests are the contract.
- `tsconfig.json`: `strict`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `noEmit`, `types: ["vite/client"]`, `skipLibCheck`. Add `"typecheck": "tsc --noEmit"` script and include it in `build` (`tsc --noEmit && vite build`).
- Command after each migration phase: `npm run build && npm test` (build runs typecheck first). Tests stay on Playwright's own toolchain; config boots its own Vite on 4173 — do not leave a manual server on 4173 while testing.

## Task Inventory (complete file list — every `src` file migrates)

| Current | Becomes |
|---|---|
| `src/main.jsx` | `src/main.tsx` |
| `src/App.jsx` | `src/App.tsx` |
| `src/LandingPage.jsx` | `src/LandingPage.tsx` |
| `src/content.js` | `src/content.ts` |
| `src/clipboard.js` | `src/clipboard.ts` |
| `src/components/SiteHeader.jsx` | `SiteHeader.tsx` |
| `src/components/SiteFooter.jsx` | `SiteFooter.tsx` |
| `src/components/HeroSection.jsx` | `HeroSection.tsx` |
| `src/components/IntroSection.jsx` | `IntroSection.tsx` |
| `src/components/JournalSection.jsx` | `JournalSection.tsx` |
| `src/components/JoinSection.jsx` | `JoinSection.tsx` |
| `src/components/CopyIcon.jsx` | `CopyIcon.tsx` |
| `src/components/CopyIpButton.jsx` | `CopyIpButton.tsx` |
| `src/store/StoreApp.jsx` | `StoreApp.tsx` |
| `src/store/catalog.js` | `catalog.ts` |
| `src/store/config.js` | `config.ts` |
| `src/store/components/StoreHero.jsx` | `StoreHero.tsx` |
| `src/store/components/CategoryTabs.jsx` | `CategoryTabs.tsx` |
| `src/store/components/SearchField.jsx` | `SearchField.tsx` |
| `src/store/components/ProductGrid.jsx` | `ProductGrid.tsx` |
| `src/store/components/DeliveryNote.jsx` | `DeliveryNote.tsx` |
| `src/news/NewsIndex.jsx` | `NewsIndex.tsx` |
| `src/news/NewsArticle.jsx` | `NewsArticle.tsx` |
| `src/news/content.js` | `content.ts` |
| `src/news/frontmatter.js` | `frontmatter.ts` |
| `src/news/components/NewsHero.jsx` | `NewsHero.tsx` |
| `src/news/components/NewsPostList.jsx` | `NewsPostList.tsx` |
| `src/news/components/ArticleBody.jsx` | `ArticleBody.tsx` |
| `src/theme/` (new) | `index.ts`, `tokens.ts` |
| `styles.css` | deleted (incremental) |
| `src/news/posts/*.md` | unchanged (content) |
| `tests/*.spec.ts` | unchanged (contract) |

---

### Task 1: Dependencies + tsconfig + typecheck gate

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`

**Interfaces:**
- Produces: scripts `"typecheck": "tsc --noEmit"` and `"build": "tsc --noEmit && vite build"`; `tsconfig.json` covers `src`.

- [ ] **Step 1: Install dependencies (pin exact)**

```bash
cd /home/jlo/dev/azothmc-web && npm install @chakra-ui/react@3.36.1 @emotion/react @emotion/styled --save-exact && npm install -D typescript@7.0.2 @types/react@19.2.18 @types/react-dom @types/node --save-exact
```

Expected: `dependencies` gains `@chakra-ui/react@3.36.1`, `@emotion/react`, `@emotion/styled`; `devDependencies` gains `typescript@7.0.2`, `@types/react@19.2.18`, `@types/react-dom`, `@types/node`.

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Update scripts in `package.json`**

```json
"typecheck": "tsc --noEmit",
"build": "tsc --noEmit && vite build",
```

- [ ] **Step 4: Gate-verify**

```bash
cd /home/jlo/dev/azothmc-web && npm run build
```

Expected: `tsc --noEmit` passes (skips `.jsx` with `allowJs` unset), Vite build passes.

- [ ] **Step 5: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add package.json package-lock.json tsconfig.json && git commit -m "chore: add Chakra UI and TypeScript 7 toolchain"
```

---

### Task 2: Chakra v3 system + theme + provider

**Files:**
- Create: `src/theme/index.ts`, `src/theme/tokens.ts`
- Modify: `src/main.jsx` → `src/main.tsx`, `src/App.jsx` → `src/App.tsx`

**Interfaces:**
- Produces: `export const system = createSystem(defaultConfig, custom)` from `src/theme/index.ts`; `main.tsx` renders `<ChakraProvider value={system}><BrowserRouter><App/></BrowserRouter></ChakraProvider>`; `tokens.ts` exports AzothMC tokens (ink/paper/accent/mint/orange, fonts, radii, shadows).

- [ ] **Step 1: Write `src/theme/tokens.ts`**

```ts
export const ink = { 950: '#071316', 900: '#0b1d22', 850: '#10272b', 800: '#153238', 700: '#1d494b' };
export const paper = { DEFAULT: '#eee9d8', bright: '#fbf9f0', deep: '#d7ceb7', ink: '#162a2d', muted: '#607372' };
export const accent = { 400: '#d8f26b', strong: '#a9d83f' };
export const mint = '#83d4c0';
export const orange = '#f3b064';
export const fonts = { body: '"Space Grotesk", system-ui, sans-serif', mono: '"DM Mono", monospace' };
export const radii = { md: '4px', lg: '8px' };
export const shadows = { md: '0 10px 30px rgba(0,0,0,0.22)', lg: '0 24px 70px rgba(0,0,0,0.3)' };
```

- [ ] **Step 2: Write `src/theme/index.ts`**

```ts
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { accent, fonts, ink, mint, orange, paper, radii, shadows } from './tokens';

const custom = defineConfig({
  theme: {
    tokens: {
      colors: {
        ink: { 500: ink[700], 600: ink[800], 700: ink[850], 800: ink[900], 900: ink[950] },
        paper: { ...paper },
        accent: { ...accent },
        mint: { 400: mint },
        orange: { 400: orange },
      },
      fonts: { body: fonts.body, heading: fonts.body, mono: fonts.mono },
      radii: { md: radii.md, lg: radii.lg },
      shadows: { md: shadows.md, lg: shadows.lg },
    },
    globalCss: {
      body: { bg: ink[950], color: '#f5f7ee', fontFamily: fonts.body },
    },
  },
});

export const system = createSystem(defaultConfig, custom);
```

- [ ] **Step 3: Rename entry + shell to TSX** — `src/main.jsx` → `src/main.tsx`, `src/App.jsx` → `src/App.tsx`. `main.tsx` uses `document.getElementById('root')!` and wraps with `<ChakraProvider value={system}>`. `App.tsx` keeps the exact same routes/JSX/logic, TSX syntax.

- [ ] **Step 4: Build + visual smoke**

```bash
cd /home/jlo/dev/azothmc-web && npm run build
```

Expected: build passes; `/`, `/store`, `/news` render with the ink background + matching fonts. Screenshot all three as baseline (`/tmp/chakra-baseline-{home,store,news}.png`).

- [ ] **Step 5: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/theme src/main.tsx src/App.tsx && git rm src/main.jsx src/App.jsx && git commit -m "feat: add Chakra v3 system and provider, TS entry"
```

---

### Task 3: Type the data modules

**Files:**
- Rename: `src/content.js` → `src/content.ts`, `src/clipboard.js` → `src/clipboard.ts`, `src/store/config.js` → `src/store/config.ts`, `src/store/catalog.js` → `src/store/catalog.ts`, `src/news/frontmatter.js` → `src/news/frontmatter.ts`, `src/news/content.js` → `src/news/content.ts`

**Interfaces:**
- Produces exact typed contracts:
  - `content.ts`: `interface NavItem { href?: string; to?: string; section: string; index: string; label: string; ariaLabel: string; isJoin?: boolean }`; `interface JournalSection { id; testId; entry; category; index; kicker; title; background; side: 'left'|'right'; paragraphs: string[]; bullets: string[] }`; `navItems: NavItem[]`, `journalSections: JournalSection[]`, `SERVER_IP: string`.
  - `clipboard.ts`: `export async function copyText(text: string): Promise<boolean>`.
  - `store/config.ts`: `STORE_ORIGIN: string`, `packageUrl(slug: string): string`.
  - `store/catalog.ts`: `type CategoryId = 'all'|'rank'|'crate'|'cosmetic'|'coin'|'bundle'`; `interface StoreCategory { id: CategoryId; label: string }`; `interface StorePackage { slug; name; category: CategoryId; price: number; description: string; perks: string[]; featured?: boolean; buyUrl: string }`; `storeCategories`, `storePackages`, `validateCatalog(): boolean`.
  - `news/frontmatter.ts`: `interface NewsMeta { title; date; summary }`; `parseFrontMatter(raw: string): NewsMeta & { body: string }`.
  - `news/content.ts`: `interface NewsPost { slug; title; date; summary; body }`; `newsPosts: NewsPost[]`, `getPost(slug: string): NewsPost | null` (keeps `import.meta.glob` eager raw import, typed via `vite/client`).

- [ ] **Step 1: Convert each file** — rename, add the interfaces, keep logic identical; `validateCatalog()` still throws on invalid data.

- [ ] **Step 2: Update every importer** — `.jsx`/`.tsx` files import the renamed modules with the codebase's ESM specifiers; no `require`.

- [ ] **Step 3: Build gate + leftover check**

```bash
cd /home/jlo/dev/azothmc-web && npm run build && (git ls-files src | grep -E '\.(js|jsx)$' || echo "no js leftovers")
```

Expected: build green; output `no js leftovers` for the data modules (only component `.jsx` remain, converted in Tasks 4-6).

- [ ] **Step 4: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src && git commit -m "feat: type content, catalog, and news data modules"
```

---

### Task 4: Convert landing components to Chakra TSX

**Files:**
- Convert: `src/components/SiteHeader.tsx`, `SiteFooter.tsx`, `HeroSection.tsx`, `IntroSection.tsx`, `JournalSection.tsx`, `JoinSection.tsx`, `CopyIcon.tsx`, `CopyIpButton.tsx`, `src/LandingPage.tsx`

**Interfaces:**
- Consumes: typed data modules (Task 3); `system` (Task 2); `App.tsx` props (`copiedButtons`, `feedback`, `onCopy`, `setActiveSection`).
- Produces: same exports/props/testids, Chakra-based:
  - `SiteHeader`: `Box`/`Flex`/`HStack`, `NavLink`-wrapped Chakra `Link` for route tabs, Chakra `Button` for copy-IP; preserve `data-testid="site-nav"`, `copy-ip-nav`, `server-ip-nav`, all `aria-label`s, `data-section` on hash tabs, `activeSection` prop, `/#hero` prefix behavior on store/news.
  - `HeroSection`/`IntroSection`/`JournalSection`/`JoinSection`: Chakra `Container`/`Box`/`VStack`/`Stack`/`Heading`/`Text`/`Image`/`List`; keep every `data-testid` (`hero`, `hero-logo`, `hero-tagline`, `hero-cta`, `hero-facts`, `feature-world/loot/quests/endgame`, `join`, `join-title`, `join-steps`, `server-ip-join`, `copy-ip-join`, `copy-feedback-*`).
  - `CopyIpButton`: Chakra `Button` that sets `data-copied` attribute + feedback; exact testids preserved.
  - `LandingPage`: typed props; IntersectionObserver unchanged.

- [ ] **Step 1: Convert `SiteHeader.tsx`** — idiomatic Chakra nav/tabs/buttons; keep all data attributes and the store-route `/#hero` link behavior.

- [ ] **Step 2: Convert the art sections** — Chakra primitives with `sx` for brand details; content/copy unchanged.

- [ ] **Step 3: Convert `CopyIcon` + `CopyIpButton`** to typed Chakra (`Icon`/`Button`).

- [ ] **Step 4: Build + landing suite + leftover check**

```bash
cd /home/jlo/dev/azothmc-web && npm run build && npx playwright test --project=chromium tests/landing.spec.ts && (git ls-files src | grep -E '\.(js|jsx)$' || echo "no js leftovers")
```

Expected: build green, 4 landing tests green; leftover check shows only store/news `.jsx` remain. Screenshot `/`; page renders fully (Chakra look expected).

- [ ] **Step 5: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/components src/LandingPage.tsx && git rm src/components/*.jsx src/LandingPage.jsx && git commit -m "feat: convert landing components to Chakra TSX"
```

---

### Task 5: Convert store components to Chakra TSX

**Files:**
- Convert: `src/store/StoreApp.tsx`, `src/store/components/{StoreHero,CategoryTabs,SearchField,ProductGrid,DeliveryNote}.tsx`

**Interfaces:**
- Consumes: typed catalog/config (Task 3).
- Produces: same testids (`store-hero`, `store-tabs`, `store-search`, `store-grid`, `product-card`, `product-buy`, `store-empty`, `delivery-note`); Chakra `Tabs`/`Button`, `Input`, `SimpleGrid`, `Card`/`Box`, `Badge`, `Link`. Buy links keep exact `href`/`target="_blank"`/`rel="noopener noreferrer"`. `StoreApp` keeps `useSearchParams` typed + `document.title` effect. `CategoryTabs` MUST keep testable `getByRole('button', { name: /Ranks/i })` + `aria-pressed` semantics (existing store tests depend on them) — use Chakra `Button` with `aria-pressed`, not a raw `Tabs` component, unless the `Tabs` primitive exposes the same roles (verify against `tests/store.spec.ts`).

- [ ] **Step 1: Convert `CategoryTabs.tsx`** — Chakra `Button` group with `aria-pressed`; verify the existing store tests' role/aria assertions still pass.

- [ ] **Step 2: Convert `StoreHero`, `SearchField`, `ProductGrid`, `DeliveryNote`, `StoreApp`** to typed Chakra; keep every testid + behavior.

- [ ] **Step 3: Build + store suite + leftover check**

```bash
cd /home/jlo/dev/azothmc-web && npm run build && npx playwright test --project=chromium tests/store.spec.ts && (git ls-files src | grep -E '\.(js|jsx)$' || echo "no js leftovers")
```

Expected: build green, 8 store tests green (if a role changes, update the test minimally and note it — the contract is behavior, not the primitive); leftover check shows only news `.jsx` remain.

- [ ] **Step 4: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/store && git rm src/store/*.jsx src/store/components/*.jsx && git commit -m "feat: convert store components to Chakra TSX"
```

---

### Task 6: Convert news components to Chakra TSX

**Files:**
- Convert: `src/news/NewsIndex.tsx`, `src/news/NewsArticle.tsx`, `src/news/components/{NewsHero,NewsPostList,ArticleBody}.tsx`

**Interfaces:**
- Consumes: typed `newsPosts`/`getPost` (Task 3); `react-markdown` (typed).
- Produces: same testids (`news-hero`, `news-post` + `data-date`, `news-empty`, `news-not-found`, `article-body`); Chakra `Box`/`VStack`/`Heading`/`Text`/`Link`/`List`; `ArticleBody` renders `<ReactMarkdown>` inside a Chakra `Box` with prose styling via `sx`.

- [ ] **Step 1: Convert components** — keep `document.title` effects, router `Link` for post links/back link, not-found state.

- [ ] **Step 2: Build + news suite**

```bash
cd /home/jlo/dev/azothmc-web && npm run build && npx playwright test --project=chromium tests/news.spec.ts && (git ls-files src | grep -E '\.(js|jsx)$' || echo "no js leftovers")
```

Expected: build green, 6 news tests green; leftover check prints `no js leftovers` (all `src/` is `.ts`/`.tsx`).

- [ ] **Step 3: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/news && git rm src/news/*.jsx src/news/components/*.jsx && git commit -m "feat: convert news components to Chakra TSX"
```

---

### Task 7: Remove `styles.css` incrementally (global styles first)

**Files:**
- Modify: `src/main.tsx` (remove `import '../styles.css'` once fully removed)
- Delete: `styles.css` (incrementally via `git rm` after each region verified)

**Constraints:** First move the `:root` tokens + `body` background/fonts + any `@keyframes` into the system globalCss (Task 2 already sets `body` bg/font; add any keyframes used by the hero/etc.). Then remove the `.site-header`, `.hero`, `.feature-intro`, `.journal-section`, `.join`, `.store-*`, `.news-*`, `.article-*` groups one at a time. After each removal, screenshot `/`, `/store`, `/news` and confirm nothing is missing/broken (Chakra look expected). Only delete the file when no group remains.

- [ ] **Step 1: Verify global styles moved** — `body` bg/color/font from `styles.css` present in the system globalCss; any `@keyframes` from the sheet added to the system global css (add now if missing).

- [ ] **Step 2: Remove rule groups one at a time** — for each section group, delete the block from `styles.css`, screenshot all three routes, confirm the page still renders.

- [ ] **Step 3: Final deletion** — remove `import '../styles.css'` from `main.tsx`, `git rm styles.css`. Build + full suite:

```bash
cd /home/jlo/dev/azothmc-web && npm run build && npm test && (git grep -l 'styles.css' || echo "no styles.css references")
```

Expected: build green, all 18 tests green, output `no styles.css references`.

- [ ] **Step 4: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git rm styles.css && git add src/main.tsx && git commit -m "refactor: remove bespoke stylesheet in favor of Chakra system"
```

---

### Task 8: Final verification + type audit + README

**Files:**
- Modify: `README.webshop.md`

- [ ] **Step 1: Type audit + zero-js verification** — strict passes with no `any`/`ts-ignore`, no `.js`/`.jsx` in `src`:

```bash
cd /home/jlo/dev/azothmc-web && npm run build && (grep -rn "any[^A-Za-z]\|@ts-ignore\|@ts-expect-error" src/ || echo "CLEAN: no any/ts-ignore") && (git ls-files src | grep -E '\.(js|jsx)$' || echo "CLEAN: no js/jsx in src")
```

Expected: build green; both `CLEAN` outputs.

- [ ] **Step 2: Full suite**

```bash
cd /home/jlo/dev/azothmc-web && npm test
```

Expected: 18 tests pass (landing 4 + store 8 + news 6).

- [ ] **Step 3: README note** — append:

```md
## Tech

Built with Vite, React 19, react-router, Chakra UI v3, and TypeScript 7.
```

- [ ] **Step 4: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add README.webshop.md && git commit -m "docs: note Chakra and TypeScript in README"
```

---

## Self-Review

**Spec coverage:**
- §3 deps/setup (`createSystem`/`ChakraProvider`, no framer-motion, incremental CSS, typecheck script) → Tasks 1-2, 7 ✓
- §3 TypeScript config/gate (`typecheck` script in `build`) → Task 1 ✓
- §4 typed data contracts → Task 3 ✓
- §5 idiomatic behavior parity (routes, copy, tests, nav attributes, document.title) → Tasks 4-6 ✓
- §7 tests stay green; adjust only for Chakra a11y role changes → Tasks 4-6 ✓
- §8 perf/a11y (tree-shaking, focus, reduced-motion) → Tasks 2, 6 ✓
- §9 CSS/token mapping + incremental removal behind screenshots → Tasks 2, 7 ✓
- §12 acceptance (build green via tsc+Vite, 18 tests, no styles.css, no any/ts-ignore, TS7+Chakra pinned) → Task 8 ✓
- **Zero-leftover inventory** (every `.jsx`/`.js` mapped to `.tsx`/`.ts`, verified per task) → Task Inventory + Tasks 3-6 checks ✓

**Placeholder scan:** no TBD/TODO; every step has full code/commands; conditional steps ("if Chakra Tabs changes roles, update test minimally") are tied to concrete existing store tests — not placeholders.

**Type consistency:** `NavItem`/`JournalSection`/`StorePackage`/`CategoryId`/`NewsPost`/`parseFrontMatter`/`getPost`/`packageUrl` defined once (Task 3) and consumed identically in Tasks 4-6; testids match between components (Tasks 4-6) and specs (unchanged tests); `system`/`createSystem` used consistently (Task 2) and by `main.tsx`; `typecheck` script referenced by `build` and verified per task.
