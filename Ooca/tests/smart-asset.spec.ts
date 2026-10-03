import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const evidence = JSON.parse(readFileSync('data/smart-asset-evidence.json', 'utf8')) as {
  title: string;
  items: { src: string; width: number; height: number; title: string; alt: string }[];
};
const dictionary: Record<string, string> = JSON.parse(readFileSync('data/locales/en.json', 'utf8'));

test('Smart Asset cover is section two and both flow sections fit in both languages', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  for (const locale of ['en', 'th']) for (const width of [320, 390, 552, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/${locale === 'th' ? 'th/' : ''}smart-asset.html#system-flow-evidence`);
    const cover = page.locator('.p-work-detail__cover--system-flow');
    await expect(page.locator('main section').nth(1)).toHaveAttribute('id', 'smart-asset-system-flow');
    await expect(cover.locator('.p-cover-flow__node')).toHaveCount(7);
    await expect(cover.locator('.p-cover-flow__node:visible')).toHaveCount(width < 768 ? 4 : 7);
    const headingLines = cover.locator('.p-cover-flow__title-line:visible');
    await expect(headingLines).toHaveCount(locale === 'en' ? 2 : width < 768 ? 4 : 3);
    expect(await headingLines.evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1))).toBe(true);
    expect(await cover.locator('[data-language-only]').evaluateAll((nodes, language) => nodes.every(node => node.getAttribute('data-language-only') === language), locale)).toBe(true);
    if (width >= 768) {
      await expect(cover.locator('svg path[data-from]')).toHaveCount(6);
      await expect(cover.locator('svg')).not.toHaveAttribute('viewBox', '0 0 1200 900');
      // Reflowed screenshots must not hide another step's caption.
      const boxes = await cover.locator('.p-cover-flow__node').evaluateAll(nodes => nodes.map(node => {
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y, right: box.right, bottom: box.bottom };
      }));
      for (const [index, box] of boxes.entries()) for (const other of boxes.slice(index + 1)) {
        expect(Math.min(box.right, other.right) <= Math.max(box.x, other.x) || Math.min(box.bottom, other.bottom) <= Math.max(box.y, other.y)).toBe(true);
      }
    }
    const section = page.locator('#system-flow-evidence');
    await expect(section.locator('h2').first()).toHaveText(locale === 'en' ? dictionary[evidence.title] : evidence.title);
    const cards = section.locator('.flow-evidence-trigger');
    await expect(cards).toHaveCount(6);
    await expect(cards.locator('strong')).toHaveText(evidence.items.map(item => locale === 'en' ? dictionary[item.title] : item.title));
    const images = await cards.locator('img').evaluateAll(async nodes => Promise.all(nodes.map(async node => {
      const image = node as HTMLImageElement;
      image.loading = 'eager';
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    })));
    expect(images).toEqual(evidence.items.map(item => [item.width, item.height]));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await section.evaluate(node => Boolean(node.compareDocumentPosition(document.querySelector('.next-case')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    await cards.last().focus();
    expect(await section.locator('.flow-evidence-strip').evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

test('Every appendix diagram opens at original resolution and returns keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of ['en', 'th']) {
    await page.goto(`/${locale === 'th' ? 'th/' : ''}smart-asset.html#system-flow-evidence`);
    const dialog = page.locator('.flow-diagram');
    for (const [index, item] of evidence.items.entries()) {
      const trigger = page.locator('.flow-evidence-trigger').nth(index);
      await trigger.focus();
      await page.keyboard.press(index % 2 ? 'Enter' : 'Space');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleName(locale === 'en' ? dictionary[item.title] : item.title);
      await expect(dialog.locator('img')).toHaveAttribute('alt', locale === 'en' ? dictionary[item.alt] : item.alt);
      expect(await dialog.locator('img').evaluate(async image => { await (image as HTMLImageElement).decode(); return (image as HTMLImageElement).naturalWidth; })).toBe(item.width);
      const original = dialog.locator('.flow-diagram-original');
      await expect(original).toHaveAttribute('href', `${locale === 'th' ? '../' : ''}${item.src}`);
      await expect(original).toHaveAttribute('target', '_blank');
      await expect(dialog.locator('.flow-diagram-close')).toBeFocused();
      if (index % 2) await dialog.locator('.flow-diagram-close').click();
      else await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await expect(page.locator('body')).not.toHaveClass(/flow-diagram-open/);
    }
  }
});
