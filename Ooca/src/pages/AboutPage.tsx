import { useAbout } from '../content';
import { ContentBlock } from '../components/ContentBlocks';
export function AboutPage() {
  const content = useAbout();
  return <main id="main" className="inner-page"><div className="wrap about-page">
    <ContentBlock node={content.intro} /><ContentBlock node={content.lead} /><ContentBlock node={content.jump} />
    {content.sections.map((section, index) => <ContentBlock key={index} node={section} />)}
  </div></main>;
}
