'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { IconButton } from '../ui'

type GameLayoutProps = {
  children: ReactNode
  title: string
  subtitle?: string
  onUndo?: () => void
  onReset?: () => void
  canUndo?: boolean
}

export function GameLayout({
  children,
  title,
  subtitle,
  onUndo,
  onReset,
  canUndo = false,
}: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-primary-bg-secondary overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-text-muted hover:text-text-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Exit</span>
          </Link>
          
          <div className="text-center">
            <div className="font-semibold text-text-primary">{title}</div>
            {subtitle && (
              <div className="text-xs text-text-muted">{subtitle}</div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {onUndo && (
              <IconButton 
                onClick={onUndo} 
                disabled={!canUndo}
                title="Undo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </IconButton>
            )}
            {onReset && (
              <IconButton 
                onClick={onReset}
                title="Reset"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </IconButton>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </div>
    </div>
  )
}
