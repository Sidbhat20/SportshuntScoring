'use client'

import { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-border ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

type CardHeaderProps = {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`text-xs font-medium uppercase tracking-wide text-text-muted mb-3 ${className}`}>
      {children}
    </div>
  )
}
