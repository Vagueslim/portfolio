import { test, expect, type Locator, type Page } from '@playwright/test';

type FoilFrame = { stamp: number; time: number; strength: number; position: number[] };
type FoilAudit = { frames: FoilFrame[] };

async function watchGpuFrames(page: Page) {
  await page.addInitScript(() => {
    const audit = { frames: [] as FoilFrame[] };
    (window as unknown as { foilAudit: FoilAudit }).foilAudit = audit;
    const names = new WeakMap<WebGLUniformLocation, string>();
    const values = new WeakMap<WebGLRenderingContext, { time: number; strength: number; position: number[] }>();
    const prototype = WebGLRenderingContext.prototype;
    const location = prototype.getUniformLocation, scalar = prototype.uniform1f, vector = prototype.uniform2f, draw = prototype.drawArrays;
    const state = (gl: WebGLRenderingContext) => {
      if (!values.has(gl)) values.set(gl, { time: NaN, strength: NaN, position: [] });
      return values.get(gl)!;
    };
    prototype.getUniformLocation = function (program, name) {
      const result = location.call(this, program, name);
      if (result) names.set(result, name);
      return result;
    };
    prototype.uniform1f = function (uniform, value) {
      const name = uniform && names.get(uniform);
      if (name === 'u_time') state(this).time = value;
      if (name === 'u_strength') state(this).strength = value;
      scalar.call(this, uniform, value);
    };
    prototype.uniform2f = function (uniform, x, y) {
      if (uniform && names.get(uniform) === 'u_position') state(this).position = [x, y];
      vector.call(this, uniform, x, y);
    };
    prototype.drawArrays = function (mode, first, count) {
      draw.call(this, mode, first, count);
      if (this.canvas instanceof HTMLCanvasElement && this.canvas.matches('.foil-background')) {
        audit.frames.push({ stamp: performance.now(), ...state(this), position: [...state(this).position] });
        if (audit.frames.length > 300) audit.frames.shift();
      }
    };
  });
}

const gpuPixels = (canvas: Locator) => canvas.evaluate(element => {
  const target = element as HTMLCanvasElement;
  const gl = target.getContext('webgl')!;
  const pixels = new Uint8Array(target.width * target.height * 4);
  gl.readPixels(0, 0, target.width, target.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let hash = 2166136261, minimum = 255, maximum = 0, opaque = 0;
  for (let index = 0; index < pixels.length; index += 4 * 53) {
    for (let channel = 0; channel < 3; channel++) {
      const value = pixels[index + channel];
      hash = Math.imul(hash ^ value, 16777619);
      minimum = Math.min(minimum, value); maximum = Math.max(maximum, value);
    }
    if (pixels[index + 3]) opaque++;
  }
  return { hash: hash >>> 0, spread: maximum - minimum, opaque };
});

async function expectStaticFoil(page: Page) {
  const canvas = page.locator('.foil-background');
  await expect(canvas).toHaveAttribute('data-ready', 'false');
  expect(await canvas.evaluate(element => {
    const style = getComputedStyle(element);
    return style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0;
  })).toBe(true);
  await expect(page.locator('.paper--projects')).toHaveCSS('background-size', 'cover');
  await expect(page.locator('.paper--projects')).toHaveCSS('background-image', /silver-rainbow-foil-v1\.png/);
}

test('Foil uses the selected shader speed and strength, paints at capped FPS and leaves text still', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await watchGpuFrames(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const canvas = page.locator('.foil-background');
  await expect(canvas).toHaveAttribute('data-motion', 'running');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  await expect(canvas).toHaveAttribute('aria-hidden', 'true');
  await expect(canvas).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('.dither-ink[data-ready="true"]')).toHaveCount(5);
  const before = await page.locator('.ink-link').evaluateAll(elements => elements.map(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }));
  const pixels = await gpuPixels(canvas);
  expect(pixels.opaque).toBeGreaterThan(0);
  expect(pixels.spread).toBeGreaterThan(20);
  await page.waitForTimeout(100); // Let the first font/ResizeObserver measurements settle.
  await page.evaluate(() => { (window as unknown as { foilAudit: FoilAudit }).foilAudit.frames = []; });
  await page.waitForTimeout(1200); // Sample actual GPU submissions over more than one second.
  const frames = await page.evaluate(() => (window as unknown as { foilAudit: FoilAudit }).foilAudit.frames);
  expect(frames.length).toBeGreaterThan(5);
  const elapsed = (frames.at(-1)!.stamp - frames[0].stamp) / 1000;
  const speed = (frames.at(-1)!.time - frames[0].time) / elapsed;
  expect(speed).toBeGreaterThan(0.33);
  expect(speed).toBeLessThan(0.39);
  expect(frames.length - 1).toBeLessThanOrEqual(Math.ceil(elapsed * 30) + 1);
  expect(frames.every(frame => Math.abs(frame.strength - 0.85) < 0.00001)).toBe(true);
  expect(frames.at(-1)!.position).toEqual([0.5, 0.5]);
  expect((await gpuPixels(canvas)).hash).not.toBe(pixels.hash);
  const after = await page.locator('.ink-link').evaluateAll(elements => elements.map(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  }));
  expect(after).toEqual(before);
  expect(errors).toEqual([]);
});

