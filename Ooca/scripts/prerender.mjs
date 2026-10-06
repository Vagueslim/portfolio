import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parse, serialize } from 'parse5';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { pageFiles } from '../src/routes.ts';
const { render } = await import(pathToFileURL(resolve('.prerender/entry-server.js')).href);
const template = await readFile('dist/index.html', 'utf8');
for (const locale of ['en', 'th']) for (const file of [...pageFiles, '404.html']) {
  const prefix = locale === 'th' ? 'th/' : '';
  const markup = render('/' + prefix + file);
  const html = template.replace('<html lang="en">', '<html lang="' + locale + '">').replace('<div id="root"></div>', '<div id="root">' + markup + '</div>');
  // React hoists metadata while rendering. Put these resource elements in head.
  const document = parse(html);
  const root = document.childNodes.find(node => node.tagName === 'html');
  const head = root.childNodes.find(node => node.tagName === 'head');
  const visit = node => {
    if (!node.childNodes) return;
    for (const child of [...node.childNodes]) {
      if (node !== head && ['title', 'meta', 'link'].includes(child.tagName)) {
        node.childNodes.splice(node.childNodes.indexOf(child), 1); child.parentNode = head; head.childNodes.push(child);
      } else visit(child);
    }
  };
  visit(root.childNodes.find(node => node.tagName === 'body'));
  await mkdir('dist/' + prefix, { recursive: true });
  let output = serialize(document);
  if (file === '404.html') output = output.replace(/<script[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, '');
  await writeFile('dist/' + prefix + file, output);
}
console.log(`Prerendered ${pageFiles.length * 2} bilingual pages and two 404 documents.`);
