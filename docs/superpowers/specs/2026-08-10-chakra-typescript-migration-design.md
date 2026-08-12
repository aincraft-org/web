# AzothMC Chakra UI + TypeScript 7 — Design Spec

Date: 2026-08-10
Status: Approved (idiomatic Chakra B, TypeScript 7, Chakra v3)

## 1. Context

`azothmc-web` (Vite + React 19 SPA) has three routes — `/` landing, `/store`, `/news` —
with hand-rolled JSX components and a 1,550-line bespoke stylesheet (`styles.css`,
Midnight Campaign tokens `--ink-*`/`--paper-*`/`--accent`/`--mint`). The user asked to
convert all components to Chakra UI and migrate the app to TypeScript 7.

Verified versions (npm registry, today):
- `@chakra-ui/react@3.36.1` — current v3 major, `react >=18` peer (we run React 19).
- `typescript@7.0.2` — published as `latest` (7.0 is the current major; the old 5.x line is
  legacy). Vite 8 ships TS 7 support via `@vitejs/plugin-react`; the repo already runs `tsc`
  for `tests/**/*.ts` under Playwright.

## 2. Goals / Non-Goals

### Goals
- Every component converted to Chakra UI v3 primitives with a Chakra system, replacing the
  bespoke CSS.
- **Direction: Idiomatic Chakra (B).** Chakra component defaults lead everywhere, with the
  AzothMC tokens (ink/paper/accent/mint/orange) as the brand accent. `styles.css` is removed
  incrementally behind screenshot parity checks so nothing regresses blindly; pages render
  with Chakra-native spacing, focus states, and component styling while staying recognizable
  as AzothMC.
- Migrate the entire app to **TypeScript 7**: `.jsx → .tsx`, `.js → .ts`, full type
  coverage of all props, state, catalog/content data, and the Chakra theme.
- Preserve the existing Midnight Campaign visual identity (dark ink, paper, emerald accent)
  via the Chakra theme, so the pages still look like AzothMC.
- Keep all routes, behavior, and the existing Playwright suites green (landing 4, store 8,
  news 6 = 18 tests) with no contract changes to the public UX.

### Non-Goals (explicitly out of scope)
- Redesigning the visual identity — the theme reproduces current tokens, not new art.
- Introducing a component library beyond Chakra (no shadcn, no Radix, no MUI).
- Backend/server/changes to hosting or ops (nothing here affects SPA rewrite).
- Adding new features, routes, or content.

## 3. Architecture

- **Dependencies (pin exact):** `@chakra-ui/react@3.36.1`, `@emotion/react`, `@emotion/styled`,
  `typescript@7.0.2`, `@types/react`, `@types/react-dom`, `@types/node` (dev). Chakra v3.36.1's
  actual peer deps are only `@emotion/react` + `react`/`react-dom` — **no `framer-motion`
  peer** (verified via npm metadata), so it is not added. `react-markdown`,
  `react-router-dom` unchanged.
