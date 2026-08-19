# AzothMC Web Application

AzothMC is a Rust server-rendered Minecraft MMORPG website and read-only marketplace API.

## Run

```sh
cargo run --manifest-path server/Cargo.toml
```

The server listens on `127.0.0.1:8787` by default. Override it with `MARKET_ADDR`.

Optional configuration:

- `DISCOURSE_URL`: absolute `http://` or `https://` forum origin.
- `STATIC_DIR`: directory for files served under `/assets/`; defaults to `public`.

## Routes

- `/` — landing page
- `/news` and `/news/{slug}` — news index and Markdown articles
- `/store` — catalog, filters, search, purchase links, and market panel
- `/forum` — Discourse launch page
- `/healthz` and `/api/v1/*` — health and marketplace JSON APIs

Rust owns route dispatch, HTML rendering, static assets, progressive store enhancement, and the marketplace API. Node, Vite, React, and a client-side router are not required to run the application.

## Test

```sh
cargo test --manifest-path server/Cargo.toml
server/tests/routes.sh
```

Marketplace data is a deterministic in-memory snapshot, not a live trading feed.
