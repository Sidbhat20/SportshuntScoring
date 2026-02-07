'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { useThrowballStore } from '@/stores/throwballStore'

const POINTS_OPTIONS = [
  { value: 15, label: '15 pts' },
  { value: 21, label: '21 pts' },
  { value: 25, label: '25 pts' },
]

export default function ThrowballSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useThrowballStore()
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [pointsToWin, setPointsToWin] = useState<number>(25)
  const [customPoints, setCustomPoints] = useState<string>('')
  const [useCustomPoints, setUseCustomPoints] = useState(false)
  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''
  
  const handleStart = () => {
    reset()
    const finalPoints = useCustomPoints && customPoints ? parseInt(customPoints) : pointsToWin
    setSetup(homeTeam.trim(), awayTeam.trim(), finalPoints)
    router.push('/throwball/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Throwball">
      <Card className="space-y-6">
        <Input label="Home Team" placeholder="Enter team name" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
        <Input label="Away Team" placeholder="Enter team name" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        
        <div className="text-sm font-medium text-text-muted">Format: Best of 3 Sets</div>
        
        <div>
          <SelectButtons 
            label="Points per Set" 
            options={POINTS_OPTIONS} 
            value={useCustomPoints ? 0 : pointsToWin} 
            onChange={(v) => { setPointsToWin(v as number); setUseCustomPoints(false); }} 
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="customPoints"
              checked={useCustomPoints}
              onChange={(e) => setUseCustomPoints(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="customPoints" className="text-sm text-text-muted">Custom:</label>
            <Input
              type="number"
              placeholder="Points"
              value={customPoints}
              onChange={(e) => { setCustomPoints(e.target.value); setUseCustomPoints(true); }}
              min={1}
              max={99}
              className="w-20"
              disabled={!useCustomPoints}
            />
          </div>
        </div>
        
        <Button variant="primary" disabled={!canStart} onClick={handleStart} className="w-full">Start Match</Button>
      </Card>
    </SetupLayout>
  )
}
