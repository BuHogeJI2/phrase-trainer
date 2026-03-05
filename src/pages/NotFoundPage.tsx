import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">Страница не найдена</h1>
      <p className="mt-1 text-sm text-slate-600">Проверьте адрес или вернитесь на главную.</p>
      <Link to="/" className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        На главную
      </Link>
    </section>
  )
}
