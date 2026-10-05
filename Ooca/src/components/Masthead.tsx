import { Fragment, useEffect, useRef, useState } from 'react';
import { useContent } from '../content';
import { assetPath } from '../content/localization';
import { LanguageSwitch } from './LanguageSwitch';
import { SiteLink } from './SiteLink';
export function Masthead({ homePage = true, activePage = 'index.html' }: { homePage?: boolean; activePage?: string }) {
  const { home: { masthead }, ui } = useContent();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, [open]);
  useEffect(() => setOpen(false), [activePage]);
  return <>
    <SiteLink className="skip" href="#main">{masthead.skipLabel}</SiteLink>
    <header ref={header} className={homePage ? 'masthead' : 'masthead inner-masthead site-header'}>
      <div className="topbar">
        <SiteLink className="brand" href="index.html" aria-label="Dhittawat — Home"><img className="brand-logo" src={assetPath('assets/brand/logo.svg')} alt="Dhittawat" width="52" height="62" />
          {!homePage && <span className="brand-copy"><strong>DHITTAWAT</strong><span>PRODUCT / UX/UI DESIGNER</span></span>}
        </SiteLink>
        {!homePage && <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>Menu +</button>}
        <nav id="main-nav" className={'nav' + (open ? ' is-open' : '')} aria-label={ui.mainMenu} onClick={() => setOpen(false)}>
          {masthead.navigation.map((link, index) => <Fragment key={link.href}>
            {index > 0 && <span className="slash" aria-hidden="true">\</span>}
            <SiteLink className={link.href === 'project.html' ? 'project-nav-link' : undefined} href={link.href} aria-current={link.href === activePage ? 'page' : undefined}>{link.label}</SiteLink>
          </Fragment>)}<LanguageSwitch />
        </nav>
      </div>
      {homePage && <><h1 className="masthead-title" lang="en">{masthead.title}</h1><p className="role" lang="en">{masthead.role}</p></>}
    </header>
  </>;
}
