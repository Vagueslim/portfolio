import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { Masthead } from './Masthead';
import { ContactFooter } from './ContactFooter';
import { ImageDialogProvider } from './ContentBlocks';
import { LanguageContext, assetPath } from '../content/localization';
import { getPage } from '../content';
import type { Metadata } from '../content/page-types';
import { routeInfo } from '../routes';

const positions = new Map<string, number>();
function NavigationEffects() {
  const location = useLocation(), action = useNavigationType();
  const previous = useRef<{ id: string; locale: string; y: number } | null>(null);
  const info = routeInfo(location.pathname);
  useEffect(() => {
    document.documentElement.lang = info.locale;
    let alive = true, frame = 0;
    const last = previous.current;
    const apply = () => {
      if (!alive) return;
      frame = requestAnimationFrame(() => {
        const samePage = last?.id === info.id;
        if (action === 'POP' && positions.has(location.key)) window.scrollTo({ top: positions.get(location.key)!, behavior: 'instant' });
        else if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });
        else if (samePage && last?.locale !== info.locale) window.scrollTo({ top: last?.y ?? 0, behavior: 'instant' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
        if (last && !samePage) { const main = document.getElementById('main'); main?.setAttribute('tabindex', '-1'); main?.focus({ preventScroll: true }); }
      });
    };
    const restoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    void document.fonts.ready.then(apply);
    return () => {
      alive = false; cancelAnimationFrame(frame);
      positions.set(location.key, window.scrollY);
      previous.current = { id: info.id, locale: info.locale, y: window.scrollY };
      history.scrollRestoration = restoration;
    };
  }, [location.key, location.hash, info.id, info.locale, action]);
  return null;
}
export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation(), info = routeInfo(location.pathname);
  const metadata = info.home ? {
    title: 'Dhittawat · Silver foil portfolio',
    description: 'Dhittawat’s selected product design work: Q-CHANG Web, Buddy 2.0, Change Date, WCF Digital, and PEC Smart Asset. Explore the people, decisions, and processes behind the interface.',
  } : info.known ? getPage<{ metadata: Metadata }>(info.id, info.locale).metadata : { title: '404 · Dhittawat', description: 'Page not found' };
  return <LanguageContext value={info.locale}>
    <title>{metadata.title}</title><meta name="description" content={metadata.description} />
    <link rel="icon" type="image/svg+xml" href={assetPath('assets/favicon.svg')} />
    <link rel="icon" type="image/svg+xml" href={assetPath('assets/favicon-light.svg')} media="(prefers-color-scheme: light)" />
    <link rel="icon" type="image/svg+xml" href={assetPath('assets/favicon-dark.svg')} media="(prefers-color-scheme: dark)" />
    {(['en', 'th'] as const).map(locale => <link key={locale} rel="alternate" hrefLang={locale} href={assetPath((locale === 'th' ? 'th/' : '') + info.file)} />)}
    <link rel="alternate" hrefLang="x-default" href={assetPath(info.file)} />
    <NavigationEffects />
    <Masthead key={'header-' + info.locale} homePage={info.home} activePage={info.file} />
    <ImageDialogProvider key={info.locale + info.file}>
      {children}
    </ImageDialogProvider>
    <ContactFooter homePage={info.home} />
  </LanguageContext>;
}
