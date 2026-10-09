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
  await expect(page.locator('.dither-ink[data-ready="true"]')).toHaveCount(5);
  await expect(page.locator('.foil-background')).toHaveAttribute('data-motion', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('.foil-background')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('.dither-ink[data-ready="false"]')).toHaveCount(5);
  const canvas = page.locator('.dither-wave').first();
  const pixels = await canvas.evaluate(element => (element as HTMLCanvasElement).toDataURL());
  const foilHash = () => page.locator('.foil-background').evaluate(element => {
    const data = (element as HTMLCanvasElement).toDataURL();
    let hash = 0;
    for (let index = 0; index < data.length; index++) hash = Math.imul(hash, 31) + data.charCodeAt(index) | 0;
    return hash;
  });
  const foil = await foilHash();
  await page.waitForTimeout(100);
  expect(await canvas.evaluate(element => (element as HTMLCanvasElement).toDataURL())).toBe(pixels);
  expect(await foilHash()).toBe(foil);
});

test('StrictMode and re-mounting keep two independent animation loops and clean up all resources', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const state = { frames: new Set<number>(), maxFrames: 0, observers: 0, resizeObservers: 0, listeners: new Set<EventListenerOrEventListenerObject>(), resizeListeners: new Set<EventListenerOrEventListenerObject>(), mediaListeners: new Set<EventListenerOrEventListenerObject>() };
    const contextListeners: { target: HTMLCanvasElement; type: string; listener: EventListenerOrEventListenerObject }[] = [];
    const gpuObjects = new Set<unknown>();
    const instrumented = window as unknown as { resources: () => { frames: number; maxFrames: number; observers: number; resizeObservers: number; listeners: number; resizeListeners: number; mediaListeners: number; contextListeners: number }; gpuResources: () => number };
    instrumented.resources = () => ({ frames: state.frames.size, maxFrames: state.maxFrames, observers: state.observers, resizeObservers: state.resizeObservers, listeners: state.listeners.size, resizeListeners: state.resizeListeners.size, mediaListeners: state.mediaListeners.size, contextListeners: contextListeners.length });
    instrumented.gpuResources = () => gpuObjects.size;
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
    const NativeResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends NativeResizeObserver {
      private active = true;
      constructor(callback: ResizeObserverCallback) { super(callback); state.resizeObservers++; }
      disconnect() { if (this.active) { state.resizeObservers--; this.active = false; } super.disconnect(); }
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
    const addWindow = window.addEventListener.bind(window), removeWindow = window.removeEventListener.bind(window);
    window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === 'resize') state.resizeListeners.add(listener);
      addWindow(type, listener, options);
    }) as typeof window.addEventListener;
    window.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
      if (type === 'resize') state.resizeListeners.delete(listener);
      removeWindow(type, listener, options);
    }) as typeof window.removeEventListener;
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const media = matchMedia(query);
      if (!query.includes('prefers-reduced-motion')) return media;
      const addMedia = media.addEventListener.bind(media), removeMedia = media.removeEventListener.bind(media);
      media.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
        if (type === 'change') state.mediaListeners.add(listener);
        addMedia(type, listener, options);
      }) as typeof media.addEventListener;
      media.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
        if (type === 'change') state.mediaListeners.delete(listener);
        removeMedia(type, listener, options);
      }) as typeof media.removeEventListener;
      return media;
    };
    const canvasPrototype = HTMLCanvasElement.prototype;
    const addCanvas = canvasPrototype.addEventListener, removeCanvas = canvasPrototype.removeEventListener;
    canvasPrototype.addEventListener = function (this: HTMLCanvasElement, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      if (['webglcontextlost', 'webglcontextrestored'].includes(type)) contextListeners.push({ target: this, type, listener });
      addCanvas.call(this, type, listener, options);
    } as typeof addCanvas;
    canvasPrototype.removeEventListener = function (this: HTMLCanvasElement, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
      const index = contextListeners.findIndex(item => item.target === this && item.type === type && item.listener === listener);
      if (index >= 0) contextListeners.splice(index, 1);
      removeCanvas.call(this, type, listener, options);
    } as typeof removeCanvas;
    const glPrototype = WebGLRenderingContext.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
    for (const kind of ['Shader', 'Program', 'Buffer', 'Texture']) {
      const create = glPrototype['create' + kind], remove = glPrototype['delete' + kind];
      glPrototype['create' + kind] = function (this: WebGLRenderingContext, ...args: unknown[]) {
        const resource = Reflect.apply(create, this, args);
        if (resource && this.canvas instanceof HTMLCanvasElement && this.canvas.matches('.foil-background')) gpuObjects.add(resource);
        return resource;
      };
      glPrototype['delete' + kind] = function (this: WebGLRenderingContext, resource: unknown) {
        gpuObjects.delete(resource);
        return Reflect.apply(remove, this, [resource]);
      };
    }
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://127.0.0.1:4176/tests/fixtures/lifecycle.html');
  // The Thai fixture shares assets with the root, like the /th/ pages.
  await expect(page.locator('[data-fallback] img')).toHaveAttribute('src', '/assets/images/smart-asset-cover.png');
  expect(await page.locator('[data-fallback] img').evaluate(async image => { await (image as HTMLImageElement).decode(); return (image as HTMLImageElement).naturalWidth; })).toBe(868);
  const resources = () => page.evaluate(() => (window as unknown as { resources: () => object }).resources());
  const gpuResources = () => page.evaluate(() => (window as unknown as { gpuResources: () => number }).gpuResources());
  for (let cycle = 0; cycle < 3; cycle++) {
    await expect(page.locator('.copy')).toHaveAttribute('data-motion', 'running');
    await expect(page.locator('.foil-background')).toHaveAttribute('data-motion', 'running');
    await expect.poll(resources).toEqual({ frames: 2, maxFrames: 2, observers: 2, resizeObservers: 2, listeners: 2, resizeListeners: 2, mediaListeners: 2, contextListeners: 2 });
    expect(await gpuResources()).toBeGreaterThan(0);
    await page.evaluate(() => (window as unknown as { unmountFixture: () => void }).unmountFixture());
    await expect.poll(resources).toEqual({ frames: 0, maxFrames: 2, observers: 0, resizeObservers: 0, listeners: 0, resizeListeners: 0, mediaListeners: 0, contextListeners: 0 });
    expect(await gpuResources()).toBe(0);
    await page.evaluate(() => (window as unknown as { mountFixture: () => void }).mountFixture());
  }
  expect(errors).toEqual([]);
});
