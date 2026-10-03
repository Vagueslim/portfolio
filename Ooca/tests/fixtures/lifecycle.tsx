import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FoilIntro } from '../../src/components/FoilIntro';
import { ProjectVisual } from '../../src/components/ProjectVisual';
import { resolveHomeVisual } from '../../src/content/visuals';
import { getProject } from '../../src/content';
import '../../src/styles/theme.css';
import '../../src/styles/home.css';
import '../../src/styles/editorial.css';

// Development-only fixture, not linked or copied into dist.
const fixture = window as unknown as { mountFixture: () => void; unmountFixture: () => void };
let root = createRoot(document.getElementById('root')!);
fixture.mountFixture = () => {
  root = createRoot(document.getElementById('root')!);
  root.render(<StrictMode><FoilIntro /></StrictMode>);
};
fixture.unmountFixture = () => root.unmount();
root.render(<StrictMode><FoilIntro /><div data-fallback className="smart-stage visual-kind-single"><ProjectVisual visual={resolveHomeVisual(getProject('smart-asset'))} /></div></StrictMode>);
