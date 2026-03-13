# TODO

## Tooling

- Decide on a single package manager. The repo currently commits `package-lock.json`, the docs use `npm`, and `package.json` still declares `pnpm`.
- Decide whether `dist/` should remain versioned. It is generated output from `npm run build` and should either be intentionally kept or removed from source control.

## Product Assets

- Replace the placeholder `public/vite.svg` manifest icons with branded PWA icons sized for installable devices.
- Audit the optional `public/audio/` catalog and decide whether missing phrase recordings should remain acceptable or become a tracked completeness target.

## Testing

- Add route-level/integration tests for onboarding, practice source switching, and empty-state flows.
- Add coverage for audio playback fallback so changes to `PhraseCard` do not silently break browser TTS behavior.
