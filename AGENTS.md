# AGENTS.md

## Project Map
- Vite + vanilla JavaScript personal website.
- `src/config/site.js` is the first place to edit content, sections, labels, and portrait data.
- `src/main.js` owns rendering, active-section tracking, keyboard navigation, and debug hooks.
- `src/style.css` owns the visual system; prefer existing CSS variables before adding new colors or spacing.

## Development
- Run `npm run dev` for local development.
- Run `npm run check` before handing work back; it currently maps to the production build.
- Avoid adding dependencies unless the feature clearly needs them.

## Debugging
- In dev, add `?debug=true` to the URL to enable scoped console logs.
- With debug enabled, inspect `window.__PERSONAL_SITE_DEBUG__` for the current config and active section.
- Keep new UI generated from data where practical so future AI edits can change content without touching rendering logic.
