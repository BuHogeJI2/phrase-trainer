interface LevelBadgeProps {
  level: 'A1' | 'A2' | 'all'
  compact?: boolean
}

export function LevelBadge({ level, compact = false }: LevelBadgeProps) {
  const label = level === 'all' ? 'A1 + A2' : level

  return (
    <span
      className={`inline-flex items-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-accent-strong)] ${
        compact ? 'px-2.5 py-1 text-xs font-semibold' : 'px-3 py-1.5 text-sm font-semibold'
      }`}
    >
      {label}
    </span>
  )
}