test('Foil pauses offscreen/hidden and restores the image fallback for motion preferences', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const canvas = page.locator('.foil-background');
  await expect(canvas).toHaveAttribute('data-motion', 'running');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute('data-motion', 'paused');
  const offscreen = await gpuPixels(canvas);
  await page.waitForTimeout(120);
  expect(await gpuPixels(canvas)).toEqual(offscreen);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(canvas).toHaveAttribute('data-motion', 'running');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(canvas).toHaveAttribute('data-motion', 'paused');
  const hidden = await gpuPixels(canvas);
  await page.waitForTimeout(120);
  expect(await gpuPixels(canvas)).toEqual(hidden);
  await page.evaluate(() => { delete (document as unknown as { hidden?: boolean }).hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await expect(canvas).toHaveAttribute('data-motion', 'running');
  for (const preference of ['reducedMotion', 'forcedColors'] as const) {
    await page.emulateMedia(preference === 'reducedMotion' ? { reducedMotion: 'reduce' } : { forcedColors: 'active' });
    await expect(canvas).toHaveAttribute('data-motion', 'reduced');
    await expectStaticFoil(page);
    const frozen = await gpuPixels(canvas);
    await page.waitForTimeout(120);
    expect(await gpuPixels(canvas)).toEqual(frozen);
    await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
    await expect(canvas).toHaveAttribute('data-motion', 'running');
    await expect.poll(async () => (await gpuPixels(canvas)).hash).not.toBe(frozen.hash);
  }
});

test('WebGL unavailability preserves the original foil image and independent dither links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
      return ['webgl', 'webgl2', 'experimental-webgl'].includes(contextId) ? null : Reflect.apply(getContext, this, [contextId, ...args]);
    } as typeof getContext;
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.foil-background')).toHaveAttribute('data-motion', 'unavailable');
  await expectStaticFoil(page);
  await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'running');
  await expect(page.locator('.dither-ink[data-ready="true"]')).toHaveCount(5);
  await page.locator('.ink-link').first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/wcf-digital\.html$/);
  expect(errors).toEqual([]);
});

test('Foil restores its GPU resources and animation after real WebGL context loss', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const canvas = page.locator('.foil-background');
  for (let cycle = 0; cycle < 2; cycle++) {
    await expect(canvas).toHaveAttribute('data-motion', 'running');
    await expect(canvas).toHaveAttribute('data-ready', 'true');
    expect(await canvas.evaluate(element => {
      const extension = (element as HTMLCanvasElement).getContext('webgl')!.getExtension('WEBGL_lose_context');
      (window as unknown as { foilContextControl: WEBGL_lose_context | null }).foilContextControl = extension;
      extension?.loseContext();
      return !!extension;
    })).toBe(true);
    await expect(canvas).toHaveAttribute('data-motion', 'context-lost');
    await expectStaticFoil(page);
    await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'running');
    await page.evaluate(() => (window as unknown as { foilContextControl: WEBGL_lose_context }).foilContextControl.restoreContext());
    await expect(canvas).toHaveAttribute('data-motion', 'running');
    await expect(canvas).toHaveAttribute('data-ready', 'true');
    const restored = await gpuPixels(canvas);
    expect(restored.spread).toBeGreaterThan(20);
    expect(restored.opaque).toBeGreaterThan(0);
    await expect.poll(async () => (await gpuPixels(canvas)).hash).not.toBe(restored.hash);
  }
  expect(errors).toEqual([]);
});

test('Foil keeps the existing cover crop and respects DPR/pixel caps while resizing', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 3, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await watchGpuFrames(page);
  try {
    await page.goto('http://127.0.0.1:4175/');
    for (const width of [390, 2560]) {
      await page.setViewportSize({ width, height: width === 390 ? 900 : 1600 });
      const canvas = page.locator('.foil-background');
      await expect(canvas).toHaveAttribute('data-motion', 'running');
      await expect(canvas).toHaveAttribute('data-ready', 'true');
      await expect.poll(() => canvas.evaluate(element => {
        const target = element as HTMLCanvasElement;
        const bounds = target.getBoundingClientRect();
        const section = target.closest('section')!.getBoundingClientRect();
        const maximumRatio = Math.min(1.5, Math.sqrt(1400000 / (section.width * section.height)));
        return target.width > 0 && target.height > 0 && target.width * target.height <= 1400000 &&
          Math.abs(target.width - section.width * maximumRatio) <= 2 && Math.abs(target.height - section.height * maximumRatio) <= 2 &&
          Math.abs(bounds.width - section.width) <= 1 && Math.abs(bounds.height - section.height) <= 1;
      })).toBe(true);
      const position = width === 390 ? [0.48, 0.5] : [0.5, 0.5];
      await expect(page.locator('.paper--projects')).toHaveCSS('background-position', width === 390 ? '48% 50%' : '50% 50%');
      await expect.poll(() => page.evaluate(() => (window as unknown as { foilAudit: FoilAudit }).foilAudit.frames.at(-1)?.position)).toEqual(position);
      expect((await gpuPixels(canvas)).spread).toBeGreaterThan(20);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  } finally { await context.close(); }
});
