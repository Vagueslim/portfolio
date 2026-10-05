import json
from html import escape as e
from pathlib import Path


def render_cover_flow():
    root = Path(__file__).resolve().parents[1]
    flow = json.loads((root / 'data/smart-asset-cover.json').read_text(encoding='utf-8'))
    headings = []
    for language in ('en', 'th'):
        for key, layout in (('headingLines', 'desktop'), ('mobileHeadingLines', 'mobile')):
            lines = ''.join(f'<span class="p-cover-flow__title-line">{e(line)}</span>' for line in flow[key][language])
            headings.append(f'<span class="p-cover-flow__{layout}-heading" data-language-only="{language}" aria-hidden="true">{lines}</span>')
    nodes = []
    for node in flow['nodes']:
        media = node['media']
        if not (root / media['src']).is_file():
            raise FileNotFoundError(media['src'])
        priority = ' is-mobile-priority' if node['mobilePriority'] else ''
        nodes.append(f'''<li class="p-cover-flow__node p-cover-flow__node--{e(node['id'])}{priority}">
          <figure><div class="p-cover-flow__media"><img src="{e(media['src'], quote=True)}" width="{media['width']}" height="{media['height']}" alt="{e(media['alt']['th'], quote=True)}" loading="lazy"></div>
          <figcaption><span class="p-cover-flow__index">{node['stage']:02d}</span>
            <strong><span class="p-cover-flow__desktop-copy">{e(node['title']['th'])}</span><span class="p-cover-flow__mobile-copy">{e(node.get('mobileTitle', node['title'])['th'])}</span></strong>
            <span><span class="p-cover-flow__desktop-copy">{e(node['description']['th'])}</span><span class="p-cover-flow__mobile-copy">{e(node.get('mobileDescription', node['description'])['th'])}</span></span>
          </figcaption></figure>
        </li>''')
    labels = ''.join(f'<span class="p-cover-flow__edge-label p-cover-flow__edge-label--{e(edge["from"])}-{e(edge["to"])}">{e(edge["label"]["th"])}</span>' for edge in flow['edges'])
    by_id = {node['id']: node for node in flow['nodes']}
    accessible_edges = ''.join(f'<li><span>{e(by_id[edge["from"]]["title"]["th"])}</span> → <span>{e(by_id[edge["to"]]["title"]["th"])}</span>: <span>{e(edge["label"]["th"])}</span></li>' for edge in flow['edges'])
    paths = ['M265 176H330V286H386', 'M498 360V430H250V492', 'M390 605H488V680H540', 'M708 704H790', 'M974 688H1060V312', 'M1084 322V438']
    connectors = ''.join(f'<path data-from="{e(edge["from"])}" data-to="{e(edge["to"])}" d="{path}" marker-end="url(#cover-flow-arrow-smart-asset)"></path>' for path, edge in zip(paths, flow['edges']))
    return f'''<section class="p-work-detail__cover p-work-detail__cover--system-flow" id="smart-asset-system-flow" aria-labelledby="cover-flow-smart-asset">
      <div class="p-cover-flow__grid" aria-hidden="true"></div>
      <header class="p-cover-flow__intro"><p class="p-cover-flow__kicker">Master Asset / Site operation</p>
        <h2 id="cover-flow-smart-asset" aria-label="{e(flow['heading']['th'], quote=True)}">{''.join(headings)}</h2>
        <p>{e(flow['description']['th'])}</p>
      </header>
      <div class="p-cover-flow__canvas">
        <p class="p-cover-flow__lane p-cover-flow__lane--master">{e(flow['lanes']['master']['th'])}</p><p class="p-cover-flow__lane p-cover-flow__lane--operations">{e(flow['lanes']['operations']['th'])}</p>
        <ol class="p-cover-flow__nodes">{''.join(nodes)}</ol>
        <svg class="p-cover-flow__connectors" viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><marker id="cover-flow-arrow-smart-asset" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 8 4 0 8Z"></path></marker></defs>{connectors}</svg>
        <div class="p-cover-flow__edge-labels" aria-hidden="true">{labels}</div>
        <ol class="p-cover-flow__sr-only" aria-label="{e(flow['heading']['th'], quote=True)}">{accessible_edges}</ol>
      </div>
    </section>'''