- **Setup (Chakra v3 idiom):** `src/theme/index.ts` calls `createSystem(defaultConfig, …)`
  to build a system (v3 uses `createSystem`, NOT v2's `extendTheme` passed directly), then
  `main.tsx` renders `<ChakraProvider value={system}>`. Global typography/background and any
  keyframes stay in the theme's global styles (`css` in the system config) rather than the
  deleted stylesheet. `styles.css` is **removed incrementally**: only after per-page
  screenshot comparison proves each replaced block renders equivalently — never all 1,550
  lines in one step.
- **Component mapping** (representative, per file):
  - `SiteHeader` → `Box`/`Flex`/`HStack`/`NavLink`-wrapped `Link`/`Button` (copy-IP as
    `Button` with `onCopy`), preserving `data-testid`s and the `ip-rail` layout.
  - `HeroSection`, `IntroSection`, `JournalSection`, `JoinSection`, `SiteFooter` →
    Chakra `Box`/`Container`/`VStack`/`Stack`/`Heading`/`Text`/`Image`/`List`, tokens from
    the theme via `sx`/styles or theme components.
  - `StoreApp` + store components → `Tabs` (Chakra), `Input`, `SimpleGrid`/`Grid`,
    `Card`/`Box`, `Badge`, `Link`; catalog/config type as `ts` interfaces.
  - News components → `Box`/`Heading`/`Text`/`Link`/`List`; `react-markdown` stays (typed
    via its own types); `ArticleBody` wraps the markdown output in Chakra prose styling.
- **TypeScript config:** `tsconfig.json` with `target: ES2022`, `moduleResolution: "bundler"`,
  `jsx: "react-jsx"`, `strict: true`, `skipLibCheck: true`, `types: ["vite/client"]`;
  `src/**/*.{ts,tsx}` compiled by Vite (esbuild/rolldown) at build; `tsc --noEmit` as a
  typecheck gate added to `npm run build` (`tsc -b` or `tsc --noEmit`). Tests stay Playwright
  TS (already covered).

### TypeScript 7 + Vite specifics
- Vite 8's React plugin handles `.tsx`/`.ts` natively; `import.meta.glob` in
  `src/news/content.ts` is typed via `vite/client`.
- `@types/react@19.2.18` matches React 19.2; Chakra v3 ships its own types.
- `tsc` (7.0.2) runs with `--noEmit` and a non-`include`-clashing config; the existing
  `tests` TS files keep compiling under Playwright's own toolchain. If `tsc` requires
  `allowImportingTsExtensions` or `verbatimModuleSyntax`, set them per the 7.0 defaults.

## 4. Data Model / Types

- `src/content.ts`: typed `NavItem` (`href?`, `to?`, `section`, `index`, `label`,
  `ariaLabel`, `isJoin?`) and `JournalSection` interfaces; `navItems`, `journalSections`,
  `SERVER_IP` typed exports.
- `src/store/config.ts`: `STORE_ORIGIN: string`, `packageUrl(slug: string): string`.
- `src/store/catalog.ts`: `StoreCategory { id: CategoryId; label: string }`,
  `StorePackage { slug; name; category: CategoryId; price: number; description;
  perks: string[]; featured?: boolean; buyUrl: string }`; `CategoryId` union
  (`'all'|'rank'|'crate'|'cosmetic'|'coin'|'bundle'`); `validateCatalog(): boolean` and a
  module-load throw for invalid data.
- `src/news/content.ts`: `NewsPost { slug; title; date; summary; body }`;
  `parseFrontMatter(raw: string): NewsPost`-shape; `newsPosts: NewsPost[]`, `getPost`.
- `src/theme/index.ts` + `src/theme/components/*.ts`: typed Chakra theme config.

## 5. Behavior / UX

- Identical routes, identical copy, identical interactions (copy-IP with feedback, category
  tabs + search persisted in URL, news archive/rendering, nav active states).
- The only visible change is implementation: Chakra primitives + theme instead of bespoke
  CSS. Visual parity with the current Midnight Campaign look is the acceptance bar.
- Document titles per route unchanged (`Store | AzothMC`, `News | AzothMC`,
  `<title> | AzothMC`); the header's active-section behavior is preserved exactly:
  `data-section` on hash nav items, `data-active-section` on `<html>` (from
  `LandingPage`'s IntersectionObserver), nav highlight via `is-active`/`aria-current`
  exactly as today — the header's Chakra conversion must keep these attributes and the
  `SiteHeader` activeSection prop contract.
- No new modal/overlay/chakra-specific UX introduced beyond what already exists.

## 6. Error Handling

- Type errors fail `npm run build` (tsc gate) — fail fast on bad props/imports.
- `validateCatalog` still throws at module load on invalid catalog data (now typed).
- `parseFrontMatter` still throws on missing front matter; `getPost` returns `null` for
  unknown slugs; not-found state unchanged.
- Chakra v3 `Tabs`/`Input` handle their own a11y/state; copy-IP failure path unchanged
  (feedback only when `navigator.clipboard` succeeds).

## 7. Testing

- Existing Playwright suites are the contract: `landing.spec.ts`, `store.spec.ts`,
  `news.spec.ts` must all stay green, untouched (except where TS 7's `tsconfig` covers
  `tests/` — keep test runtime identical).
- Add one smoke test per converted area only if needed to lock Chakra-specific behavior
  (e.g. store `Tabs` still exposes `aria-selected` semantics the existing tests assert via
  buttons — verify existing `getByRole('button')`/`aria-pressed` tests still pass; adjust
  only if a Chakra primitive changes the accessible name/role, and update the test
  accordingly with a note).
- No new unit tests for Chakra internals; Playwright remains the observable contract.

## 8. Performance & Accessibility

- Chakra v3 is ESM, tree-shakeable; import primitives from `@chakra-ui/react` (named) so the
  bundle only ships what's used. `styles.css` deletion removes ~1,500 lines of CSS from the
  bundle (styles move to theme + sx, which are already resolved JS).
- Chakra provides built-in a11y (focus rings, `aria-selected` on Tabs, `aria-current` on
  active nav links via our `NavLink`). Preserve: skip-link, `data-testid`s, `target/rel`
  on buy links, reduced-motion (Chakra motion respects `prefers-reduced-motion`; verify).
- Bundle size watch: Chakra + emotion + framer adds weight; lazy-load `/news` route already
  planned in the news spec — keep it lazy so landing/store stay lean.

## 9. CSS / Theme Mapping

- Delete `styles.css` **incrementally**, only after per-block screenshot comparison proves
  the Chakra theme (`createSystem` global styles + component styles) renders equivalently.
  Keep the existing CSS class names as `data-testid`-only where tests depend on them;
  otherwise replaced.
- Token translation table: `--ink-950 → system colors.ink.950`, `--paper-* → colors.paper.*`,
  `--accent → colors.accent.500` (with `.600` hover), `--mint → colors.mint.400`,
  `--orange → colors.orange.400`, `--radius → radii.md (4px)`, `--shadow-small → shadows.md`,
  `--ease → transitions (theme)`, fonts mapped to `fonts.heading/body/mono`.
- Global `body` background (`--ink-950`), font stack, and any `@keyframes` move into the
  system's global styles so nothing visual regresses when the stylesheet shrinks.
- `article-body` prose styles move into `theme/components/article.ts` (or a `prose` style
  object) so markdown rendering stays styled.

## 10. Configuration / Ops

- No hosting, DNS, or external-config changes. Build output changes (TS + Chakra) are
  deploy-identical (static SPA; same SPA-rewrite requirement already documented).
- `tsc` + Vite build in CI (or the existing `npm run build` which now gates on `tsc`).

## 11. Delivery Sequence (implementation order)

1. Add deps (`@chakra-ui/react`, `@emotion/react`, `@emotion/styled`, `framer-motion`,
   `typescript@7.0.2`, `@types/react`, `@types/react-dom`, `@types/node`).
2. `tsconfig.json` (strict, bundler resolution, vite/client types) + `tsc --noEmit` gate in
   `npm run build`.
3. Theme (`src/theme/`) + `ChakraProvider` in `main.tsx`; typed theme.
4. Convert `src/content.ts`, `src/clipboard.ts`, `src/store/{config,catalog}.ts`,
   `src/news/{frontmatter,content}.ts` (typed data) and their consumers.
5. Convert landing components to Chakra (Hero, Intro, Journal, Join, SiteHeader,
   SiteFooter, CopyIcon/CopyIpButton).
6. Convert store components to Chakra (StoreApp, tabs/search/grid/delivery).
7. Convert news components to Chakra + typed markdown wrapper.
8. Delete `styles.css`; verify visual parity (screenshot `/, /store, /news` before/after).
9. Full suite (`landing` + `store` + `news`) green; `npm run build` green (includes tsc).
10. Update README (TS + Chakra notes); commit atomically per component group.

## 12. Acceptance Criteria

- `npm run build` passes (Vite + `tsc --noEmit`), `npm test` passes (18 tests, suites
  untouched or minimally adjusted for Chakra a11y).
- Every component under `src/` is a `.tsx`/`.ts` using Chakra primitives and the theme; no
  `styles.css` remains; `git grep -l 'styles.css'` returns nothing.
- Visual parity: `/`, `/store`, `/news` match the current Midnight Campaign design
  (screenshot diff clean to the eye).
- `typescript@7.0.2` in `devDependencies`; `@chakra-ui/react@3.36.1` in `dependencies`;
  no `any`/`ts-ignore` in converted files (strict passes).
- Routers, copy-IP, tabs+search, news markdown, not-found states all behave identically.
