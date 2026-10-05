import { readFileSync, existsSync } from 'node:fs';
import { pageFiles } from '../src/routes.ts';
import { parseVisual } from '../src/content/visuals.ts';
import { localize } from '../src/content/localization.ts';
const read = name => JSON.parse(readFileSync('data/' + name + '.json', 'utf8'));
const media = read('media'), projects = read('projects'), pages = Object.fromEntries(pageFiles.filter(file => file !== 'index.html').map(file => { const id = file.replace('.html', ''); return [id, read('pages/' + id)]; })), home = read('home');
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
const tags = new Set('section p h1 br div h2 dl dt dd a nav span ol li article h3 ul svg use aside small table thead tr th tbody td blockquote figure button figcaption strong'.split(' '));
function walk(value, path = '') {
  if (!value || typeof value !== 'object') return;
  if ('kind' in value) check(['text', 'element', 'image', 'single', 'pair', 'collage', 'statistics', 'flow'].includes(value.kind), 'Unsupported content kind: ' + path);
  if (value.kind === 'text') check(typeof value.value?.en === 'string' && typeof value.value?.th === 'string', 'Missing bilingual text: ' + path);
  if (value.kind === 'flow') check(Array.isArray(value.blocks), 'Missing flow blocks: ' + path);
  if ('en' in value || 'th' in value) {
    check('en' in value && 'th' in value, 'Incomplete translation: ' + path);
    check(typeof value.en === typeof value.th, 'Translation type mismatch: ' + path);
    if (typeof value.en === 'string') check(!/[\u0e00-\u0e7f]/.test(value.en), 'Thai in English: ' + path);
  }
  if (value.kind === 'element') {
    check(tags.has(value.tag), 'Unsupported content tag: ' + value.tag);
    check(Array.isArray(value.children), 'Missing children: ' + path);
    for (const key of Object.keys(value.attributes || {})) check(!/^on/i.test(key) && key !== 'srcdoc', 'Executable attribute: ' + key);
  }
  if (value.kind === 'image') check(typeof value.alt === 'object', 'Missing localized alt: ' + path);
  if (value.kind === 'pair' || value.kind === 'collage') check(value.mediaIds?.length === 2, 'Invalid paired visual: ' + path);
  for (const [key, child] of Object.entries(value)) {
    if (['mediaId','coverMediaId','backgroundMediaId','iconMediaId','data-media-id'].includes(key)) check(!!media[child], 'Missing media ' + child + ' at ' + path);
    if (key === 'mediaIds') for (const id of child) check(!!media[id], 'Missing media ' + id);
    if (key === 'projectId') check(!!projects[child], 'Missing project ' + child);
    if (key === 'href' && typeof child === 'string' && /^[\w-]+\.html/.test(child)) check(pageFiles.includes(child.split('#')[0]), 'Unknown route: ' + child);
    walk(child, path + '.' + key);
  }
}
for (const [id, image] of Object.entries(media)) {
  check(existsSync(image.src), 'Missing image file: ' + id);
  check(typeof image.alt?.en === 'string' && typeof image.alt?.th === 'string', 'Missing media alt: ' + id);
}
for (const [id, project] of Object.entries(projects)) {
  check(pageFiles.includes(project.href), 'Unknown project route: ' + project.href);
  check(pages[id]?.chapters?.length > 0, 'Empty case: ' + id);
  const ids = pages[id]?.chapters?.map(chapter => chapter.id) || [];
  check(new Set(ids).size === ids.length, 'Duplicate chapter IDs: ' + id);
}
for (const [name, value] of Object.entries({ media, projects, pages, home, cover: read('smart-asset-cover'), evidence: read('smart-asset-evidence'), ui: read('ui') })) walk(value, name);
for (const locale of ['en', 'th']) {
  const localizedHome = localize(home, locale);
  for (const item of [...localizedHome.selected.items, localizedHome.wcf, localizedHome.smart]) {
    try { parseVisual(item.visual); } catch (error) { errors.push(item.projectId + ': ' + error.message); }
  }
  for (const id of Object.keys(projects)) {
    const overview = localize(pages[id].overview, locale);
    if (overview?.kind !== 'flow') try { parseVisual(overview); } catch (error) { errors.push(id + ': ' + error.message); }
  }
}
if (errors.length) throw Error(errors.join('\n'));
console.log('Validated both languages, 8 routes, 5 cases and ' + Object.keys(media).length + ' shared images.');
