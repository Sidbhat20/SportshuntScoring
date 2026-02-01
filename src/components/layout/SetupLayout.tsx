'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type SetupLayoutProps = {
  children: ReactNode
  title: string
  subtitle?: string
  sportName?: string
  onStart?: () => void
}

export function SetupLayout({ children, title, subtitle, sportName, onStart }: SetupLayoutProps) {
  return (
    <div className="min-h-screen bg-primary-bg-secondary overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-text-muted hover:text-text-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </Link>
          <Image src="/logo.jpeg" alt="Sportshunt" width={32} height={32} className="rounded-md" />
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {(subtitle || sportName) && (
            <p className="text-text-muted mt-1">{subtitle || sportName}</p>
          )}
        </div>
        {children}
        
        {/* Start Button */}
        {onStart && (
          <div className="mt-6 sm:mt-8">
            <button
              onClick={onStart}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 px-6 rounded-lg touch-manipulation min-h-[56px] text-base sm:text-lg shadow-md hover:shadow-lg"
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
