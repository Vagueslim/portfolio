import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { pageFiles } from '../src/routes';
type Node = DefaultTreeAdapterMap['node'];
const attribute = (node: Node, key: string) => 'attrs' in node ? node.attrs.find(a => a.name === key)?.value : undefined;
const find = (node: Node, match: (node: Node) => boolean): Node[] => [...(match(node) ? [node] : []), ...('childNodes' in node ? node.childNodes.flatMap(n => find(n, match)) : [])];
const textNodes = (node: Node) => find(node, n => n.nodeName === '#text' && 'value' in n && !!n.value.trim()).map(n => ('value' in n ? n.value : '').replace(/\s+/g, ' ').trim());
const baseline = JSON.parse(readFileSync('qa/react-migration/content-baseline.json', 'utf8')) as Record<string, { text: string[]; images: {src?: string; alt: string}[]; ids: string[]; links: string[] }>;

test('Every original word, evidence image, alt, fragment and link survives in both languages', async () => {
  for (const [key, before] of Object.entries(baseline)) {
    const [locale, file] = key.split('/');
    const doc = parse(readFileSync('dist/' + (locale === 'th' ? 'th/' : '') + file, 'utf8'));
    const main = find(doc, n => 'tagName' in n && n.tagName === 'main')[0];
    const remaining = textNodes(main);
    for (const text of before.text) {
      const index = remaining.indexOf(text);
      expect(index, key + ': ' + text).toBeGreaterThanOrEqual(0);
      remaining.splice(index, 1);
    }
    expect(remaining, 'Unexpected new copy: ' + key).toEqual([]);
    const images = find(main, n => 'tagName' in n && n.tagName === 'img');
    for (const image of before.images.filter(i => i.src)) expect(images.some(n => attribute(n, 'src') === '/' + image.src && attribute(n, 'alt') === image.alt), key + ' image ' + image.src).toBe(true);
    for (const id of before.ids) expect(find(main, n => attribute(n, 'id') === id), key + ' #' + id).toHaveLength(1);
    for (const href of before.links.filter(Boolean)) expect(find(main, n => attribute(n, 'href') === href), key + ' link ' + href).not.toHaveLength(0);
  }
});

test('All 16 prerendered pages are readable without JavaScript and have page metadata', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const locale of ['en', 'th']) for (const file of pageFiles) {
    const response = await page.goto('http://127.0.0.1:4175/' + (locale === 'th' ? 'th/' : '') + file);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    expect((await page.locator('main').textContent())!.trim().length).toBeGreaterThan(200);
    await expect(page.locator('head title')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
  }
  await context.close();
});

test('Navigation and locale changes keep one document, with Back/Forward, focus and metadata', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => { (window as unknown as { migrationToken: string }).migrationToken = 'same-document'; });
  await page.locator('.nav a[href="about.html"]').click();
  await expect(page.locator('h1')).toContainText('Curious about people.');
  await expect(page.locator('main')).toBeFocused();
  await page.locator('.about-jump a[href="#capabilities"]').click();
  await expect(page).toHaveURL(/about.html#capabilities$/);
  await page.locator('.language-switch a[lang="th"]').click();
  await expect(page).toHaveURL(/th\/about.html#capabilities$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  await expect(page.locator('main')).toContainText('ผมสนใจว่าคนกำลังพยายามทำอะไร');
  await expect.poll(() => page.locator('#capabilities').evaluate(n => Math.abs(n.getBoundingClientRect().top))).toBeLessThanOrEqual(112);
  await page.locator('.nav a[href="project.html"]').click();
  await page.locator('[data-category="internal"] a').first().click();
  await expect(page).toHaveURL(/th\/wcf-digital.html$/);
  await expect(page).toHaveTitle(/WCF/);
  await page.goBack();
  await expect(page).toHaveURL(/th\/project.html$/);
  await page.goForward();
  await expect(page).toHaveURL(/th\/wcf-digital.html$/);
  expect(await page.evaluate(() => (window as unknown as { migrationToken: string }).migrationToken)).toBe('same-document');
  expect(errors).toEqual([]);
});

test('Navigating between Home and Smart Asset releases observers and animation work', async ({ page }) => {
  await page.addInitScript(() => {
    const counters = { intersection: 0, resize: 0 };
    (window as unknown as { observerCounts: typeof counters }).observerCounts = counters;
    const IO = window.IntersectionObserver, RO = window.ResizeObserver;
    window.IntersectionObserver = class extends IO {
      private active = true;
      constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) { super(cb, opts); counters.intersection++; }
      disconnect() { if (this.active) { this.active = false; counters.intersection--; } super.disconnect(); }
    };
    window.ResizeObserver = class extends RO {
      private active = true;
      constructor(cb: ResizeObserverCallback) { super(cb); counters.resize++; }
      disconnect() { if (this.active) { this.active = false; counters.resize--; } super.disconnect(); }
    };
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const counts = () => page.evaluate(() => (window as unknown as { observerCounts: {intersection: number; resize: number} }).observerCounts);
  const initial = await counts();
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.locator('.ink-link[href="smart-asset.html"]').click();
    await expect.poll(counts).toEqual({ intersection: 0, resize: 1 });
    await expect(page.locator('svg path[data-from]')).toHaveCount(6);
    await page.locator('.nav a[href="about.html"]').click();
    await expect.poll(counts).toEqual({ intersection: 0, resize: 0 });
    await page.locator('.brand').click();
    await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'running');
    await expect.poll(counts).toEqual(initial);
    await expect(page.locator('#liquid-noise')).toHaveCount(1);
  }
});

test('Editing the central cover changes listing and case fallback while Home/evidence retain overrides', async ({ page }) => {
  // Serve changed JSON to Vite, without mutating the repository or production data.
  await page.route('**/data/projects.json*', async route => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: body.replaceAll('wcf-cover', 'smart-asset-cover') });
  });
  await page.route('**/data/pages/wcf-digital.json*', async route => {
    const response = await route.fetch();
    const body = await response.text();
    // Vite exposes each top-level export and a default object. Replace only the overview export.
    await route.fulfill({ response, body: body.replace(/export const overview = [\s\S]*?;\n/, 'export const overview = null;\n') });
  });
  await page.goto('http://127.0.0.1:4176/project.html');
  await expect(page.locator('.work-card a[href="wcf-digital.html"] img')).toHaveAttribute('src', '/assets/images/smart-asset-cover.png');
  await page.locator('.work-card a[href="wcf-digital.html"]').click();
  await expect(page.locator('.case-overview img')).toHaveAttribute('src', '/assets/images/smart-asset-cover.png');
  await expect(page.locator('.evidence img').first()).toHaveAttribute('src', '/assets/images/wcf-medical-categories.png');
  await page.locator('.brand').click();
  await expect(page.locator('#wcf .wcf-stage img').first()).toHaveAttribute('src', /wcf-workflow/);
});

test('Diagram failures have a recoverable state; leaving a modal never leaves body locked', async ({ page }) => {
  await page.goto('/');
  await page.locator('.ink-link[href="smart-asset.html"]').click();
  const trigger = page.locator('.flow-evidence-trigger').first();
  const src = await trigger.getAttribute('data-flow-image');
  await page.route('**' + src, route => route.abort());
  await trigger.click();
  await expect(page.locator('.flow-diagram-error')).toBeVisible();
  await expect(page.locator('.flow-diagram-original')).toHaveAttribute('href', src!);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  await page.unroute('**' + src);
  await trigger.click();
  await expect(page.locator('.flow-diagram-loading')).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
});
