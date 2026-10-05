# React migration verification — 2026-10-05

Baseline: main at 59290b69e5b8f198261f97e6d7e09c2d84924ddf.
Implementation branch: agent/react-all-pages.
Application: C:\Users\Admin\Documents\Custom_portfolio\React\Ooca.

## Result

- Node 24.16.0, npm 11.13.0; TypeScript and production build pass.
- 28 Playwright tests pass: all 22 original behaviors plus six migration checks.
- Original Home geometry is within the existing 1px acceptance tolerance at 320, 390, 552, 768 and 1440px.
- The original About, Project and five case pages' main text, evidence images/alt, anchors and links match their EN/TH baseline. The Change Date listing retains its original flow text below the shared primary cover.
- 84 responsive captures/checks: 8 pages × 2 languages × 5 widths, plus About at 936 and 1050px in both languages. No page overflow, visible clipped text, missing image alt or browser errors.
- The six visually hidden Smart Asset connection descriptions are excluded from *visible text clipping* checks; they remain available to screen readers and included in content parity.
- Deployment simulation under /portfolio/: all 16 direct URLs and reloads pass, client navigation retains the document, EN/TH switching works, source HTML is readable without JavaScript, missing routes return 404.
- Diagram error state, Escape/close/focus return, reopening and navigation cleanup pass. A close-event race found during testing was fixed and its scenarios repeated successfully.
- Home and flow observers are released on navigation. Foil visibility, reduced motion and StrictMode lifecycle checks pass.
- Data override check changes a project cover through Vite's served JSON: listing and case fallback follow it; Home's explicit override and evidence screenshots stay independent.

## Evidence

Ignored local evidence:
- qa/react-migration/before/: 40 original screenshots and localized source HTML.
- qa/react-migration/after/: 84 current responsive captures.
- qa/react-migration/responsive-checks.json: layout and browser diagnostics.
- qa/react-migration/deployment-checks.json: static-host URL checks.
- qa/react-home/test-results.json: latest complete Playwright run.

Tracked parity evidence:
- qa/react-migration/content-baseline.json.
- qa/react-home/baseline.json.

Screenshots inspected include the Project listing on desktop, About on mobile, About career columns at 936/1050px, mobile EN/TH capabilities, Smart Asset's flow heading/connections and Q-CHANG narrative/TOC.

## Boundaries

This is a local implementation, not a deployment. Existing empty Home accordion answers and evidence caveats remain unchanged. Source screenshots are preserved in their original language. Python generators and old HTML are archived and no longer used by the build. GitHub Actions now validates before publishing the prerendered dist directory.
