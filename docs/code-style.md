# Code Style

## Baseline

- Use TypeScript with the strict compiler settings already defined in `tsconfig.app.json`.
- Keep components as function components.
- Prefer ASCII in source unless existing user-facing copy already requires non-ASCII characters.

## File Organization

- Put route-level composition in `src/pages/`.
- Put reusable UI in `src/components/`.
- Put pure logic in `src/lib/`.
- Put static content and shared labels in `src/data/`.
- Keep cross-page mutable state in `src/state/`.

When adding new behavior, prefer extending the existing folder instead of creating a new top-level pattern.

## React Conventions

- Shared state changes should go through reducer actions in `AppContext.tsx`.
- Keep derivations close to the component that consumes them unless they become reusable pure logic.
- Use `useMemo` only when there is an actual derived value worth stabilizing, as the current code already does in a few page-level flows.
- Avoid introducing a separate state library unless the app outgrows the current reducer/context approach.

## Styling Conventions

- The project uses Tailwind utility classes inline inside components.
- `src/index.css` is the place for global styles only.
- Preserve the existing visual language: rounded mobile-friendly cards, soft slate/sky palette, and bottom navigation shell.

## Content and Copy

- User-facing UI copy is currently in Russian.
- Reused UI labels belong in `src/data/ui.ts`.
- Phrase content belongs in `src/data/phrases.ts`, not embedded in components.

## Persistence and Domain Rules

- Treat `storage.ts` as the source of truth for default state and storage schema changes.
- Keep phrase IDs, audio paths, and situation IDs deterministic.
- If phrase catalog rules change, update the assertion logic and docs together.

## Testing Preference

- Add tests for pure logic and state transitions first.
- Add component tests when UI behavior has meaningful branching or persistence side effects.
- Avoid broad snapshot-heavy tests; the existing suite is behavior-oriented.
