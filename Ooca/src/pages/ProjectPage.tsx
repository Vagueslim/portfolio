import { useState } from 'react';
import { useContent, useListing } from '../content';
import { ContentBlock, ContentBlocks } from '../components/ContentBlocks';
import { SiteLink } from '../components/SiteLink';
export function ProjectPage() {
  const content = useListing();
  const { getProject, getMedia, locale } = useContent();
  const [filter, setFilter] = useState('all');
  const count = content.items.filter(item => filter === 'all' || filter === item.category).length;
  return <main id="main" className="inner-page"><div className="wrap">
    <ContentBlock node={content.intro} />
    <div className="filters">{content.filters.map(item => <button key={item.id} type="button" className="filter" data-filter={item.id} aria-pressed={item.id === filter} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
    <p className="filter-count" aria-live="polite">{filter === 'all' ? content.count : locale === 'en' ? 'Showing ' + count + ' projects' : 'แสดง ' + count + ' ผลงาน'}</p>
    <section className="project-grid">{content.items.map(item => {
      const project = getProject(item.projectId), image = getMedia(project.coverMediaId);
      return <article key={item.projectId} className="work-card" data-category={item.category} hidden={filter !== 'all' && filter !== item.category}>
        <SiteLink href={project.href}><div className={item.visualClass}><img src={image.src} alt={item.coverAlt ?? image.alt} width={image.width} height={image.height} loading="lazy" /></div><div><ContentBlock node={item.caption} />{item.supplementary && <div className="listing-flow"><ContentBlocks nodes={item.supplementary} /></div>}</div></SiteLink>
      </article>;
    })}</section>
  </div></main>;
}
