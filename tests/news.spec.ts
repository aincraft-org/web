import { test, expect, type Page } from '@playwright/test';

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('AzothMC news', () => {
  test('index loads with zero page errors', async ({ page }) => {
    const errors = trackPageErrors(page);

    await page.goto('/news');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/News.*AzothMC|AzothMC.*News/i);
    await expect(page.getByTestId('news-hero')).toBeVisible();
    await expect(page.locator('[data-testid="news-post"]').first()).toBeVisible();
    expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);
  });

  test('index lists posts newest first with links', async ({ page }) => {
    await page.goto('/news');

    const posts = page.locator('[data-testid="news-post"]');
    const count = await posts.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const dates: string[] = [];
    for (let index = 0; index < count; index += 1) {
      dates.push((await posts.nth(index).getAttribute('data-date')) ?? '');
    }
    for (let index = 1; index < dates.length; index += 1) {
      expect(dates[index - 1] >= dates[index]).toBe(true);
    }

    const links = page.locator('[data-testid="news-post"] a');
    expect(await links.count()).toBe(count);
    for (let index = 0; index < count; index += 1) {
      const href = (await links.nth(index).getAttribute('href')) ?? '';
      expect(href).toMatch(/^\/news\/[a-z0-9-]+$/);
    }
  });

  test('article renders markdown as real HTML', async ({ page }) => {
    await page.goto('/news/2026-08-10-season-zero-launches');

    await expect(page).toHaveTitle(/Season Zero Launches.*AzothMC/);
    await expect(page.getByTestId('article-body')).toBeVisible();
    await expect(page.getByTestId('article-body').getByRole('heading', { name: /Expedition notes/i, level: 2 })).toBeVisible();
    await expect(page.getByTestId('article-body').locator('code')).toHaveCount(1);
    await expect(page.getByTestId('article-body').locator('li').first()).toBeVisible();
  });

  test('unknown slug shows not-found with a link back', async ({ page }) => {
    await page.goto('/news/does-not-exist');
    await expect(page.getByTestId('news-not-found')).toBeVisible();
    await expect(page.getByTestId('news-not-found').getByRole('link', { name: /Back to all news/i })).toBeVisible();
  });

  test('nav link navigates to /news and marks the tab active', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('site-nav').getByRole('link', { name: /News/i }).click();
    await expect(page).toHaveURL(/\/news/);
    await expect(page.getByTestId('news-hero')).toBeVisible();
    await expect(page.getByTestId('site-nav').getByRole('link', { name: /News/i })).toHaveAttribute('aria-current', 'page');
  });

  test('nav News tab stays active on an article page', async ({ page }) => {
    await page.goto('/news/2026-08-08-webstore-live');
    await expect(page.getByTestId('site-nav').getByRole('link', { name: /News/i })).toHaveAttribute('aria-current', 'page');
  });
});
