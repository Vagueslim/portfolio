import { useContent } from '../content';

export function WorkingApproach() {
  const { home } = useContent();
  const { approach } = home;
  return <div className="editorial-wrap"><section id="conversation" className="editorial-conversation" aria-labelledby="approach-heading">
    <div className="editorial-conversation-heading"><p className="editorial-kicker">{approach.kicker}</p><h2 id="approach-heading">{approach.title}</h2><p>{approach.description}</p><span className="editorial-conversation-count" aria-hidden="true">Q&amp;A / {String(approach.items.length).padStart(2, '0')}</span></div>
    <div className="editorial-qa">{approach.items.map((item, index) => <details key={item.id} open={item.open}>
      <summary><span className="qa-number">{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span></summary>
      <div className="qa-answer">{item.answer.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    </details>)}</div>
  </section></div>;
}
