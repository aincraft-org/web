import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const SCRATCH =
  process.env.AZOTHMC_SCRATCH ||
  '/tmp/grok-goal-ee5c39db991f/implementer';

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  return errors;
}

test.describe('AzothMC landing page', () => {
  test('loads with expedition journal structure, paints content, zero page errors', async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    fs.mkdirSync(SCRATCH, { recursive: true });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/AzothMC/i);

    // Wooden nav
    const nav = page.getByTestId('site-nav');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: /Home/i }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: /World/i })).toBeVisible();
    await expect(nav.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: /Play/i })).toBeVisible();
    // carved wood tabs + hanging IP
    await expect(nav.locator('.nav-tab').first()).toBeVisible();
    await expect(nav.getByTestId('copy-ip-nav')).toBeVisible();

    // Hero: logo, tagline, CTA, landscape
    const hero = page.getByTestId('hero');
    await expect(hero).toBeVisible();
    await expect(page.getByTestId('hero-logo')).toBeVisible();
    await expect(page.getByTestId('hero-tagline')).toBeVisible();
    await expect(hero.getByRole('heading', { level: 1 })).toContainText(
      /Minecraft MMORPG/i
    );
    await expect(page.getByTestId('hero-cta')).toBeVisible();
    await expect(page.getByTestId('hero-cta')).toContainText(/Begin your journey/i);
    await expect(page.getByTestId('hero-facts')).toBeVisible();
    await expect(page.getByTestId('player-count')).toHaveCount(0);
    await expect(page.getByTestId('press-quotes')).toHaveCount(0);

    // Server IP appears on page
    const serverIp = page.getByTestId('server-ip');
    await expect(serverIp).toBeVisible();
    const ipText = (await serverIp.textContent())?.trim() ?? '';
    expect(ipText.length).toBeGreaterThan(0);
    expect(ipText).toMatch(/azothmc/i);

    // Feature sections with parchment headings
    await expect(page.getByTestId('feature-world')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Handcrafted Realms/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Loot & Trade Market/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Quests & Roleplay/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Endgame Raids/i })
    ).toBeVisible();

    // Join block
    const join = page.getByTestId('join');
    await expect(join).toBeVisible();
    await expect(page.getByTestId('join-title')).toContainText(/Play AzothMC/i);
    await expect(page.getByTestId('join-steps')).toBeVisible();
    await expect(page.getByTestId('server-ip-join')).toBeVisible();

    // Paint: hero fills substantial viewport
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    const heroBox = await hero.boundingBox();
    expect(heroBox).toBeTruthy();
    if (viewport && heroBox) {
      expect(heroBox.height).toBeGreaterThan(viewport.height * 0.5);
      expect(heroBox.width).toBeGreaterThan(viewport.width * 0.8);
    }

    const mainBox = await page.locator('main').boundingBox();
    expect(mainBox).toBeTruthy();
    if (viewport && mainBox) {
      expect(mainBox.height).toBeGreaterThan(viewport.height);
      expect(mainBox.width).toBeGreaterThan(viewport.width * 0.5);
    }

    // Hero background image should be loaded
    const bgLoaded = await page.evaluate(() => {
      const bg = document.querySelector('.hero .slide-bg') as HTMLElement | null;
      if (!bg) return false;
      const url = getComputedStyle(bg).backgroundImage;
      return /hero-bg/i.test(url);
    });
    expect(bgLoaded).toBe(true);

    expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);

    await page.screenshot({
      path: path.join(SCRATCH, 'landing-shot.png'),
      fullPage: false,
    });
  });

  test('second load is consistent (no flaky blank paint)', async ({ page }) => {
    const errors = trackPageErrors(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('hero')).toBeVisible();
    await expect(page.getByTestId('hero-logo')).toBeVisible();
    await expect(page.getByTestId('hero-tagline')).toBeVisible();
    await expect(page.getByTestId('server-ip')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Handcrafted Realms/i })
    ).toBeVisible();

    const heroBox = await page.getByTestId('hero').boundingBox();
    const viewport = page.viewportSize();
    expect(heroBox && viewport).toBeTruthy();
    if (heroBox && viewport) {
      expect(heroBox.height).toBeGreaterThan(viewport.height * 0.5);
    }

    expect(errors).toEqual([]);
  });

  test('copy IP interaction updates observable DOM state', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const serverIp = page.getByTestId('server-ip');
    const expectedIp = ((await serverIp.textContent()) ?? '').trim();
    expect(expectedIp.length).toBeGreaterThan(0);

    const copyBtn = page.getByTestId('copy-ip-join');
    await expect(copyBtn).toBeVisible();
    await copyBtn.scrollIntoViewIfNeeded();

    await expect(copyBtn).not.toHaveAttribute('data-copied', 'true');
    await copyBtn.click();

    await expect(copyBtn).toHaveAttribute('data-copied', 'true');
    await expect(page.locator('html')).toHaveAttribute(
      'data-last-copied-ip',
      expectedIp
    );
    await expect(page.getByTestId('copy-feedback-join')).toBeVisible();
    await expect(page.getByTestId('copy-feedback-join')).toContainText(/copied/i);

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(expectedIp);
  });

  test('nav Play link scrolls to join section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo(0, 0));
    const startY = await page.evaluate(() => window.scrollY);
    expect(startY).toBe(0);

    await page.getByTestId('site-nav').getByRole('link', { name: /Play/i }).click();
    await expect(page.getByTestId('join')).toBeInViewport({ ratio: 0.15 });

    const endY = await page.evaluate(() => window.scrollY);
    expect(endY).toBeGreaterThan(100);
  });
});
