# Roadmap

## Current Implementation Scope

The app now includes Iteration 1 plus a first training-cycle slice that makes practice more active and memory-oriented.

### Iteration 1

- onboarding refinement
- home screen redesign
- design system foundation
- situation card improvements

### Core Training Cycle Slice

- 5-phrase study blocks
- required checkpoint after each block
- matching plus multiple-choice recall
- immediate mistake review and one retry pass
- per-phrase learning states: new / studying / difficult / known
- heuristic local repetition for daily and scoped practice

## Future Iterations

These are documented for planning only and should not be implemented unless a later task explicitly asks for them.

### Iteration 2

- situation-level learning mode refinement
- phrase-card polish on top of the new difficult/known actions
- favorites improvements beyond the current scoped practice
- continue where you left off across partial training blocks

### Iteration 3

- stronger review-today system on top of the current heuristic repetition
- filters by usefulness
- search
- urgent pack refinement

### Iteration 4

- what they may say back
- mini-dialogues
- listen and repeat
- slow audio scaffolding
- reminder settings placeholder

## Explicitly Deferred

- typed recall
- pronunciation scoring or speech recognition
- full spaced-repetition scheduling
- push reminders or backend-backed review queues

## Roadmap Rules

- Keep each iteration focused on its own value.
- Allow only tiny supporting refactors across iteration boundaries.
- Document future requirements before implementing them.

## Repo Follow-Ups

### Tooling

- Decide on a single package manager. The repo currently commits `package-lock.json`, the docs use `npm`, and `package.json` still declares `pnpm`.
- Decide whether `dist/` should remain versioned. It is generated output from `npm run build` and should either be intentionally kept or removed from source control.

### Product Assets

- Replace the SVG manifest icon with branded raster install icons sized for installable devices.
- Audit the optional `public/audio/` catalog and decide whether missing phrase recordings should remain acceptable or become a tracked completeness target.

### Testing

- Expand route-level practice coverage for long-session edge cases and progress summaries across multiple blocks.
- Add coverage for audio playback fallback so changes to `PhraseCard` do not silently break browser TTS behavior.
