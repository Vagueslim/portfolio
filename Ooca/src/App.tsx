import { useLocation } from 'react-router';
import { routeInfo } from './routes';
import { Home } from './Home';
import { AboutPage } from './pages/AboutPage';
import { ProjectPage } from './pages/ProjectPage';
import { CasePage } from './pages/CasePage';
import { SiteLayout } from './components/SiteLayout';
import { SiteLink } from './components/SiteLink';
import { assetPath, useLanguage } from './content/localization';
function NotFound() {
  const language = useLanguage();
  return <main id="main" className="inner-page"><div className="wrap page-head"><h1>404</h1><p>{language === 'th' ? 'ไม่พบหน้านี้' : 'Page not found'}</p><SiteLink href={assetPath('index.html')}>Home ↗</SiteLink></div></main>;
}
export function App() {
  const info = routeInfo(useLocation().pathname);
  return <SiteLayout>{!info.known ? <NotFound /> : info.home ? <Home /> : info.id === 'about' ? <AboutPage /> : info.id === 'project' ? <ProjectPage /> : <CasePage id={info.id} />}</SiteLayout>;
}
