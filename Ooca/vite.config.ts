import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const legacyPages = ['about.html', 'project.html', 'q-chang-web.html', 'buddy-2-0.html', 'change-date.html', 'wcf-digital.html', 'smart-asset.html'];

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), {
    name: 'keep-legacy-pages',
    apply: 'build',
    async closeBundle() {
      await mkdir('dist', { recursive: true });
      // Legacy pages retain their original paths, stylesheet and interactions.
      for (const page of legacyPages) await cp(page, resolve('dist', page));
      await cp('assets', 'dist/assets', { recursive: true });
    },
  }],
  build: { outDir: 'dist', assetsDir: 'home-assets' },
});
