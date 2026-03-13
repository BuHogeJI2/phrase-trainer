/* eslint-disable react-refresh/only-export-components */
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
}

function resolveVariant(variant: ButtonVariant): string {
  switch (variant) {
    case 'secondary':
      return 'bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[var(--color-surface-strong)]'
    case 'ghost':
      return 'bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]'
    case 'danger':
      return 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:bg-[#f9dada]'
    case 'primary':
    default:
      return 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)]'
  }
}

export function buttonClassName(variant: ButtonVariant = 'primary', fullWidth = false): string {
  return [
    'inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-muted)]',
    fullWidth ? 'w-full' : '',
    resolveVariant(variant),
  ]
    .filter(Boolean)
    .join(' ')
}

export function Button({ variant = 'primary', fullWidth = false, className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${buttonClassName(variant, fullWidth)} ${className}`.trim()} {...props} />
}
