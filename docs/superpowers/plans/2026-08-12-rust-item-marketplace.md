# Rust Item Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tested Rust HTTP marketplace API and integrate its item listings and economy trends into the existing `/store` view without regressing the donation catalog.

**Architecture:** A standalone `server/` Rust crate uses axum with seeded in-memory data and read-only JSON endpoints. The React `/store` route adds a `MarketplacePanel` that fetches listings and trends through `/api/v1`, with Vite proxy support and a graceful unavailable-feed state.

**Tech Stack:** Rust 2021, axum 0.8, tokio 1, serde/serde_json 1, tower-http 0.6, React 19, TypeScript 7, Chakra UI 3, Vite 8, Playwright.

## Global Constraints

- Preserve the existing 12 donation `product-card` nodes and Tebex deep-link behavior.
- No authentication, payment settlement, inventory mutation, database, secrets, or player identifiers.
- Rust API defaults to `127.0.0.1:8787`; `MARKET_ADDR` may override it.
- Frontend uses `VITE_MARKET_API_URL` when present and `/api/v1` otherwise.
- Prices are non-negative emerald integers; trend points are oldest-to-newest.
- Unknown items return 404 JSON; unsupported ranges return 400 JSON.
- Run focused tests for each task; do not run formatters, linters, or project-wide suites inside delegated tasks.

---

### Task 1: Rust marketplace service

**Files:**
- Create: `server/Cargo.toml`
- Create: `server/src/main.rs`
- Create: `server/src/market.rs`

**Interfaces:**
- Produces `GET /healthz`, `GET /api/v1/items`, `GET /api/v1/items/{slug}`, and `GET /api/v1/items/{slug}/trends?range=24h`.
- JSON types exactly match the design spec: `ItemSummary`, `TrendResponse`, `TrendPoint`, and `{error}` responses.

- [ ] Define axum/tokio/serde/tower-http dependencies and a binary crate.
- [ ] Implement seeded item summaries and trend points with deterministic RFC3339 timestamps.
- [ ] Implement route handlers, path/query validation, explicit 400/404 JSON errors, and GET-only permissive local CORS.
- [ ] Add unit/router tests for all success and error contracts.
- [ ] Run `cargo test --manifest-path server/Cargo.toml`.

### Task 2: Frontend marketplace integration

**Files:**
- Create: `src/store/components/MarketplacePanel.tsx`
- Create: `src/store/components/TrendChart.tsx`
- Modify: `src/store/StoreApp.tsx`
- Modify: `vite.config.mjs`

**Interfaces:**
- Consumes `GET /api/v1/items` and `GET /api/v1/items/{slug}/trends?range=24h`.
- Produces accessible `data-testid="marketplace-panel"`, `market-item`, `market-trend`, and unavailable state markers.

- [ ] Define frontend API types and fetch helpers with `VITE_MARKET_API_URL` fallback.
- [ ] Render listings with name, category, emerald price, 24h change, volume, and activity.
- [ ] Select the first item by default and fetch its trend; selecting another item replaces the chart.
- [ ] Render a dependency-free SVG trend chart with accessible summary and empty/loading states.
- [ ] Keep donation catalog layout and delivery note intact.
- [ ] Add Vite `/api` proxy targeting `http://127.0.0.1:8787`.
- [ ] Run `npm run typecheck`.

### Task 3: End-to-end coverage and developer operations

**Files:**
- Modify: `playwright.config.ts`
- Create: `tests/marketplace.spec.ts`
- Modify: `README.webshop.md`

**Interfaces:**
- Playwright starts the Rust service before Vite tests when Cargo is available.
- README documents `cargo run --manifest-path server/Cargo.toml`, `MARKET_ADDR`, and `VITE_MARKET_API_URL`.

- [ ] Add a Playwright web server entry for the Rust API on port 8787 with a deterministic cargo command.
- [ ] Assert market listings, trend chart, economy metrics, item selection, and no regression to 12 donation cards.
- [ ] Assert API-unavailable copy remains visible when requests fail.
- [ ] Document local startup, API routes, and production reverse-proxy requirement.
- [ ] Run focused marketplace Playwright tests and the existing store tests.

### Task 4: Whole-feature verification

**Files:**
- No new files unless verification exposes a defect.

- [ ] Run `cargo test --manifest-path server/Cargo.toml`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `npm test` with the Rust service available.
- [ ] Inspect the changed files and confirm no secrets, payment APIs, or write endpoints were introduced.
