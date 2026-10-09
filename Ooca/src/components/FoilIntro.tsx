import { SiteLink } from './SiteLink';
import { useState } from 'react';
import { useContent } from '../content';
import { useDitherWave } from '../hooks/useDitherWave';
import { DitherWaveText } from './DitherWaveText';
import { FoilBackground } from './FoilBackground';

export function FoilIntro() {
  const { home, getMedia, getProject, ui } = useContent();
  const { foil } = home;
  const motion = useDitherWave(foil.lines.map(line => line.label).join('|'));
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = focused ?? hovered;
  motion.hoverTarget.current = active ? 1 : 0;

  return <section className="paper paper--projects" aria-label={foil.label} style={{ backgroundImage: `url("${getMedia(foil.backgroundMediaId).src}")` }}>
      <FoilBackground src={getMedia(foil.backgroundMediaId).src} />
      <div className="copy copy--projects" lang="en" ref={motion.copyRef}>
        {foil.lines.map(line => <p key={line.projectId}>
          <span className="project-thought">{line.thought}</span>{' '}
          <span className="project-reference"><span className="project-separator" aria-hidden="true">/</span>{' '}
            <SiteLink className="ink-link" href={getProject(line.projectId).href} aria-label={`${line.label} — ${ui.readCase}`}
              onPointerEnter={() => setHovered(line.destination)} onPointerLeave={() => setHovered(null)}
              onFocus={() => setFocused(line.destination)} onBlur={() => setFocused(null)}>
              <DitherWaveText text={line.label} />
            </SiteLink>
          </span>
        </p>)}
      </div>
      <div className="paper-foot"><span className="destination" aria-hidden="true">{active ?? foil.destination} ↗</span></div>
    </section>;
}
