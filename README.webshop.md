# AzothMC webstore

The `/store` route is a static catalog that sends each purchase to a public Tebex package URL. Edit `src/store/catalog.ts` when the Tebex package slugs or display copy change. The public store origin is configured once in `src/store/config.ts` as `STORE_ORIGIN`.

The catalog is rendered as an artwork-first card grid. Each package supplies an `image` path
from `public/assets/` and descriptive `imageAlt` text in `src/store/catalog.ts`; the card keeps
the artwork prominent while retaining the package perks, price, category filter, search, and
secretless Tebex deep link.

Production hosting must rewrite `/store` and other client-side routes to `index.html` (SPA fallback), while serving `/assets/*` normally. Configure the Tebex custom domain `store.azothmc.com` with its DNS CNAME and Tebex Plus before replacing the placeholder package slugs.

Install the official Tebex plugin on the Minecraft server and configure each Tebex package's delivery commands. Tebex polls paid orders and the server delivers perks in-game, including for offline players.

This repo contains no payment credentials or Tebex API secrets. The Tebex plugin secret belongs in the server/Tebex integration configuration only.

## Marketplace

The `/store` route also renders a **Player market** panel that lists item
prices and a 24h price-trend chart. Both are served by a standalone read-only
Rust API (`server/`, crate `azoth-market`) that returns a **deterministic,
seeded in-memory snapshot**: the listings and trend series are hardcoded at
startup, so responses are stable across restarts and identical on every
machine; they are **not** a live feed, do not reflect real player trades, and
do not change over time. The panel is purely presentational: it performs no
authentication, payment settlement, inventory mutation, or database access,
and it never holds secrets or player identifiers.

### Local startup

Start the Rust API (listens on `127.0.0.1:8787` by default):

```sh
cargo run --manifest-path server/Cargo.toml
```

Override the bind address with the `MARKET_ADDR` environment variable
(a `SocketAddr`, e.g. `MARKET_ADDR=0.0.0.0:9000`). Then start the Vite dev
server as usual:

```sh
npm run dev
```

Vite proxies `/api` → `http://127.0.0.1:8787`, so the browser panel resolves
`/api/v1/*` through the dev server. To point the frontend at a different
origin entirely, set `VITE_MARKET_API_URL` (e.g. `https://market.example.com`)
— when unset the panel defaults to `/api/v1`.

### API routes

All endpoints are `GET`-only and return JSON:

| Method | Route                    | Description                                        |
| ------ | ------------------------ | -------------------------------------------------- |
| GET    | `/healthz`               | Liveness probe; returns `{"status":"ok"}`.         |
| GET    | `/api/v1/items`          | Snapshot listings: `{"items":[ItemSummary,…]}`.     |
| GET    | `/api/v1/items/{slug}`   | One listing; unknown `slug` → `404 {"error":"item_not_found"}`. |
| GET    | `/api/v1/items/{slug}/trends?range=24h` | Price series (oldest→newest); unknown range → `400 {"error":"unsupported_range"}`. |

Prices are non-negative emerald integers; trend points carry RFC3339 UTC
timestamps. When the API is unreachable or returns a non-2xx response, the
panel shows an explicit "Market feed is currently unavailable." state instead
of a broken layout, so the donation catalog and delivery note remain intact.

### Testing

The Playwright suite (`npm test`) detects whether the Cargo toolchain is
installed and behaves deterministically in either case:

- **Cargo present** — `playwright.config.ts` starts the Rust API as a
  `webServer`, and the seeded-snapshot tests (render, economy metrics, selection)
  exercise the service's deterministic in-memory data.
- **Cargo absent** — the Rust service is not started, and those same
  seeded-snapshot tests are **skipped** (reported as `skipped`, not failing) with
  an explicit "requires the Rust azoth-market service" reason. The
  unavailable-feed test still runs: it aborts every `/api/v1` request and
  asserts the "Market feed is currently unavailable." state, so the no-service
  path always has coverage even on a machine without Rust.

Run the suites for a single spec with
`npx playwright test tests/marketplace.spec.ts`; pass `--list` to confirm which
cases would be skipped before invoking Cargo.

### Production reverse proxy

In production the Rust API is **not** expected to be publicly exposed by
default. Terminate TLS and route `/api/v1/*` (and `/healthz`) to the Rust
service on port `8787` (or whatever `MARKET_ADDR` binds) through your reverse
proxy (Caddy, nginx, Cloudflare, …). The proxy must map the same origin as the
site so `/api/v1` resolves automatically; alternatively set
`VITE_MARKET_API_URL` to the proxied base URL at build time. No CORS of
concern is needed because requests are same-origin through the proxy; the
service itself sends permissive GET-only, no-credential CORS for local
development.

## News

The `/news` page renders Markdown posts compiled at build time. To publish:

1. Add a new `.md` file to `src/news/posts/` with a slug-style filename.
2. Start it with a `---` front-matter block containing `title`, `date` (YYYY-MM-DD), and `summary`.
3. Body is standard Markdown (headings, lists, links, code, blockquotes).

Rebuild and deploy — the index and `/news/:slug` routes pick the post up automatically.

## Forum

The `/forum` route is a native, branded launch page (no iframe) that links out to a
self-hosted Discourse instance. Configure the destination once via
[`docs/discourse.md`](docs/discourse.md) sections 2–3. The frontend reads it through
`getDiscourseUrl()` in `src/forum/config.ts`, which accepts only `http:`/`https:` URLs and
returns `null` when the variable is missing or malformed — the page then shows an
explicit "Discourse is not configured" state instead of a broken link.

Discourse itself is not vendored or provisioned here; run it with the official Discourse
Docker Manager and keep every secret (SMTP credentials, admin email, deploy keys) in the
host's `app.yml`/environment, never in this repo. Mirror the site's Chakra semantic
tokens and component styling in Discourse via Admin → Customize → Themes so the forum
matches the site. Full local setup, production prerequisites (VPS, DNS, TLS, SMTP,
storage, backups, admin), and the styling checklist are in `docs/discourse.md`.

## Tech

Built with Vite, React 19, react-router, Chakra UI v3, and TypeScript 7.
