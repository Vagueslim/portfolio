(() => {
  const section = document.querySelector('.p-work-detail__cover--system-flow');
  if (!section) return;
  const canvas = section.querySelector('.p-cover-flow__canvas');
  const svg = section.querySelector('.p-cover-flow__connectors');

  function connect() {
    if (getComputedStyle(svg).display === 'none') return;
    const bounds = canvas.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const box = id => {
      const node = section.querySelector(`.p-cover-flow__node--${id}`);
      const rect = node.getBoundingClientRect();
      const media = node.querySelector('.p-cover-flow__media').getBoundingClientRect();
      return { x: rect.x - bounds.x, y: rect.y - bounds.y, right: rect.right - bounds.x, bottom: rect.bottom - bounds.y, center: rect.x - bounds.x + rect.width / 2, middle: media.y - bounds.y + media.height / 2 };
    };
    svg.querySelectorAll('path[data-from]').forEach(path => {
      const from = box(path.dataset.from);
      const to = box(path.dataset.to);
      const label = section.querySelector(`.p-cover-flow__edge-label--${path.dataset.from}-${path.dataset.to}`);
      const labelWidth = label.offsetWidth;
      const labelHeight = label.offsetHeight;
      let route;
      let labelX;
      let labelY;
      if (path.dataset.from === 'asset') {
        // Enter Site from the right, leaving its bottom port exclusively for Status.
        const outside = bounds.width + 24;
        route = `M${from.right + 8} ${from.middle}H${outside}V${to.middle}H${to.right + 8}`;
        labelX = (from.right + outside - labelWidth) / 2;
        labelY = from.middle - labelHeight - 8;
      } else if (path.dataset.from === 'category') {
        const middle = (from.right + to.x) / 2;
        route = `M${from.right + 3} ${from.middle}H${middle}V${to.middle}H${to.x - 3}`;
        labelX = middle - labelWidth - 10;
        labelY = (from.bottom + to.middle - labelHeight) / 2;
      } else if (path.dataset.from === 'sku-detail') {
        // Give the short side-by-side handoff its own lane below both captions.
        const lane = Math.max(from.bottom, to.bottom) + 44;
        route = `M${from.center} ${from.bottom + 8}V${lane}H${to.center}V${to.bottom + 8}`;
        labelX = (from.center + to.center - labelWidth) / 2;
        labelY = lane - labelHeight / 2;
      } else if (path.dataset.from === 'site') {
        const start = from.bottom + 8;
        const end = to.y - 8;
        route = `M${from.center} ${start}V${end}`;
        labelX = from.center + 12;
        labelY = (start + end - labelHeight) / 2;
      } else {
        const start = from.bottom + 8;
        const end = to.y - 8;
        const middle = (start + end) / 2;
        route = `M${from.center} ${start}V${middle}H${to.center}V${end}`;
        labelX = (from.center + to.center - labelWidth) / 2;
        labelY = middle - labelHeight / 2;
      }
      path.setAttribute('d', route);
      // Labels follow the connection lanes instead of reading as extra node copy.
      label.style.left = `${labelX}px`;
      label.style.top = `${labelY}px`;
      label.style.right = 'auto';
    });
  }

  // Static connections follow responsive boxes and font loading; no animation loop.
  const observer = new ResizeObserver(connect);
  observer.observe(canvas);
  section.querySelectorAll('.p-cover-flow__node').forEach(node => observer.observe(node));
  document.fonts.ready.then(connect);
  connect();
})();
