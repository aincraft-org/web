# AzothMC Rust Migration Design

## Goal

Migrate the AzothMC web application from the React/Vite client architecture to a Rust-owned server-rendered application while preserving public routes, content, marketplace API contracts, and browser-visible behavior.

## Decision

Use an incremental Rust server-rendered cutover. Rust becomes the production serving boundary. Existing React routes remain as a parity reference and temporary fallback until each route is migrated and verified; no route is deleted before equivalent Rust behavior is covered.

## Architecture

- `server/` becomes the Rust application workspace and owns HTTP routing, HTML rendering, static assets, content loading, and the existing marketplace API.
- Axum continues to provide HTTP routing and Tokio provides the runtime.
- Server-rendered HTML uses Rust templates/components rather than a browser SPA.
- Browser JavaScript is limited to progressive enhancement required for clipboard actions, navigation behavior, and marketplace refreshes.
- `/api/v1/*` and `/healthz` retain their existing JSON contracts.
- `/`, `/news`, `/news/:slug`, `/store`, and `/forum` are migrated one route family at a time.
- Vite/React files remain only until the corresponding route family has parity evidence; final removal happens after all route families pass the migrated end-to-end checks.

## First Vertical Slice

The first slice adds Rust-owned HTML for `/` and a static-file fallback. It must:

1. Serve a complete HTML document from Rust at `/`.
2. Preserve the AzothMC identity, server address, primary navigation, landing sections, and join call-to-action.
3. Serve built/static files from a configured directory without changing API routes.
4. Keep the marketplace API and health endpoint behavior unchanged.
5. Be deterministic and testable through Axum integration tests.

## Route Migration Order

1. Landing page and shared shell.
2. News index/article rendering and front matter parsing.
3. Store catalog and marketplace client behavior.
4. Forum launch page and URL validation.
5. Clipboard/progressive enhancement scripts.
6. Remove Vite/React dependencies and obsolete frontend code after parity verification.

## Compatibility and Error Handling

- Preserve existing route paths and response status semantics.
- Unknown news slugs and invalid API identifiers return explicit not-found responses.
- Missing optional integrations render explicit unavailable/configuration states.
- No secrets move into source or committed configuration.
- Static-file misses fall through to route handlers; API errors remain JSON.

## Verification

Each migrated route requires Rust tests for rendering and status behavior plus a browser smoke test against the Rust server. The existing Playwright suite remains active during migration. The final cutover requires Rust tests, the browser suite, and a production-style static asset smoke test.
