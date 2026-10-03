import homeJson from '../../data/home.json' with { type: 'json' };
import projectsJson from '../../data/projects.json' with { type: 'json' };
import mediaJson from '../../data/media.json' with { type: 'json' };
import type { HomeContent, MediaItem, Project } from './types';
import { parseVisual, resolveHomeVisual, visualMediaIds } from './visuals.ts';

export const media: Record<string, MediaItem> = mediaJson;
export const projects: Record<string, Project> = projectsJson;
export const home: HomeContent = {
  ...homeJson,
  selected: { ...homeJson.selected, items: homeJson.selected.items.map(item => ({ ...item, visual: parseVisual('visual' in item ? item.visual : undefined) })) },
  wcf: { ...homeJson.wcf, visual: parseVisual('visual' in homeJson.wcf ? homeJson.wcf.visual : undefined) },
  smart: { ...homeJson.smart, visual: parseVisual('visual' in homeJson.smart ? homeJson.smart.visual : undefined) },
};

export function getMedia(id: string): MediaItem {
  const item = media[id];
  if (!item) throw new Error(`Unknown media ID "${id}". Check data/media.json.`);
  return item;
}
export function getProject(id: string): Project {
  const project = projects[id];
  if (!project) throw new Error(`Unknown project ID "${id}". Check data/projects.json.`);
  return project;
}

// Validate references before rendering rather than silently displaying broken images.
getMedia(home.foil.backgroundMediaId);
getMedia(home.smart.iconMediaId);
home.foil.lines.forEach(line => getProject(line.projectId));
Object.values(projects).forEach(project => getMedia(project.coverMediaId));
for (const item of [...home.selected.items, home.wcf, home.smart]) {
  visualMediaIds(resolveHomeVisual(getProject(item.projectId), item.visual)).forEach(getMedia);
}
