import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'qa/react-home/test-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4175', channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true },
  webServer: [
    { command: 'npm run build && npm run preview -- --port 4175', url: 'http://127.0.0.1:4175', reuseExistingServer: false, timeout: 120000 },
    { command: 'npm run dev -- --port 4176', url: 'http://127.0.0.1:4176', reuseExistingServer: !process.env.CI, timeout: 120000 },
  ],
});
