import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { pageFiles } from '../src/routes.ts';
const origin = process.argv[2] || 'http://127.0.0.1:4177';
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined });
const page = await browser.newPage();
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
await page.emulateMedia({ reducedMotion: 'reduce' });
try {
 for (const language of ['en','th']) for (const width of [320,390,552,768,1440]) for (const file of pageFiles) {
  await page.setViewportSize({width,height:900});
  await page.goto(origin + '/' + (language === 'th' ? 'th/' : '') + file);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(i=>i.src).map(async i=>{i.loading='eager';await i.decode();})); });
  const report = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    missingAlt: [...document.images].filter(i=>!i.hasAttribute('alt')).length,
    clippedText: [...document.querySelectorAll('h1,h2,h3,p,li')].filter(n=>!n.closest('.p-cover-flow__sr-only') && n.getBoundingClientRect().width && n.scrollWidth > n.clientWidth + 2 && getComputedStyle(n).overflowX !== 'auto').map(n=>({text:n.textContent.slice(0,100), width:n.clientWidth,scroll:n.scrollWidth})),
  }));
  results.push({language,width,file,...report});
  await page.screenshot({path:'qa/react-migration/after/'+language+'-'+file+'-'+width+'.png',fullPage:true});
 }
 for (const width of [936,1050]) for (const language of ['en','th']) {
  await page.setViewportSize({width,height:900});
  await page.goto(origin+'/'+(language==='th'?'th/':'')+'about.html#career');
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'qa/react-migration/after/'+language+'-about-career-'+width+'.png'});
  results.push({language,width,file:'about.html',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }
 await mkdir('qa/react-migration',{recursive:true});
 await writeFile('qa/react-migration/responsive-checks.json',JSON.stringify({results,errors},null,2));
 console.log(JSON.stringify({checks:results.length,overflow:results.filter(x=>x.overflow),clippedText:results.filter(x=>x.clippedText?.length),errors},null,2));
 if(errors.length||results.some(x=>x.overflow||x.missingAlt||x.clippedText?.length))process.exitCode=1;
} finally {await browser.close();}
