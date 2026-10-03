import { Fragment } from 'react';
import { home } from '../content';

export function Masthead() {
  const { masthead } = home;
  return <>
    <a className="skip" href="#main">{masthead.skipLabel}</a>
    <header className="masthead">
      <div className="topbar">
        <a className="brand" href="index.html" aria-label="Dhittawat — Home"><span aria-hidden="true">{masthead.brand}</span></a>
        <nav className="nav" aria-label="เมนูหลัก">{masthead.navigation.map((link, index) => <Fragment key={link.href}>
          {index > 0 && <span className="slash" aria-hidden="true">\</span>}
          <a href={link.href} aria-current={link.href === 'index.html' ? 'page' : undefined}>{link.label}</a>
        </Fragment>)}</nav>
      </div>
      <h1 className="masthead-title" lang="en">{masthead.title}</h1>
      <p className="role" lang="en">{masthead.role}</p>
    </header>
  </>;
}
