import { Fragment } from 'react';
import { home } from '../content';
import { assetPath, t } from '../content/localization';
import { LanguageSwitch } from './LanguageSwitch';

export function Masthead() {
  const { masthead } = home;
  return <>
    <a className="skip" href="#main">{masthead.skipLabel}</a>
    <header className="masthead">
      <div className="topbar">
        <a className="brand" href="index.html" aria-label="Dhittawat — Home"><img className="brand-logo" src={assetPath('assets/brand/logo.svg')} alt="Dhittawat" width="52" height="62" /></a>
        <nav className="nav" aria-label={t('เมนูหลัก')}>{masthead.navigation.map((link, index) => <Fragment key={link.href}>
          {index > 0 && <span className="slash" aria-hidden="true">\</span>}
          <a className={link.href === 'project.html' ? 'project-nav-link' : undefined} href={link.href} aria-current={link.href === 'index.html' ? 'page' : undefined}>{link.label}</a>
        </Fragment>)}<LanguageSwitch /></nav>
      </div>
      <h1 className="masthead-title" lang="en">{masthead.title}</h1>
      <p className="role" lang="en">{masthead.role}</p>
    </header>
  </>;
}
