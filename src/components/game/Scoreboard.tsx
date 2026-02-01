'use client'

import { ReactNode } from 'react'
import { Card } from '../ui'

type ScoreboardProps = {
  homeTeam: string
  awayTeam: string
  homeScore: string | number
  awayScore: string | number
  homeExtra?: ReactNode
  awayExtra?: ReactNode
  centerContent?: ReactNode
}

export function Scoreboard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  homeExtra,
  awayExtra,
  centerContent,
}: ScoreboardProps) {
  return (
    <Card className="mb-4">
      <div className="grid grid-cols-3 items-center gap-4">
        {/* Home Team */}
        <div className="text-center">
          <div className="text-sm font-medium text-text-muted mb-2 truncate">{homeTeam}</div>
          <div className="font-mono text-5xl md:text-6xl font-bold text-text-primary tabular-nums">
            {homeScore}
          </div>
          {homeExtra && (
            <div className="mt-3">{homeExtra}</div>
          )}
        </div>
        
        {/* Center */}
        <div className="text-center">
          {centerContent || (
            <div className="text-2xl text-text-muted">—</div>
          )}
        </div>
        
        {/* Away Team */}
        <div className="text-center">
          <div className="text-sm font-medium text-text-muted mb-2 truncate">{awayTeam}</div>
          <div className="font-mono text-5xl md:text-6xl font-bold text-text-primary tabular-nums">
            {awayScore}
          </div>
          {awayExtra && (
            <div className="mt-3">{awayExtra}</div>
          )}
        </div>
      </div>
    </Card>
  )
}
