'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, SelectButtons } from '@/components/ui'
import { useTugOfWarStore } from '@/stores/tugofwarStore'

export default function TugOfWarSetupPage() {
  const router = useRouter()
  const setSetup = useTugOfWarStore((s) => s.setSetup)

  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [bestOf, setBestOf] = useState<3 | 5>(3)

  const handleStart = () => {
    setSetup(homeTeam || 'Home', awayTeam || 'Away', bestOf)
    router.push('/tugofwar/game')
  }

  return (
    <SetupLayout title="Tug of War" subtitle="Setup" onStart={handleStart}>
      <Card>
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Teams</div>
        <div className="space-y-3">
          <Input label="Home Team" placeholder="Home" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
          <Input label="Away Team" placeholder="Away" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        </div>
      </Card>

      <Card className="mt-4">
        <SelectButtons
          label="Format"
          options={[
            { value: 3, label: 'Best of 3' },
            { value: 5, label: 'Best of 5' },
          ]}
          value={bestOf}
          onChange={(v) => setBestOf(v as 3 | 5)}
        />
      </Card>
    </SetupLayout>
  )
}
