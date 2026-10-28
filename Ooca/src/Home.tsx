import { FoilIntro } from './components/FoilIntro';
import { EditorialIntro, SelectedWork } from './components/SelectedWork';
import { WorkingApproach } from './components/WorkingApproach';

export function Home() {
  return <>
    <main id="main">
      <FoilIntro />
      <div className="portfolio-lower">
        <EditorialIntro />
        <SelectedWork />
        <WorkingApproach />
      </div>
    </main>
  </>;
}
