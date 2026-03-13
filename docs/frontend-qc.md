# Frontend QC Checklist

Use this checklist after each iteration or substantial UI change.

## Functional Correctness

- Main routes still work: `/`, `/situation/:slug`, `/practice`, `/saved`, `/settings`.
- Direction switching still supports `RU -> DE` and `DE -> RU`.
- Buttons, toggles, navigation, and filters behave as intended.
- New iteration features actually work in the live UI.

## Regression Safety

- Existing working flows are preserved.
- Saved phrases still work.
- Onboarding and settings still persist correctly.
- Progress still persists after refresh.

## Russian-Only UI

- Interface text remains in Russian.
- No accidental English labels remain in UI chrome, helper text, or empty states.
- German appears only as learning content.

## Design System Consistency

- Accent, background, and text colors match the product principles.
- Buttons, cards, spacing, and corner radius feel cohesive.
- Stats stay secondary when the screen should be action-led.
- The app remains calm, practical, and beginner-friendly.

## Mobile Usability

- Core flows work at approximately `360x800`.
- Tap targets are large enough.
- Cards and controls remain readable.
- No clipping, overlap, or awkward wrapping under real content lengths.

## Accessibility Baseline

- Interactive controls are semantic and keyboard reachable.
- Focus states are visible.
- Contrast remains readable.
- Status is not conveyed by color alone where practical.

## State and Fallbacks

- `localStorage` defaults remain safe when data is missing or malformed.
- Optional content fields degrade gracefully.
- Empty states remain useful and localized.

## Code Quality

- Components are reusable where repetition is meaningful.
- New abstractions remain small and explicit.
- No unnecessary complexity or hidden state duplication is introduced.
