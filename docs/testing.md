# Testing

## Tooling

- Vitest
- `@testing-library/react`
- `@testing-library/user-event`
- `jsdom`
- `@testing-library/jest-dom`

Configured in `vite.config.ts` and `src/test/setup.ts`.

## Commands

```bash
npm run test
npm run test:run
```

Related quality commands:

```bash
npm run lint
npm run build
```

## Current Test Coverage

### Pure logic

- `src/lib/storage.test.ts`: storage fallback and persistence round-trip
- `src/lib/learning.test.ts`: prompt/answer direction, filtering, and quiz option generation

### Shared state

- `src/state/AppContext.test.tsx`: reducer-backed persistence across remounts
- `src/App.test.tsx`: first-run onboarding flow and reopening onboarding from settings

### UI components

- `src/components/Layout.test.tsx`: Russian navigation labels render in the app shell
- `src/components/PhraseCard.test.tsx`: direction-dependent labels and answer reveal behavior
- `src/pages/HomePage.test.tsx`: daily CTA, urgent situations, continue card, and practical situation descriptions

## Coverage Shape

The current suite is strongest around:

- local storage safety
- pure learning helpers
- state persistence
- a few UI regressions around key shared components

The current suite does not yet cover:

- route-level flows
- onboarding completion behavior
- daily/favorites/situation practice flows end-to-end
- audio playback and TTS fallback behavior
- PWA registration or offline caching

## When Adding Tests

- Prefer extending `src/lib/*.test.ts` for deterministic logic changes.
- Test reducer-driven behavior through `AppProvider` when a user-visible feature depends on persistence.
- Add page-level tests only when navigation or screen composition logic changes materially.
