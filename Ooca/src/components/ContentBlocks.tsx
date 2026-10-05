import { createElement, createContext, useContext, useState, type ReactNode } from 'react';
import type { ContentNode } from '../content/page-types';
import { useContent } from '../content';
import { assetPath } from '../content/localization';
import { SiteLink } from './SiteLink';
import { useModal, closeOnBackdrop } from '../hooks/useModal';

const ImageContext = createContext<(id: string, caption: string) => void>(() => {});
export function ImageDialogProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<{ id: string; caption: string } | null>(null);
  const ref = useModal(image);
  const { getMedia, ui } = useContent();
  return <ImageContext value={(id, caption) => setImage({ id, caption })}>
    {children}
    <dialog className="dialog" ref={ref} onCancel={() => setImage(null)} onClose={() => { if (!ref.current?.open) setImage(null); }} onClick={closeOnBackdrop} aria-label={image?.caption || ui.close}>
      <button type="button" className="dialog-close" aria-label={ui.close} autoFocus onClick={() => ref.current?.close()}>×</button>
      <figure>{image && <img src={getMedia(image.id).src} alt={image.caption} />}<figcaption>{image?.caption}</figcaption></figure>
    </dialog>
  </ImageContext>;
}
function ContentImage({ node }: { node: Extract<ContentNode, { kind: 'image' }> }) {
  const { getMedia } = useContent();
  const image = getMedia(node.mediaId);
  return <img src={image.src} alt={node.alt} width={image.width} height={image.height} className={node.className} loading="lazy" />;
}
export function ContentBlock({ node }: { node: ContentNode }) {
  const openImage = useContext(ImageContext);
  const { getMedia } = useContent();
  if (node.kind === 'text') return node.value;
  if (node.kind === 'image') return <ContentImage node={node} />;
  const props: Record<string, unknown> = { ...node.attributes };
  if (props.class) { props.className = props.class; delete props.class; }
  if (typeof props.style === 'string') props.style = Object.fromEntries(props.style.split(';').filter(Boolean).map(item => {
    const [key, ...value] = item.split(':');
    return [key.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), value.join(':').trim()];
  }));
  if (typeof props.href === 'string' && props.href.startsWith('assets/')) props.href = assetPath(props.href);
  if (props['data-media-id']) {
    const id = String(props['data-media-id']);
    props['data-image'] = getMedia(id).src;
    props.onClick = () => openImage(id, String(props['data-caption'] || ''));
    props.type = 'button';
  }
  if (node.tag === 'br') return <br />;
  const children = <ContentBlocks nodes={node.children} />;
  if (node.tag === 'a') return <SiteLink {...props}>{children}</SiteLink>;
  return createElement(node.tag, props, children);
}
export function ContentBlocks({ nodes }: { nodes: ContentNode[] }) {
  return <>{nodes.map((node, index) => <ContentBlock key={index} node={node} />)}</>;
}
