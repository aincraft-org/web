# AzothMC News — Design Spec

Date: 2026-08-10
Status: Draft for review

## 1. Context

`azothmc-web` is a Vite + React 19 SPA with a landing page (`/`) and a `/store` route
sharing a header/footer shell and a design system in `styles.css` (Midnight Campaign:
dark ink, paper, emerald accent tokens `--ink-*`/`--paper-*`/`--accent`/`--mint`, mono
eyebrows, radius, shadows). Route tabs use `NavLink` with `aria-current="page"`; hash links
prefix `/{item.href}` when on a non-landing route; the footer prefixes similarly.

This spec adds a **news page that renders markdown**: an archive index at `/news` listing
changelog/blog posts, each with its own shareable route `/news/:slug`, with article bodies
authored as Markdown and rendered at build time.

## 2. Goals / Non-Goals

### Goals
- `/news` archive: list of posts, newest first, with date/title/summary and a link each.
- `/news/:slug` article page: renders that post's Markdown body.
- Markdown authored as files inside the repo, **compiled at build time** (no runtime fetch,
  no backend).
- Content pipeline: Markdown + front-matter metadata → static article modules → routes.
- Full shared shell (header/nav/footer), route-aware active tab, consistent design.
- Playwright coverage matching the existing store/landing conventions.

### Non-Goals (explicitly out of scope)
- Runtime fetch of Markdown from `public/` or a CMS. (Build-time import chosen.)
- Editing/authoring UI, drafts, or admin.
- Pagination/tags/categories beyond the archive list itself.
- RSS/Atom feeds, comments, or search across posts.

## 3. Architecture

```
src/news/
├── posts/
│   ├── 2026-08-10-launch-post.md        # front-matter (title, date, summary) + Markdown body
│   └── … (1-2 more sample posts so index listing is real)
├── content.js       # static registry: imports the .md files, exports ordered posts
├── NewsIndex.jsx     # /news — archive list (route component)
├── NewsArticle.jsx   # /news/:slug — renders one post body
├── components/
│   ├── NewsHero.jsx      # shared page banner
│   ├── NewsPostList.jsx  # the archive list
│   └── ArticleBody.jsx   # Markdown renderer wrapper (react-markdown)
└── news.store.css        # component styles (or append to styles.css — see §CSS)
```

Routing (`src/App.jsx`):
- `/news` → `<NewsIndex/>`
- `/news/:slug` → `<NewsArticle/>`
- Unknown `/news/*` slug → friendly not-found state (component handles missing post)

### Markdown compilation (chosen approach)
- Posts live as `src/news/posts/*.md`, **raw-imported at build** via Vite `?raw`:
  `import raw from './posts/2026-08-10-launch-post.md?raw'`.
- Metadata lives in YAML-ish front matter at the top of each file; a tiny
  `frontmatter.js` parser extracts `{ title, date, summary }` and the body (no extra
  dependency; ~20 lines, deterministic for our controlled files).
- Body is rendered with **`react-markdown`** (React 19 compatible, AST-based, escaping by
  default — no `dangerouslySetInnerHTML`). Chosen over `marked` because it's React-native
  (default-safe output, custom component mapping) and our bundle-size cost is acceptable
  for a content page.
- Slug = filename without `.md`; registry auto-derives it.
- New post = drop a new `.md` in `src/news/posts/` + rebuild; the index and routes update
  automatically.

## 4. Data Model

```md
--- .md front matter ---
title: Season Zero Launches
date: 2026-08-10
summary: The realm is open — join the first expedition chronicle.
---

Body in standard Markdown (headings, lists, links, code fences, blockquotes).
```

```js
// content.js registry (exact contract)
export const newsPosts = [
  {
    slug: '2026-08-10-launch-post',     // derived from filename
    title: 'Season Zero Launches',
    date: '2026-08-10',                  // YYYY-MM-DD, sortable
    summary: 'The realm is open…',
    body: '…',                           // raw Markdown string
  },
  // …ordered newest-first by date
];

export function getPost(slug) {
  return newsPosts.find((post) => post.slug === slug) ?? null;
}
```

- Dates are ISO strings for stable sorting; display formatting is a thin helper.
- The registry is the single source of truth for the index and article routes.

## 5. Behavior / UX

- `/news` (NewsIndex): NewsHero (eyebrow `AZOTHMC / CHRONICLES`, h1 "News", subtitle), then
  a vertical list of posts — each shows date (formatted `Aug 10, 2026`), title (link to
  `/news/:slug`), summary. Newest first.
- `/news/:slug` (NewsArticle): NewsHero variant showing the post title/date, then
  ArticleBody rendering the Markdown with proper typography (headings, lists, inline code,
  code blocks, links, blockquote) matching the field-guide art direction.
