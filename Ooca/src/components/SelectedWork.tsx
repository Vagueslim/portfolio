import { SiteLink } from './SiteLink';
import { useContent } from '../content';
import { resolveHomeVisual } from '../content/visuals';
import { EditorialLink, Lines } from './Shared';
import { ProjectVisual, visualClass } from './ProjectVisual';

export function EditorialIntro() {
  const { home, getProject, ui } = useContent();
  const { intro } = home;
  return <section className="editorial-intro editorial-wrap" aria-labelledby="intro-heading">
    <p className="editorial-kicker"><Lines text={intro.kicker} /></p>
    <div><h2 id="intro-heading"><Lines text={intro.title} /></h2><p className="intro-description">{intro.description}</p><EditorialLink {...intro.link} /></div>
  </section>;
}

export function SelectedWork() {
  const { home, getProject, ui } = useContent();
  const { selected } = home;
  return <section className="editorial-selected editorial-wrap" id="selected-work" aria-labelledby="selected-heading">
    <div className="editorial-heading"><h2 id="selected-heading">{selected.title}<sup>{String(selected.items.length).padStart(2, '0')}</sup></h2><EditorialLink {...selected.link} /></div>
    {selected.items.map(item => {
      const project = getProject(item.projectId);
      const visual = resolveHomeVisual(project, item.visual);
      return <article className="editorial-project" key={item.projectId} data-project={item.projectId}>
        <div className="editorial-meta"><p>{item.metaTitle}</p><p>{item.metaType}</p></div>
        <div className="editorial-project-grid">
          <SiteLink className={`editorial-visual ${visualClass(visual)}`} href={project.href} aria-label={`${ui.readCase} ${project.title}`}><ProjectVisual visual={visual} /></SiteLink>
          <div className="editorial-project-copy"><p className="editorial-kicker">{item.kicker}</p><h3><Lines text={item.title} /></h3><p className="project-description">{item.description}</p><p className="project-role"><Lines text={item.role} /></p><EditorialLink href={project.href} label={item.linkLabel} ariaLabel={`${ui.readStory} ${project.title}`} /></div>
        </div>
      </article>;
    })}
  </section>;
}
