import english from '../../data/locales/en.json' with { type: 'json' };

export type Language = 'en' | 'th';
export const language: Language = typeof document === 'undefined' ? 'th' : document.documentElement.lang === 'th' ? 'th' : 'en';
export function translateText(text: string, locale: Language, dictionary: Record<string, string> = english): string {
  if (locale === 'th' || !/[\u0e00-\u0e7f]/.test(text)) return text;
  const key = text.replace(/\s+/g, ' ').trim();
  const translated = dictionary[key];
  if (translated === undefined) throw new Error(`Missing English translation: ${key}`);
  return translated;
}
export const t = (text: string) => translateText(text, language);
export function translateContent<T>(value: T, locale: Language): T {
  if (typeof value === 'string') return translateText(value, locale) as T;
  if (Array.isArray(value)) return value.map(item => translateContent(item, locale)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateContent(item, locale)])) as T;
  return value;
}
export const assetPath = (path: string) => typeof document !== 'undefined' && language === 'th' ? `../${path}` : path;

export function languageHref(target: Language, page = 'index.html', current: Language = language) {
  return target === current ? page : current === 'th' ? `../${page}` : `th/${page}`;
}
