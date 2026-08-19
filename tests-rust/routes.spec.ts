import { test, expect } from '@playwright/test';

test.describe('Rust-rendered routes', () => {
  test('all public routes render', async ({ page }) => {
    for (const [route, marker, title] of [['/', 'AzothMC', 'AzothMC'], ['/news', 'News', 'News'], ['/store', 'Store', 'Store'], ['/forum', 'The Commons', 'Forum']] as const) {
      await page.goto(route);
      await expect(page).toHaveTitle(new RegExp(title, 'i'));
      await expect(page.locator('body')).toContainText(marker);
    }
  });

  test('news article renders Markdown and missing article is 404', async ({ page, request }) => {
    await page.goto('/news/2026-08-10-season-zero-launches');
    await expect(page.getByRole('heading', { name: 'Expedition notes' })).toBeVisible();
    const missing = await request.get('/news/missing');
    expect(missing.status()).toBe(404);
  });

  test('store renders artwork, canonical purchase links, and client filters', async ({ page }) => {
    await page.goto('/store');
    await expect(page.getByTestId('product-card')).toHaveCount(12);
    await expect(page.getByTestId('product-image')).toHaveCount(12);
    await expect(page.getByTestId('product-buy').first()).toHaveAttribute('href', /^https:\/\/store\.azothmc\.com\/package\//);
    await page.getByTestId('store-tabs').getByRole('button', { name: 'Ranks' }).click();
    await expect(page).toHaveURL(/category=rank/);
    await expect(page.locator('[data-testid="product-card"]:not([hidden])')).toHaveCount(4);
    await page.getByTestId('store-search').fill('ember knight');
    await expect(page).toHaveURL(/category=rank&q=ember\+knight/);
    await expect(page.locator('[data-testid="product-card"]:not([hidden])')).toHaveCount(1);
  });

  test('forum renders explicit setup state without configuration', async ({ page }) => {
    await page.goto('/forum');
    await expect(page.getByTestId('forum-setup')).toBeVisible();
    await expect(page.getByTestId('forum-cta')).toHaveCount(0);
  });
});
