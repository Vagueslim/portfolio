import { useLocation } from 'react-router';
import { useLanguage, languageHref } from '../content/localization';
import { SiteLink } from './SiteLink';
export function LanguageSwitch() {
  const location = useLocation();
  const language = useLanguage();
  const page = location.pathname.split('/').pop() || 'index.html';
  return <div className="language-switch" role="group" aria-label={language === 'en' ? 'Language' : 'ภาษา'}>
    {(['en', 'th'] as const).map(locale => <SiteLink key={locale} href={languageHref(locale, page, language) + location.search + location.hash} hrefLang={locale} lang={locale}
      aria-current={language === locale ? 'true' : undefined} aria-label={locale === 'en' ? 'English' : 'ภาษาไทย'}>{locale.toUpperCase()}</SiteLink>)}
  </div>;
}
