import { useState } from 'react'
import type { Direction, Level } from '../types'
import { DirectionSwitch } from './DirectionSwitch'
import { LevelFilter } from './LevelFilter'
import { Button } from './ui/Button'

interface OnboardingModalProps {
  mode: 'initial' | 'settings'
  initialValues: {
    direction: Direction
    defaultLevel: Level | 'all'
    transliterationEnabled: boolean
  }
  onClose: () => void
  onComplete: (payload: { direction: Direction; defaultLevel: Level | 'all'; transliterationEnabled: boolean }) => void
}

const infoSteps = [
  {
    title: 'Немецкие фразы для реальных ситуаций в Германии',
    description: 'Короткие и полезные фразы для жизни, общения и бытовых ситуаций.',
    aside: 'Приложение помогает спокойно подготовиться к повседневным ситуациям и не перегружает лишней теорией.',
  },
  {
    title: 'Не просто читать, а запоминать и использовать',
    description: 'Практика, повторение и реальные ситуации помогут быстрее начать говорить.',
    aside: 'Фразы сгруппированы по знакомым сценариям, чтобы их было легче перенести в жизнь сразу после тренировки.',
  },
] as const

export function OnboardingModal({ mode, initialValues, onClose, onComplete }: OnboardingModalProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>(initialValues.direction)
  const [defaultLevel, setDefaultLevel] = useState<Level | 'all'>(initialValues.defaultLevel)
  const [transliterationEnabled, setTransliterationEnabled] = useState(initialValues.transliterationEnabled)
  const isPersonalizationStep = stepIndex === 2

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[color:rgba(24,17,11,0.72)] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="mx-auto mt-6 max-w-md rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-strong)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">
              Шаг {stepIndex + 1} из 3
            </p>
            <div className="mt-3 flex gap-2" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={`block h-2.5 rounded-full transition-all ${
                    index === stepIndex ? 'w-8 bg-[var(--color-accent)]' : 'w-2.5 bg-[var(--color-surface-strong)]'
                  }`}
                />
              ))}
            </div>
          </div>
          {mode === 'settings' ? (
            <button
              type="button"
              className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
              onClick={onClose}
              aria-label="Закрыть введение"
            >
              Закрыть
            </button>
          ) : null}
        </div>

        {!isPersonalizationStep ? (
          <section className="mt-6">
            <h1 id="onboarding-title" className="text-3xl font-semibold leading-tight text-[var(--color-text)]">
              {infoSteps[stepIndex].title}
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">{infoSteps[stepIndex].description}</p>
            <div className="mt-6 rounded-[28px] bg-[var(--color-accent-soft)] p-4 text-sm leading-6 text-[var(--color-accent-strong)]">
              {infoSteps[stepIndex].aside}
            </div>
          </section>
        ) : (
          <section className="mt-6">
            <h1 id="onboarding-title" className="text-3xl font-semibold leading-tight text-[var(--color-text)]">
              Настройте удобный старт
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--color-text-muted)]">
              Выберите привычный режим. Позже эти настройки можно поменять в разделе «Настройки».
            </p>

            <section className="mt-5">
              <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">Направление обучения</p>
              <DirectionSwitch direction={direction} onChange={setDirection} />
            </section>

            <section className="mt-5">
              <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">Уровень фраз</p>
              <LevelFilter value={defaultLevel} onChange={setDefaultLevel} />
            </section>

            <label className="mt-5 flex items-center gap-3 rounded-[24px] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={transliterationEnabled}
                onChange={(event) => setTransliterationEnabled(event.target.checked)}
              />
              Показывать подсказку произношения (кириллица)
            </label>
          </section>
        )}

        <div className="mt-8 flex gap-3">
          {stepIndex > 0 ? (
            <Button variant="secondary" fullWidth onClick={() => setStepIndex((current) => current - 1)}>
              Назад
            </Button>
          ) : null}
          {isPersonalizationStep ? (
            <Button fullWidth onClick={() => onComplete({ direction, defaultLevel, transliterationEnabled })}>
              {mode === 'settings' ? 'Сохранить настройки' : 'Начать обучение'}
            </Button>
          ) : (
            <Button fullWidth onClick={() => setStepIndex((current) => current + 1)}>
              Далее
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
