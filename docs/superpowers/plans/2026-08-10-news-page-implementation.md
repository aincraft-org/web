# AzothMC News Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/news` (archive index) and `/news/:slug` (markdown article) routes to the existing AzothMC SPA, rendering repo-authored Markdown compiled at build time.

**Architecture:** Markdown posts live in `src/news/posts/*.md` with YAML-ish front matter; a small parser + registry (`frontmatter.js`/`content.js`) imports them via Vite `?raw` at build and exports an ordered post list. `NewsIndex` renders the archive; `NewsArticle` renders one body with `react-markdown` (AST, default-escaped HTML). Both share the existing `App` shell (header/nav/footer), route-aware active tab, and a `News` nav item parallel to the existing `Store` item.

**Tech Stack:** Vite 8, React 19, react-router-dom 7.18.2, react-markdown 10.1.0 (pin exact), Playwright (existing).

## Global Constraints

- Root: `/home/jlo/dev/azothmc-web` (git root `/home/jlo/dev`; commit only files under `azothmc-web/` from `cd /home/jlo/dev/azothmc-web`).
- `react-markdown` pinned to `10.1.0` (React >=18 peer; we run React 19).
- No runtime data fetch: posts are build-time `?raw` imports only. No secrets, no external services.
- Reuse existing conventions/patterns exactly: route shell in `src/App.jsx` (visited-in-path `/news` sections), header nav tab (`content.js` `navItems` `{ to: '/news', section: 'news', index: 'NEWS', label: 'News', ariaLabel: 'News' }` inserted after the Store item, before Join), `data-testid` naming like store (`news-hero`, `news-post`, `news-empty`, `news-not-found`, `article-body`), `document.title` mount/unmount pattern from `StoreApp.jsx`, `navItems.map`/`NavLink` branching in `SiteHeader.jsx`, hash-prefixing in `SiteHeader`/`SiteFooter`.
- Playwright run from `azothmc-web`: `npx playwright test --project=chromium` (config boots Vite on 4173 itself); `npm run build` before the full suite at the end.

---

### Task 1: Post sources + registry (front matter, `?raw` imports, ordering)

**Files:**
- Create: `src/news/posts/2026-08-10-season-zero-launches.md`
- Create: `src/news/posts/2026-08-08-webstore-live.md`
- Create: `src/news/posts/2026-07-30-prologue.md`
- Create: `src/news/frontmatter.js`
- Create: `src/news/content.js`

**Interfaces:**
- Produces:
  - `frontmatter.js`: `export function parseFrontMatter(raw)` → `{ title, date, summary, body }`; throws with a descriptive error when `title`/`date`/`summary` are missing.
  - `content.js`: `export const newsPosts` — array of `{ slug, title, date, summary, body }` sorted newest-first by `date` (string compare on `YYYY-MM-DD`); `export function getPost(slug)` → post or `null`.

- [ ] **Step 1: Write three sample posts**

`src/news/posts/2026-07-30-prologue.md`:

```md
---
title: A Prologue to the Frontier
date: 2026-07-30
summary: The realm of Azoth is waking — a field guide to what comes next.
---

Welcome to the first chronicle from Azoth.

## What is Azoth?

Azoth is a handcrafted Minecraft MMORPG. Every skyline is intentional.

- Handcrafted realms, not generators
- Player-driven emerald economy
- Branching quest lines across kingdoms

> No two expeditions are the same.

## What comes next

We open Season Zero soon. Join the expedition.
```

`src/news/posts/2026-08-08-webstore-live.md`:

```md
---
title: The Webstore Is Live
date: 2026-08-08
summary: Support the realm and unlock perks — ranks, crates, cosmetics, and bundles.
---

The AzothMC webstore is open at the new **Store** tab. Choose a perk and complete
checkout on our secure partner, Tebex.

## What you can grab

- Ranks with kits and homes
- Crates and cosmetics
- Emerald pouches for the trade market

Deliveries arrive in-game within about 1-2 minutes, even if you are offline.
```

`src/news/posts/2026-08-10-season-zero-launches.md`:

```md
---
title: Season Zero Launches
date: 2026-08-10
summary: The realm is open — join the first expedition chronicle.
---

Season Zero is live. `play.azothmc.com` is open, and the frontier is waking.

## Expedition notes

- Join the server and pick a path
- Link your account to receive purchases instantly
- The Trade Market opens with the emerald economy

## Field tips

1. Start a character and follow the quest lines.
2. Squad up for the first raid windows.
3. Keep an eye on the news for the first world boss.

We will see you in Azoth.
```

