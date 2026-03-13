# Project Structure

## Repository Layout

```text
.
├── AGENTS.md
├── README.md
├── TODO.md
├── docs/
├── public/
│   ├── audio/
│   └── vite.svg
├── src/
│   ├── components/
│   │   └── ui/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   ├── state/
│   ├── test/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── eslint.config.js
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Top-Level Files

- `package.json`: scripts, dependencies, and package manager metadata.
- `vite.config.ts`: React, Tailwind, Vitest, and PWA plugin configuration.
- `eslint.config.js`: flat ESLint config for TypeScript and React hooks.
- `public/audio/README.txt`: naming contract for optional MP3 files.
- `dist/`: generated build output from `npm run build`.

## Source Layout

### `src/pages`

Route-level screens:

- `HomePage.tsx`: dashboard, daily session entry, progress summary, and situation list.
- `SituationPage.tsx`: phrase list scoped to one situation.
- `PracticePage.tsx`: card mode and quiz mode for global, daily, favorites, or one-situation practice.
- `SavedPage.tsx`: favorites list and entry point into favorites-only practice.
- `SettingsPage.tsx`: persistent learning preferences and progress reset.
- `NotFoundPage.tsx`: fallback route target.

### `src/components`

Reusable UI blocks such as the layout shell, onboarding modal, phrase card, filters, progress widgets, and navigation.

### `src/components/ui`

Small shared primitives for the current design system foundation, such as buttons, section headers, and level badges.

### `src/state`

- `AppContext.tsx`: reducer-backed application state and persistence wiring.
- `AppContext.test.tsx`: persistence behavior tests for saved phrases, completed phrases, and preferences.

### `src/data`

Static application content:

- `situations.ts`: 10 ordered situation definitions and lookup maps.
- `phrases.ts`: phrase seed catalog and derived phrase objects.
- `ui.ts`: shared Russian UI labels reused by the layout and controls.

### `src/lib`

Pure helpers and browser storage logic:

- `learning.ts`: filtering, quiz question generation, daily selection, badges, and prompt/answer mapping.
- `storage.ts`: default state, storage validation, serialization, and reset helpers.
- `transliterate.ts`: German-to-Cyrillic pronunciation hint generation.

### `src/test`

- `setup.ts`: shared Vitest setup that installs `jest-dom` matchers and clears `localStorage` before each test.

## Runtime Entry Points

- `src/main.tsx`: registers the service worker and mounts React.
- `src/App.tsx`: wraps the app with `AppProvider` and `BrowserRouter`, defines all routes, and shows onboarding when needed.

## Route Inventory

- `/`: home dashboard
- `/situation/:slug`: one situation
- `/practice`: all phrases or filtered practice via query params
- `/saved`: saved phrases
- `/settings`: preferences
- `/404`: explicit not-found screen

`/practice` also accepts query parameters:

- `source=daily`
- `source=favorites`
- `source=situation&slug=<situation-slug>`
