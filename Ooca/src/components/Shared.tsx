import { SiteLink } from './SiteLink';
import { Fragment } from 'react';
import { useContent } from '../content';

export function Lines({ text }: { text: string }) {
  return text.split('\n').map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>);
}

export function EditorialLink({ href, label, ariaLabel, external = false }: { href: string; label: string; ariaLabel?: string; external?: boolean }) {
  return <SiteLink className="editorial-link" href={href} aria-label={ariaLabel} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{label} <span className="arrow" aria-hidden="true">↗</span></SiteLink>;
}

export function MediaImage({ id, className }: { id: string; className?: string }) {
  const { getMedia } = useContent();
  const image = getMedia(id);
  return <img className={className} src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />;
}

export function SectionLabels({ labels }: { labels: string[] }) {
  return <div className="editorial-section-line">{labels.map(label => <span key={label}>{label}</span>)}</div>;
}
