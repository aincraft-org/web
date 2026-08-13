# AzothMC Rust Item Marketplace — Design Spec

Date: 2026-08-12
Status: Approved by implementation decision (user requested Rust backend)

## Context

The existing `web/` project is a Vite + React 19 SPA. `/store` is a static donation/perk catalog with no runtime API or backend. The requested feature is a player-facing item marketplace that shows economy trends in the same view, backed by a Rust service.

## Goals

- Add a standalone Rust HTTP service under `server/` with deterministic seeded marketplace data.
- Expose item listings, item detail, and price-history trend endpoints.
- Extend the existing `/store` view without removing the donation catalog or changing its existing checkout contract.
- Show current price, 24-hour movement, volume, market activity, and a selectable price trend chart.
- Keep the service secretless and suitable for local development and a later persistent store.
- Provide automated Rust unit/API tests and a frontend smoke path with a graceful API-unavailable state.

## Non-goals

- No authentication, order settlement, player inventory mutation, wallet, or payment processing.
- No database migration or external market provider; seeded in-memory data is the source for this increment.
- No change to Tebex links, donation-package semantics, or existing product-card counts.

## Architecture

```text
server/
  Cargo.toml
  src/main.rs       axum server, routes, CORS, startup
  src/market.rs     domain types, seeded repository, trend calculations

web SPA /store
  MarketplacePanel  fetches API and owns selected item/loading/error state
  TrendChart         SVG chart rendered from trend points
```

The Rust service listens on `127.0.0.1:8787` by default, configurable with `MARKET_ADDR`. The frontend uses `VITE_MARKET_API_URL` when supplied and otherwise requests `/api/v1`; Vite proxies `/api` to the Rust service during development. The service allows GET requests from the local frontend origin through permissive CORS; no credentials are accepted.

## API contract

- `GET /healthz` → `{ "status": "ok" }`
- `GET /api/v1/items` → `{ "items": [ItemSummary, ...] }`
- `GET /api/v1/items/{slug}` → `ItemSummary` or `404` JSON `{ "error": "item_not_found" }`
- `GET /api/v1/items/{slug}/trends?range=24h` → `{ "slug": string, "range": "24h", "points": [{ "timestamp": RFC3339, "price": number }] }`

`ItemSummary`:

```json
{
  "slug": "emberheart",
  "name": "Emberheart Core",
  "category": "Relic",
  "description": "A volatile core sought by forge guilds.",
  "price": 1840,
  "currency": "emeralds",
  "change_24h": 7.4,
  "volume_24h": 128,
  "market_activity": "Rising",
  "image": "/assets/loot-bg.jpg"
}
```

Prices are non-negative integers in emeralds. Trend points are ordered oldest to newest. Unknown range values return `400` JSON `{ "error": "unsupported_range" }`; unknown slugs return `404`.

## Frontend behavior

`MarketplacePanel` appears below the existing donation catalog and before the delivery note, with heading “Trade Market” and an explicit “Live economy feed” status. On load it fetches listings. Clicking an item selects it and fetches its 24-hour trend. Loading uses visible skeleton/copy; API failure shows “Market feed unavailable” and retains the rest of `/store`; no fake success state is shown. The default selected item is the first listing. Trend chart includes accessible text summary, data labels/tooltips via SVG `<title>`, and a no-data fallback.

The existing donation store remains unchanged: 12 `product-card` nodes, category/search URL state, Tebex deep links, delivery copy, and current tests continue to pass.

## Testing

- Rust unit tests cover seeded catalog invariants, trend ordering, unsupported range, unknown item, and non-negative prices.
- Rust integration-style router tests call the axum service with `tower::ServiceExt` and assert health, list, detail, trend, 404, and 400 responses.
- Frontend Playwright test starts the Rust service separately when available, asserts marketplace heading/list/trend content, and a separate unavailable-feed test intercepts API requests to assert the error state without hiding the donation store.
- `npm run typecheck`, `npm run build`, `cargo test --manifest-path server/Cargo.toml`, and the focused Playwright suite are required verification commands.

## Security and operations

No secrets, cookies, writes, or player identifiers enter the service. Bind address is explicit and local by default. CORS is restricted to GET methods and does not allow credentials. A production deployment must place the service behind TLS and a reverse proxy; persistence and authentication are future work outside this increment.
