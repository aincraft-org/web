# Discourse Forum Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a branded `/forum` route linked to a configurable self-hosted Discourse instance and document local deployment plus styling synchronization.

**Architecture:** Keep Discourse on its own origin and add a native Chakra-styled launch page to the React SPA. Read and validate `VITE_DISCOURSE_URL` in a small forum config module; keep deployment instructions and theme synchronization in documentation without committing secrets or trying to provision privileged infrastructure.

**Tech Stack:** React 19, TypeScript 7, Vite 8, React Router 7, Chakra UI v3, Playwright, Discourse Docker Manager.

## Global Constraints

- No iframe embedding, API proxy, SSO, credentials, or production infrastructure provisioning.
- No secrets committed; `VITE_DISCOURSE_URL` is the only frontend configuration required.
- Reuse existing Chakra styling and data-driven navigation patterns.
- Preserve all existing routes and tests.

---

### Task 1: Add forum URL configuration

**Files:**
- Create: `src/forum/config.ts`
- Test: `tests/forum.spec.ts`

**Interfaces:**
- Produces `getDiscourseUrl(): string | null`, which trims the Vite environment value, accepts only `http:` or `https:` URLs, and returns `null` for absent or malformed values.

- [ ] **Step 1: Write the failing browser assertions**

Add tests that run with `VITE_DISCOURSE_URL=https://forum.example.test` and assert the forum link has that exact absolute URL, then run a missing-variable case and assert the setup message appears with no broken link.

- [ ] **Step 2: Run the focused test to verify the new route is absent**

Run: `npx playwright test tests/forum.spec.ts`
Expected: FAIL because `/forum` and its configuration module do not exist.

- [ ] **Step 3: Implement `getDiscourseUrl`**

Use `import.meta.env.VITE_DISCOURSE_URL`, trim it, construct `new URL(value)`, accept only `http:` and `https:`, and return `url.toString()`; catch parsing errors and return `null`.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS for the new module.

### Task 2: Add the branded forum route and navigation

**Files:**
- Modify: `src/content.ts:27-44`
- Modify: `src/App.tsx:1-12,53-54,55-100`
- Create: `src/forum/ForumApp.tsx`
- Create: `src/forum/components/ForumHero.tsx`
- Test: `tests/forum.spec.ts`

**Interfaces:**
- `ForumApp` is the route component at `/forum`.
- `ForumHero` accepts `discourseUrl: string | null` and renders either the external CTA or explicit configuration state.

- [ ] **Step 1: Extend the forum browser tests**

Assert `/forum` has `data-testid="forum-page"`, a visible “Community Forum” heading, the navigation item is active, the configured CTA has `target="_blank"` and `rel` containing `noopener`, and the missing URL state has no anchor with an empty destination.

- [ ] **Step 2: Run the focused test to verify failure**

Run: `npx playwright test tests/forum.spec.ts`
Expected: FAIL because the route and components are not present.

- [ ] **Step 3: Add the navigation item and route**

Add `{ to: '/forum', section: 'forum', index: 'FORUM', label: 'Forum', ariaLabel: 'Community Forum' }` after News. Import `ForumApp`, map `/forum` to active section `forum`, and add the route before the catch-all redirect.

- [ ] **Step 4: Implement the Chakra page**

Follow `NewsIndex`’s title lifecycle and page spacing. Use existing Chakra primitives and the current dark/warm visual language. Include concise forum copy, a primary external CTA when configured, and an explicit “Forum URL is not configured” state otherwise. Keep the external link safe with `target="_blank"` and `rel="noopener noreferrer"`.

- [ ] **Step 5: Run the focused browser test**

Run: `npx playwright test tests/forum.spec.ts`
Expected: PASS.

### Task 3: Document local deployment and style synchronization

**Files:**
- Create: `docs/discourse.md`
- Modify: `README.webshop.md`
- Modify: `.gitignore` only if an environment example requires it; do not add secrets.

**Interfaces:**
- Documentation defines local startup prerequisites, `VITE_DISCOURSE_URL`, production prerequisites, and the exact visual synchronization checklist.

- [ ] **Step 1: Document local Discourse setup**

Describe installing Docker, cloning the official Discourse Docker repository outside this project, running the Discourse setup flow, using a local hostname such as `forum.localhost` or a hosts-file entry, and setting `VITE_DISCOURSE_URL` before starting Vite. State that local email delivery may require a development SMTP sink and that production needs real SMTP.

- [ ] **Step 2: Document production prerequisites**

List VPS resources, DNS A/AAAA records, TLS, SMTP, persistent volume/backups, firewall, admin bootstrap, and the requirement to keep Discourse separate from the static SPA host.

- [ ] **Step 3: Document style synchronization**

Map the site’s existing logo/brand assets and Chakra visual treatment to Discourse Admin → Customize → Themes. Include dark background, warm accent, typography, logo/favicon, button radius, content width, and responsive checks. Explicitly state that this is a manual Discourse theme configuration step because cross-origin CSS cannot be controlled by the SPA.

- [ ] **Step 4: Add the forum route to the README**

Add a short Forum section linking to `docs/discourse.md`, explain the environment variable, and state that no credentials belong in the repository.

### Task 4: Full verification and review

**Files:**
- No new files.

- [ ] **Step 1: Run typecheck and production build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 2: Run the complete Playwright suite**

Run: `npm test`
Expected: PASS, including the new forum tests and all existing landing/news/store/marketplace tests.

- [ ] **Step 3: Smoke-test the route in the built app**

Run the preview server and open `/forum`; verify the page renders, the CTA destination is correct when configured, and the missing configuration state is readable.

- [ ] **Step 4: Review the final diff**

Confirm only the planned frontend, tests, and deployment documentation changed; confirm no credentials, Docker secrets, or generated Discourse data were added.