- [ ] **Step 2: Write `src/news/frontmatter.js`**

```js
const REQUIRED = ['title', 'date', 'summary'];

export function parseFrontMatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    throw new Error('News post is missing front matter (--- block)');
  }

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key && value) meta[key] = value;
  }

  for (const key of REQUIRED) {
    if (!meta[key]) {
      throw new Error(`News post is missing required front matter field: ${key}`);
    }
  }

  return { title: meta.title, date: meta.date, summary: meta.summary, body: match[2].trim() };
}
```

- [ ] **Step 3: Write `src/news/content.js`** (glob-based registry — auto-discovers every `.md` in `posts/`, so adding a post needs no registry edit)

```js
import { parseFrontMatter } from './frontmatter.js';

const modules = import.meta.glob('./posts/*.md', { eager: true, query: '?raw', import: 'default' });

const posts = Object.entries(modules)
  .map(([key, raw]) => ({ slug: key.split('/').pop().replace(/\.md$/, ''), raw }));
```

```js
export const newsPosts = posts
  .map(({ slug, raw }) => ({ slug, ...parseFrontMatter(raw) }))
  .sort((left, right) => (left.date < right.date ? 1 : -1));

export function getPost(slug) {
  return newsPosts.find((post) => post.slug === slug) ?? null;
}
```

- [ ] **Step 4: Verify the registry through a build (Node cannot resolve Vite `?raw` imports directly)**

```bash
cd /home/jlo/dev/azothmc-web && npm run build
```

Expected: build succeeds (module graph resolved; posts available for Task 2). The precise sort/`getPost` behavior is covered by the Playwright specs in Task 5.

- [ ] **Step 5: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/news && git commit -m "feat: add markdown news posts and content registry"
```

---

### Task 2: News route components (index, article, markdown renderer)

**Files:**
- Create: `src/news/components/NewsHero.jsx`
- Create: `src/news/components/NewsPostList.jsx`
- Create: `src/news/components/ArticleBody.jsx`
- Create: `src/news/NewsIndex.jsx`
- Create: `src/news/NewsArticle.jsx`
- Modify: `src/App.jsx` (route mount)

**Interfaces:**
- Consumes: `newsPosts`, `getPost` (Task 1); `react-markdown`; route params via `useParams`.
- Produces:
  - `NewsIndex` (default export): `/news` archive. Renders `<NewsHero/>` + `<NewsPostList posts={newsPosts}/>`.
  - `NewsArticle` (default export): `/news/:slug`. Reads `useParams().slug`, `getPost(slug)`; not-found render when `null`.
  - `NewsHero` (named export, props `{ eyebrow, title, subtitle }`).
  - `NewsPostList` (named export, props `{ posts }`): `<ul>` of `<li>` `news-post` items; each has a link to `/news/{slug}` and `data-date`; empty state when `posts` is empty.
  - `ArticleBody` (named export, props `{ body }`): `<article data-testid="article-body" className="article-body"><ReactMarkdown>{body}</ReactMarkdown></article>`.
  - Component testids: `news-hero`, `news-post` (per item), `news-empty`, `news-not-found`, `article-body`.

- [ ] **Step 1: Install react-markdown**

```bash
cd /home/jlo/dev/azothmc-web && npm install react-markdown@10.1.0 --save-exact
```

Expected: added to `dependencies` as `"react-markdown": "10.1.0"`.

- [ ] **Step 2: Write `src/news/components/NewsHero.jsx`**

```jsx
export function NewsHero({ eyebrow, title, subtitle }) {
  return (
    <section className="news-hero" data-testid="news-hero" aria-labelledby="news-hero-title">
      <p className="news-eyebrow">{eyebrow}</p>
      <h1 id="news-hero-title">{title}</h1>
      {subtitle ? <p className="news-hero-copy">{subtitle}</p> : null}
    </section>
  );
}
```

- [ ] **Step 3: Write `src/news/components/NewsPostList.jsx`**

```jsx
import { Link } from 'react-router-dom';

