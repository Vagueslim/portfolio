import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { pageFiles } from '../src/routes';
import profile from '../data/profile.json' with { type: 'json' };
import home from '../data/home.json' with { type: 'json' };

for (const locale of ['en', 'th'] as const) {
  const prefix = locale === 'th' ? '/th/' : '/';
  test(`Identity and native CV downloads remain available without JavaScript in ${locale}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    try {
      for (const file of pageFiles) {
        await page.goto(prefix + file);
        await expect(page).toHaveTitle(/ · Product Designer$/);
        const footer = page.locator('footer.portfolio-lower');
        await expect(footer).toContainText(home.contact.title[locale]);
        await expect(footer).toContainText(locale === 'th' ? 'ติดต่อเรื่องงาน' : 'Contact me');
        await expect(footer.locator('.cv-link')).toHaveAttribute('href', '/' + profile.cv.src);
        await expect(footer.locator('.cv-link')).toContainText('English PDF');
        const phones = footer.getByRole('link', { name: profile.phone.ariaLabel[locale], exact: true });
        await expect(phones).toHaveText(['062-645-4249 ↗', '062-645-4249']);
        await expect(footer.locator('.editorial-footer-bottom .editorial-footer-phone')).toHaveText('062-645-4249');
        for (const phone of await phones.all()) {
          await expect(phone).toHaveAttribute('href', 'tel:+66626454249');
          await phone.focus();
          await expect(phone).toBeFocused();
        }
      }
      for (const file of ['index.html', 'about.html']) {
        await page.goto(prefix + file);
        const link = page.locator('.cv-link').first();
        const url = page.url();
        await link.focus();
        const downloadPromise = page.waitForEvent('download');
        await page.keyboard.press('Enter');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe('dhittawat-thongkhum-cv.pdf');
        expect(page.url()).toBe(url);
        expect(readFileSync((await download.path())!)).toEqual(readFileSync(profile.cv.src));
      }
      await expect(page.locator('main')).not.toContainText('GPA');
      const pdf = await context.request.get('/' + profile.cv.src);
      expect(pdf.status()).toBe(200);
      expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');
    } finally { await context.close(); }
  });

  test(`Home and About identity copy fits all requested widths in ${locale}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [320, 390, 552, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const file of ['index.html', 'about.html']) {
        await page.goto(prefix + file);
        await page.evaluate(() => document.fonts.ready);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        for (const link of await page.locator('.cv-link, footer a[href^="tel:"]').all()) {
          const bounds = (await link.boundingBox())!;
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
        }
        if (file === 'index.html') {
          await expect(page.locator('.role')).toContainText('Product Designer');
          await expect(page.locator('.role')).toContainText('10+ years in design');
          await expect(page.locator('.profile-summary')).toHaveCount(0);
          for (const line of home.foil.lines) await expect(page.locator('.paper')).toContainText(line.thought[locale]);
        } else {
          await expect(page.locator('main')).not.toContainText('GPA');
          await expect(page.locator('main')).toContainText(locale === 'en' ? 'Jul–Oct 2026' : 'ก.ค.–ต.ค. 2026');
        }
        if ([390, 1440].includes(width)) await page.screenshot({ path: `qa/profile-${locale}-${file}-${width}.png`, fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });
}
