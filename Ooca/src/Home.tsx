import { FoilIntro } from './components/FoilIntro';
import { EditorialIntro, SelectedWork } from './components/SelectedWork';
import { WorkingApproach } from './components/WorkingApproach';
import { ContentBlock } from './components/ContentBlocks';
import { useListing } from './content';

export function Home() {
  const { personalProject } = useListing();
  return <>
    <main id="main">
      <FoilIntro />
      <div className="portfolio-lower">
        <EditorialIntro />
        <SelectedWork />
        {personalProject && <div className="editorial-personal editorial-wrap"><ContentBlock node={personalProject} /></div>}
        <WorkingApproach />
      </div>
    </main>
  </>;
}
