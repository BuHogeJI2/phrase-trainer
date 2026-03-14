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

- `src/lib/storage.test.ts`: storage fallback, persistence round-trip, and v1-to-v2 migration
- `src/lib/learning.test.ts`: prompt/answer direction, filtering, quiz generation, and practice-priority ordering

### Shared state

- `src/state/AppContext.test.tsx`: reducer-backed persistence across remounts
- `src/App.test.tsx`: first-run onboarding flow and reopening onboarding from settings

### UI components

- `src/components/Layout.test.tsx`: Russian navigation labels render in the app shell
- `src/components/PhraseCard.test.tsx`: direction-dependent labels, answer reveal behavior, and learning actions
- `src/pages/HomePage.test.tsx`: daily CTA, urgent situations, continue card, and practical situation descriptions
- `src/pages/PracticePage.test.tsx`: daily cycle, situation scoping, and favorites-only practice

## Coverage Shape

The current suite is strongest around:

- local storage safety
- pure learning helpers
- state persistence
- route-level practice flow plus a few UI regressions around key shared components

The current suite does not yet cover:

- route-level flows
- audio playback and TTS fallback behavior
- PWA registration or offline caching

## When Adding Tests

- Prefer extending `src/lib/*.test.ts` for deterministic logic changes.
- Test reducer-driven behavior through `AppProvider` when a user-visible feature depends on persistence.
- Add page-level tests only when navigation or screen composition logic changes materially.
