'use client'

import { ReactNode } from 'react'
import { Card, CardHeader } from '../ui'

type ControlPanelProps = {
  homeControls: ReactNode
  awayControls: ReactNode
  centerControls: ReactNode
  homeLabel?: string
  awayLabel?: string
  centerLabel?: string
}

export function ControlPanel({
  homeControls,
  awayControls,
  centerControls,
  homeLabel = 'Home',
  awayLabel = 'Away',
  centerLabel = 'Match',
}: ControlPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Home Controls */}
      <Card>
        <CardHeader>{homeLabel}</CardHeader>
        <div className="space-y-3">
          {homeControls}
        </div>
      </Card>
      
      {/* Center Controls */}
      <Card>
        <CardHeader>{centerLabel}</CardHeader>
        <div className="space-y-3">
          {centerControls}
        </div>
      </Card>
      
      {/* Away Controls */}
      <Card>
        <CardHeader>{awayLabel}</CardHeader>
        <div className="space-y-3">
          {awayControls}
        </div>
      </Card>
    </div>
  )
}
