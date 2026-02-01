'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button } from '@/components/ui'
import { useBasketballStore } from '@/stores/basketballStore'

export default function BasketballSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useBasketballStore()
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [quarterMinutes, setQuarterMinutes] = useState<string>('12')
  const [quarterSeconds, setQuarterSeconds] = useState<string>('0')
  
  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''
  
  const handleStart = () => {
    reset()
    const minutes = parseInt(quarterMinutes) || 0
    const seconds = parseInt(quarterSeconds) || 0
    const totalSeconds = minutes * 60 + seconds
    setSetup(homeTeam.trim(), awayTeam.trim(), totalSeconds)
    router.push('/basketball/game')
  }
  
  return (
    <SetupLayout title="Game Setup" sportName="Basketball">
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
            Quarter Duration
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={quarterMinutes}
              onChange={(e) => setQuarterMinutes(e.target.value)}
              min={0}
              max={99}
              className="w-24 text-center"
            />
            <span className="text-text-muted">:</span>
            <Input
              type="number"
              placeholder="Sec"
              value={quarterSeconds}
              onChange={(e) => setQuarterSeconds(e.target.value)}
              min={0}
              max={59}
              className="w-24 text-center"
            />
          </div>
          <p className="text-xs text-text-muted mt-1">Enter minutes and seconds (e.g., 12:00)</p>
        </div>
        
        <Button
          variant="primary"
          disabled={!canStart}
          onClick={handleStart}
          className="w-full"
        >
          Start Game
        </Button>
      </Card>
    </SetupLayout>
  )
}
