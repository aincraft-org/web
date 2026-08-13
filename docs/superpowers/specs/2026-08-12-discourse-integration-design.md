# Discourse Forum Integration — Design Spec

Date: 2026-08-12
Status: Approved for implementation by continuation directive

## Context

AzothMC is a Vite + React 19 single-page site using React Router and Chakra UI. It currently has landing, store, and news routes. The forum will be self-hosted with Discourse, starting locally and later moving to a VPS/domain.

## Goals

- Add a native `/forum` entry page to the site.
- Make the Discourse destination configurable through `VITE_DISCOURSE_URL`.
- Match the existing AzothMC visual language through existing Chakra layout and color conventions.
- Prepare a local-first, Docker-based Discourse deployment path without committing credentials.
- Document the production prerequisites and the Discourse theme synchronization steps.
- Add browser coverage for the route, configured destination, and missing configuration state.

## Non-goals

- No iframe embedding or cross-origin DOM styling.
- No Discourse API proxy, authentication service, or SSO in this increment.
- No production VPS provisioning, DNS changes, SMTP setup, or secret creation from this repository.
- No credentials or private Discourse configuration committed to source control.

## Architecture

```text
React SPA
  /forum route
    ForumApp -> ForumHero -> configured external Discourse link

Environment
  VITE_DISCOURSE_URL -> normalized, validated forum origin

Operations
  docs/discourse.md -> local Docker setup, production prerequisites,
                       Discourse theme-token synchronization checklist
```

The SPA owns a branded launch page rather than embedding Discourse. This avoids iframe sizing, cross-origin CSS, CSP, and authentication coupling. Discourse owns the forum experience at its own origin. Styling is synchronized by reusing the site’s visible brand values in Discourse’s theme settings, not by attempting to control Discourse DOM from the SPA.

## Frontend behavior

- Add `Forum` to the existing data-driven navigation list.
- `/forum` renders a responsive page with a kicker, heading, concise community copy, and a primary link to Discourse.
- If `VITE_DISCOURSE_URL` is valid, the primary link points to it and carries a clear external-link label.
- If the variable is absent or invalid, the page remains usable and displays an explicit setup message instead of rendering a broken link.
- The page sets and restores `document.title` using the same pattern as the news route.
- Existing routes and navigation remain unchanged.

## Deployment behavior

Local Discourse is documented using the official Discourse Docker Manager workflow. The repository does not vendor Discourse or attempt to automate privileged Docker installation. Local deployment requires Docker, a hostname resolvable by the browser, and a Discourse admin bootstrap configuration. Production requires a VPS, domain/DNS, TLS, SMTP, persistent storage/backups, and admin credentials.

## Testing

- Playwright verifies `/forum` renders the branded page.
- Playwright verifies a configured URL produces the expected destination.
- Playwright verifies missing configuration produces the explicit setup state.
- Existing typecheck, build, and Playwright suites must continue to pass.

## Styling synchronization checklist

The setup documentation will map the site’s current visual choices to Discourse theme settings: dark ink/background colors, warm accent color, readable body text, display-heading treatment, logo asset, favicon, button radius, and content-width/spacing expectations. The checklist will be explicit that exact parity requires applying the values in Discourse Admin → Customize → Themes and verifying desktop/mobile rendering.
