import homeJson from '../../data/home.json' with { type: 'json' };
import projectsJson from '../../data/projects.json' with { type: 'json' };
import mediaJson from '../../data/media.json' with { type: 'json' };
import page0 from '../../data/pages/about.json' with { type: 'json' };
import page1 from '../../data/pages/project.json' with { type: 'json' };
import page2 from '../../data/pages/q-chang-web.json' with { type: 'json' };
import page3 from '../../data/pages/buddy-2-0.json' with { type: 'json' };
import page4 from '../../data/pages/change-date.json' with { type: 'json' };
import page5 from '../../data/pages/wcf-digital.json' with { type: 'json' };
import page6 from '../../data/pages/smart-asset.json' with { type: 'json' };
import page7 from '../../data/pages/maxi-task.json' with { type: 'json' };
import page8 from '../../data/pages/asean-summit-2019.json' with { type: 'json' };
import uiJson from '../../data/ui.json' with { type: 'json' };
import type { HomeContent, MediaItem, Project } from './types';
import type { CaseStudy, AboutContent, ListingContent } from './page-types';
import { localize, useLanguage, assetPath, type Language } from './localization';

const pagesJson = {'about': page0, 'project': page1, 'q-chang-web': page2, 'buddy-2-0': page3, 'change-date': page4, 'wcf-digital': page5, 'smart-asset': page6, 'maxi-task': page7, 'asean-summit-2019': page8};

const contentByLanguage = Object.fromEntries((['en', 'th'] as const).map(locale => [locale, {
  home: localize<HomeContent>(homeJson, locale),
  projects: localize<Record<string, Project>>(projectsJson, locale),
  media: localize<Record<string, MediaItem>>(mediaJson, locale),
  pages: localize<Record<string, unknown>>(pagesJson, locale),
  ui: localize<Record<keyof typeof uiJson, string>>(uiJson, locale),
}]));
export const getLocalizedHome = (locale: Language) => contentByLanguage[locale].home;
export const projects = localize<Record<string, Project>>(projectsJson, 'en');
export const media = localize<Record<string, MediaItem>>(mediaJson, 'en');
export const home = getLocalizedHome('th'); // Fixture API; components use useContent.
export function getProject(id: string, locale: Language = 'en'): Project {
  const project = contentByLanguage[locale].projects[id];
  if (!project) throw Error('Unknown project ID: ' + id);
  return project;
}
export function getMedia(id: string, locale: Language = 'en'): MediaItem {
  const item = contentByLanguage[locale].media[id];
  if (!item) throw Error('Unknown media ID: ' + id);
  return { ...item, src: assetPath(item.src) };
}
export function getPage<T>(id: string, locale: Language): T {
  const value = contentByLanguage[locale].pages[id];
  if (!value) throw Error('Unknown page: ' + id);
  return value as T;
}
export function useContent() {
  const locale = useLanguage();
  return { locale, home: getLocalizedHome(locale), ui: contentByLanguage[locale].ui,
    getProject: (id: string) => getProject(id, locale), getMedia: (id: string) => getMedia(id, locale) };
}
export const useCaseStudy = (id: string) => getPage<CaseStudy>(id, useLanguage());
export const useAbout = () => getPage<AboutContent>('about', useLanguage());
export const useListing = () => getPage<ListingContent>('project', useLanguage());
