'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button } from '@/components/ui'
import { useFootballStore } from '@/stores/footballStore'

export default function FootballSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useFootballStore()
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [halfMinutes, setHalfMinutes] = useState<string>('45')
  const [halfSeconds, setHalfSeconds] = useState<string>('0')
  
  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''
  
  const handleStart = () => {
    reset()
    const minutes = parseInt(halfMinutes) || 0
    const seconds = parseInt(halfSeconds) || 0
    const totalSeconds = minutes * 60 + seconds
    setSetup(homeTeam.trim(), awayTeam.trim(), totalSeconds)
    router.push('/football/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Football">
      <Card className="space-y-6">
        <Input
          label="Home Team"
          placeholder="Enter home team name"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
        />
        
        <Input
          label="Away Team"
          placeholder="Enter away team name"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
        />
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Half Duration
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={halfMinutes}
              onChange={(e) => setHalfMinutes(e.target.value)}
              min={0}
              max={99}
              className="w-24 text-center"
            />
            <span className="text-text-muted">:</span>
            <Input
              type="number"
              placeholder="Sec"
              value={halfSeconds}
              onChange={(e) => setHalfSeconds(e.target.value)}
              min={0}
              max={59}
              className="w-24 text-center"
            />
          </div>
          <p className="text-xs text-text-muted mt-1">Enter minutes and seconds (e.g., 45:00)</p>
        </div>
        
        <Button
          variant="primary"
          disabled={!canStart}
          onClick={handleStart}
          className="w-full"
        >
          Start Match
        </Button>
      </Card>
    </SetupLayout>
  )
}
