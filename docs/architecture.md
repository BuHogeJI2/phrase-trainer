# Architecture

## Runtime Overview

The app is a client-only React SPA served by Vite and enhanced with `vite-plugin-pwa`. There is no server-side rendering, no remote API, and no background sync. Product behavior is driven by static phrase data plus reducer-managed user state in the browser.

## Boot Flow

1. `src/main.tsx` imports global styles, registers the service worker with `registerSW({ immediate: true })`, and mounts the app.
2. `src/App.tsx` wraps the tree in `AppProvider` and `BrowserRouter`.
3. `AppRoutes` renders the route tree inside `Layout` and conditionally overlays `OnboardingModal` until `prefs.onboardingCompleted` becomes `true`.
4. After first-run completion, the same onboarding flow can be reopened from Settings through non-persistent UI state held in `AppContext`.

## UI Shell

- `Layout.tsx` owns the persistent header, the bottom navigation, and the centered content container.
- Pages are route-driven and keep most business decisions close to the screen that uses them.
- `PhraseCard.tsx` is the main interaction component for phrase reveal, completion marking, saving, and audio playback.

## State Model

`AppContext.tsx` owns the only shared mutable state in the app:

- `prefs`: direction, default level, transliteration toggle, autoplay toggle, onboarding completion.
- `progress`: completed phrases, saved phrases, quiz stats, and last visited situation metadata.
- non-persistent UI state: onboarding visibility for reopening the guided flow from Settings.

The reducer is the boundary for persistent state updates. Every reducer change is serialized back to `localStorage` via `saveStateToStorage` in an effect.

## Data Flow

- Static content comes from `src/data/situations.ts` and `src/data/phrases.ts`.
- Pages derive filtered or scoped phrase lists with helpers from `src/lib/learning.ts`.
- UI-level controls dispatch reducer actions directly through `useAppState()`.
- `storage.ts` validates browser data on load and falls back to a safe default state when stored JSON is missing or malformed.

## Product Behaviors Worth Knowing

- Daily practice is deterministic for a given ISO date via a seeded pseudo-random helper.
- Situation practice updates `lastVisitedSituationId` and `lastVisitedAt`, which feeds the "continue session" card on the home page.
- Quiz answers increment aggregate stats and mark the active phrase as completed.
- Revealing a phrase on a card also marks it as completed.

## Audio and Offline Behavior

- Each phrase points at `/audio/<situationId>-<NN>.mp3`.
- If the MP3 file fails to play, `PhraseCard` falls back to `speechSynthesis` with `de-DE`.
- The service worker caches the app shell and static assets configured in `vite.config.ts`.
- The manifest currently reuses `public/vite.svg` for both icon sizes; branded app icons are still a follow-up item.
