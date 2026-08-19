import { test, expect } from '@playwright/test';

test.describe('Rust-rendered routes', () => {
  test('all public routes render', async ({ page }) => {
    for (const [route, marker, title] of [['/', 'AzothMC', 'AzothMC'], ['/news', 'News', 'News'], ['/store', 'Store', 'Store'], ['/forum', 'The Commons', 'Forum']] as const) {
      await page.goto(route);
      await expect(page).toHaveTitle(new RegExp(title, 'i'));
      await expect(page.locator('body')).toContainText(marker);
    }
  });

  test('every image on the landing page actually decodes', async ({ page }) => {
    const failures: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('/');
    await page.evaluate(() => {
      for (const img of document.images) img.loading = 'eager';
      window.scrollTo(0, document.body.scrollHeight);
    });
    // Element presence is not proof of loading; the previous asset bug passed
    // a presence check while every image 404ed.
    await expect
      .poll(async () =>
        page.evaluate(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0)),
      )
      .toBe(true);
    const count = await page.evaluate(() => document.images.length);
    expect(count).toBeGreaterThanOrEqual(7);
    expect(failures).toEqual([]);
  });

  test('news article renders Markdown and missing article is 404', async ({ page, request }) => {
    await page.goto('/news/2026-08-10-season-zero-launches');
    await expect(page.getByRole('heading', { name: 'Expedition notes' })).toBeVisible();
    const missing = await request.get('/news/missing');
    expect(missing.status()).toBe(404);
  });

  test('store renders a mark per package, canonical purchase links, and client filters', async ({ page }) => {
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

  test('store groups the catalog, computes value, and hides empty groups', async ({ page }) => {
    await page.goto('/store');
    await expect(page.getByTestId('store-count')).toHaveText('Showing all 12 packages');
    await expect(page.locator('.tier')).toHaveCount(4);
    await expect(page.locator('.product__badge')).toHaveCount(1);
    await expect(page.getByText('Save $11.97 (44%)')).toBeVisible();
    await expect(page.getByText('best rate')).toBeVisible();
    await page.getByTestId('store-tabs').getByRole('button', { name: 'Crates' }).click();
    await expect(page.locator('[data-group="crate"]')).toBeVisible();
    await expect(page.locator('[data-group="rank"]')).toBeHidden();
    await expect(page.getByTestId('store-count')).toHaveText('Showing 2 of 12 packages');
    await page.getByTestId('store-search').fill('zzzz');
    await expect(page.getByTestId('store-empty')).toBeVisible();
  });

  test('forum renders explicit setup state without configuration', async ({ page }) => {
    await page.goto('/forum');
    await expect(page.getByTestId('forum-setup')).toBeVisible();
    await expect(page.getByTestId('forum-cta')).toHaveCount(0);
  });
});
