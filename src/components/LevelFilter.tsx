import type { Level } from '../types'

interface LevelFilterProps {
  value: Level | 'all'
  onChange: (level: Level | 'all') => void
}

const levels: Array<Level | 'all'> = ['all', 'A1', 'A2']

export function LevelFilter({ value, onChange }: LevelFilterProps) {
  return (
    <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            value === level ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          {level === 'all' ? 'Все' : level}
        </button>
      ))}
    </div>
  )
}
