'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { useBadmintonStore } from '@/stores/badmintonStore'

const POINTS_OPTIONS = [
  { value: 11, label: '11 pts' },
  { value: 15, label: '15 pts' },
  { value: 21, label: '21 pts' },
]

const BEST_OF_OPTIONS = [
  { value: 1, label: 'Best of 1' },
  { value: 3, label: 'Best of 3' },
  { value: 5, label: 'Best of 5' },
]

export default function BadmintonSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useBadmintonStore()
  const [playerA, setPlayerA] = useState('')
  const [playerB, setPlayerB] = useState('')
  const [bestOf, setBestOf] = useState<number>(3)
  const [pointsToWin, setPointsToWin] = useState<number>(21)
  const [customPoints, setCustomPoints] = useState<string>('')
  const [useCustomPoints, setUseCustomPoints] = useState(false)
  const canStart = playerA.trim() !== '' && playerB.trim() !== ''
  
  const handleStart = () => {
    reset()
    const finalPoints = useCustomPoints && customPoints ? parseInt(customPoints) : pointsToWin
    setSetup(playerA.trim(), playerB.trim(), bestOf, finalPoints)
    router.push('/badminton/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Badminton">
      <Card className="space-y-6">
        <Input label="Player/Team A" placeholder="Enter name" value={playerA} onChange={(e) => setPlayerA(e.target.value)} />
        <Input label="Player/Team B" placeholder="Enter name" value={playerB} onChange={(e) => setPlayerB(e.target.value)} />
        
        <SelectButtons 
          label="Match Format" 
          options={BEST_OF_OPTIONS} 
          value={bestOf} 
          onChange={(v) => setBestOf(v as number)} 
        />
        
        <div>
          <SelectButtons 
            label="Points per Game" 
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
