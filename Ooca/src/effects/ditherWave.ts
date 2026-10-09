// Original ordered-dither wave renderer for the portfolio; no third-party effect code.
// A 4x4 Bayer matrix quantizes a smooth, travelling field into four ink shades.
const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const ink = [[13, 21, 33], [31, 47, 65], [60, 80, 101], [99, 119, 139]];

export function createDitherSurface(element: HTMLElement, index: number) {
  const canvas = element.querySelector<HTMLCanvasElement>('canvas');
  const text = element.querySelector<HTMLElement>('.dither-ink-text');
  if (!canvas || !text) return null;
  const mask = document.createElement('canvas');
  const texture = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const maskContext = mask.getContext('2d');
  const textureContext = texture.getContext('2d');
  if (!context || !maskContext || !textureContext) return null;
  let pixels: ImageData | undefined;
  let cell = 1;
  let fontSize = 40;

  const fallback = () => { element.dataset.ready = 'false'; };
  const measure = () => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(text);
    if (!bounds.width || !bounds.height) { pixels = undefined; fallback(); return; }
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    fontSize = parseFloat(style.fontSize);
    cell = Math.max(1, Math.min(2, fontSize / 28));
    canvas.width = mask.width = Math.ceil(bounds.width * ratio);
    canvas.height = mask.height = Math.ceil(bounds.height * ratio);
    texture.width = Math.ceil(bounds.width / cell);
    texture.height = Math.ceil(bounds.height / cell);
    pixels = textureContext.createImageData(texture.width, texture.height);

    maskContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    maskContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    maskContext.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
    maskContext.textBaseline = 'alphabetic';
    const label = text.textContent ?? '';
    const metrics = maskContext.measureText(label);
    // Match CSS's half-leading and font ascent, rather than centering visible glyphs.
    const ascent = metrics.fontBoundingBoxAscent;
    const descent = metrics.fontBoundingBoxDescent;
    const baseline = (bounds.height - ascent - descent) / 2 + ascent;
    maskContext.fillStyle = '#000';
    maskContext.fillText(label, 0, baseline);
  };

  const draw = (phase: number) => {
    if (!pixels) return;
    const { width, height, data } = pixels;
    const offset = phase + index * .8;
    for (let y = 0; y < height; y++) {
      const v = y * cell / fontSize;
      const bend = Math.sin(v * 3.4 - offset * .5) * .7;
      for (let x = 0; x < width; x++) {
        const u = x * cell / fontSize;
        const field = Math.max(0, Math.min(1,
          .43 + .34 * Math.sin(u * 2.5 + v * 2.2 - offset + bend)
          + .18 * Math.sin(u * 1.2 - v * 3.8 + offset * .65)));
        const level = field * (ink.length - 1);
        const base = Math.floor(level);
        const threshold = (bayer[(y % 4) * 4 + x % 4] + .5) / 16;
        const shade = ink[Math.min(ink.length - 1, base + (level - base > threshold ? 1 : 0))];
        const p = (y * width + x) * 4;
        data[p] = shade[0]; data[p + 1] = shade[1]; data[p + 2] = shade[2]; data[p + 3] = 255;
      }
    }
    textureContext.putImageData(pixels, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(mask, 0, 0);
    context.globalCompositeOperation = 'source-in';
    context.imageSmoothingEnabled = false;
    context.drawImage(texture, 0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'source-over';
    if (element.dataset.ready !== 'true') element.dataset.ready = 'true';
  };
  return { element, measure, draw, fallback };
}
