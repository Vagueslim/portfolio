import { test, expect, type Locator } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { home, media, projects } from '../src/content';
import { parseVisual, resolveHomeVisual, visualMediaIds } from '../src/content/visuals';

const baseline = JSON.parse(readFileSync('qa/react-home/baseline.json', 'utf8')) as { width: number; sections: { selector: string; x: number; y: number; width: number; height: number; text: string }[] }[];

const canvasPixels = (canvas: Locator) => canvas.evaluate(element => (element as HTMLCanvasElement).toDataURL());
const hasPaint = (canvas: Locator) => canvas.evaluate(element => {
  const target = element as HTMLCanvasElement;
  const pixels = target.getContext('2d')!.getImageData(0, 0, target.width, target.height).data;
  return pixels.some((value, index) => index % 4 === 3 && value > 0);
});
const textIsReadable = (text: Locator) => text.evaluate(element => {
  const style = getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0 && style.color !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(style.color);
});
const canvasIsHidden = (canvas: Locator) => canvas.evaluate(element => {
  const style = getComputedStyle(element);
  return style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0;
});

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
    await expect(page.locator('h1')).toHaveText('I’M THREE DHITTAWAT.');
    const titleFit = await page.locator('h1').evaluate(element => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return { textWidth: range.getBoundingClientRect().width, availableWidth: element.clientWidth };
    });
    expect(titleFit.textWidth).toBeLessThanOrEqual(titleFit.availableWidth + 1);
    expect(titleFit.textWidth / titleFit.availableWidth).toBeGreaterThan(0.98);
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
  expect(visualMediaIds(home.selected.items[1].visual!)).toEqual(['buddy-job-selection-cover']);
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
  for (const locale of ['en', 'th']) {
    const prefix = locale === 'th' ? '/th/' : '/';
    await page.goto(prefix);
    const viewAll = page.locator('#selected-work .editorial-heading a');
    await expect(page.locator('main a[href="project.html"]')).toHaveCount(1);
    await viewAll.focus();
    await expect(viewAll).toHaveText(locale === 'en' ? 'View all ↗' : 'ดูผลงานทั้งหมด ↗');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(prefix + 'project\\.html$'));
    await expect(page.locator('.filter-count')).toHaveText(locale === 'en' ? 'Showing 7 projects' : 'แสดง 7 ผลงาน');
    for (const [id, title] of [['maxi-task', 'MAXI TASK'], ['asean-summit-2019', 'ASEAN Summit 2019']]) {
      await page.locator(`.work-card a[href="${id}.html"]`).click();
      await expect(page.locator('h1')).toHaveText(title);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await page.goBack();
      await expect(page.locator('.work-card:visible')).toHaveCount(7);
    }
  }
});

