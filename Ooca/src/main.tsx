import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from './Home';
import './styles/theme.css';
import './styles/home.css';
import './styles/editorial.css';
import '../assets/language.css';

createRoot(document.getElementById('root')!).render(<StrictMode><Home /></StrictMode>);
