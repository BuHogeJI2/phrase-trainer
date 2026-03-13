# Roadmap

## Current Implementation Scope

Only Iteration 1 is in implementation scope right now.

### Iteration 1

- onboarding refinement
- home screen redesign
- design system foundation
- situation card improvements

## Future Iterations

These are documented for planning only and should not be implemented unless a later task explicitly asks for them.

### Iteration 2

- learning modes inside a situation
- improved phrase card
- favorites improvements
- continue where you left off

### Iteration 3

- review today / difficult phrases
- filters by usefulness
- search
- urgent pack refinement

### Iteration 4

- what they may say back
- mini-dialogues
- listen and repeat
- slow audio scaffolding
- reminder settings placeholder

## Roadmap Rules

- Keep each iteration focused on its own value.
- Allow only tiny supporting refactors across iteration boundaries.
- Document future requirements before implementing them.

## Repo Follow-Ups

### Tooling

- Decide on a single package manager. The repo currently commits `package-lock.json`, the docs use `npm`, and `package.json` still declares `pnpm`.
- Decide whether `dist/` should remain versioned. It is generated output from `npm run build` and should either be intentionally kept or removed from source control.

### Product Assets

- Replace the placeholder `public/vite.svg` manifest icons with branded PWA icons sized for installable devices.
- Audit the optional `public/audio/` catalog and decide whether missing phrase recordings should remain acceptable or become a tracked completeness target.

### Testing

- Add route-level/integration tests for onboarding, practice source switching, and empty-state flows.
- Add coverage for audio playback fallback so changes to `PhraseCard` do not silently break browser TTS behavior.
