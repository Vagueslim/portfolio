import type { HomeVisual } from './types';
/** Semantic, editable content data; never executable HTML strings. */
export type ContentNode =
  | { kind: 'text'; value: string }
  | { kind: 'image'; mediaId: string; alt: string; className?: string }
  | { kind: 'element'; tag: string; attributes?: Record<string, string>; children: ContentNode[] };
export interface Metadata { title: string; description: string }
export interface CaseStudy {
  metadata: Metadata; head: ContentNode; overview?: (HomeVisual & { alt?: string }) | { kind: 'flow'; blocks: ContentNode[] };
  visualClass: string; caption: ContentNode;
  toc: ContentNode; chapters: { id: string; blocks: ContentNode[] }[];
  sources?: ContentNode; next: ContentNode;
}
export interface AboutContent {
  metadata: Metadata; intro: ContentNode; lead: ContentNode; jump: ContentNode; sections: ContentNode[];
}
export interface ListingContent {
  metadata: Metadata; intro: ContentNode; filters: { id: string; label: string }[]; count: string;
  items: { projectId: string; category: string; visualClass: string; caption: ContentNode; coverAlt?: string; supplementary?: ContentNode[] }[];
}
