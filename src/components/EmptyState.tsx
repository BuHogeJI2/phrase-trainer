interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-[28px] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5 text-center shadow-[var(--shadow-soft)]">
      <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
    </section>
  )
}
