export const pageFiles = ['index.html', 'about.html', 'project.html', 'q-chang-web.html', 'buddy-2-0.html', 'change-date.html', 'wcf-digital.html', 'smart-asset.html'] as const;
export const routePaths = pageFiles.flatMap(file => ['/' + file, '/th/' + file]);
export function routeInfo(pathname: string) {
  const locale = pathname.startsWith('/th/') || pathname === '/th' ? 'th' : 'en';
  const file = pathname.split('/').pop() || 'index.html';
  const known = ['/', '/th/', ...routePaths].includes(pathname);
  return { locale: locale as 'en' | 'th', file, id: file.replace(/\.html$/, ''), home: known && file === 'index.html', known };
}
