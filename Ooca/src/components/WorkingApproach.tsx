import { SiteLink } from './SiteLink';
import { useContent } from '../content';
import { EditorialLink, Lines } from './Shared';

export function WorkingApproach() {
  const { home } = useContent();
  const { approach } = home;
  return <div className="editorial-wrap"><section className="editorial-conversation" aria-labelledby="approach-heading">
    <div className="editorial-conversation-heading"><p className="editorial-kicker">{approach.kicker}</p><h2 id="approach-heading"><Lines text={approach.title} /></h2><p>{approach.description}</p><EditorialLink {...approach.link} /></div>
    <div className="editorial-qa">{approach.items.map((item, index) => <details key={item.id} open={item.open}>
      <summary><span className="qa-number">{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span></summary>
      <div className="qa-answer"><p>{item.answer}</p></div>
    </details>)}</div>
  </section></div>;
}
