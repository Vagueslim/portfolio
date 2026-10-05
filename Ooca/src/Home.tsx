import { FoilIntro } from './components/FoilIntro';
import { EditorialIntro, SelectedWork } from './components/SelectedWork';
import { WcfProject, SmartAssetProject } from './components/SupportingProjects';
import { WorkingApproach } from './components/WorkingApproach';

export function Home() {
  return <>
    <main id="main">
      <FoilIntro />
      <div className="portfolio-lower">
        <EditorialIntro />
        <SelectedWork />
        <WcfProject />
        <SmartAssetProject />
        <WorkingApproach />
      </div>
    </main>
  </>;
}