export function NewsPostList({ posts }) {
  if (!posts.length) {
    return (
      <p className="news-empty" data-testid="news-empty">
        No chronicles yet — check back soon.
      </p>
    );
  }

  return (
    <ul className="news-post-list" data-testid="news-post-list">
      {posts.map((post) => (
        <li key={post.slug} className="news-post" data-testid="news-post" data-date={post.date}>
          <time dateTime={post.date} className="news-post-date">{formatDate(post.date)}</time>
          <h2 className="news-post-title">
            <Link to={`/news/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="news-post-summary">{post.summary}</p>
        </li>
      ))}
    </ul>
  );
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}, ${year}`;
}
```

- [ ] **Step 4: Write `src/news/components/ArticleBody.jsx`**

```jsx
import ReactMarkdown from 'react-markdown';

export function ArticleBody({ body }) {
  return (
    <article className="article-body" data-testid="article-body">
      <ReactMarkdown>{body}</ReactMarkdown>
    </article>
  );
}
```

- [ ] **Step 5: Write `src/news/NewsIndex.jsx`**

```jsx
import { useEffect } from 'react';
import { newsPosts } from './content.js';
import { NewsHero } from './components/NewsHero.jsx';
import { NewsPostList } from './components/NewsPostList.jsx';

export default function NewsIndex() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'News | AzothMC';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="news-page">
      <NewsHero
        eyebrow="AZOTHMC / CHRONICLES"
        title="News"
        subtitle="Expedition notes, updates, and chronicles from the frontier."
      />
      <NewsPostList posts={newsPosts} />
    </div>
  );
}
```

- [ ] **Step 6: Write `src/news/NewsArticle.jsx`**

```jsx
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPost } from './content.js';
import { ArticleBody } from './components/ArticleBody.jsx';
import { NewsHero } from './components/NewsHero.jsx';

export default function NewsArticle() {
  const { slug } = useParams();
  const post = getPost(slug ?? '');

  useEffect(() => {
    if (!post) return undefined;
    const previousTitle = document.title;
    document.title = `${post.title} | AzothMC`;
    return () => { document.title = previousTitle; };
  }, [post]);

  if (!post) {
    return (
      <div className="news-page">
        <NewsHero eyebrow="AZOTHMC / CHRONICLES" title="Post not found" subtitle="This chronicle does not exist — it may have been moved." />
        <p className="news-not-found" data-testid="news-not-found">
          <Link to="/news">Back to all news</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="news-page">
      <NewsHero eyebrow="AZOTHMC / CHRONICLES" title={post.title} subtitle={formatDate(post.date)} />
      <ArticleBody body={post.body} />
    </div>
  );
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}, ${year}`;
}
```

- [ ] **Step 7: Mount the routes in `src/App.jsx`**

Import the two components and add routes inside `<Routes>` (replace the current `*` fallback with the two routes + `*`; the order matters — `/news` before `/news/:slug`):

```jsx
import NewsArticle from './news/NewsArticle.jsx';
import NewsIndex from './news/NewsIndex.jsx';
// …inside <Routes> after the /store route…
<Route path="/news" element={<NewsIndex />} />
<Route path="/news/:slug" element={<NewsArticle />} />
```

Leave `Navigate`/`*` fallback as the last route (unchanged).

- [ ] **Step 8: Verify build**

```bash
cd /home/jlo/dev/azothmc-web && npm run build
```

Expected: build succeeds; output now includes news routes in the emitted JS.

- [ ] **Step 9: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/news src/App.jsx package.json package-lock.json && git commit -m "feat: add news index and article routes with markdown rendering"
```

---

### Task 3: Navigation (News tab) + active-route wiring

**Files:**
- Modify: `src/content.js` (navItems)
- Modify: `src/components/SiteHeader.jsx`
- Modify: `src/components/SiteFooter.jsx` (no functional change required — footer only lists landing hashes; leave as-is unless a News link is added there — do not add one)

**Interfaces:**
- Consumes: existing `NavLink` branch in `SiteHeader` (already handles `{ to: … }` items with `aria-current="page"`).
- Produces: a News tab in the primary nav, active on `/news` and `/news/:slug` (NavLink `end` behavior — the `/news` NavLink should not be active on `/news/:slug`; use the `end` prop so only `/news/:slug` marks the News tab when viewing an article; verify with the nav test).

- [ ] **Step 1: Add the News nav item**

In `src/content.js`, inside `navItems`, insert after the Store item and before the Join item:

```js
{ to: '/news', section: 'news', index: 'NEWS', label: 'News', ariaLabel: 'News' },
```

- [ ] **Step 2: Make the News tab active on both `/news` and `/news/:slug`**

In `src/components/SiteHeader.jsx`, in the `item.to ? (<NavLink …>)` branch, keep the plain `to={item.to}`. Add an `end` prop only when we want the tab inactive on nested paths. For `Store` (single path) `end` is irrelevant; for `News` we want it active on `/news/:slug` too, so **remove reliance on `end`** and instead keep the default behavior — but the default NavLink IS active on descendant paths, which is exactly what we want for `/news/:slug`. Verify in Step 3 that `/news/:slug` shows the News tab active (NavLink default `isActive` includes descendants).

If the Article route path were a sibling (it is not — it's a descendant `/news/:slug`), adjust accordingly. No code change needed in this step beyond verifying the default; if the default proves inactive on the article page during testing, add `end` and a `className` function — but first rely on the default and the nav test.

- [ ] **Step 3: Run a quick nav check**

```bash
cd /home/jlo/dev/azothmc-web && npm run build
```

Expected: build succeeds with the new nav item.

- [ ] **Step 4: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add src/content.js && git commit -m "feat: add News tab to primary navigation"
```

---

### Task 4: Styles for news + article typography

**Files:**
- Modify: `styles.css` (append `/* News */` block at very end; and add the nav active rule if not already covered — the store block already styles `[aria-current="page"]`, so News inherits it; no new nav rule needed)

**Constraints:** reuse `--ink-*`, `--paper-*`, `--accent`, `--mint`, `--orange`, `--radius`, `--shadow-small`, `--ease`, `--mono`; selectors prefixed `news-`/`article-`.

- [ ] **Step 1: Append the news styles to `styles.css`**

```css
/* News */
.news-page {
  width: min(100%, 1000px);
  margin: 0 auto;
  padding: clamp(28px, 6vw, 72px) clamp(16px, 4vw, 56px) 56px;
}

.news-hero {
  margin-bottom: clamp(28px, 5vw, 48px);
  padding: clamp(26px, 5vw, 54px) clamp(20px, 4vw, 48px);
  border: 1px solid rgba(131, 212, 192, 0.24);
  background: linear-gradient(145deg, rgba(16, 39, 43, 0.96), rgba(7, 19, 22, 0.96));
  box-shadow: var(--shadow);
}

.news-eyebrow {
  margin: 0 0 10px;
  color: var(--mint);
  font-family: var(--mono);
  font-size: 0.65rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.news-hero h1 {
  max-width: 16ch;
  margin: 0;
  color: var(--paper-bright);
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1;
  letter-spacing: -0.03em;
}

.news-hero-copy {
  max-width: 60ch;
  margin: 14px 0 0;
  color: var(--muted);
}

.news-post-list {
  display: grid;
  gap: 14px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.news-post {
  display: grid;
  gap: 6px;
  padding: 20px 22px;
  border: 1px solid rgba(222, 240, 221, 0.15);
  border-left: 3px solid rgba(216, 242, 107, 0.6);
  border-radius: calc(var(--radius) * 2);
  background: rgba(16, 39, 43, 0.62);
  transition: border-color var(--ease), transform var(--ease);
}

.news-post:hover {
  border-color: rgba(216, 242, 107, 0.42);
  transform: translateY(-1px);
}

.news-post-date {
  color: var(--mint);
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.news-post-title {
  margin: 0;
  font-size: 1.3rem;
}

.news-post-title a {
  color: var(--paper-bright);
}

.news-post-title a:hover,
.news-post-title a:focus-visible {
  color: var(--accent);
}

.news-post-title a:focus-visible,
.news-not-found a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.news-post-summary {
  margin: 0;
  color: var(--muted);
}

.news-empty,
.news-not-found {
  padding: 40px 20px;
  border: 1px dashed rgba(222, 240, 221, 0.24);
  color: var(--muted);
  text-align: center;
}

.news-not-found a {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
}

.article-body {
  max-width: 78ch;
  color: var(--paper-deep);
  line-height: 1.72;
}

.article-body h2,
.article-body h3 {
  color: var(--paper-bright);
  line-height: 1.25;
}

.article-body h2 {
  margin: 1.8em 0 0.5em;
  font-size: 1.5rem;
}

.article-body h3 {
  margin: 1.4em 0 0.5em;
  font-size: 1.15rem;
}

.article-body p,
.article-body ul,
.article-body ol {
  margin: 0 0 1em;
}

.article-body a {
  color: var(--accent);
  border-bottom: 1px solid rgba(216, 242, 107, 0.4);
}

.article-body a:hover {
  color: var(--white);
  border-color: var(--white);
}

.article-body ul,
.article-body ol {
  padding-left: 1.4em;
}

.article-body li + li {
  margin-top: 0.35em;
}

.article-body code {
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent);
  background: rgba(216, 242, 107, 0.1);
  font-family: var(--mono);
  font-size: 0.88em;
}

.article-body pre {
  padding: 14px 16px;
  overflow-x: auto;
  border: 1px solid rgba(222, 240, 221, 0.18);
  border-radius: calc(var(--radius) * 2);
  background: var(--ink-900);
}

.article-body pre code {
  padding: 0;
  color: var(--paper-bright);
  background: transparent;
}

.article-body blockquote {
  margin: 1.4em 0;
  padding: 4px 18px;
  border-left: 3px solid var(--mint);
  color: var(--muted);
}

@media (max-width: 640px) {
  .news-page {
    padding-inline: 16px;
  }
}
```

- [ ] **Step 2: Verify build (styles compile)**

```bash
cd /home/jlo/dev/azothmc-web && npm run build
```

Expected: build succeeds; CSS bundle size increased.

- [ ] **Step 3: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add styles.css && git commit -m "style: add news and article typography styles"
```

---

### Task 5: Playwright specs for the news page

**Files:**
- Create: `tests/news.spec.ts`

**Interfaces:**
- Consumes: the exact testids/behavior from Tasks 1-4 (`news-hero`, `news-post` with `data-date`, `news-empty`, `news-not-found`, `article-body`, nav link `News`, `aria-current="page"`).

- [ ] **Step 1: Write `tests/news.spec.ts`**

```ts
import { test, expect, type Page } from '@playwright/test';

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('AzothMC news', () => {
  test('index loads with zero page errors', async ({ page }) => {
    const errors = trackPageErrors(page);

    await page.goto('/news');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/News.*AzothMC|AzothMC.*News/i);
    await expect(page.getByTestId('news-hero')).toBeVisible();
    await expect(page.locator('[data-testid="news-post"]').first()).toBeVisible();
    expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('index lists posts newest first with links', async ({ page }) => {
    await page.goto('/news');

    const posts = page.locator('[data-testid="news-post"]');
    const count = await posts.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const dates: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const date = (await posts.nth(index).getAttribute('data-date')) ?? '';
      dates.push(date);
    }
    for (let index = 1; index < dates.length; index += 1) {
      expect(dates[index - 1] >= dates[index]).toBe(true);
    }

    const links = page.locator('[data-testid="news-post"] a');
    expect(await links.count()).toBe(count);
    for (let index = 0; index < count; index += 1) {
      const href = (await links.nth(index).getAttribute('href')) ?? '';
      expect(href).toMatch(/^\/news\/[a-z0-9-]+$/);
    }
  });

  test('article renders markdown as real HTML', async ({ page }) => {
    await page.goto('/news/2026-08-10-season-zero-launches');

    await expect(page).toHaveTitle(/Season Zero Launches.*AzothMC/);
    await expect(page.getByTestId('article-body')).toBeVisible();
    await expect(page.getByTestId('article-body').getByRole('heading', { level: 2 })).toContainText(/Expedition notes/i);
    await expect(page.getByTestId('article-body').locator('code')).toHaveCount(1);
    await expect(page.getByTestId('article-body').locator('li').first()).toBeVisible();
  });

  test('unknown slug shows not-found with a link back', async ({ page }) => {
    await page.goto('/news/does-not-exist');
    await expect(page.getByTestId('news-not-found')).toBeVisible();
    await expect(page.getByTestId('news-not-found').getByRole('link', { name: /Back to all news/i })).toBeVisible();
  });

  test('nav link navigates to /news and marks the tab active', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('site-nav').getByRole('link', { name: /News/i }).click();
    await expect(page).toHaveURL(/\/news/);
    await expect(page.getByTestId('news-hero')).toBeVisible();
    await expect(page.getByTestId('site-nav').getByRole('link', { name: /News/i })).toHaveAttribute('aria-current', 'page');
  });

  test('nav News tab stays active on an article page', async ({ page }) => {
    await page.goto('/news/2026-08-08-webstore-live');
    await expect(page.getByTestId('site-nav').getByRole('link', { name: /News/i })).toHaveAttribute('aria-current', 'page');
  });
});
```

- [ ] **Step 2: Run the news spec — expect FAIL on the nav-active test**

```bash
cd /home/jlo/dev/azothmc-web && npx playwright test --project=chromium tests/news.spec.ts
```

Expected: the email list + nav tests fail OR pass depending on Step 3 of Task 3; fix Task 3's NavLink `end`/default behavior to make the article-page active test pass. Then re-run until all pass.

- [ ] **Step 3: Verify full suite (landing + store + news) and build**

```bash
cd /home/jlo/dev/azothmc-web && npm run build && npm test
```

Expected: ALL tests pass (landing 4 + store 8 + news 6).

- [ ] **Step 4: Commit**

```bash
cd /home/jlo/dev/azothmc-web && git add tests/news.spec.ts && git commit -m "test: cover news index, markdown rendering, and navigation"
```

---

### Task 6: Docs + final ops note + secret audit

**Files:**
- Modify: `README.webshop.md` (append a short "News" section, or create `README.news.md` — prefer appending to the existing README to avoid a new file; include the "add a post = add one .md + rebuild" note)

- [ ] **Step 1: Append a News section to `README.webshop.md`**

Add after the secret note:

```md
## News

The `/news` page renders Markdown posts compiled at build time. To publish:

1. Add a new `.md` file to `src/news/posts/` with a slug-style filename.
2. Start it with a `---` front-matter block containing `title`, `date` (YYYY-MM-DD), and `summary`.
3. Body is standard Markdown (headings, lists, links, code, blockquotes).

Rebuild and deploy — the index and `/news/:slug` routes pick the post up automatically.
```

- [ ] **Step 2: Secret/API-surface audit** — grep the frontend for forbidden patterns (expect NO matches):

```bash
cd /home/jlo/dev/azothmc-web && npx grep -riE "tebex|secret|api[_-]?key|plugin\.tebex\.io" src tests index.html 2>/dev/null || echo "CLEAN: no secret/API surface"
```

Expected: `CLEAN` (store spec tests reference `tebex` in assertions only — exclude `tests/` from this audit or accept those matches; the audit target is `src/` + `index.html`).

- [ ] **Step 3: Full verification + commit**

```bash
cd /home/jlo/dev/azothmc-web && npm run build && npm test
```

Expected: all green. Then:

```bash
cd /home/jlo/dev/azothmc-web && git add README.webshop.md && git commit -m "docs: document publishing news posts"
```

---

## Self-Review

**Spec coverage:**
- §5 `/news` index + newest-first + links → Tasks 1,2,5 ✓
- §5 `/news/:slug` render + not-found → Tasks 2,5 ✓
- §3 build-time `?raw` + front matter + react-markdown → Tasks 1,2 ✓
- §4 registry contract (`newsPosts`, `getPost`) → Task 1 ✓
- §5 document.title pattern → Task 2 ✓
- §10 ops (no new hosting) → Task 6 note ✓
- §11/12 acceptance (build+suite green, nav tab, markdown renders, adding a post = one .md) → Tasks 5,6 ✓
- Header nav News tab + active on article → Task 3 ✓
- CSS §9 (`news-`/`article-` selectors, prose scoping) → Task 4 ✓

**Placeholder scan:** no TBD/TODO; every code step has full code; every run step has an exact command + expected output. The "verify Task 3's NavLink behavior" step is directional but tied to a concrete acceptance test (Task 5), so it is not a placeholder — the test defines the pass criterion.

**Type consistency:** `newsPosts` shape `{ slug, title, date, summary, body }` consistent across content.js, NewsPostList, NewsArticle, and the spec; `getPost(slug)` used identically; testids (`news-hero`, `news-post`, `news-empty`, `news-not-found`, `article-body`, nav `News`) match between components (Task 2), styles (Task 4), and tests (Task 5). `formatDate` is defined in NewsPostList and NewsArticle independently (small duplication; acceptable — or hoist to a shared helper — plan keeps them local, both deterministic).
