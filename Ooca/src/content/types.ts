export interface MediaItem { src: string; alt: string; width?: number; height?: number }
export interface Project { title: string; href: string; coverMediaId: string }
export interface TextLink { label: string; href: string }
export type HomeVisual =
  | { kind: 'single'; mediaId: string }
  | { kind: 'pair' | 'collage'; mediaIds: [string, string] }
  | { kind: 'statistics'; caption: string; total: string; totalLabel: string; totalNote: string; items: { value: string; label: string }[]; footer: string; evidenceNote: string };

export interface HomeProject {
  projectId: string;
  metaTitle: string;
  metaType: string;
  kicker: string;
  title: string;
  description: string;
  role: string;
  linkLabel: string;
  visual?: HomeVisual;
}
export interface HomeContent {
  masthead: { title: string; role: string; brand: string; skipLabel: string; navigation: TextLink[] };
  foil: { label: string; backgroundMediaId: string; destination: string; lines: { thought: string; label: string; projectId: string; destination: string }[] };
  intro: { kicker: string; title: string; description: string; link: TextLink };
  selected: { title: string; link: TextLink; items: HomeProject[] };
  wcf: { projectId: string; labels: string[]; kicker: string; descriptor: string; iconMediaId: string; title: string; description: string; linkLabel: string; visual?: HomeVisual };
  smart: { projectId: string; labels: string[]; chip: string; label: string; title: string; subtitle: string; iconMediaId: string; process: string; role: string; linkLabel: string; visual?: HomeVisual };
  approach: { kicker: string; title: string; description: string; items: { id: string; title: string; answer: string[]; open: boolean }[] };
  contact: { kicker: string; title: string; description: string; link: TextLink };
  footer: { name: string; link: TextLink; copyright: string; location: string; backLabel: string };
}
