'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui'
import { SPORTS } from '@/lib/types'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-bg-secondary overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src="/logo.jpeg" alt="Sportshunt" width={40} height={40} className="rounded-lg sm:w-12 sm:h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Sportshunt</h1>
              <p className="text-sm sm:text-base text-text-muted">Scoreboard</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sport List */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card padding="none">
          <div className="divide-y divide-border">
            {SPORTS.map((sport) => (
              <Link
                key={sport.id}
                href={`/${sport.id}/setup`}
                className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 touch-manipulation min-h-[56px]"
              >
                <span className="font-medium text-base sm:text-lg text-text-primary">{sport.name}</span>
                <svg 
                  className="w-5 h-5 text-text-muted" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </Card>
        
        <p className="text-center text-text-muted text-sm mt-8">
          Select a sport to start scoring
        </p>
      </div>
    </div>
  )
}
