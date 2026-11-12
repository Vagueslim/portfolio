import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { localize } from '../src/content/localization';
import { media } from '../src/content';

const raw = JSON.parse(readFileSync('data/maxi-task-evidence.json', 'utf8'));
const evidenceFor = (locale: 'en' | 'th') => localize<{ title: string; items: { mediaId: string; title: string; alt: string }[] }>(raw, locale);

test('MAXI TASK uses the same responsive card strip and image treatment as Smart Asset', async ({ page, context }) => {
  const reference = await context.newPage();
  for (const locale of ['en', 'th'] as const) {
    const prefix = locale === 'th' ? '/th/' : '/';
    await page.goto(`${prefix}maxi-task.html`);
    await reference.goto(`${prefix}smart-asset.html`);
    for (const width of [320, 390, 768, 1440, 2048]) {
      await page.setViewportSize({ width, height: 900 });
      await reference.setViewportSize({ width, height: 900 });
      const styles = await Promise.all([page, reference].map(target => target.locator('.flow-evidence').evaluate(section => {
        const pick = (selector: string, properties: string[]) => {
          const style = getComputedStyle(section.querySelector(selector)!);
          return properties.map(property => style.getPropertyValue(property));
        };
        return {
          header: pick('.flow-evidence-header', ['grid-template-columns', 'gap', 'padding-inline', 'margin-bottom']),
          heading: pick('h2', ['font-family', 'font-size', 'font-weight', 'line-height']),
          strip: pick('.flow-evidence-strip', ['grid-auto-flow', 'grid-auto-columns', 'gap', 'overflow-x', 'scroll-snap-type']),
          card: pick('.flow-evidence-trigger', ['width', 'border', 'background-color']),
          snapshot: pick('.flow-evidence-snapshot', ['height', 'padding', 'background-color']),
          image: pick('.flow-evidence-snapshot img', ['object-fit', 'object-position', 'filter']),
          number: pick('.flow-evidence-index', ['top', 'left', 'padding', 'font-size']),
        };
      })));
      expect(styles[0]).toEqual(styles[1]);
      expect(await page.locator('.flow-evidence-strip').evaluate(strip => {
        const items = [...strip.children].map(item => item.getBoundingClientRect());
        return strip.scrollWidth > strip.clientWidth && items.every(item => Math.abs(item.top - items[0].top) < 1);
      })).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const lastCard = page.locator('#maxi-task-appendix .flow-evidence-trigger').last();
    await lastCard.click();
    await expect(page.locator('.flow-diagram')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(lastCard).toBeFocused();
    expect(await page.locator('.flow-evidence-strip').evaluate(strip => strip.scrollLeft)).toBeGreaterThan(0);
  }
  await reference.close();
});

test('MAXI TASK appendix preserves all eight screenshots, fits small screens, and has a bilingual anchor', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  for (const locale of ['en', 'th'] as const) {
    const evidence = evidenceFor(locale);
    await page.goto(`/${locale === 'th' ? 'th/' : ''}maxi-task.html`);
    await page.locator('.case-toc a[href="#maxi-task-appendix"]').click();
    await expect(page).toHaveURL(/#maxi-task-appendix$/);
    const section = page.locator('#maxi-task-appendix');
    await expect(section.locator('h2').first()).toHaveText(evidence.title);
    const triggers = section.locator('.flow-evidence-trigger');
    await expect(triggers).toHaveCount(8);
    await expect(triggers.locator('strong')).toHaveText(evidence.items.map(item => item.title));
    expect(await section.evaluate(node => Boolean(node.compareDocumentPosition(document.querySelector('.next-case')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    for (const width of [320, 390, 552, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const dimensions = await triggers.locator('img').evaluateAll(async nodes => Promise.all(nodes.map(async node => {
        const image = node as HTMLImageElement;
        image.loading = 'eager'; await image.decode();
        return [image.naturalWidth, image.naturalHeight];
      })));
      expect(dimensions).toEqual(evidence.items.map(item => [media[item.mediaId].width, media[item.mediaId].height]));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await triggers.evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1))).toBe(true);
    }
    await page.locator(`.language-switch a[lang="${locale === 'en' ? 'th' : 'en'}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${locale === 'en' ? '/th/' : '/'}maxi-task\\.html#maxi-task-appendix$`));
    await page.reload();
    await expect(section).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('Every MAXI TASK appendix image opens at original resolution and returns keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of ['en', 'th'] as const) {
    await page.goto(`/${locale === 'th' ? 'th/' : ''}maxi-task.html#maxi-task-appendix`);
    const dialog = page.locator('.flow-diagram');
    for (const [index, item] of evidenceFor(locale).items.entries()) {
      const trigger = page.locator('#maxi-task-appendix .flow-evidence-trigger').nth(index);
      await trigger.focus();
      await page.keyboard.press(index % 2 ? 'Enter' : 'Space');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleName(item.title);
      await expect(dialog.locator('img')).toHaveAttribute('alt', item.alt);
      expect(await dialog.locator('img').evaluate(async image => { await (image as HTMLImageElement).decode(); return (image as HTMLImageElement).naturalWidth; })).toBe(media[item.mediaId].width);
      await expect(dialog.locator('.flow-diagram-original')).toHaveAttribute('href', '/' + media[item.mediaId].src);
      await expect(dialog.locator('.flow-diagram-close')).toBeFocused();
      if (index % 2) await dialog.locator('.flow-diagram-close').click();
      else await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
    }
  }
});

test('MAXI TASK appendix recovers from a missing image and navigation closes the viewer', async ({ page }) => {
  await page.goto('/about.html');
  await page.locator('.career-projects a[href="maxi-task.html"]').click();
  const trigger = page.locator('#maxi-task-appendix .flow-evidence-trigger').first();
  const src = await trigger.getAttribute('data-flow-image');
  await page.route('**' + src, route => route.abort());
  await trigger.click();
  await expect(page.locator('.flow-diagram-error')).toBeVisible();
  await expect(page.locator('.flow-diagram-original')).toHaveAttribute('href', src!);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.unroute('**' + src);
  await trigger.click();
  await expect(page.locator('.flow-diagram-loading')).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(/\/about.html$/);
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  await page.goForward();
  await expect(page.locator('#maxi-task-appendix .flow-evidence-trigger')).toHaveCount(8);
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});
