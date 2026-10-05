// One-time extraction of the approved, pre-migration HTML. Not part of the build.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { parse } from 'parse5';
import { localizePage, legacyPages } from './localize-pages.ts';
import { translateText } from '../src/content/localization.ts';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const save = (path: string, value: unknown) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
const pair = (text: string) => ({ en: translateText(text, 'en'), th: text });
const media = read('data/media.json');
for (const value of Object.values(media) as any[]) value.alt = pair(value.alt);
function mediaId(src: string, alt = '') {
  src = src.replace(/^\.\.\//, '');
  const existing = Object.keys(media).find(id => media[id].src === src);
  if (existing) return existing;
  let id = src.replace(/^assets\/(images\/)?/, '').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-');
  if (media[id]) id = `evidence-${id}`;
  media[id] = { src, alt: pair(alt) };
  return id;
}
const structural = new Set(['href', 'src', 'kind', 'id', 'projectId', 'mediaId', 'mediaIds', 'coverMediaId', 'backgroundMediaId', 'iconMediaId']);
function localized(value: any, key = ''): any {
  if (structural.has(key)) return value;
  if (typeof value === 'string') return pair(value);
  if (Array.isArray(value)) return value.map(item => localized(item));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localized(v, k)]));
  return value;
}
const attr = (n: any, name: string) => n?.attrs?.find((a: any) => a.name === name)?.value;
const cls = (n: any, name: string) => (attr(n, 'class') || '').split(' ').includes(name);
function all(n: any, pred: (n: any) => boolean): any[] { return [...(pred(n) ? [n] : []), ...(n.childNodes || []).flatMap((c: any) => all(c, pred))]; }
const one = (n: any, name: string) => all(n, n => cls(n, name))[0];
const text = (n: any): string => n?.nodeName === '#text' ? n.value : (n?.childNodes || []).map(text).join('');
const children = (n: any) => (n.childNodes || []).filter((c: any) => c.nodeName === '#text' ? c.value.trim() : c.tagName);
function blocks(n: any, en: any): any[] { return children(n).map((child: any, i: number) => block(child, children(en)[i])); }
function block(n: any, en: any): any {
  if (!en || n.nodeName !== en.nodeName) throw Error(`Structure mismatch ${n.nodeName} / ${en?.nodeName}`);
  if (n.nodeName === '#text') return { kind: 'text', value: { en: en.value, th: n.value } };
  if (n.tagName === 'img') return { kind: 'image', mediaId: mediaId(attr(n, 'src'), attr(n, 'alt')), alt: { en: attr(en, 'alt') || '', th: attr(n, 'alt') || '' }, ...(attr(n, 'class') ? { className: attr(n, 'class') } : {}) };
  const attributes: Record<string, any> = {};
  for (const a of n.attrs || []) {
    if (a.name === 'data-image') { attributes['data-media-id'] = mediaId(a.value); continue; }
    if (['alt', 'title', 'aria-label', 'data-caption'].includes(a.name)) attributes[a.name] = { en: attr(en, a.name), th: a.value };
    else attributes[a.name] = a.value;
  }
  return { kind: 'element', tag: n.tagName, ...(Object.keys(attributes).length ? { attributes } : {}), children: blocks(n, en) };
}
mkdirSync('qa/react-migration/before/html/th', { recursive: true });
const pages: Record<string, any> = {};
const baseline: Record<string, any> = {};
for (const file of legacyPages) {
  const source = readFileSync(file, 'utf8');
  const htmls = ['en', 'th'].map(locale => localizePage(source, file, locale as 'en' | 'th'));
  const docs = htmls.map(html => parse(html));
  for (let i = 0; i < 2; i++) {
    const locale = i ? 'th' : 'en';
    writeFileSync(`qa/react-migration/before/html/${i ? 'th/' : ''}${file}`, htmls[i]);
    const main = all(docs[i], n => n.tagName === 'main')[0];
    baseline[`${locale}/${file}`] = {
      text: all(main, n => n.nodeName === '#text' && n.value.trim()).map(n => n.value.replace(/\s+/g, ' ').trim()),
      images: all(main, n => n.tagName === 'img').map(n => ({ src: attr(n, 'src')?.replace(/^\.\.\//, ''), alt: attr(n, 'alt') || '' })),
      links: all(main, n => n.tagName === 'a').map(n => attr(n, 'href')),
      ids: all(main, n => !!attr(n, 'id')).map(n => attr(n, 'id')),
    };
  }
  const [en, th] = docs;
  const metadata = { title: { en: text(all(en, n => n.tagName === 'title')[0]), th: text(all(th, n => n.tagName === 'title')[0]) }, description: { en: attr(all(en, n => attr(n, 'name') === 'description')[0], 'content'), th: attr(all(th, n => attr(n, 'name') === 'description')[0], 'content') } };
  const part = (name: string) => block(one(th, name), one(en, name));
  if (file === 'about.html') {
    const a = one(th, 'about-page'), b = one(en, 'about-page');
    pages.about = { metadata, intro: part('page-head'), lead: part('about-lead'), jump: part('about-jump'), sections: children(a).filter((n: any) => cls(n, 'section')).map((n: any) => block(n, children(b).find((m: any) => attr(m, 'id') === attr(n, 'id') && cls(m, 'section')))) };
  } else if (file === 'project.html') {
    pages.project = { metadata, intro: part('page-head'), filters: children(one(th, 'filters')).map((n: any, i: number) => ({ id: attr(n, 'data-filter'), label: { en: text(children(one(en, 'filters'))[i]), th: text(n) } })), count: { en: text(one(en, 'filter-count')), th: text(one(th, 'filter-count')) }, items: all(th, n => cls(n, 'work-card')).map((n: any, i: number) => ({ projectId: attr(all(n, x => x.tagName === 'a')[0], 'href').replace('.html', ''), category: attr(n, 'data-category'), visualClass: attr(one(n, 'work-visual'), 'class'), caption: block(one(n, 'work-caption'), one(all(en, x => cls(x, 'work-card'))[i], 'work-caption')) })) };
  } else {
    const id = file.replace('.html', '');
    const hero = one(th, 'case-hero') || one(th, 'visual-date');
    const heroImg = all(hero, n => n.tagName === 'img')[0];
    const captions = all(th, n => cls(n, 'caption'));
    const captionsEn = all(en, n => cls(n, 'caption'));
    pages[id] = { metadata, head: part('case-head'), overview: heroImg ? { kind: 'single', mediaId: mediaId(attr(heroImg, 'src'), attr(heroImg, 'alt')), alt: { en: attr(all(one(en, 'case-hero'), n => n.tagName === 'img')[0], 'alt'), th: attr(heroImg, 'alt') } } : undefined, overviewBlocks: heroImg ? undefined : blocks(hero, one(en, 'case-hero') || one(en, 'visual-date')), visualClass: attr(hero, 'class'), caption: block(captions[0], captionsEn[0]), toc: part('case-toc'), chapters: all(th, n => cls(n, 'chapter')).map((n: any, i: number) => ({ id: attr(n, 'id'), blocks: blocks(n, all(en, x => cls(x, 'chapter'))[i]) })), sources: one(th, 'source-links') ? part('source-links') : undefined, next: part('next-case') };
  }
}
// Keep source-content references independent from display images.
save('data/pages.json', pages);
save('qa/react-migration/content-baseline.json', baseline);
save('data/home.json', localized(read('data/home.json')));
save('data/projects.json', localized(read('data/projects.json')));
const cover = read('data/smart-asset-cover.json');
for (const node of cover.nodes) {
  node.mediaId = mediaId(node.media.src, node.media.alt.th);
  Object.assign(media[node.mediaId], { ...node.media, alt: node.media.alt });
  delete node.media;
}
save('data/smart-asset-cover.json', cover);
const evidence = localized(read('data/smart-asset-evidence.json'));
for (const item of evidence.items) {
  item.mediaId = mediaId(item.src, item.alt.th);
  Object.assign(media[item.mediaId], { src: item.src, width: item.width, height: item.height, alt: item.alt });
  delete item.src; delete item.width; delete item.height;
}
save('data/smart-asset-evidence.json', evidence);
save('data/media.json', media);
save('data/ui.json', Object.fromEntries(Object.entries({mainMenu:'เมนูหลัก',readCase:'อ่านเคส',readStory:'อ่านเรื่อง',close:'ปิดภาพ',relatedProjects:'โปรเจกต์ที่เกี่ยวข้อง'}).map(([k,v]) => [k,pair(v)])));
console.log(`Extracted ${Object.keys(pages).length} pages and ${Object.keys(media).length} shared images.`);
