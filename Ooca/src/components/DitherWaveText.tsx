/** The real text owns layout, selection and the no-JS fallback. Canvas is decoration. */
export function DitherWaveText({ text }: { text: string }) {
  return <span className="dither-ink" aria-hidden="true">
    <span className="dither-ink-text">{text}</span>
    <canvas className="dither-wave" aria-hidden="true" />
  </span>;
}
