import { useEffect, useRef } from 'react';
import { createDitherSurface } from '../effects/ditherWave';

/** All five labels share one visibility-aware animation loop. */
export function useDitherWave(contentKey: string) {
  const copyRef = useRef<HTMLDivElement>(null);
  const hoverTarget = useRef(0);

  useEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    const elements = [...copy.querySelectorAll<HTMLElement>('.dither-ink')];
    const surfaces = elements.flatMap((element, index) => {
      // Context creation may fail in a browser without canvas support.
      try { const surface = createDitherSurface(element, index); return surface ? [surface] : []; }
      catch { return []; }
    });
    // Both preferences use solid DOM text, so don't animate an invisible canvas.
    const reduced = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');
    let disposed = false;
    let visible = false;
    let frameId = 0;
    let lastFrame = 0;
    let phase = 0;
    let hover = 0;
    let needsMeasure = true;
    const allowed = () => surfaces.length > 0 && !disposed && !reduced.matches && !document.hidden && visible;
    const measure = () => { surfaces.forEach(surface => surface.measure()); needsMeasure = false; };
    const draw = () => { if (needsMeasure) measure(); surfaces.forEach(surface => surface.draw(phase)); };
    const tick = (stamp: number) => {
      frameId = 0;
      // Browsers can update matches before delivering the media-query change event.
      if (!allowed()) { sync(); return; }
      if (!lastFrame) lastFrame = stamp;
      const elapsed = stamp - lastFrame;
      if (elapsed >= 32 || needsMeasure) {
        const dt = Math.min(elapsed, 70) / 1000;
        hover += (hoverTarget.current - hover) * (1 - Math.exp(-dt * 5));
        phase += dt * (.85 + hover * .55);
        lastFrame = stamp;
        draw();
      }
      frameId = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (disposed) return;
      const running = allowed();
      copy.dataset.motion = reduced.matches ? 'reduced' : !surfaces.length ? 'unavailable' : running ? 'running' : 'paused';
      if (reduced.matches) surfaces.forEach(surface => surface.fallback());
      if (!running) { cancelAnimationFrame(frameId); frameId = 0; lastFrame = 0; }
      else if (!frameId) { draw(); frameId = requestAnimationFrame(tick); }
    };
    const resize = () => {
      needsMeasure = true;
      // Visible static text is already the fallback; don't draw offscreen or when paused.
      if (allowed()) draw();
    };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    const sizes = new ResizeObserver(resize);
    intersection.observe(copy);
    elements.forEach(element => sizes.observe(element));
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize);
    // A late font resolution from a previous StrictMode mount must not repaint.
    void document.fonts.ready.then(() => { if (!disposed) resize(); });
    sync();
    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      intersection.disconnect();
      sizes.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', resize);
      surfaces.forEach(surface => surface.fallback());
      delete copy.dataset.motion;
    };
  }, [contentKey]);
  return { copyRef, hoverTarget };
}