test('Delayed navigation restoration preserves a newer accordion focus and scroll position', async ({ page }) => {
  await page.goto('/');
  await page.locator('.ink-link').first().click();
  await expect(page.locator('main')).toBeFocused();
  // Hold the route's font-dependent restoration so the user can interact first.
  await page.evaluate(() => {
    const ready = new Promise<void>(resolve => {
      (window as unknown as { releaseNavigationFonts: () => void }).releaseNavigationFonts = resolve;
    });
    Object.defineProperty(document.fonts, 'ready', { configurable: true, value: ready });
  });
  await page.locator('.brand').click();
  const details = page.locator('.editorial-qa details').nth(1);
  const summary = details.locator('summary');
  await summary.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  const scrollAfterInteraction = await page.evaluate(() => window.scrollY);
  expect(scrollAfterInteraction).toBeGreaterThan(0);
  await page.evaluate(async () => {
    (window as unknown as { releaseNavigationFonts: () => void }).releaseNavigationFonts();
    // Flush the queued restoration frame, including callbacks queued by font readiness.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await expect(summary).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollAfterInteraction);
  await page.keyboard.press('Enter');
  await expect(details).not.toHaveAttribute('open', '');
});

test('Dither waves paint all five links, pause when inactive and retain reduced-motion/forced-colors text', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const copy = page.locator('.copy');
  const canvases = page.locator('.ink-link .dither-wave');
  const firstCanvas = canvases.first();
  await expect(copy).toHaveAttribute('data-motion', 'running');
  await expect(page.locator('.dither-ink[data-ready="true"]')).toHaveCount(5);
  await expect(canvases).toHaveCount(5);
  for (const canvas of await canvases.all()) {
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas).toHaveCSS('pointer-events', 'none');
    expect(await hasPaint(canvas)).toBe(true);
  }
  await expect(page.locator('#liquid-text, #liquid-noise, #liquid-warp')).toHaveCount(0);
  const first = await canvasPixels(firstCanvas);
  await expect.poll(() => canvasPixels(firstCanvas)).not.toBe(first);
  await page.locator('.ink-link').first().hover();
  await expect(page.locator('.destination')).toHaveText('WCF ↗');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(copy).toHaveAttribute('data-motion', 'paused');
  const paused = await canvasPixels(firstCanvas);
  await page.waitForTimeout(120);
  expect(await canvasPixels(firstCanvas)).toBe(paused);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(copy).toHaveAttribute('data-motion', 'running');
  await expect.poll(() => canvasPixels(firstCanvas)).not.toBe(paused);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(copy).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('.dither-ink[data-ready="false"]')).toHaveCount(5);
  for (let index = 0; index < 5; index++) {
    expect(await textIsReadable(page.locator('.dither-ink-text').nth(index))).toBe(true);
    expect(await canvasIsHidden(canvases.nth(index))).toBe(true);
  }
  const reduced = await canvasPixels(firstCanvas);
  await page.waitForTimeout(120);
  expect(await canvasPixels(firstCanvas)).toBe(reduced);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(copy).toHaveAttribute('data-motion', 'running');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(copy).toHaveAttribute('data-motion', 'paused');
  const hidden = await canvasPixels(firstCanvas);
  await page.waitForTimeout(120);
  expect(await canvasPixels(firstCanvas)).toBe(hidden);
  await page.evaluate(() => { delete (document as unknown as { hidden?: boolean }).hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await expect(copy).toHaveAttribute('data-motion', 'running');
  await expect.poll(() => canvasPixels(firstCanvas)).not.toBe(hidden);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(copy).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('.dither-ink[data-ready="false"]')).toHaveCount(5);
  for (let index = 0; index < 5; index++) {
    expect(await textIsReadable(page.locator('.dither-ink-text').nth(index))).toBe(true);
    expect(await canvasIsHidden(canvases.nth(index))).toBe(true);
  }
  const forcedColors = await canvasPixels(firstCanvas);
  await page.waitForTimeout(120);
  expect(await canvasPixels(firstCanvas)).toBe(forcedColors);
  await page.emulateMedia({ forcedColors: 'none' });
  await expect(copy).toHaveAttribute('data-motion', 'running');
  await expect.poll(() => canvasPixels(firstCanvas)).not.toBe(forcedColors);
  await page.screenshot({ path: 'qa/react-home/after-dither-1440.png' });
  expect(errors).toEqual([]);
});

test('Project names remain readable native links without JavaScript in both languages', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const prefix of ['/', '/th/']) {
      await page.goto('http://127.0.0.1:4175' + prefix);
      await expect(page.locator('.paper--projects')).toHaveCSS('background-image', /silver-rainbow-foil-v1\.png/);
      await expect(page.locator('.paper--projects')).toHaveCSS('background-size', 'cover');
      expect(await canvasIsHidden(page.locator('.foil-background'))).toBe(true);
      const links = page.locator('.ink-link');
      await expect(links).toHaveText(home.foil.lines.map(line => line.label));
      for (let index = 0; index < home.foil.lines.length; index++) {
        await expect(links.nth(index)).toHaveAttribute('href', projects[home.foil.lines[index].projectId].href);
        expect(await textIsReadable(links.nth(index).locator('.dither-ink-text'))).toBe(true);
        expect(await canvasIsHidden(links.nth(index).locator('canvas'))).toBe(true);
      }
      await links.first().focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(prefix + 'wcf-digital\\.html$'));
      await expect(page.locator('h1')).toHaveText('WCF Digital');
    }
  } finally { await context.close(); }
});

test('Unavailable Canvas2D preserves readable project links without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'unavailable');
  await expect(page.locator('.ink-link')).toHaveText(home.foil.lines.map(line => line.label));
  for (let index = 0; index < 5; index++) {
    expect(await textIsReadable(page.locator('.dither-ink-text').nth(index))).toBe(true);
    expect(await canvasIsHidden(page.locator('.dither-wave').nth(index))).toBe(true);
  }
  await page.locator('.ink-link').first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/wcf-digital\.html$/);
  expect(errors).toEqual([]);
});

test('Dither canvases remain painted and sharp after resize on a HiDPI screen', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    await page.goto('http://127.0.0.1:4175/');
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('.dither-ink[data-ready="true"]')).toHaveCount(5);
      await expect.poll(() => page.locator('.dither-wave').evaluateAll(elements => elements.every(element => {
        const canvas = element as HTMLCanvasElement;
        const bounds = canvas.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0 && Math.abs(canvas.width - bounds.width * devicePixelRatio) <= 2 && Math.abs(canvas.height - bounds.height * devicePixelRatio) <= 2;
      }))).toBe(true);
      for (const canvas of await page.locator('.dither-wave').all()) expect(await hasPaint(canvas)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  } finally { await context.close(); }
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
  await expect(page.locator('.work-card:visible')).toHaveCount(4);
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator('.work-card:visible')).toHaveCount(7);
  await page.goto('/buddy-2-0.html');
  const trigger = page.locator('[data-image]').first();
  await trigger.click();
  await expect(page.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
