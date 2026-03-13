import { Link } from 'react-router-dom'
import { buttonClassName } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
      <h1 className="text-lg font-semibold text-[var(--color-text)]">Страница не найдена</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Проверьте адрес или вернитесь на главную.</p>
      <Link to="/" className={`${buttonClassName()} mt-4`}>
        На главную
      </Link>
    </section>
  )
}
