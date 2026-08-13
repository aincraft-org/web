# Discourse Forum — Local Setup, Production, and Styling Synchronization

AzothMC ships a native `/forum` launch page (no iframe) that points visitors at a
self-hosted [Discourse](https://www.discourse.org/) instance. The Discourse Origin is
configured through the `VITE_DISCOURSE_URL` environment variable and read at build time
by `getDiscourseUrl()` in `src/forum/config.ts`. This page is a branded doorway: the
forum itself lives on its own origin, runs Discourse, and is styled to match the site.

This document covers:

1. What this repository does **and does not** provision.
2. Running Discourse locally with the official Docker Manager (nothing vendored here).
3. Wiring the local hostname into the frontend.
4. Production prerequisites (VPS, DNS, TLS, SMTP, storage, backups, admin).
5. A concrete styling-synchronization checklist for
   **Admin → Customize → Themes**.

---

## 1. Scope: what this repo can and cannot do

**This repository provides:**

- A native `/forum` route that renders a branded launch page and a single CTA linking to
  the configured Discourse origin.
- `getDiscourseUrl(): string | null` (`src/forum/config.ts`), which reads
  `VITE_DISCOURSE_URL`, trims it, accepts **only** `http:` or `https:` URLs, and returns
  `null` when the variable is absent or malformed.
- An explicit, non-broken "Discourse is not configured" state on `/forum` when the
  destination is missing.
- This operations guide.

**This repository does NOT:**

- Vendor, build, or install Discourse. Discourse runs on your machine or server via its
  own official installer (section 2).
- Provision a VPS, domain, DNS, TLS certificate, SMTP relay, or backups. Those are
  external, privileged infrastructure you create outside this repo.
- Store any secret. Discourse admin email, SMTP credentials, API keys, and deploy keys
  belong in Discourse's own runtime config (the Docker `app.yml` / env), **never** in
  this repository, `.env`, `.env.local`, or any committed file. See section 4.
- Embed Discourse in an iframe, reverse-proxy its API, or reach into its DOM — the SPA
  deliberately links out instead, so styling is synchronized by **mirroring brand values
  in Discourse's theme settings** (section 5), not by injecting CSS cross-origin.

---

## 2. Local setup (official Discourse Docker Manager)

Discourse publishes an official Docker Manager that boots a prebuilt Discourse image.
We do **not** clone Discourse's app source into this repo; the installer lives in its own
directory and pulls the official image.

### 2.1 Prerequisites

- A 64-bit Linux machine (macOS/Windows dev candidates are possible but the official
  flow assumes Linux).
- Docker Engine with the `docker` group membership for your user (or `sudo` for `docker`
  and `launcher`).
- Git CLI (the Docker Manager is a git repo).
- A hostname the **browser** can resolve to your machine (see 2.3). Discourse refuses to
  run on a bare `localhost` by default and requires a real-looking `DISCOURSE_HOSTNAME`.
- Ports 80 and 443 free on the host (Discourse listens on both).

### 2.2 Install and bootstrap

Follow the official Discourse Docker Manager flow against its own repo (paths outside
this project):

```sh
# 1. Clone the Docker Manager (NOT this repo) into a system path.
sudo git clone https://github.com/discourse/discourse_docker.git /var/discourse
cd /var/discourse

# 2. First-time interactive bootstrap. This asks for:
#    - the hostname (DISCOURSE_HOSTNAME, see 2.3)
#    - the admin/developer email (DISCOURSE_DEVELOPER_EMAILS)
#    - SMTP settings (see 4.4)
sudo ./discourse-setup

# 3. Stand up the container (described in detail at
#    https://github.com/discourse/discourse_docker — official docs):
sudo ./launcher bootstrap app
sudo ./launcher start app
```

`discourse-setup` writes `/var/discourse/containers/app.yml`. For **local-only**
testing the SMTP section can use a placeholder service such as `Mailhog`/`Mailpit`
(see the Docker Manager docs) — do not reuse production SMTP credentials here.

Verify the container is up:

```sh
sudo ./launcher enter app   # drop into the running container
discourse --version         # confirms Discourse is booted
```

The first boot performs migrations and can take a few minutes. Admin bootstrap is
triggered by email; locally that email is delivered to the SMTP sink you configured.

### 2.3 Local hostname and browser resolution

Discourse binds to the hostname set in `DISCOURSE_HOSTNAME` in `app.yml`. For local work
pick something the browser can map to `127.0.0.1`:

- Prefer a dedicated `.test`-style name, e.g. `forum.test` (`forum.azothmc.test`).
  `.test` is reserved and never resolves publicly.
- Add it to `/etc/hosts` (Linux/macOS) or the Windows Hosts file:

  ```sh
  127.0.0.1  forum.azothmc.test
  ```

- Because `/forum` links to the Discourse origin over the browser, plain HTTP to
  `http://forum.azothmc.test:...` works for local smoke tests. Discourse expects to
  serve on 80/443; during local dev you may run it behind a proxy/port map — simplest is
  to keep the standard ports and just point `/etc/hosts` at `127.0.0.1`.

Update `app.yml` if you change the hostname, then:

```sh
sudo ./launcher rebuild app
sudo ./launcher start app
```

## 3. Wiring the frontend

The SPA reads **one** environment variable, `VITE_DISCOURSE_URL`. Because it is a
`VITE_` value it is **baked in at build time** — the running app does not re-read it.

### 3.1 Setting it locally

Create (do not commit) a local env file. `.env.local` is git-ignored and never checked in:

```sh
# .env.local  (untracked, local only)
VITE_DISCOURSE_URL=http://forum.azothmc.test
```

Then start the dev server:

```sh
npm run dev
```

Restart the dev server after changing `VITE_DISCOURSE_URL` — Vite reads env at startup.

### 3.2 Validation rules

`getDiscourseUrl()` (`src/forum/config.ts`) returns:

- The normalized URL string when `VITE_DISCOURSE_URL` is present, trims cleanly, and
  parses as an absolute URL with scheme `http:` or `https:`. Any other scheme
  (`ftp:`, `javascript:`, relative paths, etc.) is rejected.
- `null` when the variable is missing, empty, or fails the above checks.

The `/forum` page then renders the Discourse CTA only when a valid URL is returned; when
`getDiscourseUrl()` returns `null`, the page shows the explicit
**"Discourse is not configured"** setup message linking to this document instead of a
broken link. This keeps the page usable without a configured forum.

The most common pitfalls:

- **Trailing space or newline** in the env line — trimmed automatically, but clean input
  avoids surprises.
- **Scheme omitted** (`forum.azothmc.test`) — rejected; prefix with `http://` or
  `https://`.
- **Forgetting the dotenv/local file** — if `getDiscourseUrl()` returns `null`, confirm
  `.env.local` exists and the dev server was restarted.

### 3.3 Production build

Set `VITE_DISCOURSE_URL` to the real `https://` origin at build time on the deploy host
or CI. Never commit it. After the variable is baked in, the static build does not need
the value at runtime.

---

## 4. Production prerequisites

This repo never creates these. When you are ready to go public, provision them outside
the repo:

### 4.1 Compute (VPS)

- A Linux VPS with ≥2 GB RAM (Discourse's container + Postgres + Redis + Ruby comfortably
  exceed 1 GB). 4 GB is the comfortable baseline for a community forum.
- A static public IPv4 and, ideally, IPv6.
- Docker installed on the VPS; the Docker Manager flow from section 2 runs identically
  there.

### 4.2 Domain and DNS

- A real domain you control (example: `forum.azothmc.com`).
- DNS `A`/`AAAA` record(s) pointing that hostname at the VPS IP.
- Optionally a `CNAME`/`ALIAS` from a vanity hostname to the canonical one.

### 4.3 TLS

- Set `DISCOURSE_HOSTNAME` to the public hostname in `/var/discourse/containers/app.yml`.
- Discourse's Docker Manager auto-provisions a Let's Encrypt certificate on first
  bootstrap when a public hostname resolves — no manual cert files required. Keep the
  renewal job running (`./launcher` handles it via `web.tlscertbox`).
- After enabling HTTPS, rebuild and restart: `./launcher rebuild app`.

### 4.4 SMTP (required — Discourse will not send welcome/admin/notification mail without it)

- Provide a real SMTP relay and credentials in `app.yml` (`DISCOURSE_SMTP_ADDRESS`,
  `DISCOURSE_SMTP_PORT`, `DISCOURSE_SMTP_USER_NAME`, `DISCOURSE_SMTP_PASSWORD`,
  `DISCOURSE_SMTP_ENABLE_START_TLS`). These are **secrets** — store them only in the
  server-side `app.yml`/env on the host, never in this repository.
- At minimum configure a `from` address and the admin email in
  `DISCOURSE_DEVELOPER_EMAILS`.

### 4.5 Persistent storage and backups

- Discourse persists to Docker volumes (`/var/discourse/shared`) — Postgres data,
  uploads, backups. Back these up.
- Use Discourse's built-in backup from **Admin → Backups**, and store the resulting
  archive off-host (object storage or another server). For a CLI backup, enter the
  app container and run the Discourse backup command documented for your installed
  release; do not assume a `launcher backup` subcommand.
- Write and test a restore runbook against the official Discourse backup/restore
  documentation before trusting the backups.

### 4.6 Admin bootstrap

- The developer email supplied during `discourse-setup` receives the bootstrap link
  and becomes the initial admin. Verify that account before announcing the forum.
- Set **Site Settings → login required** and **invitation only** per moderation policy.

- Keep Discourse and the Docker image updated (`./launcher rebuild app` on the Stable
  channel) — this is the single most important ongoing task.
- Do not expose Postgres/Redis/admin ports publicly; Discourse's default binds them to
  the container network already — do not undo that.
- Put the frontend site and the forum behind the same TLS posture; there is no CORS
  concern because the SPA only links out, it never calls Discourse's API cross-origin.

---

## 5. Styling synchronization checklist

The SPA's current visual language is expressed through Chakra semantic tokens used by
the existing components (see `src/theme/index.ts` and the page/component files under
`src/`). To make Discourse match, apply the corresponding values in
**Admin → Customize → Themes → “Edit” → Colors / Components**, choosing the theme's
corresponding settings. **Exact parity still requires verifying desktop and mobile in
the browser** — the values below are the synchronization target, not an automated
link to the SPA.
The values below are a manually maintained synchronization target, not exported
semantic tokens from the current Chakra setup. Exact parity requires browser checks.

### 5.1 Color palette

The site's palette is a dark "ink" UI with a warm paper text layer and a single warm
accent. Transcribe these into the Discourse theme Color Scheme:

| Token | Value      | Site usage                                      | Discourse target |
| ----- | ---------- | ----------------------------------------------- | ---------------- |
| `ink.950` | `#071316` | page background                                  | `primary-lowest` |
| `ink.900` | `#0b1d22` | section/footer backgrounds                       | `primary-very-low` |
| `ink.850` | `#10272b` | intermediate background                         | secondary background |
| `ink.800` | `#153238` | card surfaces                                   | `primary-low` |
| `ink.700` | `#1d494b` | hover surfaces                                  | hover background |
| `paper.bright` | `#fbf9f0` | headings and primary text                  | `primary` |
| `paper.deep` | `#d7ceb7` | body text                                      | `primary-medium` |
| `paper.DEFAULT` | `#eee9d8` | light surfaces                             | `primary-high` |
| `paper.ink` | `#162a2d` | text on light surfaces                       | inverse-surface text |
| `paper.muted` | `#607372` | secondary text                                | `primary-low-mid` |
| `accent.400` | `#d8f26b` | links, buttons, active tabs, focus rings     | `tertiary` |
| `accent.strong` | `#a9d83f` | accent hover                                | `tertiary-high` |
| `mint.400` | `#83d4c0` | markers and borders                           | `highlight` |
| `orange.400` | `#f3b064` | warm highlights                               | warning color |

Setting notes for the themed accents:

- Underline **links** with the site's link style (`accent.400` text, thin underline).
- Buttons: background = `accent.400`, text = `ink.950` (`#071316`), hover = `accent.strong`
  — mirror the site's primary CTA.
- Focus-visible outlines use `accent.400` (`2px`, offset). Discourse's default focus
  ring should be switched to the accent so keyboard users see the same emphasis.
- **Body/heading font:** `system-ui, sans-serif` is the current fallback used by the
  default Chakra system. If a branded font is selected for the site later, use that
  same family for Discourse headings and body text.
- **Monospace labels:** use a monospace family for code, badges, and metadata to echo
  the site's eyebrow labels.
- Load any custom font through the Discourse theme's **Common CSS** and approved theme
  assets or an externally hosted font source; there is no generic “Fonts” tab to rely on.
- Upload `public/assets/logo.png` from this repo as the Discourse **logo** and
  **logo small** in **Admin → Customize → Themes → Edit → Common/Header**.
- Set the site **title** and tagline to match the AzothMC voice (e.g. `AzothMC` /
  matching field-guide phrasing) and the site favicon.

### 5.4 Radius and layout

- The site currently relies on Chakra's default radius and system font fallbacks. Keep
  Discourse controls modestly rounded and use the same system font stack unless the
  site adopts explicit brand tokens later.
- **Content width / spacing:**
  - Landing hero caps at `1500px`; journal/store/news sections at `1200px`; the join
    panel at `900px`; prose at `78ch`.
  - Adjust the Discourse theme's layout CSS (for example, its max-width variables)
    toward the site's `1200px` reading feel; do not look for a nonexistent
    `content-width` Site Setting.
  - Keep card gutters and generous vertical rhythm (site uses `py` of `16`–`24`).

### 5.5 Responsive checks (do these after applying)

1. Desktop ≥1280 px — header nav, topic list, and login panel align with the site's
   `1200px` container.
2. Tablet ~768–1024 px — sidebar collapses gracefully; no horizontal scroll.
3. Mobile ≤480 px — the topic list and composer use full width; mono eyebrows do not
   overflow; focus outlines remain visible (WCAG-ish 2px accent, sufficient contrast).
4. Contrast: `accent.400` on `ink.*` and `paper.*` on `ink.*` pass AAA-ish for text;
   re-check any Discourse auto-generated colors after switching the scheme.

### 5.6 Where values live for future edits

Keep this checklist in sync with the code:

- Chakra setup: `src/theme/index.ts`; component-level styling: `src/components/`,
  `src/news/`, `src/store/`, and `src/forum/`.
- Logo: `public/assets/logo.png`.
- If the site's semantic tokens or component styling changes, update the Discourse
  theme via Admin → Customize → Themes → Components, then re-run the responsive checks
  in 5.5.

---

## 6. Verifying end to end

Local smoke path once both halves run:

1. Discourse up on `http://forum.azothmc.test` (section 2).
2. `VITE_DISCOURSE_URL=http://forum.azothmc.test` in `.env.local` (section 3).
3. `npm run dev`, open `http://localhost:5173/forum` → the launch page's CTA links to the
   Discourse origin with the external-link label.
4. Remove `VITE_DISCOURSE_URL` → reload → the explicit **not configured** state appears
   and the CTA is hidden (no broken link).

Do not run project-wide validation here — the parent runs typecheck/build/Playwright after
all edits. This repo contains no Discourse credentials, config, or provisioned
infrastructure; every secret stays in the host's `app.yml`/environment.
