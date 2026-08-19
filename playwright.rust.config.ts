import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests-rust',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8787',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'cargo run --quiet --manifest-path server/Cargo.toml',
    url: 'http://127.0.0.1:8787/healthz',
    reuseExistingServer: false,
    timeout: 60_000,
    env: { MARKET_ADDR: '127.0.0.1:8787' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
