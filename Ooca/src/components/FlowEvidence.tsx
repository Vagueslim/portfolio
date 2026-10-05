import { useState } from 'react';
import data from '../../data/smart-asset-evidence.json' with { type: 'json' };
import { useContent } from '../content';
import { localize, useLanguage } from '../content/localization';
import { closeOnBackdrop, useModal } from '../hooks/useModal';
interface Diagram { mediaId: string; alt: string; title: string; description: string }
interface Evidence { title: string; label: string; intro: string; open: string; close: string; loading: string; error: string; original: string; items: Diagram[] }
export function FlowEvidence() {
  const content = localize<Evidence>(data, useLanguage()), { getMedia } = useContent();
  const [active, setActive] = useState<Diagram | null>(null), [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const ref = useModal(active);
  return <section className="flow-evidence" id="system-flow-evidence" aria-labelledby="flow-evidence-heading">
    <div className="flow-evidence-header"><p className="eyebrow">{content.label}</p><h2 id="flow-evidence-heading">{content.title}</h2><p>{content.intro}</p></div>
    <ol className="flow-evidence-strip" aria-labelledby="flow-evidence-heading">{content.items.map((item, i) => { const image = getMedia(item.mediaId); return <li className="flow-evidence-item" key={item.mediaId}>
      <button className="flow-evidence-trigger" type="button" aria-haspopup="dialog" aria-controls="flow-diagram" data-flow-image={image.src} data-caption={item.alt} onClick={() => { setStatus('loading'); setActive(item); }}>
        <span className="flow-evidence-snapshot"><img src={image.src} width={image.width} height={image.height} alt="" loading="lazy" /><span className="flow-evidence-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span></span>
        <span className="flow-evidence-copy"><strong>{item.title}</strong><span className="flow-evidence-description">{item.description}</span><span className="flow-evidence-action">{content.open} <span aria-hidden="true">↗</span></span></span>
      </button>
    </li>; })}</ol>
    <dialog className="flow-diagram" id="flow-diagram" ref={ref} aria-labelledby="flow-diagram-title" aria-describedby="flow-diagram-description" onCancel={() => setActive(null)} onClose={() => { if (!ref.current?.open) setActive(null); }} onClick={closeOnBackdrop}>
      <div className="flow-diagram-bar"><div><p className="eyebrow">{content.label}</p><h2 id="flow-diagram-title">{active?.title}</h2></div><button className="flow-diagram-close" type="button" aria-label={content.close} autoFocus onClick={() => ref.current?.close()}>×</button></div>
      <div className="flow-diagram-viewport" key={active?.mediaId ?? 'closed'} tabIndex={0} aria-labelledby="flow-diagram-title">
        <p className="flow-diagram-loading" role="status" hidden={!active || status !== 'loading'}>{content.loading}</p><p className="flow-diagram-error" role="alert" hidden={!active || status !== 'error'}>{content.error}</p>
        {active && <img src={getMedia(active.mediaId).src} alt={active.alt} hidden={status === 'error'} onLoad={() => setStatus('ready')} onError={() => setStatus('error')} />}
      </div>
      <div className="flow-diagram-caption"><p id="flow-diagram-description">{active?.description}</p><a className="flow-diagram-original" href={active ? getMedia(active.mediaId).src : undefined} target="_blank" rel="noopener noreferrer">{content.original} <span aria-hidden="true">↗</span></a></div>
    </dialog>
  </section>;
}
