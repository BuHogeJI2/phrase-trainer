import type { Level } from '../types'

interface LevelFilterProps {
  value: Level | 'all'
  onChange: (level: Level | 'all') => void
}

const levels: Array<Level | 'all'> = ['all', 'A1', 'A2']

export function LevelFilter({ value, onChange }: LevelFilterProps) {
  return (
    <div className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`rounded-full px-3 py-2 text-sm font-medium transition ${
            value === level
              ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-soft)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          {level === 'all' ? 'Все' : level}
        </button>
      ))}
    </div>
  )
}
