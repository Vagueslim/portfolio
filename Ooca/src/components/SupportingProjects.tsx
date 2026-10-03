import { getProject, home } from '../content';
import { resolveHomeVisual } from '../content/visuals';
import { EditorialLink, MediaImage, SectionLabels } from './Shared';
import { ProjectVisual } from './ProjectVisual';
import { t } from '../content/localization';

export function WcfProject() {
  const { wcf } = home;
  const project = getProject(wcf.projectId);
  const visual = resolveHomeVisual(project, wcf.visual);
  const [headline, ...supportingLines] = wcf.title.split('\n');
  return <section className="editorial-backup editorial-wrap" id="wcf" aria-labelledby="backup-heading">
    <SectionLabels labels={wcf.labels} />
    <div className="wcf-panel">
      <div className="wcf-copy">
        <p className="wcf-label"><span>{wcf.kicker}</span>{wcf.descriptor}</p>
        <h2 id="backup-heading">
          <span className="wcf-title-line"><MediaImage id={wcf.iconMediaId} /><span>{headline}</span></span>
          <span className="wcf-subtitle">{supportingLines.join(' ')}</span>
        </h2>
        <p className="wcf-description">{wcf.description}</p>
        <EditorialLink href={project.href} label={wcf.linkLabel} />
      </div>
      <a className={`wcf-stage visual-kind-${visual.kind}`} href={project.href} aria-label={`${t('อ่านเคส')} ${project.title}`}><ProjectVisual visual={visual} /></a>
    </div>
  </section>;
}

export function SmartAssetProject() {
  const { smart } = home;
  const project = getProject(smart.projectId);
  const visual = resolveHomeVisual(project, smart.visual);
  return <section className="smart-project editorial-wrap" id="smart-asset" aria-labelledby="smart-heading">
    <SectionLabels labels={smart.labels} />
    <div className="smart-panel">
      <a className={`smart-stage visual-kind-${visual.kind}`} href={project.href} aria-label={`${t('อ่านเคส')} ${project.title}`}><ProjectVisual visual={visual} /></a>
      <div className="smart-copy">
        <p className="smart-label" lang="en"><span>{smart.chip}</span> {smart.label}</p>
        <h2 id="smart-heading" lang="en"><span className="smart-title-line"><MediaImage id={smart.iconMediaId} /><span>{smart.title}</span></span><span className="smart-subtitle">{smart.subtitle}</span></h2>
        <p className="smart-process" lang="en">{smart.process}</p><p className="smart-role">{smart.role}</p><EditorialLink href={project.href} label={smart.linkLabel} />
      </div>
    </div>
  </section>;
}
