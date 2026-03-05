import type { Direction } from '../types'

interface DirectionSwitchProps {
  direction: Direction
  onChange: (direction: Direction) => void
  compact?: boolean
}

export function DirectionSwitch({ direction, onChange, compact = false }: DirectionSwitchProps) {
  return (
    <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
      <button
        type="button"
        onClick={() => onChange('ru_to_de')}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
          direction === 'ru_to_de' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
        } ${compact ? 'px-2 py-1 text-xs' : ''}`}
      >
        RU → DE
      </button>
      <button
        type="button"
        onClick={() => onChange('de_to_ru')}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
          direction === 'de_to_ru' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
        } ${compact ? 'px-2 py-1 text-xs' : ''}`}
      >
        DE → RU
      </button>
    </div>
  )
}
