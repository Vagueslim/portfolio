import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { basePath } from './content/localization';
import './styles/theme.css';
import './styles/home.css';
import './styles/editorial.css';
import '../assets/language.css';
import './styles/pages.css';
import '../assets/smart-asset-cover.css';
import '../assets/smart-asset-evidence.css';

const container = document.getElementById('root')!;
const app = <StrictMode><BrowserRouter basename={basePath}><App /></BrowserRouter></StrictMode>;
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
import './styles/pages-overrides.css';
