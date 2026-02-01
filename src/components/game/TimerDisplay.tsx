'use client'

import { formatTime } from '@/lib/utils'

type TimerDisplayProps = {
  seconds: number
  isRunning?: boolean
  isDanger?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function TimerDisplay({ 
  seconds, 
  isRunning = false, 
  isDanger = false,
  label,
  size = 'md'
}: TimerDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }
  
  return (
    <div className="flex items-center justify-center gap-2">
      {isRunning && (
        <div className="w-2 h-2 rounded-full bg-action-success" />
      )}
      <span 
        className={`
          font-mono font-semibold tabular-nums
          ${sizeClasses[size]}
          ${isDanger ? 'text-action-danger' : 'text-text-primary'}
        `}
      >
        {formatTime(seconds)}
      </span>
      {label && (
        <span className="text-xs text-text-muted uppercase">{label}</span>
      )}
    </div>
  )
}
