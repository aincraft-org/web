# Visual Redesign — Design

Date: 2026-08-19

## Problem

The Rust migration moved every page to server-rendered HTML but shipped no
presentation layer. No stylesheet was linked from any page, so all four routes
rendered as unstyled browser defaults.

Three concrete defects:

1. **No styling at all.** `site.rs`, `news.rs`, `store.rs`, and `forum.rs`
   emitted bare `<h1>`/`<p>`/`<article>` markup with no CSS file anywhere in the
   repository.
2. **Duplicated page shell.** Each of the four page modules hard-coded its own
   doctype, `<head>`, header, nav, and footer. The copies had already drifted:
   the landing page carried nine nav links (including in-page hash anchors)
   while the other three carried four.
3. **Artwork referenced but never served.** `/assets/{*path}` resolved to
   `public/{path}`, but all eight art files live in `public/assets/`. Every
   image URL on the site returned 404. The existing Playwright test asserted
   only that twelve `<img>` elements exist, not that they load, so the break
   went unnoticed.

## Direction

Three directions were explored previously. This work implements **Midnight
Campaign**: a cinematic dark base (near-black navy), a warm ember/gold accent
for actions and emphasis, and a cool cyan used sparingly for live/status
signals. Display type is a serif stack for headings against a system sans for
body text, which gives the RPG voice without resorting to woodgrain textures or
blocky Minecraft pastiche.

The store follows the **compact catalog** layout previously chosen: short
header, small square thumbnails, and aligned comparison fields in a row per
package, rather than tall decorative cards.

## Architecture

### Shared shell

`server/src/layout.rs` is the single owner of page chrome:

```rust
pub enum Nav { Home, News, Store, Forum }
pub fn page(title: &str, current: Nav, body: &str) -> Html<String>
```

`page` renders the document head, masthead with logo and primary navigation,
`<main>`, and footer. `current` marks exactly one nav link with
`aria-current="page"`. Page modules render only their own content and pass a
complete `<title>`. This removes all four copies of the shell and makes nav
drift impossible.

### Styling

`public/assets/styles.css` is one hand-written stylesheet: custom properties for
color, type scale, spacing, radius, and shadow, followed by component classes
(`.hero`, `.band`, `.card`, `.product`, `.news-card`, `.panel`, `.notice`). No
build step, no framework, no client-side router — consistent with the migration
goal of Rust owning rendering.

One non-obvious rule is load-bearing: `[hidden] { display: none !important; }`.
The store filter script toggles the `hidden` attribute, and component `display`
declarations would otherwise defeat the user-agent default.

### Static assets

`STATIC_DIR` now defaults to `public/assets`, matching its documented meaning
("directory for files served under `/assets/`"). Path resolution is extracted
into `resolve_asset(root, path) -> Option<PathBuf>`, which rejects empty, `.`,
and `..` segments and confirms the result stays under the root, so the
traversal rule is unit-testable without touching the filesystem or environment.

CSS and JS moved to `public/assets/` alongside the artwork.

### Progressive enhancement

`public/assets/site.js` adds a sticky-header background state, the
copy-server-address button (previously a `data-copy-text` button with no
handler anywhere in the codebase), and scroll reveals. `public/assets/store.js`
keeps catalog filtering. Both degrade cleanly: content renders and reads without
JavaScript, and reveal animations are suppressed under
`prefers-reduced-motion`.

## Page composition

- **Landing** — full-bleed hero over `hero-bg.jpg` with a scrim for text
  contrast, the server address chip, then an intro band pairing
  `character-mage.png` with three onboarding cards, then four alternating
  image/text feature bands (`#world`, `#loot`, `#quests`, `#endgame`) driven by
  a `BANDS` const, closing with a call to action using `dragon.png` as
  decorative art. All eight previously-orphaned assets are now used.
- **News** — page header plus a responsive card grid; articles render Markdown
  into a `.prose` column. Markdown output keeps its plain tags so heading text
  stays assertable.
- **Store** — page header, filter pills and search in a toolbar, compact
  catalog rows, and market/delivery panels.
- **Forum** — page header with the configured call to action, or the
  unconfigured-state notice.

## Testing

- `layout.rs`: current page marked exactly once; shell links the stylesheet,
  script, and every route; body content lands inside `<main>`.
- `site.rs`: bands use distinct artwork and alternate sides; asset paths resolve
  under `public/assets`; traversal and empty segments are rejected; **every
  asset referenced by the landing page exists on disk** — this guards the 404
  class of bug directly.
- Existing Rust and Playwright suites continue to pass unchanged, including the
  store filter test, which confirms the `hidden` contract survives the new
  layout CSS.

## Out of scope

Marketplace behavior, Discourse integration, news content, and the catalog data
are untouched. The `character-mage.png` source file has a light artifact behind
the figure; replacing artwork is not part of this work.
