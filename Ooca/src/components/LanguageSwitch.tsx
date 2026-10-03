import { language, languageHref } from '../content/localization';

export function LanguageSwitch() {
  const page = location.pathname.split('/').pop() || 'index.html';
  return <div className="language-switch" role="group" aria-label={language === 'en' ? 'Language' : 'ภาษา'}>
    {(['en', 'th'] as const).map(locale => <a key={locale} href={languageHref(locale, page) + location.hash} hrefLang={locale} lang={locale}
      aria-current={language === locale ? 'true' : undefined} aria-label={locale === 'en' ? 'English' : 'ภาษาไทย'}>{locale.toUpperCase()}</a>)}
  </div>;
}
