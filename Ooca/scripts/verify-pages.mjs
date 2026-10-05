import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { pageFiles } from '../src/routes.ts';
const base = '/portfolio/', root = resolve('dist'), errors = [];
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (!pathname.startsWith(base)) { response.writeHead(404); response.end('Outside deployment base'); return; }
  let file = resolve(root, pathname.slice(base.length) || 'index.html');
  if (!file.startsWith(root + '/') && !file.startsWith(root + '\\')) { response.writeHead(404); response.end(); return; }
  try {
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end(await readFile(resolve(root, '404.html')));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined });
const checks = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !r.url().includes('missing-page')) errors.push(r.status() + ' ' + r.url()); });
  for (const language of ['en','th']) for (const file of pageFiles) {
    const url = origin + base + (language === 'th' ? 'th/' : '') + file;
    const response = await page.goto(url);
    assert.equal(response.status(), 200);
    await page.locator('h1').waitFor();
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(i => i.src).map(async i => { i.loading='eager'; await i.decode(); })); });
    assert.equal(await page.locator('html').getAttribute('lang'), language);
    await page.reload(); await page.locator('h1').waitFor();
    checks.push({ url: new URL(url).pathname, direct: true, refresh: true, language });
  }
  await page.goto(origin + base);
  await page.evaluate(() => window.deploymentToken = 'same-document');
  await page.locator('.nav a[href="about.html"]').click();
  await page.locator('.language-switch a[lang="th"]').click();
  assert.equal(new URL(page.url()).pathname, base + 'th/about.html');
  await page.locator('.nav a[href="project.html"]').click();
  await page.locator('.work-card a[href="smart-asset.html"]').click();
  assert.equal(new URL(page.url()).pathname, base + 'th/smart-asset.html');
  await page.locator('.brand').click();
  assert.equal(await page.evaluate(() => window.deploymentToken), 'same-document');
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await nojs.newPage();
  await staticPage.goto(origin + base + 'th/smart-asset.html');
  assert.match(await staticPage.locator('main').innerText(), /ทรัพย์สิน/);
  const missing = await staticPage.goto(origin + base + 'missing-page.html');
  assert.equal(missing.status(), 404);
  assert.equal(await staticPage.locator('h1').innerText(), '404');
  await nojs.close();
  assert.deepEqual(errors, []);
  await mkdir('qa/react-migration', { recursive: true });
  await writeFile('qa/react-migration/deployment-checks.json', JSON.stringify({ base, checks, spa: true, noJavaScript: true, notFound: true, errors }, null, 2));
  console.log('PASS: 16 direct links + refresh, bilingual SPA navigation, static reading and 404 under /portfolio/.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
