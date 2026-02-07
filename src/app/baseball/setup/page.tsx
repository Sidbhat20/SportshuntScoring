'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, SelectButtons } from '@/components/ui'
import { useBaseballStore } from '@/stores/baseballStore'

export default function BaseballSetupPage() {
  const router = useRouter()
  const setSetup = useBaseballStore((s) => s.setSetup)
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [innings, setInnings] = useState(9)
  
  const handleStart = () => {
    setSetup(homeTeam || 'Home', awayTeam || 'Away', innings)
    router.push('/baseball/game')
  }
  
  return (
    <SetupLayout title="Baseball" subtitle="Setup" onStart={handleStart}>
      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Teams</div>
        <div className="space-y-3">
          <Input label="Away Team" placeholder="Away" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
          <Input label="Home Team" placeholder="Home" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
        </div>
      </Card>
      
      <Card>
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Innings</div>
        <SelectButtons options={[{ value: 7, label: '7' }, { value: 9, label: '9' }]} value={innings} onChange={(v) => setInnings(Number(v))} />
      </Card>
    </SetupLayout>
  )
}
