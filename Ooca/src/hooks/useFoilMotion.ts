import { useEffect, useRef } from 'react';
import { createFoilTexture, FOIL_MOTION } from '../effects/foilTexture';

export function useFoilMotion(src: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = canvas?.parentElement;
    if (!canvas || !scene) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');
    const image = new Image();
    let renderer: ReturnType<typeof createFoilTexture> | undefined;
    let disposed = false, loaded = false, failed = false, lost = false, visible = false;
    let frameId = 0, previous = 0, lastDraw = 0, clock = 0;
    let needsResize = true, positionX = .5, positionY = .5;
    const allowed = () => !disposed && !failed && !lost && loaded && visible && !document.hidden && !reduced.matches;
    const resize = () => {
      const bounds = scene.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, FOIL_MOTION.maxDpr,
        Math.sqrt(FOIL_MOTION.maxPixels / Math.max(1, bounds.width * bounds.height)));
      const width = Math.max(1, Math.floor(bounds.width * ratio));
      const height = Math.max(1, Math.floor(bounds.height * ratio));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      const positions = getComputedStyle(scene).backgroundPosition.split(' ');
      const x = parseFloat(positions[0]) / 100, y = parseFloat(positions[1]) / 100;
      positionX = Number.isFinite(x) ? x : .5;
      positionY = 1 - (Number.isFinite(y) ? y : .5);
      needsResize = false;
    };
    const draw = () => {
      if (needsResize) resize();
      renderer?.draw(clock, positionX, positionY);
      canvas.dataset.ready = 'true';
    };
    const tick = (stamp: number) => {
      frameId = 0;
      // Check preferences again here: matches can change before the browser sends its event.
      if (!allowed()) { sync(); return; }
      if (previous) clock += Math.min((stamp - previous) / 1000, .1) * FOIL_MOTION.speed;
      previous = stamp;
      if (stamp - lastDraw >= 1000 / FOIL_MOTION.fps) { draw(); lastDraw = stamp; }
      frameId = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (disposed) return;
      if (allowed() && !renderer) {
        try { renderer = createFoilTexture(canvas, image); needsResize = true; }
        catch { failed = true; }
      }
      const running = allowed() && !!renderer;
      canvas.dataset.motion = reduced.matches ? 'reduced' : lost ? 'context-lost' : failed ? 'unavailable' : !loaded ? 'loading' : running ? 'running' : 'paused';
      if (reduced.matches || failed || lost) canvas.dataset.ready = 'false';
      if (!running) { cancelAnimationFrame(frameId); frameId = 0; previous = 0; lastDraw = 0; }
      else if (!frameId) { draw(); lastDraw = performance.now(); frameId = requestAnimationFrame(tick); }
    };
    const queueResize = () => { needsResize = true; };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      renderer?.dispose(); renderer = undefined;
      sync();
    };
    const contextRestored = () => { lost = false; failed = false; needsResize = true; sync(); };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .01 });
    const sizes = new ResizeObserver(queueResize);
    intersection.observe(scene);
    sizes.observe(scene);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', queueResize);
    canvas.addEventListener('webglcontextlost', contextLost);
    canvas.addEventListener('webglcontextrestored', contextRestored);
    image.onload = () => { if (!disposed) { loaded = true; sync(); } };
    image.onerror = () => { if (!disposed) { failed = true; sync(); } };
    image.src = src;
    sync();
    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      intersection.disconnect(); sizes.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', queueResize);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      image.onload = image.onerror = null;
      renderer?.dispose(); renderer = undefined;
      delete canvas.dataset.motion;
      delete canvas.dataset.ready;
    };
  }, [src]);
  return canvasRef;
}
