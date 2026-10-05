# React client navigation with prerendered HTML

Accepted — 2026-10-05.

The portfolio uses React Router in the browser and renders the same components at build time for every existing EN/TH HTML URL. GitHub Pages receives a static dist directory; it does not need a Node server or a catch-all rewrite for direct case links.

The route registry defines supported filenames. PORTFOLIO_BASE_PATH is shared by Vite, the router, assets and metadata. English is the root language; Thai uses /th/. Locale belongs to the URL, not a module-level document lookup or localStorage.

Content is bilingual JSON with stable project/media IDs. Case narrative uses a constrained semantic block tree rendered as React elements, never an HTML-string injection. The case template and interaction components own layout and behavior.

Alternatives considered: retaining generated HTML preserves duplicated templates and full-page navigation; a client-only SPA requires a GitHub Pages fallback for deep links and starts with an empty document. Prerendering preserves direct links, readable static content and shared React templates at the cost of a small server entry and build script.

Original generators and source HTML are archived under legacy and excluded from the build. The pre-migration main text, links, IDs and evidence images are an executable parity baseline. Changes to the baseline require an intentional content revision, not merely a test update.
