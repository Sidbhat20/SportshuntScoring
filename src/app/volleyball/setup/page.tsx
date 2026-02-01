'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { useVolleyballStore } from '@/stores/volleyballStore'

const POINTS_OPTIONS = [
  { value: 15, label: '15 pts' },
  { value: 21, label: '21 pts' },
  { value: 25, label: '25 pts' },
]

const BEST_OF_OPTIONS = [
  { value: 3, label: 'Best of 3' },
  { value: 5, label: 'Best of 5' },
]

export default function VolleyballSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useVolleyballStore()
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [bestOf, setBestOf] = useState<number>(5)
  const [pointsToWin, setPointsToWin] = useState<number>(25)
  const [finalSetPoints, setFinalSetPoints] = useState<number>(15)
  const [customPoints, setCustomPoints] = useState<string>('')
  const [useCustomPoints, setUseCustomPoints] = useState(false)
  const [customFinalPoints, setCustomFinalPoints] = useState<string>('')
  const [useCustomFinalPoints, setUseCustomFinalPoints] = useState(false)
  const canStart = homeTeam.trim() !== '' && awayTeam.trim() !== ''
  
  const handleStart = () => {
    reset()
    const finalPoints = useCustomPoints && customPoints ? parseInt(customPoints) : pointsToWin
    const finalSet = useCustomFinalPoints && customFinalPoints ? parseInt(customFinalPoints) : finalSetPoints
    setSetup(homeTeam.trim(), awayTeam.trim(), bestOf, finalPoints, finalSet)
    router.push('/volleyball/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Volleyball">
      <Card className="space-y-6">
        <Input label="Home Team" placeholder="Enter team name" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
        <Input label="Away Team" placeholder="Enter team name" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        
        <SelectButtons 
          label="Match Format" 
          options={BEST_OF_OPTIONS} 
          value={bestOf} 
          onChange={(v) => setBestOf(v as number)} 
        />
        
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
        
        <div>
          <SelectButtons 
            label="Final Set Points" 
            options={[{ value: 15, label: '15 pts' }, { value: 21, label: '21 pts' }]} 
            value={useCustomFinalPoints ? 0 : finalSetPoints} 
            onChange={(v) => { setFinalSetPoints(v as number); setUseCustomFinalPoints(false); }} 
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="customFinalPoints"
              checked={useCustomFinalPoints}
              onChange={(e) => setUseCustomFinalPoints(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="customFinalPoints" className="text-sm text-text-muted">Custom:</label>
            <Input
              type="number"
              placeholder="Points"
              value={customFinalPoints}
              onChange={(e) => { setCustomFinalPoints(e.target.value); setUseCustomFinalPoints(true); }}
              min={1}
              max={99}
              className="w-20"
              disabled={!useCustomFinalPoints}
            />
          </div>
        </div>
        
        <Button variant="primary" disabled={!canStart} onClick={handleStart} className="w-full">Start Match</Button>
      </Card>
    </SetupLayout>
  )
}
