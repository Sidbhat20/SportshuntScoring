'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, SelectButtons } from '@/components/ui'
import { useCricketStore } from '@/stores/cricketStore'

export default function CricketSetupPage() {
  const router = useRouter()
  const setSetup = useCricketStore((s) => s.setSetup)
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [format, setFormat] = useState<'T20' | 'ODI' | 'Test' | 'Custom'>('T20')
  const [customOvers, setCustomOvers] = useState('20')
  
  const handleStart = () => {
    const maxOvers = format === 'T20' ? 20 : format === 'ODI' ? 50 : format === 'Test' ? 90 : parseInt(customOvers) || 20
    setSetup(homeTeam || 'Home', awayTeam || 'Away', format, maxOvers)
    router.push('/cricket/game')
  }
  
  return (
    <SetupLayout title="Cricket" subtitle="Setup" onStart={handleStart}>
      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Teams</div>
        <div className="space-y-3">
          <Input label="Home Team (Batting First)" placeholder="Home" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
          <Input label="Away Team" placeholder="Away" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        </div>
      </Card>
      
      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Format</div>
        <SelectButtons
          options={[
            { value: 'T20', label: 'T20' },
            { value: 'ODI', label: 'ODI' },
            { value: 'Test', label: 'Test' },
            { value: 'Custom', label: 'Custom' },
          ]}
          value={format}
          onChange={setFormat}
        />
      </Card>
      
      {format === 'Custom' && (
        <Card>
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Custom Overs</div>
          <Input type="number" placeholder="20" value={customOvers} onChange={(e) => setCustomOvers(e.target.value)} />
        </Card>
      )}
    </SetupLayout>
  )
}
