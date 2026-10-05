import { createContext, useContext } from 'react';
export type Language = 'en' | 'th';
export type LocalizedText = { en: string; th: string };
export const LanguageContext = createContext<Language>('en');
export const useLanguage = () => useContext(LanguageContext);
export const basePath = import.meta.env?.BASE_URL || '/';
export function assetPath(path: string) { return basePath + path.replace(/^\.?\//, ''); }
export function localize<T>(value: unknown, language: Language): T {
  if (Array.isArray(value)) return value.map(item => localize(item, language)) as T;
  if (value && typeof value === 'object') {
    const item = value as Record<string, unknown>;
    if (Object.keys(item).length === 2 && 'en' in item && 'th' in item) return item[language] as T;
    return Object.fromEntries(Object.entries(item).map(([key, v]) => [key, localize(v, language)])) as T;
  }
  return value as T;
}
export function languageHref(target: Language, page = 'index.html', current: Language = 'en') {
  return target === current ? page : current === 'th' ? '../' + page : 'th/' + page;
}
