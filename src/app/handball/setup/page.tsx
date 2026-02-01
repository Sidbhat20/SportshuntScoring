'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button } from '@/components/ui'
import { useHandballStore } from '@/stores/handballStore'

export default function HandballSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useHandballStore()
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  
  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''
  
  const handleStart = () => {
    reset()
    setSetup(homeTeam.trim(), awayTeam.trim())
    router.push('/handball/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Handball">
      <Card className="space-y-6">
        <Input label="Home Team" placeholder="Enter home team name" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
        <Input label="Away Team" placeholder="Enter away team name" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        <div className="text-sm text-text-muted">2 halves × 30 minutes</div>
        <Button variant="primary" disabled={!canStart} onClick={handleStart} className="w-full">Start Match</Button>
      </Card>
    </SetupLayout>
  )
}
