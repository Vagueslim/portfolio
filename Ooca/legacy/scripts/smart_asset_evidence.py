import json
from html import escape as e
from pathlib import Path


def render_flow_evidence():
    root = Path(__file__).resolve().parents[1]
    data = json.loads((root / 'data/smart-asset-evidence.json').read_text(encoding='utf-8'))
    cards = []
    for index, item in enumerate(data['items'], 1):
        if not (root / item['src']).is_file():
            raise FileNotFoundError(item['src'])
        cards.append(f'''<li class="flow-evidence-item">
          <button class="flow-evidence-trigger" type="button" aria-haspopup="dialog" aria-controls="flow-diagram" data-flow-image="{e(item['src'], quote=True)}" data-caption="{e(item['alt'], quote=True)}">
            <span class="flow-evidence-snapshot"><img src="{e(item['src'], quote=True)}" width="{item['width']}" height="{item['height']}" alt="" loading="lazy"><span class="flow-evidence-index" aria-hidden="true">{index:02d}</span></span>
            <span class="flow-evidence-copy"><strong>{e(item['title'])}</strong><span class="flow-evidence-description">{e(item['description'])}</span><span class="flow-evidence-action">{e(data['open'])} <span aria-hidden="true">↗</span></span></span>
          </button>
        </li>''')
    return f'''<section class="flow-evidence" id="system-flow-evidence" aria-labelledby="flow-evidence-heading">
      <div class="flow-evidence-header"><p class="eyebrow">{e(data['label'])}</p><h2 id="flow-evidence-heading">{e(data['title'])}</h2><p>{e(data['intro'])}</p></div>
      <ol class="flow-evidence-strip" aria-labelledby="flow-evidence-heading">{''.join(cards)}</ol>
      <dialog class="flow-diagram" id="flow-diagram" aria-labelledby="flow-diagram-title" aria-describedby="flow-diagram-description">
        <div class="flow-diagram-bar"><div><p class="eyebrow">{e(data['label'])}</p><h2 id="flow-diagram-title"></h2></div><button class="flow-diagram-close" type="button" aria-label="{e(data['close'])}" autofocus>×</button></div>
        <div class="flow-diagram-viewport" tabindex="0" aria-labelledby="flow-diagram-title"><p class="flow-diagram-loading" role="status" hidden>{e(data['loading'])}</p><p class="flow-diagram-error" role="alert" hidden>{e(data['error'])}</p><img alt=""></div>
        <div class="flow-diagram-caption"><p id="flow-diagram-description"></p><a class="flow-diagram-original" target="_blank" rel="noopener noreferrer">{e(data['original'])} <span aria-hidden="true">↗</span></a></div>
      </dialog>
    </section>'''
