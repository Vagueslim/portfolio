import { useCaseStudy, useContent } from '../content';
import { ContentBlock, ContentBlocks } from '../components/ContentBlocks';
import { ProjectVisual } from '../components/ProjectVisual';
import { resolveHomeVisual } from '../content/visuals';
import { SystemFlow } from '../components/SystemFlow';
import { FlowEvidence } from '../components/FlowEvidence';
export function CasePage({ id }: { id: string }) {
  const content = useCaseStudy(id);
  const { getProject, getMedia } = useContent();
  const visual = content.overview ?? resolveHomeVisual(getProject(id));
  return <main id="main" className="inner-page case-page">
    <div className="wrap"><ContentBlock node={content.head} /></div>
    {id === 'smart-asset' && <SystemFlow />}
    <div className="wrap">
      <div className={content.visualClass + ' case-overview'}>
        {visual.kind === 'flow' ? <ContentBlocks nodes={visual.blocks} /> : visual.kind === 'single' ?
          <img src={getMedia(visual.mediaId).src} alt={('alt' in visual && typeof visual.alt === 'string' ? visual.alt : undefined) ?? getMedia(visual.mediaId).alt} loading="eager" /> : <ProjectVisual visual={visual} />}
      </div><ContentBlock node={content.caption} />
      <div className="case-layout"><ContentBlock node={content.toc} /><div className="case-body">
        {content.chapters.map(chapter => <section className="chapter" id={chapter.id} key={chapter.id}><ContentBlocks nodes={chapter.blocks} /></section>)}
        {content.sources && <ContentBlock node={content.sources} />}
      </div></div>
    </div>
    {id === 'smart-asset' && <FlowEvidence />}
    <div className="wrap"><ContentBlock node={content.next} /></div>
  </main>;
}