- Unknown slug: a friendly "Post not found" block + link back to `/news`. No route
  redirect; component-level fallback.
- Both pages set `document.title` on mount (`News | AzothMC`, `«title» | AzothMC`),
  restoring the previous title on unmount (same pattern as StoreApp).
- Mobile: single-column list; article prose `max-width` keeps readable line length.

## 6. Error Handling

- **Missing `?raw` import / bad path** → Vite build fails (fail fast, controlled files).
- **Post file lacks required front matter** → `content.js` throws at module load with the
  file path, so a malformed post breaks the build instead of rendering a broken page.
- **Unknown `/news/:slug`** → component-level not-found state, no crash.
- **No posts at all** → index renders an empty state ("No chronicles yet — check back
  soon."), with the registry returning `[]`.
- react-markdown escapes raw HTML by default; our content is controlled/trusted.

## 7. Testing (Playwright, `tests/news.spec.ts`)

- **index loads with zero page errors** — goto `/news`, assert NewsHero visible, archive
  list has `news-post` links, title matches `/News.*AzothMC/`, zero page errors.
- **index lists posts newest first as links** — assert ≥2 `news-post` entries; assert
  first entry's date ≥ second's (string compare on `data-date`); each links to `/news/{slug}`.
- **article renders markdown as HTML** — goto `/news/<first slug>`, assert H2 from the
  body text is a real heading (not raw `## text`), inline code renders as `<code>`, and a
  list item appears as `<li>`. Assert title contains the post title.
- **unknown slug shows not-found** — goto `/news/does-not-exist`, assert not-found testid
  and a link back to `/news`.
- **nav link navigates to `/news`** — from `/`, click nav "News" link, assert URL
  `/news`, `aria-current="page"` on the tab, NewsHero visible (mirrors store nav test).
- **existing store/landing suites stay green** (regression — header changes only add a tab).

## 8. Performance & Accessibility

- Markdown compiled into the bundle at build: zero runtime data fetch, no loading states.
- react-markdown is imported only where used; if it inflates the main chunk, it lands in a
  lazy-loaded route chunk via `React.lazy` for `/news`, keeping the landing/store paths
  lean.
- Accessible: list of posts as `<ul>`/`<li>` with links + visible dates; article is one
  `<article>` with an `aria-labelledby` heading; focus-visible styles consistent with the
  store; no color-only meaning; reduced-motion respected; skip-link reused.

## 9. CSS

- Follow the existing convention: new selectors prefixed `news-` / `article-`
  (`.news-page`, `.news-hero`, `.news-post-list`, `.news-post`, `.article-body`).
- Reuse tokens (`--ink-*`, `--paper-*`, `--accent`, `--mint`, `--radius`, `--shadow-small`,
  `--ease`, mono/sans fonts).
- `.article-body` typography: scoped styles for h2/h3, paragraphs, lists, `code`,
  `pre`, `blockquote`, links — a "prose" block that does not leak to other pages.
- `news.store.css` imported once from `NewsIndex.jsx`; Vite bundles inline. (Alternative:
  append to `styles.css`; decided at implementation based on diff cleanliness.)

## 10. Configuration / Ops

- No external services, no keys, no secrets, no hosting changes beyond the existing SPA
  rewrite (already required for `/store`; `/news` and `/news/:slug` are covered by the same
  `/* → /index.html` rule).

## 11. Delivery Sequence (implementation order)

1. Add `react-markdown` dependency (pin exact version).
2. `src/news/posts/` with 2-3 sample `.md` posts (front matter + rich Markdown body).
3. `src/news/frontmatter.js` + `src/news/content.js` registry (`?raw` imports + parse +
  derive slugs, throw on missing front matter).
4. `NewsIndex`, `NewsArticle`, components (`NewsHero`, `NewsPostList`, `ArticleBody`).
5. Routes in `App.jsx` (`/news`, `/news/:slug`) + active tab in `SiteHeader`/`content.js`.
6. `news-*`/`article-*` styles (append to `styles.css` or new file; follow §9).
7. `tests/news.spec.ts`; full suite (landing + store + news) green.
8. Update header nav test only if it asserted an exact nav label set (it does not today).

## 12. Acceptance Criteria

- `npm run build` passes; `npm test` passes with landing + store + news suites green.
- `/news` shows the archive (≥2 posts, newest first), each linking to `/news/:slug`.
- `/news/:slug` renders Markdown as real HTML with correct typography; unknown slug shows a
  friendly not-found state.
- Header nav has a News tab, active on `/news` and `/news/:slug` (`aria-current="page"`).
- No runtime data fetch, no backend, no secrets; Markdown only compiled at build.
- Adding a post = adding one `.md` file + rebuild (documented in README).
