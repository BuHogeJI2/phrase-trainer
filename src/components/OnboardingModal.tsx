import { useState } from 'react'
import type { Direction, Level } from '../types'
import { DirectionSwitch } from './DirectionSwitch'
import { LevelFilter } from './LevelFilter'

interface OnboardingModalProps {
  onComplete: (payload: { direction: Direction; defaultLevel: Level | 'all'; transliterationEnabled: boolean }) => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [direction, setDirection] = useState<Direction>('ru_to_de')
  const [defaultLevel, setDefaultLevel] = useState<Level | 'all'>('all')
  const [transliterationEnabled, setTransliterationEnabled] = useState(true)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4">
      <div className="mx-auto mt-8 max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h1 className="text-xl font-bold text-slate-900">Добро пожаловать</h1>
        <p className="mt-2 text-sm text-slate-600">
          Настройте обучение один раз. Все интерфейсы приложения остаются на русском языке.
        </p>

        <section className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-800">Направление обучения</p>
          <DirectionSwitch direction={direction} onChange={setDirection} />
        </section>

        <section className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-800">Уровень фраз</p>
          <LevelFilter value={defaultLevel} onChange={setDefaultLevel} />
        </section>

        <label className="mt-5 flex items-center gap-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={transliterationEnabled}
            onChange={(event) => setTransliterationEnabled(event.target.checked)}
          />
          Показывать подсказку произношения (кириллица)
        </label>

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white"
          onClick={() => onComplete({ direction, defaultLevel, transliterationEnabled })}
        >
          Начать обучение
        </button>
      </div>
    </div>
  )
}
