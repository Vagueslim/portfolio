import { useState } from 'react';
import { getMedia, getProject, home } from '../content';
import { useLiquidText } from '../hooks/useLiquidText';
import { t } from '../content/localization';

export function FoilIntro() {
  const { foil } = home;
  const motion = useLiquidText();
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = focused ?? hovered;
  motion.hoverTarget.current = active ? 1 : 0;

  return <>
    <svg className="liquid-filters" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="liquid-text" x="-15%" y="-25%" width="130%" height="150%" colorInterpolationFilters="sRGB">
        <feTurbulence ref={motion.noiseRef} id="liquid-noise" type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="1" seed="8" result="noise" />
        <feDisplacementMap ref={motion.warpRef} id="liquid-warp" in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
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
