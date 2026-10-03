import type { HomeVisual } from '../content/types';
import { Lines, MediaImage } from './Shared';

export function ProjectVisual({ visual }: { visual: HomeVisual }) {
  switch (visual.kind) {
    case 'single': return <MediaImage id={visual.mediaId} />;
    case 'pair': return <>{visual.mediaIds.map(id => <MediaImage key={id} id={id} />)}</>;
    case 'collage': return <><MediaImage id={visual.mediaIds[0]} className="smart-flow" /><MediaImage id={visual.mediaIds[1]} className="smart-permissions" /></>;
    case 'statistics': return <>
      <p className="date-caption">{visual.caption}</p>
      <div className="date-stat-grid">
        <div className="date-total"><span>{visual.totalLabel}</span><strong>{visual.total}<i aria-hidden="true">.</i></strong><span>{visual.totalNote}</span></div>
        {visual.items.map(item => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
      </div>
      <div className="date-visual-foot"><p>{visual.footer}</p><p><Lines text={visual.evidenceNote} /></p></div>
    </>;
  }
}

/** Layout follows the media choice, not the project name, including cover fallback. */
export function visualClass(visual: HomeVisual) {
  return { single: 'editorial-visual--web', pair: 'editorial-visual--buddy', collage: 'editorial-visual--collage', statistics: 'editorial-visual--date' }[visual.kind];
}
