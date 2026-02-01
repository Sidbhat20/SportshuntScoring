'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button } from '@/components/ui'
import { useRugbyStore } from '@/stores/rugbyStore'

export default function RugbySetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useRugbyStore()
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  
  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''
  
  const handleStart = () => {
    reset()
    setSetup(homeTeam.trim(), awayTeam.trim(), 40)
    router.push('/rugby/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Rugby">
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
        
        <div className="text-sm text-text-muted">
          2 halves × 40 minutes
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
