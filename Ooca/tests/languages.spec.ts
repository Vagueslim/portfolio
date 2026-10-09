import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const pages = ['index.html', 'about.html', 'project.html', 'q-chang-web.html', 'buddy-2-0.html', 'change-date.html', 'wcf-digital.html', 'smart-asset.html'];

test('English is the default even for a Thai browser; both languages work on every page', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'th-TH', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const width of [320, 768, 1280]) for (const language of ['en', 'th']) for (const file of pages) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(`http://127.0.0.1:4175/${language === 'th' ? 'th/' : ''}${file}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('.language-switch a[aria-current="true"]')).toHaveText(language.toUpperCase());
    await expect(page.locator('.brand-logo')).toHaveAttribute('src', '/assets/brand/logo.svg');
    const text = await page.locator('body').innerText();
    expect(/[\u0e00-\u0e7f]/.test(text)).toBe(language === 'th');
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.querySelectorAll<HTMLImageElement>('img[src]')].map(async img => { img.loading = 'eager'; await img.decode(); })); });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
  await context.close();
});

for (const width of [320, 390, 552, 768, 1440]) test(`English header, SVG logo and language controls fit at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  if (width === 390) {
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(async img => { img.loading = 'eager'; await img.decode(); }));
  });
  await expect(page.locator('.language-switch')).toBeVisible();
  const layout = await page.evaluate(() => {
    const title = document.querySelector('h1')!.getBoundingClientRect();
    const project = document.querySelector('.project-nav-link')!.getBoundingClientRect();
    const languages = document.querySelector('.language-switch')!.getBoundingClientRect();
    const logo = document.querySelector<HTMLImageElement>('.brand-logo')!;
    return { overflow: document.documentElement.scrollWidth > innerWidth, titleRight: title.right, width: innerWidth, projectRight: project.right, languageLeft: languages.left, logoLoaded: logo.complete && logo.naturalWidth > 0 };
  });
  expect(layout.overflow).toBe(false);
  expect(layout.titleRight).toBeLessThanOrEqual(layout.width);
  expect(layout.languageLeft).toBeGreaterThanOrEqual(layout.projectRight);
  expect(layout.logoLoaded).toBe(true);
  await page.screenshot({ path: `qa/react-home/english-${width}.png`, fullPage: true });
  await page.screenshot({ path: `qa/react-home/english-header-${width}.png` });
  await page.locator('.language-switch a[lang="th"]').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/th\/index.html$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  await page.locator('.ink-link').first().click();
  await expect(page).toHaveURL(/\/th\/wcf-digital.html$/);
  // Client navigation updates the URL before React commits the destination menu.
  await expect(page.locator('h1')).toHaveText('WCF Digital');
  if (await page.locator('.menu-toggle').isVisible()) await page.locator('.menu-toggle').click();
  await page.locator('.language-switch a[lang="en"]').click();
  await expect(page).toHaveURL(/(?<!\/th)\/wcf-digital.html$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('Case-study evidence boundaries and translated dynamic controls are preserved', async ({ page }) => {
  await page.goto('/change-date.html');
  await expect(page.locator('main')).toContainText('3,999');
  await expect(page.locator('main')).toContainText('not unique customers or outcomes achieved after');
  await page.goto('/buddy-2-0.html');
  await expect(page.locator('main')).toContainText('left the team before the app launched');
  await page.goto('/project.html');
  await page.locator('[data-filter="internal"]').click();
  await expect(page.locator('.filter-count')).toHaveText('Showing 4 projects');
  await page.goto('/th/project.html');
  await page.locator('[data-filter="internal"]').click();
  await expect(page.locator('.filter-count')).toHaveText('แสดง 4 ผลงาน');
});

test('Favicons use the supplied t mark with black/light and white/dark variants', async ({ page }) => {
  const light = readFileSync('assets/favicon-light.svg', 'utf8');
  const dark = readFileSync('assets/favicon-dark.svg', 'utf8');
  expect(light.match(/d="([^"]+)"/)?.[1]).toBe(dark.match(/d="([^"]+)"/)?.[1]);
  expect(light).toContain('fill="#101010"');
  expect(dark).toContain('fill="#ffffff"');
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    const href = await page.locator(`link[rel="icon"][media="(prefers-color-scheme: ${scheme})"]`).getAttribute('href');
    expect(href).toBe(`/assets/favicon-${scheme}.svg`);
    const response = await page.request.get(href!);
    expect(response.ok()).toBe(true);
  }
  await page.goto('/assets/favicon.svg');
  await expect(page.locator('svg path')).toHaveCSS('fill', 'rgb(255, 255, 255)');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('svg path')).toHaveCSS('fill', 'rgb(16, 16, 16)');
});

test('Development URLs select the same language as production', async ({ page }) => {
  for (const [path, lang] of [['/', 'en'], ['/th/', 'th'], ['/about.html', 'en'], ['/th/about.html', 'th']]) {
    await page.goto(`http://127.0.0.1:4176${path}`);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('.language-switch')).toBeVisible();
  }
});
