import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { home, media, projects } from '../src/content';
import { parseVisual, resolveHomeVisual, visualMediaIds } from '../src/content/visuals';

const baseline = JSON.parse(readFileSync('qa/react-home/baseline.json', 'utf8')) as { width: number; sections: { selector: string; x: number; y: number; width: number; height: number; text: string }[] }[];

for (const width of [320, 390, 552, 768, 1440]) {
  test(`Home preserves layout and copy at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/th/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(async image => { image.loading = 'eager'; await image.decode(); }));
    });
    await expect(page.locator('h1')).toHaveText('I’M DHITTAWAT.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const before = baseline.find(item => item.width === width)!;
    const comparisons = [];
    for (const section of before.sections) {
      const locator = page.locator(section.selector);
      const after = (await locator.boundingBox())!;
      comparisons.push({ selector: section.selector, before: section, after });
      if (section.selector === '.masthead') {
        await expect(locator.locator('.nav a')).toHaveText(['Home', 'About', 'Project', 'EN', 'TH']);
      } else {
        expect((await locator.innerText()).replace(/\s+/g, ' ').trim()).toBe(section.text.replace(/\s+/g, ' ').trim());
      }
      for (const dimension of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(after[dimension] - section[dimension]), `${section.selector} ${dimension}`).toBeLessThanOrEqual(1);
    }
    await page.screenshot({ path: `qa/react-home/after-${width}.png`, fullPage: true });
    await test.info().attach('layout-comparison', { body: JSON.stringify(comparisons, null, 2), contentType: 'application/json' });
    await expect(page.locator('.exploration, .copy-signoff, .foil-controls')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('Home image override, cover fallback and shared media IDs', async () => {
  const wcf = projects['wcf-digital'];
  expect(resolveHomeVisual(wcf, home.wcf.visual)).toEqual({ kind: 'collage', mediaIds: ['wcf-workflow', 'wcf-notice-list'] });
  expect(resolveHomeVisual(wcf)).toEqual({ kind: 'single', mediaId: 'wcf-cover' });
  expect(resolveHomeVisual({ ...wcf, coverMediaId: 'replacement' })).toEqual({ kind: 'single', mediaId: 'replacement' });
  expect(resolveHomeVisual({ ...wcf, coverMediaId: 'replacement' }, home.wcf.visual)).toEqual(home.wcf.visual);
  expect(visualMediaIds(home.selected.items[1].visual!)).toEqual(['buddy-onboarding', 'buddy-services']);
  expect(visualMediaIds(home.smart.visual!)).toEqual(['smart-asset-master-flow', 'smart-asset-bu-permissions']);
  expect(parseVisual(undefined)).toBeUndefined();
  expect(() => parseVisual({ kind: 'pair', mediaIds: ['only-one'] })).toThrow();
  expect(() => parseVisual({ kind: 'unknown' })).toThrow();
  for (const image of Object.values(media)) expect(existsSync(resolve('dist', image.src)), image.src).toBe(true);
});

test('Project links, anchors, keyboard and accordion', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('.ink-link')).toHaveCount(5);
  const links = await page.locator('.ink-link').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
  expect(links).toEqual(['wcf-digital.html', 'change-date.html', 'smart-asset.html', 'q-chang-web.html', 'buddy-2-0.html']);
  expect(await page.locator('a[href^="#"]').evaluateAll(elements => elements.every(el => document.getElementById(el.getAttribute('href')!.slice(1))))).toBe(true);
  await page.locator('.ink-link').first().focus();
  await expect(page.locator('.destination')).toHaveText('WCF ↗');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/wcf-digital\.html$/);
  await page.locator('.brand').click();
  await expect(page.locator('.masthead-title')).toBeVisible();
  const details = page.locator('.editorial-qa details');
  expect(await details.evaluateAll(elements => elements.map(el => (el as HTMLDetailsElement).open))).toEqual([true, false, false]);
  await details.nth(1).locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(details.nth(1)).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(details.nth(1)).not.toHaveAttribute('open', '');
});

test('Liquid animation runs, pauses, respects motion preferences and scales on hover', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const copy = page.locator('.copy');
  const noise = page.locator('#liquid-noise');
  await expect(copy).toHaveAttribute('data-motion', 'running');
  const first = await noise.getAttribute('baseFrequency');
  await expect.poll(() => noise.getAttribute('baseFrequency')).not.toBe(first);
  const initialScale = Number(await page.locator('#liquid-warp').getAttribute('scale'));
  await page.locator('.ink-link').first().hover();
  await expect.poll(async () => Number(await page.locator('#liquid-warp').getAttribute('scale'))).toBeGreaterThan(initialScale + 1);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(copy).toHaveAttribute('data-motion', 'paused');
  const paused = await noise.getAttribute('baseFrequency');
  await page.waitForTimeout(120);
  expect(await noise.getAttribute('baseFrequency')).toBe(paused);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(copy).toHaveAttribute('data-motion', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(copy).toHaveAttribute('data-motion', 'reduced');
  expect(await page.locator('.liquid-ink').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(copy).toHaveAttribute('data-motion', 'running');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(copy).toHaveAttribute('data-motion', 'paused');
  await page.evaluate(() => { delete (document as unknown as { hidden?: boolean }).hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await expect(copy).toHaveAttribute('data-motion', 'running');
  await page.screenshot({ path: 'qa/react-home/after-liquid-1440.png' });
});

test('Legacy pages keep their files, images and interactions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const file of ['about.html', 'project.html', ...Object.values(projects).map(project => project.href)]) {
    expect(readFileSync(`dist/${file}`, 'utf8')).toContain('lang="en"');
    expect(readFileSync(`dist/th/${file}`, 'utf8')).toContain('lang="th"');
    const response = await page.goto(`/${file}`);
    expect(response?.status()).toBe(200);
    await page.evaluate(async () => { await Promise.all([...document.querySelectorAll<HTMLImageElement>('img[src]')].map(async image => { image.loading = 'eager'; await image.decode(); })); });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.nav a').first()).toHaveAttribute('href', 'index.html');
  }
  await page.goto('/project.html');
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('[data-filter="internal"]').click();
  await expect(page.locator('.work-card:visible')).toHaveCount(2);
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator('.work-card:visible')).toHaveCount(5);
  await page.goto('/buddy-2-0.html');
  const trigger = page.locator('[data-image]').first();
  await trigger.click();
  await expect(page.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
