import { defineConfig, devices } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(__dirname);

// The marketplace test suite drives the Rust API through Vite's `/api` proxy.
// When Cargo is available we start the Rust service as a first-class
// webServer so listings are live during tests. When Cargo is absent (e.g. a
// machine that cannot build Rust) we do not start it; tests/marketplace.spec.ts
// detects the same condition and skips the live-listing tests there, leaving
// the unavailable-feed test (which aborts `/api/v1` routes itself) to run on
// the webServer below (or an externally started service on 8787).
//
// The spawned servers must be deterministic regardless of ambient env:
//  - MARKET_ADDR is pinned to 127.0.0.1:8787 so the Rust service always binds
//    where both this config probes (`/healthz`) and Vite's `/api` proxy point,
//  - VITE_MARKET_API_URL is forced to an empty string so the frontend ignores
//    any ambient override and uses the `/api/v1` proxy default for tests.
const hasCargo = spawnSync('cargo', ['--version'], { encoding: 'utf8' }).status === 0;

const webServer = [
  ...(hasCargo
    ? [{
        command: 'cargo run --quiet --manifest-path server/Cargo.toml',
        url: 'http://127.0.0.1:8787/healthz',
        reuseExistingServer: false,
        timeout: 60_000,
        env: { MARKET_ADDR: '127.0.0.1:8787' },
      }]
    : []),
  {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60_000,
    env: { VITE_MARKET_API_URL: '' },
  },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
