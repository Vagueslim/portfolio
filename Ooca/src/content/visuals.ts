import type { HomeVisual, Project } from './types';

/** Omitting the Home override is intentional: the project's cover becomes the visual. */
export function resolveHomeVisual(project: Project, override?: HomeVisual): HomeVisual {
  return override ?? { kind: 'single', mediaId: project.coverMediaId };
}

export function visualMediaIds(visual: HomeVisual): string[] {
  if (visual.kind === 'single') return [visual.mediaId];
  if (visual.kind === 'pair' || visual.kind === 'collage') return visual.mediaIds;
  return [];
}

/** JSON is editable by hand, so unsupported layouts fail with a useful message. */
export function parseVisual(value: unknown): HomeVisual | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object') throw new Error('Home visual must be an object.');
  const v = value as Record<string, unknown>;
  if (v.kind === 'single' && typeof v.mediaId === 'string') return { kind: 'single', mediaId: v.mediaId };
  if ((v.kind === 'pair' || v.kind === 'collage') && Array.isArray(v.mediaIds) && v.mediaIds.length === 2 && v.mediaIds.every(id => typeof id === 'string')) {
    return { kind: v.kind, mediaIds: [v.mediaIds[0], v.mediaIds[1]] };
  }
  if (v.kind === 'statistics') {
    const fields = ['caption', 'total', 'totalLabel', 'totalNote', 'footer', 'evidenceNote'];
    if (fields.every(key => typeof v[key] === 'string') && Array.isArray(v.items) && v.items.every(item => item && typeof item.value === 'string' && typeof item.label === 'string')) {
      return v as Extract<HomeVisual, { kind: 'statistics' }>;
    }
  }
  throw new Error(`Invalid Home visual: ${String(v.kind)}. Use single, pair, collage or statistics.`);
}
