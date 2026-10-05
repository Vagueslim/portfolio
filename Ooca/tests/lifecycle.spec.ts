import { test, expect } from '@playwright/test';

test('Animation loop synchronizes reduced motion even when the change event is delayed', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const media = original(query);
      // Reproduce the observed browser ordering: matches changes before notification.
      if (query.includes('prefers-reduced-motion')) media.addEventListener = () => {};
      return media;
    };
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://127.0.0.1:4176/tests/fixtures/lifecycle.html');
  await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'reduced');
  const frequency = await page.locator('#liquid-noise').getAttribute('baseFrequency');
  await page.waitForTimeout(100);
  expect(await page.locator('#liquid-noise').getAttribute('baseFrequency')).toBe(frequency);
});

test('StrictMode and re-mounting keep one animation loop and clean up resources', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const state = { frames: new Set<number>(), maxFrames: 0, observers: 0, listeners: new Set<EventListenerOrEventListenerObject>() };
    const instrumented = window as unknown as { resources: () => { frames: number; maxFrames: number; observers: number; listeners: number } };
    instrumented.resources = () => ({ frames: state.frames.size, maxFrames: state.maxFrames, observers: state.observers, listeners: state.listeners.size });
    const raf = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => {
      const id = raf(time => { state.frames.delete(id); callback(time); });
      state.frames.add(id); state.maxFrames = Math.max(state.maxFrames, state.frames.size);
      return id;
    };
    window.cancelAnimationFrame = id => { state.frames.delete(id); cancel(id); };
    const NativeObserver = window.IntersectionObserver;
    window.IntersectionObserver = class extends NativeObserver {
      private active = true;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) { super(callback, options); state.observers++; }
      disconnect() { if (this.active) { state.observers--; this.active = false; } super.disconnect(); }
    };
    const add = document.addEventListener.bind(document);
    const remove = document.removeEventListener.bind(document);
    document.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === 'visibilitychange') state.listeners.add(listener);
      add(type, listener, options);
    }) as typeof document.addEventListener;
    document.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
      if (type === 'visibilitychange') state.listeners.delete(listener);
      remove(type, listener, options);
    }) as typeof document.removeEventListener;
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:4176/tests/fixtures/lifecycle.html');
  // The Thai fixture shares assets with the root, like the /th/ pages.
  await expect(page.locator('[data-fallback] img')).toHaveAttribute('src', '/assets/images/smart-asset-cover.png');
  expect(await page.locator('[data-fallback] img').evaluate(async image => { await (image as HTMLImageElement).decode(); return (image as HTMLImageElement).naturalWidth; })).toBe(868);
  const resources = () => page.evaluate(() => (window as unknown as { resources: () => object }).resources());
  for (let cycle = 0; cycle < 3; cycle++) {
    await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'running');
    await expect.poll(resources).toEqual({ frames: 1, maxFrames: 1, observers: 1, listeners: 1 });
    await page.evaluate(() => (window as unknown as { unmountFixture: () => void }).unmountFixture());
    await expect.poll(resources).toEqual({ frames: 0, maxFrames: 1, observers: 0, listeners: 0 });
    await page.evaluate(() => (window as unknown as { mountFixture: () => void }).mountFixture());
  }
  expect(errors).toEqual([]);
});
