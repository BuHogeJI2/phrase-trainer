import type { Direction } from '../types'

interface DirectionSwitchProps {
  direction: Direction
  onChange: (direction: Direction) => void
  compact?: boolean
}

export function DirectionSwitch({ direction, onChange, compact = false }: DirectionSwitchProps) {
  return (
    <div className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1">
      <button
        type="button"
        onClick={() => onChange('ru_to_de')}
        className={`rounded-full px-3 py-2 text-sm font-medium transition ${
          direction === 'ru_to_de'
            ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-soft)]'
            : 'text-[var(--color-text-muted)]'
        } ${compact ? 'px-2 py-1 text-xs' : ''}`}
      >
        RU → DE
      </button>
      <button
        type="button"
        onClick={() => onChange('de_to_ru')}
        className={`rounded-full px-3 py-2 text-sm font-medium transition ${
          direction === 'de_to_ru'
            ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-soft)]'
            : 'text-[var(--color-text-muted)]'
        } ${compact ? 'px-2 py-1 text-xs' : ''}`}
      >
        DE → RU
      </button>
    </div>
  )
}
