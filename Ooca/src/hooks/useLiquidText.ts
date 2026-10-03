import { useEffect, useRef } from 'react';

export function useLiquidText() {
  const copyRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<SVGFETurbulenceElement>(null);
  const warpRef = useRef<SVGFEDisplacementMapElement>(null);
  const hoverTarget = useRef(0);

  useEffect(() => {
    const copy = copyRef.current;
    const noise = noiseRef.current;
    const warp = warpRef.current;
    if (!copy || !noise || !warp) return;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frameId = 0;
    let lastFrame = 0;
    let phase = 0;
    let hoverLevel = 0;
    let fontSize = 40;
    const allowed = () => !reduceMotion.matches && !document.hidden && visible;
    const measure = () => { fontSize = parseFloat(getComputedStyle(copy.querySelector('.liquid-ink') ?? copy).fontSize); };
    const tick = (stamp: number) => {
      frameId = 0;
      // A media-query change can become observable before its change event arrives.
      // Synchronize the paused state before ending the loop as well as in listeners.
      if (!allowed()) { sync(); return; }
      if (!lastFrame) lastFrame = stamp;
      const elapsed = stamp - lastFrame;
      if (elapsed >= 32) {
        const dt = Math.min(elapsed, 70) / 1000;
        phase += dt * (1 + hoverLevel * .65); lastFrame = stamp;
        hoverLevel += (hoverTarget.current - hoverLevel) * (1 - Math.exp(-dt * 5));
        // Scale the veins with the font, so the marble stays visible on mobile.
        noise.setAttribute('baseFrequency', `${((.42 + Math.sin(phase * .24) * .09) / fontSize).toFixed(5)} ${((.64 + Math.cos(phase * .19) * .14) / fontSize).toFixed(5)}`);
        warp.setAttribute('scale', (fontSize * (.2 + hoverLevel * .22)).toFixed(2));
      }
      frameId = requestAnimationFrame(tick);
    };
    const sync = () => {
      const running = allowed();
      copy.classList.toggle('motion-paused', !running);
      copy.dataset.motion = reduceMotion.matches ? 'reduced' : running ? 'running' : 'paused';
      if (!running) { cancelAnimationFrame(frameId); frameId = 0; lastFrame = 0; }
      else if (!frameId) frameId = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(copy);
    reduceMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', measure);
    measure(); sync();
    // StrictMode re-mounts effects in development; every resource belongs to this mount.
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      reduceMotion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', measure);
      copy.classList.remove('motion-paused');
      delete copy.dataset.motion;
    };
  }, []);

  return { copyRef, noiseRef, warpRef, hoverTarget };
}
