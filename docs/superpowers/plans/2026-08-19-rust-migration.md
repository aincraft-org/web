# AzothMC Rust Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish Rust as the serving boundary with a tested server-rendered landing page while preserving the existing marketplace API.

**Architecture:** Extend the existing Axum service with a shared HTML shell, landing-page renderer, and static-file handler. Keep the current React app as a temporary parity reference; migrate additional route families only after this slice is verified.

**Tech Stack:** Rust 2021, Axum 0.8, Tokio, Serde, Tower HTTP, existing React/Vite reference app.

## Global Constraints

- Preserve `/healthz` and `/api/v1/*` JSON contracts exactly.
- Do not introduce secrets or committed environment values.
- Keep rendering deterministic.
- Do not remove existing frontend routes during the first slice.
- Run focused Rust tests before broader smoke tests.

---

### Task 1: Add Rust landing renderer

**Files:**
- Create: `server/src/site.rs`
- Modify: `server/src/main.rs`
- Test: `server/src/main.rs` module tests

**Interfaces:**
- Produces `site::landing_page() -> Html<String>`.
- Produces `site::static_file(Path<String>) -> impl IntoResponse`.
- Existing API handlers remain unchanged.

- [ ] **Step 1: Add failing route tests**

Add tests that call the router with `GET /` and assert status `200`, content type `text/html`, and body markers `AzothMC`, `play.azothmc.com`, `/store`, `/news`, `/forum`, and the landing section IDs `hero`, `intro`, `world`, `loot`, `quests`, `endgame`.

- [ ] **Step 2: Run focused tests and confirm failure**

Run `cargo test --manifest-path server/Cargo.toml landing_page`. Expected: failure because the `/` route is not registered.

- [ ] **Step 3: Implement deterministic HTML**

Create a Rust module returning a complete document with semantic header/nav/main/footer, the required landing sections, and a copy button carrying `data-copy-text="play.azothmc.com"`. Use escaped static literals only; no user input enters this first renderer.

- [ ] **Step 4: Register the route**

Add `mod site;` and route `GET /` before the API routes. Keep `/healthz` and `/api/v1/*` handlers unchanged.

- [ ] **Step 5: Run focused tests**

Run `cargo test --manifest-path server/Cargo.toml landing_page`. Expected: all landing route tests pass.

- [ ] **Step 6: Commit**

```sh
git add server/src/main.rs server/src/site.rs
git commit -m "feat: render landing page from Rust"
```

### Task 2: Add static-file serving

**Files:**
- Modify: `server/src/site.rs`
- Modify: `server/src/main.rs`
- Test: `server/src/main.rs` module tests

**Interfaces:**
- Reads `STATIC_DIR`, defaulting to `public` relative to the process directory.
- Serves existing files with content type inferred from extension.
- Returns `404` for missing files without intercepting API routes.

- [ ] **Step 1: Add failing static-file tests**

Create a temporary test fixture under `server/tests/fixtures/` containing `marker.txt`, request `/assets/marker.txt`, and assert `200` plus body `marker`. Request a missing file and assert `404`.

- [ ] **Step 2: Implement bounded static path resolution**

Reject path traversal components, resolve only under the configured static directory, read the file asynchronously, and return `404` on read failure. Set explicit MIME types for `.css`, `.js`, `.svg`, `.png`, `.jpg`, `.webp`, and `.txt`; use `application/octet-stream` otherwise.

- [ ] **Step 3: Register static route after API routes**

Register `/assets/{*path}` so it cannot shadow `/api/v1/*` or `/healthz`.

- [ ] **Step 4: Run focused and full Rust tests**

Run `cargo test --manifest-path server/Cargo.toml`. Expected: all existing API tests and new static tests pass.

- [ ] **Step 5: Commit**

```sh
git add server/src/main.rs server/src/site.rs server/tests/fixtures
git commit -m "feat: serve static assets from Rust"
```

### Task 3: Verify the first vertical slice

**Files:**
- Modify: `README.webshop.md` with Rust serving instructions only if current instructions are inaccurate.

- [ ] **Step 1: Launch the actual Rust server**

Run `cargo run --manifest-path server/Cargo.toml` with `MARKET_ADDR=127.0.0.1:8787`.

- [ ] **Step 2: Exercise landing and API routes**

Use HTTP requests to verify `/`, `/healthz`, `/api/v1/items`, and a missing static file. Confirm the landing response is HTML and API responses remain JSON.

- [ ] **Step 3: Run the existing browser suite where compatible**

Run `npm test -- --grep "landing|marketplace"`. Record any failures caused by the suite still targeting Vite rather than the Rust serving boundary; do not claim full migration from this slice.

- [ ] **Step 4: Review scope**

Confirm React/Vite files remain intentionally present, because news/store/forum have not yet been migrated. Document the next route family rather than deleting them.
