import { useId, useRef } from 'react';
import data from '../../data/smart-asset-cover.json' with { type: 'json' };
import { localize, useLanguage } from '../content/localization';
import { useContent } from '../content';
import { useFlowConnections } from '../hooks/useFlowConnections';
interface FlowContent {
  heading: string; headingLines: string[]; mobileHeadingLines: string[]; description: string;
  lanes: { master: string; operations: string };
  nodes: { id: string; stage: number; mediaId: string; mobilePriority: boolean; title: string; mobileTitle?: string; description: string; mobileDescription?: string }[];
  edges: { from: string; to: string; label: string }[];
}
export function SystemFlow() {
  const locale = useLanguage(), flow = localize<FlowContent>(data, locale);
  const { getMedia } = useContent();
  const ref = useRef<HTMLElement>(null);
  const marker = 'flow-arrow-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  useFlowConnections(ref);
  return <section ref={ref} className="p-work-detail__cover p-work-detail__cover--system-flow" id="smart-asset-system-flow" aria-labelledby="cover-flow-smart-asset">
    <div className="p-cover-flow__grid" aria-hidden="true" />
    <header className="p-cover-flow__intro"><p className="p-cover-flow__kicker">Master Asset / Site operation</p>
      <h2 id="cover-flow-smart-asset" aria-label={flow.heading}>
        <span className="p-cover-flow__desktop-heading" data-language-only={locale} aria-hidden="true">{flow.headingLines.map(line => <span className="p-cover-flow__title-line" key={line}>{line}</span>)}</span>
        <span className="p-cover-flow__mobile-heading" data-language-only={locale} aria-hidden="true">{flow.mobileHeadingLines.map(line => <span className="p-cover-flow__title-line" key={line}>{line}</span>)}</span>
      </h2><p>{flow.description}</p>
    </header>
    <div className="p-cover-flow__canvas">
      <p className="p-cover-flow__lane p-cover-flow__lane--master">{flow.lanes.master}</p><p className="p-cover-flow__lane p-cover-flow__lane--operations">{flow.lanes.operations}</p>
      <ol className="p-cover-flow__nodes">{flow.nodes.map(node => { const image = getMedia(node.mediaId); return <li key={node.id} className={'p-cover-flow__node p-cover-flow__node--' + node.id + (node.mobilePriority ? ' is-mobile-priority' : '')}>
        <figure><div className="p-cover-flow__media"><img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" /></div>
          <figcaption><span className="p-cover-flow__index">{String(node.stage).padStart(2, '0')}</span><strong><span className="p-cover-flow__desktop-copy">{node.title}</span><span className="p-cover-flow__mobile-copy">{node.mobileTitle ?? node.title}</span></strong>
            <span><span className="p-cover-flow__desktop-copy">{node.description}</span><span className="p-cover-flow__mobile-copy">{node.mobileDescription ?? node.description}</span></span>
          </figcaption></figure>
      </li>; })}</ol>
      <svg className="p-cover-flow__connectors" viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs id="cover-flow-arrow-smart-asset"><marker id={marker} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 8 4 0 8Z" /></marker></defs>
        {flow.edges.map(edge => <path key={edge.from + edge.to} data-from={edge.from} data-to={edge.to} markerEnd={'url(#' + marker + ')'} />)}
      </svg>
      <div className="p-cover-flow__edge-labels" aria-hidden="true">{flow.edges.map(edge => <span key={edge.from + edge.to} className={'p-cover-flow__edge-label p-cover-flow__edge-label--' + edge.from + '-' + edge.to}>{edge.label}</span>)}</div>
      <ol className="p-cover-flow__sr-only" aria-label={flow.heading}>{flow.edges.map(edge => <li key={edge.from + edge.to}><span>{flow.nodes.find(node => node.id === edge.from)!.title}</span> → <span>{flow.nodes.find(node => node.id === edge.to)!.title}</span>: <span>{edge.label}</span></li>)}</ol>
    </div>
  </section>;
}
