# AzothMC webstore

The `/store` route is a static catalog that sends each purchase to a public Tebex package URL. Edit `src/store/catalog.ts` when the Tebex package slugs or display copy change. The public store origin is configured once in `src/store/config.ts` as `STORE_ORIGIN`.

The catalog is rendered as an artwork-first card grid. Each package supplies an `image` path
from `public/assets/` and descriptive `imageAlt` text in `src/store/catalog.ts`; the card keeps
the artwork prominent while retaining the package perks, price, category filter, search, and
secretless Tebex deep link.

Production hosting must rewrite `/store` and other client-side routes to `index.html` (SPA fallback), while serving `/assets/*` normally. Configure the Tebex custom domain `store.azothmc.com` with its DNS CNAME and Tebex Plus before replacing the placeholder package slugs.

Install the official Tebex plugin on the Minecraft server and configure each Tebex package's delivery commands. Tebex polls paid orders and the server delivers perks in-game, including for offline players.

This repo contains no payment credentials or Tebex API secrets. The Tebex plugin secret belongs in the server/Tebex integration configuration only.

## News

The `/news` page renders Markdown posts compiled at build time. To publish:

1. Add a new `.md` file to `src/news/posts/` with a slug-style filename.
2. Start it with a `---` front-matter block containing `title`, `date` (YYYY-MM-DD), and `summary`.
3. Body is standard Markdown (headings, lists, links, code, blockquotes).

Rebuild and deploy — the index and `/news/:slug` routes pick the post up automatically.

## Tech

Built with Vite, React 19, react-router, Chakra UI v3, and TypeScript 7.
