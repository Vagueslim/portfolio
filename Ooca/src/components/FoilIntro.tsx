import { useState } from 'react';
import { getMedia, getProject, home } from '../content';
import { useLiquidText } from '../hooks/useLiquidText';
import { t } from '../content/localization';

// Repeated dark-to-silver bands turn smooth noise into fine marble veins.
// The final alpha mask keeps the actual text edges sharp and selectable.
const marbleChannels = [
  [0.025, 0.085, 0.32],
  [0.035, 0.10, 0.35],
  [0.065, 0.12, 0.38],
].map(([base, shoulder, highlight]) => Array.from({ length: 129 }, (_, index) => {
  const band = (1 + Math.cos(index / 128 * Math.PI * 16)) / 2;
  return (base + shoulder * band ** 3 + highlight * band ** 12).toFixed(3);
}).join(' '));

export function FoilIntro() {
  const { foil } = home;
  const motion = useLiquidText();
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = focused ?? hovered;
  motion.hoverTarget.current = active ? 1 : 0;

  return <>
    <svg className="liquid-filters" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="liquid-text" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence ref={motion.noiseRef} id="liquid-noise" type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="1" seed="8" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="stone" />
        <feComponentTransfer in="stone" result="veins">
          <feFuncR type="table" tableValues={marbleChannels[0]} />
          <feFuncG type="table" tableValues={marbleChannels[1]} />
          <feFuncB type="table" tableValues={marbleChannels[2]} />
        </feComponentTransfer>
        <feDisplacementMap ref={motion.warpRef} id="liquid-warp" in="veins" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="marble" />
        <feComposite in="marble" in2="SourceAlpha" operator="in" />
      </filter></defs>
    </svg>
    <section className="paper paper--projects" aria-label={foil.label} style={{ backgroundImage: `url("${getMedia(foil.backgroundMediaId).src}")` }}>
      <div className="copy copy--projects" lang="en" ref={motion.copyRef}>
        {foil.lines.map(line => <p key={line.projectId}>
          <span className="project-thought">{line.thought}</span>{' '}
          <span className="project-reference"><span className="project-separator" aria-hidden="true">/</span>{' '}
            <a className="ink-link" href={getProject(line.projectId).href} aria-label={`${line.label} — ${t('อ่านเคส')}`}
              onPointerEnter={() => setHovered(line.destination)} onPointerLeave={() => setHovered(null)}
              onFocus={() => setFocused(line.destination)} onBlur={() => setFocused(null)}>
              <span className="liquid-ink" aria-hidden="true">{line.label}</span>
            </a>
          </span>
        </p>)}
      </div>
      <div className="paper-foot"><span className="destination" aria-hidden="true">{active ?? foil.destination} ↗</span></div>
    </section>
  </>;
}
