import { spawnSync } from 'node:child_process';
import { test, expect, type Page } from '@playwright/test';

/**
 * Mirrors playwright.config.ts: the Rust azoth-market service (server/) is
 * started as a webServer only when the Cargo toolchain is available. When it
 * is absent, the live-listing tests below must skip deterministically instead
 * of failing against an absent feed; the unavailable-state test always runs
 * because it aborts every `/api/v1` route and needs no service behind them.
 */
const HAS_CARGO = spawnSync('cargo', ['--version'], { encoding: 'utf8' }).status === 0;

/** Skip reason shared by the live-listing tests when the feed cannot be served. */
const NO_CARGO_SKIP = 'requires the Rust azoth-market service (server/, crate azoth-market)';

/** Mirrors tests/store.spec.ts: collects uncaught page errors to fail on JS exceptions. */
function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

/**
 * Seeded Rust marketplace API (server/), in catalog order. The first listing
 * is selected by default; the first two are exercised here.
 */
const LISTINGS = [
  { slug: 'emberheart', name: 'Emberheart Core', activity: 'Rising' },
  { slug: 'netherite-ark', name: 'Netherite Ark', activity: 'Cooling' },
  { slug: 'phantom-wing', name: 'Phantom Wing', activity: 'Stable' },
  { slug: 'voidhearth', name: 'Voidhearth', activity: 'Rising' },
  { slug: 'packed-compass-coin', name: 'Packed Compass Coin', activity: 'Stable' },
] as const;

const FIRST = LISTINGS[0];
const SECOND = LISTINGS[1];

test.describe('AzothMC marketplace', () => {
  test('renders live listings, default trend chart, and keeps the 12 donation cards', async ({ page }) => {
    test.skip(!HAS_CARGO, NO_CARGO_SKIP);
    const errors = trackPageErrors(page);

    await page.goto('/store');
    const panel = page.getByTestId('marketplace-panel');
    await expect(panel).toBeVisible();

    // All five seeded listings render as selectable market items. Scope each
    // name to its own market-item: a bare getByText would also match the
    // selected item's name in the trend-chart heading, so scoping keeps the
    // assertion deterministic.
    const items = page.getByTestId('market-item');
    await expect(items).toHaveCount(LISTINGS.length);
    await expect(panel).toContainText('Trade Market');
    for (let i = 0; i < LISTINGS.length; i++) {
      await expect(panel.getByTestId('market-item').nth(i)).toContainText(LISTINGS[i].name);
    }

    // First listing is selected by default and its trend chart renders.
    await expect(items.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(items.first()).toHaveAttribute('data-selected', 'true');
    const trend = page.getByTestId('market-trend');
    await expect(trend).toBeVisible();
    await expect(trend).toHaveAttribute('aria-label', `Trend chart for ${FIRST.name}`);

    // The donation catalog is not regressed: all 12 product cards remain.
    await expect(page.getByTestId('product-card')).toHaveCount(12);
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

    expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('shows economy metrics on each listing card', async ({ page }) => {
    test.skip(!HAS_CARGO, NO_CARGO_SKIP);
    await page.goto('/store');
    await expect(page.getByTestId('marketplace-panel')).toBeVisible();
    await expect(page.getByTestId('market-item')).toHaveCount(LISTINGS.length);

    // First listing is a rising item: its 24h change carries a "+" sign.
    const first = page.getByTestId('market-item').first();
    await expect(first).toContainText(FIRST.name);
    await expect(first.getByTestId('market-change')).toContainText('+');
    await expect(first.getByTestId('market-change')).toContainText('24h');
    await expect(first.getByTestId('market-volume')).toContainText(/Vol \d+(,\d+)? sold/);
    await expect(first.getByTestId('market-activity')).toHaveText(FIRST.activity);

    // A cooling item carries a "-" sign on its 24h change.
    await page.getByTestId('market-item').nth(1).scrollIntoViewIfNeeded();
    const second = page.getByTestId('market-item').nth(1);
    await expect(second).toContainText(SECOND.name);
    await expect(second.getByTestId('market-change')).toContainText('-');
    await expect(second.getByTestId('market-activity')).toHaveText(SECOND.activity);
  });

  test('selecting a listing replaces the trend chart', async ({ page }) => {
    test.skip(!HAS_CARGO, NO_CARGO_SKIP);
    await page.goto('/store');
    await expect(page.getByTestId('marketplace-panel')).toBeVisible();

    // Default selection is the first item.
    const trend = page.getByTestId('market-trend');
    await expect(trend).toHaveAttribute('aria-label', `Trend chart for ${FIRST.name}`);

    // Clicking the second listing selects it and swaps the chart.
    const second = page.getByTestId('market-item').nth(1);
    await second.click();
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await expect(second).toHaveAttribute('data-selected', 'true');
    await expect(page.getByTestId('market-item').first()).toHaveAttribute('aria-pressed', 'false');

    await expect(page.getByTestId('market-trend')).toHaveAttribute(
      'aria-label',
      `Trend chart for ${SECOND.name}`,
    );
  });

  test('shows unavailable copy when the market feed requests fail', async ({ page }) => {
    // Force every /api/v1 request to fail as if the Rust service is unreachable.
    await page.route('**/api/v1/**', (route) => route.abort());

    await page.goto('/store');
    const unavailable = page.getByTestId('market-unavailable');
    await expect(unavailable).toBeVisible();
    await expect(unavailable).toContainText('Market feed is currently unavailable.');
    await expect(unavailable).toContainText('Economy trends will return when the service is back online.');

    // No listing or chart should be shown in the unavailable state.
    await expect(page.getByTestId('market-item')).toHaveCount(0);
    await expect(page.getByTestId('market-trend')).toHaveCount(0);
  });

  test('keeps donation grid functional alongside the marketplace panel', async ({ page }) => {
    await page.goto('/store');
    await expect(page.getByTestId('store-grid')).toBeVisible();
    await expect(page.getByTestId('product-card')).toHaveCount(12);
    await expect(page.getByTestId('marketplace-panel')).toBeVisible();

    // Donation catalog interactions still work with the panel mounted.
    await page.getByTestId('store-tabs').getByRole('button', { name: /Ranks/i }).click();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(4);
  });
});
