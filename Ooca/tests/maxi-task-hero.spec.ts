import { test, expect } from '@playwright/test';

test('MAXI TASK uses the approved landscape hero without cropping or losing its appendix', async ({ page }) => {
  for (const locale of ['', 'th/']) {
    await page.goto(`/${locale}maxi-task.html`);
    const hero = page.locator('.case-hero.imported-case-cover.case-overview img');
    await expect(hero).toHaveAttribute('src', '/assets/cases/maxi-task/hero-landscape.png');
    await expect(hero).toHaveAttribute('alt', /MAXITASK/);
    for (const width of [320, 390, 552, 768, 1440, 2048]) {
      await page.setViewportSize({ width, height: 900 });
      const image = await hero.evaluate(async node => {
        const img = node as HTMLImageElement;
        await img.decode();
        const rect = img.getBoundingClientRect();
        return { width: img.naturalWidth, height: img.naturalHeight, ratio: rect.width / rect.height, left: rect.left, right: rect.right, fit: getComputedStyle(img).objectFit };
      });
      expect([image.width, image.height]).toEqual([1672, 941]);
      expect(image.ratio).toBeCloseTo(1672 / 941, 2);
      expect(image.fit).toBe('contain');
      expect(image.left).toBeGreaterThanOrEqual(0);
      expect(image.right).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await expect(page.locator('#maxi-task-appendix .flow-evidence-trigger')).toHaveCount(8);
    expect(await page.locator('.flow-evidence-strip').evaluate(node => getComputedStyle(node).gridAutoFlow)).toBe('column');
  }
});
