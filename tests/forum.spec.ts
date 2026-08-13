import { test, expect, type Page } from '@playwright/test';
import { normalizeDiscourseUrl } from '../src/forum/normalizeDiscourseUrl';

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('AzothMC forum', () => {
  test.describe('config resolves a safe Discourse origin', () => {
    test('accepts an http and an https origin', () => {
      expect(normalizeDiscourseUrl('https://forum.azothmc.com')).toBe('https://forum.azothmc.com/');
      expect(normalizeDiscourseUrl('http://127.0.0.1:9000')).toBe('http://127.0.0.1:9000/');
    });

    test('missing or unusable values resolve to null', () => {
      expect(normalizeDiscourseUrl(undefined)).toBeNull();
      expect(normalizeDiscourseUrl('')).toBeNull();
      expect(normalizeDiscourseUrl('   ')).toBeNull();
      expect(normalizeDiscourseUrl('not a url')).toBeNull();
      expect(normalizeDiscourseUrl('ftp://example.com')).toBeNull();
      expect(normalizeDiscourseUrl('javascript:alert(1)')).toBeNull();
    });
  });

  test.describe('/forum', () => {
    test('without a configured URL shows the explicit setup state and active nav', async ({ page }) => {
      const errors = trackPageErrors(page);

      await page.goto('/forum');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveTitle(/Forum.*AzothMC|AzothMC.*Forum/i);
      await expect(page.getByTestId('forum-hero')).toBeVisible();
      await expect(page.getByTestId('forum-setup')).toBeVisible();
      await expect(page.getByTestId('forum-setup')).toContainText(/not configured/i);
      await expect(page.getByTestId('forum-cta')).toHaveCount(0);
      await expect(page.getByTestId('site-nav').getByRole('link', { name: /Forum/i })).toHaveAttribute('aria-current', 'page');
      expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);
    });

    test('with a configured URL renders a safe external CTA', async ({ page }) => {
      const errors = trackPageErrors(page);

      await page.addInitScript(() => {
        (window as unknown as Record<string, unknown>).__AZOTHMC_DISCOURSE_URL__ = 'https://forum.azothmc.com';
      });
      await page.goto('/forum');
      await page.waitForLoadState('networkidle');

      await expect(page.getByTestId('forum-cta')).toBeVisible();
      await expect(page.getByTestId('forum-setup')).toHaveCount(0);
      const cta = page.getByTestId('forum-cta');
      await expect(cta).toHaveAttribute('href', /^https:\/\/forum\.azothmc\.com\/?$/);
      await expect(cta).toHaveAttribute('target', '_blank');
      const rel = (await cta.getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
      expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);
    });

    test('an unsafe override degrades to the setup state instead of a link', async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as Record<string, unknown>).__AZOTHMC_DISCOURSE_URL__ = 'ftp://forum.example.com';
      });
      await page.goto('/forum');

      await expect(page.getByTestId('forum-setup')).toBeVisible();
      await expect(page.getByTestId('forum-cta')).toHaveCount(0);
    });

    test('nav link navigates to /forum and marks the tab active', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('site-nav').getByRole('link', { name: /Forum/i }).click();
      await expect(page).toHaveURL(/\/forum/);
      await expect(page.getByTestId('forum-hero')).toBeVisible();
      await expect(page.getByTestId('site-nav').getByRole('link', { name: /Forum/i })).toHaveAttribute('aria-current', 'page');
    });

    test('forum chrome links back to the landing route', async ({ page }) => {
      await page.goto('/forum');
      await page.getByRole('link', { name: 'AzothMC home' }).click();
      await expect(page).toHaveURL(/\/#hero$/);
      await expect(page.getByTestId('hero')).toBeVisible();
    });
  });
});
