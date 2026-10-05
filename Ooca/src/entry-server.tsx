import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { basePath } from './content/localization';
export function render(path: string) {
  return renderToString(<StrictMode><StaticRouter basename={basePath} location={basePath + path.replace(/^\//, '')}><App /></StaticRouter></StrictMode>);
}
