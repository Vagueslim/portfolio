import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { home, media, projects, getLocalizedHome } from '../src/content/index.ts';
import { translateContent } from '../src/content/localization.ts';

for (const [id, image] of Object.entries(media)) {
  if (!image.src.startsWith('assets/') || image.src.includes('..') || !existsSync(resolve(image.src))) {
    throw new Error(`Media "${id}" must point to an existing file inside assets/: ${image.src}`);
  }
}
for (const [id, project] of Object.entries(projects)) {
  if (!existsSync(project.href)) throw new Error(`Project "${id}" has no local page: ${project.href}`);
}
const featuredIds = home.selected.items.map(item => item.projectId);
getLocalizedHome('en');
translateContent(media, 'en');
if (new Set(featuredIds).size !== featuredIds.length) throw new Error('Home selected projects must not repeat an ID.');
console.log(`Home content valid: ${Object.keys(projects).length} projects, ${Object.keys(media).length} media entries.`);
