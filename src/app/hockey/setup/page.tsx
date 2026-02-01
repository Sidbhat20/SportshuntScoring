'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { useHockeyStore } from '@/stores/hockeyStore'

const TYPE_OPTIONS = [
  { value: 'ice', label: 'Ice Hockey' },
  { value: 'field', label: 'Field Hockey' },
]

export default function HockeySetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useHockeyStore()
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [hockeyType, setHockeyType] = useState<'ice' | 'field'>('ice')
  
  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''
  
  const handleStart = () => {
    reset()
    setSetup(homeTeam.trim(), awayTeam.trim(), hockeyType)
    router.push('/hockey/game')
  }
  
  return (
    <SetupLayout title="Game Setup" sportName="Hockey">
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
        
        <SelectButtons
          label="Hockey Type"
          options={TYPE_OPTIONS}
          value={hockeyType}
          onChange={(v) => setHockeyType(v as 'ice' | 'field')}
        />
        
        <div className="text-sm text-text-muted">
          {hockeyType === 'ice' ? '3 periods × 20 minutes' : '4 quarters × 15 minutes'}
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
