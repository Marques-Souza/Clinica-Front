import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  variant?: 'default' | 'brand'
  compact?: boolean
}

function Card({ children, className = '', variant = 'default', compact = false }: CardProps) {
  const variantClass =
    variant === 'brand'
      ? 'border-brand bg-brand text-white'
      : 'border-brand/10 bg-linear-to-r from-mint to-white text-ink'

  return (
    <section className={`rounded-2xl border ${compact ? 'p-0' : 'p-6'} shadow-sm ${variantClass} ${className}`}>
      {children}
    </section>
  )
}

export default Card
