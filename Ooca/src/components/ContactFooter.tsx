import { SiteLink } from './SiteLink';
import { useContent } from '../content';
import { EditorialLink, Lines } from './Shared';
import { CvLink } from './CvLink';

export function ContactFooter() {
  const { home, profile } = useContent();
  const { contact, footer } = home;
  return <footer className="portfolio-lower"><div className="editorial-wrap">
    <section className="editorial-contact" aria-labelledby="contact-heading">
      <p className="editorial-kicker">{contact.kicker}</p><h2 id="contact-heading"><Lines text={contact.title} /></h2>
      <div className="editorial-contact-row"><p><Lines text={contact.description.replace('{role}', profile.role)} /></p><div className="contact-actions"><EditorialLink {...contact.link} /><CvLink /></div></div>
    </section>
    <div className="editorial-footer-top"><span className="editorial-footer-name">{footer.name}</span><EditorialLink {...footer.link} external /></div>
    <div className="editorial-footer-bottom"><span>{footer.copyright}</span><span><span lang="en">{profile.role}</span> · {footer.location}</span><SiteLink href="#top">{footer.backLabel}</SiteLink></div>
  </div></footer>;
}
