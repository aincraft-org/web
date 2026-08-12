import { test, expect, type Page } from '@playwright/test';

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('AzothMC webstore', () => {
  test('loads with catalog and zero page errors', async ({ page }) => {
    const errors = trackPageErrors(page);

    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Store.*AzothMC|AzothMC.*Store/i);
    await expect(page.getByTestId('store-hero')).toBeVisible();
    await expect(page.getByTestId('store-tabs')).toBeVisible();
    await expect(page.getByTestId('store-grid')).toBeVisible();
    await expect(page.getByTestId('product-card').first()).toBeVisible();
    await expect(page.getByTestId('product-card')).toHaveCount(12);
    expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('category tabs filter the grid and update the URL', async ({ page }) => {
    await page.goto('/store');

    await page.getByTestId('store-tabs').getByRole('button', { name: /Ranks/i }).click();
    await expect(page).toHaveURL(/category=rank/);
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(4);
    await expect(page.locator('[data-testid="product-card"]').first()).toHaveAttribute('data-category', 'rank');
    await expect(page.getByTestId('store-tabs').getByRole('button', { name: /All/i })).toHaveAttribute('aria-pressed', 'false');

    await page.getByTestId('store-tabs').getByRole('button', { name: /All/i }).click();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(12);
  });

  test('search filters the grid and updates the URL', async ({ page }) => {
    await page.goto('/store');

    await page.getByTestId('store-search').fill('ember');
    await expect(page).toHaveURL(/q=ember/);
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1);
    await expect(page.getByTestId('product-card')).toContainText(/Ember Knight Rank/i);
  });

  test('search with no matches shows an empty state', async ({ page }) => {
    await page.goto('/store');
    await page.getByTestId('store-search').fill('zzzzzz');
    await expect(page.getByTestId('store-empty')).toBeVisible();
  });
  test('catalog cards lead with game artwork', async ({ page }) => {
    await page.goto('/store');

    const images = page.getByTestId('product-image');
    await expect(images).toHaveCount(12);
    for (let index = 0; index < 12; index += 1) {
      const image = images.nth(index);
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute('src', /^\/assets\//);
      await expect(image).toHaveAttribute('alt', /.+/);
    }
  });

  test('every buy link is a secretless package deep link in a new tab', async ({ page }) => {
    await page.goto('/store');
    const links = page.getByTestId('product-buy');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const link = links.nth(index);
      const href = (await link.getAttribute('href')) ?? '';
      expect(href).toMatch(/^https:\/\/store\.azothmc\.com\/package\/[a-z0-9-]+$/);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = (await link.getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }

    const html = await page.content();
    expect(html).not.toContain(['plugin', 'tebex', 'io'].join('.'));
    expect(html).not.toContain(['X', 'Tebex', 'Secret'].join('-'));
  });

  test('delivery note explains delivery without claiming success', async ({ page }) => {
    await page.goto('/store');
    const note = page.getByTestId('delivery-note');
    await expect(note).toBeVisible();
    await expect(note).toContainText(/1-2 min/i);
    await expect(note).toContainText(/offline/i);
    await expect(note).not.toContainText(/order success|payment success|your order has been|order complete/i);
  });

  test('header nav link navigates to the store', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('site-nav').getByRole('link', { name: /Store/i }).click();
    await expect(page).toHaveURL(/\/store/);
    await expect(page.getByTestId('store-hero')).toBeVisible();
    await expect(page.getByTestId('site-nav').getByRole('link', { name: /Store/i })).toHaveAttribute('aria-current', 'page');
  });
  test('store chrome links back to the landing route', async ({ page }) => {
    await page.goto('/store');
    await page.getByRole('link', { name: 'AzothMC home' }).click();
    await expect(page).toHaveURL(/\/#hero$/);
    await expect(page.getByTestId('hero')).toBeVisible();
  });
});
