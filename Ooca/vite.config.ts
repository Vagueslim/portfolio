import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, cp } from 'node:fs/promises';
import { pageFiles } from './src/routes.ts';
const base = process.env.PORTFOLIO_BASE_PATH || '/';
function pages(): Plugin {
  let clientBuild = false;
  return {
    name: 'react-static-pages',
    configResolved(config) { clientBuild = config.command === 'build' && !config.build.ssr; },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url || '/', 'http://localhost');
        const pathname = url.pathname.replace(base === '/' ? /^\// : new RegExp('^' + base), '');
        const file = pathname.replace(/^th\//, '') || 'index.html';
        if (!(pageFiles as readonly string[]).includes(file)) return next();
        try {
          const source = await readFile('index.html', 'utf8');
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(await server.transformIndexHtml(url.pathname, source));
        } catch (error) { next(error as Error); }
      });
    },
    async closeBundle() { if (clientBuild) await cp('assets', 'dist/assets', { recursive: true }); },
  };
}
export default defineConfig({
  base, publicDir: false, plugins: [react(), pages()],
  build: { outDir: 'dist', assetsDir: 'home-assets' },
});
