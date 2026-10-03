import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { legacyPages, localizePage } from './scripts/localize-pages.ts';

let productionBuild = false;

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), {
    name: 'bilingual-pages',
    configResolved(config) { productionBuild = config.command === 'build'; },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        const match = pathname.match(/^\/(th\/)?([^/]*\.html)?$/);
        if (!match) return next();
        const locale = match[1] ? 'th' : 'en';
        const file = match[2] || 'index.html';
        if (file !== 'index.html' && !legacyPages.includes(file)) return next();
        try {
          const html = localizePage(await readFile(file, 'utf8'), file, locale, file === 'index.html');
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(await server.transformIndexHtml(pathname, html));
        } catch (error) { next(error as Error); }
      });
    },
    async closeBundle() {
      if (!productionBuild) return;
      await mkdir('dist/th', { recursive: true });
      // Source HTML remains the original Thai; output is localized during build.
      for (const page of legacyPages) {
        const source = await readFile(page, 'utf8');
        await writeFile(resolve('dist', page), localizePage(source, page, 'en'));
        await writeFile(resolve('dist/th', page), localizePage(source, page, 'th'));
      }
      const home = await readFile('dist/index.html', 'utf8');
      await writeFile('dist/index.html', localizePage(home, 'index.html', 'en', true));
      await writeFile('dist/th/index.html', localizePage(home, 'index.html', 'th', true));
      await cp('assets', 'dist/assets', { recursive: true });
    },
  }],
  build: { outDir: 'dist', assetsDir: 'home-assets' },
});
