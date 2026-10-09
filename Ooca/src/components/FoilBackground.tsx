import { useFoilMotion } from '../hooks/useFoilMotion';

export function FoilBackground({ src }: { src: string }) {
  const canvasRef = useFoilMotion(src);
  return <canvas className="foil-background" ref={canvasRef} aria-hidden="true" />;
}
