# Product Principles

## Product Goal

RU-DE Phrase Trainer should feel like a practical phrase trainer for real situations in Germany. The app is meant to reduce hesitation, help beginners act quickly in daily life, and stay light enough to use in short mobile sessions.

## Experience Principles

- Calm: avoid noisy layouts, visual overload, and aggressive gamification.
- Practical: prioritize phrases and flows that help in real everyday situations.
- Supportive: use simple, reassuring Russian copy that guides without lecturing.
- Beginner-friendly: reduce friction, keep decisions small, and make the next action obvious.
- Lightweight: preserve the local-only architecture and avoid complexity without clear user value.

## Tone and Content Rules

- All app UI remains in Russian.
- German appears only inside learning content.
- Copy should be simple, calm, helpful, supportive, and not robotic.
- The experience should not feel like a school exercise platform.

## UX and Design Rules

- Mobile-first at roughly `360x800`.
- Clear hierarchy with one dominant action per screen where possible.
- Generous spacing, rounded cards, subtle borders or soft shadows, and large tap targets.
- Brand foundation:
  - accent `#008f6b`
  - background `#f8f4ef`
  - main text near-black/dark gray
- Accessibility basics are required: semantic controls, visible focus states, readable contrast, and reduced-motion friendliness.

## Implementation Constraints

- Extend the current app incrementally; do not rebuild it.
- Preserve existing working routes and learning flows.
- Keep code readable, typed, and maintainable.
- When content fields are not available yet, support them gracefully without inventing hidden systems.
