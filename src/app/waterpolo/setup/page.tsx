'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button } from '@/components/ui'
import { useWaterPoloStore } from '@/stores/waterpoloStore'

export default function WaterPoloSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useWaterPoloStore()
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''
  
  const handleStart = () => {
    reset()
    setSetup(homeTeam.trim(), awayTeam.trim())
    router.push('/waterpolo/game')
  }
  
  return (
    <SetupLayout title="Game Setup" sportName="Water Polo">
      <Card className="space-y-6">
        <Input label="Home Team" placeholder="Enter home team name" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
        <Input label="Away Team" placeholder="Enter away team name" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        <div className="text-sm text-text-muted">4 periods × 8 minutes • 30 second shot clock</div>
        <Button variant="primary" disabled={!canStart} onClick={handleStart} className="w-full">Start Game</Button>
      </Card>
    </SetupLayout>
  )
}
