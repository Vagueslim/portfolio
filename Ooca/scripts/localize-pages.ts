import { parse, parseFragment, serialize, type DefaultTreeAdapterMap } from 'parse5';
import { readFileSync } from 'node:fs';
import { translateText, languageHref, type Language } from '../src/content/localization.ts';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
export const legacyPages = ['about.html', 'project.html', 'q-chang-web.html', 'buddy-2-0.html', 'change-date.html', 'wcf-digital.html', 'smart-asset.html'];
function visit(node: Node, fn: (node: Node) => void) {
  fn(node);
  if ('childNodes' in node) [...node.childNodes].forEach(child => visit(child, fn));
}
const attr = (node: Element, name: string) => node.attrs.find(a => a.name === name)?.value;
function setAttr(node: Element, name: string, value: string) {
  const existing = node.attrs.find(a => a.name === name);
  if (existing) existing.value = value; else node.attrs.push({ name, value });
}
function append(parent: Element, html: string) {
  const fragment = parseFragment(html);
  for (const child of fragment.childNodes) { child.parentNode = parent; parent.childNodes.push(child); }
}

/** Generate both languages from the existing HTML; never translate or rewrite source files. */
export function localizePage(source: string, page: string, locale: Language, isHome = false) {
  const dictionary = JSON.parse(readFileSync('data/locales/en.json', 'utf8')) as Record<string, string>;
  const doc = parse(source, { scriptingEnabled: false });
  // Editorial line breaks can differ by language. Keep only the matching variant
  // before translating text so hidden duplicates never reach the output page.
  visit(doc, node => {
    if ('childNodes' in node) node.childNodes = node.childNodes.filter(child =>
      !('tagName' in child) || !attr(child, 'data-language-only') || attr(child, 'data-language-only') === locale);
  });
  const nodes: Node[] = [];
  visit(doc, node => nodes.push(node));
  const elements = nodes.filter((node): node is Element => 'tagName' in node);
  const root = elements.find(node => node.tagName === 'html')!;
  const head = elements.find(node => node.tagName === 'head')!;
  setAttr(root, 'lang', locale);
  for (const node of nodes) {
    if (node.nodeName === '#text' && 'value' in node && !['script', 'style'].includes(node.parentNode && 'tagName' in node.parentNode ? node.parentNode.tagName : '')) {
      if (locale === 'en' && /[\u0e00-\u0e7f]/.test(node.value)) {
        const before = node.value;
        node.value = (before.match(/^\s*/)?.[0] || '') + translateText(before, locale, dictionary) + (before.match(/\s*$/)?.[0] || '');
      }
    }
    if ('attrs' in node) {
      for (const a of node.attrs) {
        if (['alt', 'title', 'aria-label', 'data-caption', 'content'].includes(a.name)) a.value = translateText(a.value, locale, dictionary);
        if (a.name === 'lang' && a.value === 'th' && locale === 'en') a.value = 'en';
      }
    }
  }
  head.childNodes = head.childNodes.filter(node => !('attrs' in node && node.tagName === 'link' && attr(node, 'rel')?.includes('icon')));
  append(head, `<link rel="icon" type="image/svg+xml" sizes="any" href="assets/favicon.svg">
    <link rel="icon" type="image/svg+xml" href="assets/favicon-light.svg" media="(prefers-color-scheme: light)">
    <link rel="icon" type="image/svg+xml" href="assets/favicon-dark.svg" media="(prefers-color-scheme: dark)">
    <link rel="alternate" hreflang="en" href="${languageHref('en', page, locale)}">
    <link rel="alternate" hreflang="th" href="${languageHref('th', page, locale)}">
    <link rel="alternate" hreflang="x-default" href="${languageHref('en', page, locale)}">`);
  if (!isHome) {
    append(head, '<link rel="stylesheet" href="assets/language.css">');
    const monogram = elements.find(node => attr(node, 'class') === 'monogram');
    if (monogram?.parentNode) {
      const img = parseFragment('<img class="brand-logo" src="assets/brand/logo.svg" alt="Dhittawat" width="42" height="50">').childNodes[0];
      const parent = monogram.parentNode;
      parent.childNodes.splice(parent.childNodes.indexOf(monogram), 1, img);
      img.parentNode = parent;
    }
    const nav = elements.find(node => attr(node, 'id') === 'main-nav')!;
    append(nav, `<div class="language-switch" role="group" aria-label="${locale === 'en' ? 'Language' : 'ภาษา'}">${(['en', 'th'] as const).map(target => `<a href="${languageHref(target, page, locale)}" hreflang="${target}" lang="${target}" aria-label="${target === 'en' ? 'English' : 'ภาษาไทย'}"${target === locale ? ' aria-current="true"' : ''}>${target.toUpperCase()}</a>`).join('')}</div>`);
  }
  // Assets are shared at the root; page links stay within the selected language.
  if (locale === 'th') visit(doc, node => {
    if ('attrs' in node) for (const a of node.attrs) if (['href', 'src', 'data-image', 'data-flow-image'].includes(a.name) && /^(?:\.\/)?(?:assets|home-assets)\//.test(a.value)) a.value = '../' + a.value.replace(/^\.\//, '');
  });
  return serialize(doc);
}
