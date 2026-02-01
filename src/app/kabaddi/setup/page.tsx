'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input } from '@/components/ui'
import { useKabaddiStore } from '@/stores/kabaddiStore'

export default function KabaddiSetupPage() {
  const router = useRouter()
  const setSetup = useKabaddiStore((s) => s.setSetup)
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  
  const handleStart = () => {
    setSetup(homeTeam || 'Home', awayTeam || 'Away')
    router.push('/kabaddi/game')
  }
  
  return (
    <SetupLayout title="Kabaddi" subtitle="Setup" onStart={handleStart}>
      <Card>
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Teams</div>
        <div className="space-y-3">
          <Input label="Home Team" placeholder="Home" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
          <Input label="Away Team" placeholder="Away" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        </div>
      </Card>
    </SetupLayout>
  )
}
