# AGENTS.md

## Project Summary

RU-DE Phrase Trainer is a single-package React 19 + Vite 7 PWA for practicing everyday German phrases with a Russian-language interface. The app is entirely static at runtime: phrase content is bundled from source files, user progress is stored in `localStorage`, and optional German audio files are loaded from `public/audio`.

## Read Order

1. [README.md](README.md) for product overview and local commands.
2. [docs/project-structure.md](docs/project-structure.md) for the repository and folder map.
3. [docs/architecture.md](docs/architecture.md) for runtime flow and state boundaries.
4. [docs/data-model.md](docs/data-model.md) for phrase content, local storage, and audio conventions.
5. [docs/code-style.md](docs/code-style.md) for implementation conventions used in this repo.
6. [docs/testing.md](docs/testing.md) for the current test stack and coverage boundaries.
7. [TODO.md](TODO.md) for concrete follow-up work discovered during the docs review.

## Technical Map

- [README.md](README.md): quick start, feature summary, and contributor-facing entry links.
- [docs/project-structure.md](docs/project-structure.md): root layout, `src/` ownership, and route inventory.
- [docs/architecture.md](docs/architecture.md): app boot flow, routing shell, reducer-backed state, and PWA behavior.
- [docs/data-model.md](docs/data-model.md): situation/phrase catalog rules, derived IDs, `localStorage` schema, and audio fallback expectations.
- [docs/code-style.md](docs/code-style.md): TypeScript, React, state, Tailwind, and testing conventions.
- [docs/testing.md](docs/testing.md): Vitest setup, current test files, and known gaps.
- [TODO.md](TODO.md): repo-specific cleanup items that are not implemented yet.

## Current Constraints

- There is no backend, API layer, auth, or database. All user-specific state lives under the `ru-de-phrase-trainer-state-v1` browser storage key.
- The phrase catalog is static and generated from `src/data/phrases.ts`. Today it contains 10 situations with 20 phrases each.
- Audio files are optional. `PhraseCard` first tries `/public/audio/<situationId>-<NN>.mp3` and falls back to browser speech synthesis.
- Commands in the updated docs use `npm` because `package-lock.json` is committed. `package.json` still declares `pnpm`; that mismatch is tracked in [TODO.md](TODO.md).
