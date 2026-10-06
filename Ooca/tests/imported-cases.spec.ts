import { test, expect } from '@playwright/test';

for (const id of ['maxi-task', 'asean-summit-2019']) test(`${id}: bilingual case, images, anchors and language navigation`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  for (const locale of ['', 'th/']) {
    await page.goto(`/${locale}${id}.html`);
    await expect(page.locator('h1')).toContainText(id === 'maxi-task' ? 'MAXI TASK' : 'ASEAN Summit 2019');
    for (const width of [320, 390, 552, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(async image => { image.loading = 'eager'; await image.decode(); }));
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('.case-toc a[href="#reflection"]').click();
    await expect(page).toHaveURL(/#reflection$/);
    const button = page.locator('.image-button').first();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('dialog[open] img')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(button).toBeFocused();
    await page.locator(`.language-switch a[lang="${locale ? 'en' : 'th'}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${locale ? '/' : '/th/'}${id}\\.html#reflection$`));
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
  }
  await page.goto('/about.html');
  await page.evaluate(() => { (window as unknown as { caseToken: string }).caseToken = 'retained'; });
  await page.locator(`.career-projects a[href="${id}.html"]`).click();
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { caseToken: string }).caseToken)).toBe('retained');
  expect(errors).toEqual([]);
});
