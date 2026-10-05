import { SiteLink } from './SiteLink';
import { useContent } from '../content';
import { EditorialLink, Lines } from './Shared';

export function ContactFooter({ homePage = true }: { homePage?: boolean }) {
  const { home, ui } = useContent();
  const { contact, footer } = home;
  return <footer className="portfolio-lower"><div className="editorial-wrap">
    <section className="editorial-contact" aria-labelledby="contact-heading">
      <p className="editorial-kicker">{homePage ? contact.kicker : ui.innerFooterKicker}</p><h2 id="contact-heading" lang="en"><Lines text={contact.title} /></h2>
      <div className="editorial-contact-row"><p><Lines text={contact.description} /></p><EditorialLink {...contact.link} /></div>
    </section>
    <div className="editorial-footer-top"><span className="editorial-footer-name">{footer.name}</span><EditorialLink {...footer.link} external /></div>
    <div className="editorial-footer-bottom"><span>{footer.copyright}</span><span>{footer.location}</span><SiteLink href="#top">{footer.backLabel}</SiteLink></div>
  </div></footer>;
}
