'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { usePickleballStore } from '@/stores/pickleballStore'

const POINTS_TO_WIN_OPTIONS = [
  { value: 11, label: '11' },
  { value: 15, label: '15' },
  { value: 21, label: '21' },
]

const SETS_TO_WIN_OPTIONS = [
  { value: 1, label: '1 Game' },
  { value: 2, label: 'Best of 3' },
  { value: 3, label: 'Best of 5' },
]

const GAME_TYPE_OPTIONS = [
  { value: 'singles', label: 'Singles' },
  { value: 'doubles', label: 'Doubles' },
]

export default function PickleballSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = usePickleballStore()
  
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [pointsToWin, setPointsToWin] = useState<number>(11)
  const [setsToWin, setSetsToWin] = useState<number>(1)
  const [gameType, setGameType] = useState<string>('singles')
  const [customPoints, setCustomPoints] = useState<string>('')
  const [useCustomPoints, setUseCustomPoints] = useState(false)
  
  const canStart = team1.trim() !== '' && team2.trim() !== ''
  
  const handleStart = () => {
    reset()
    const finalPoints = useCustomPoints && customPoints ? parseInt(customPoints) : pointsToWin
    setSetup(
      team1.trim(), 
      team2.trim(), 
      finalPoints, 
      setsToWin, 
      true, // win by two always for pickleball
      gameType === 'doubles'
    )
    router.push('/pickleball/game')
  }
  
  return (
    <SetupLayout title="Game Setup" sportName="Pickleball">
      <Card className="space-y-6">
        <Input
          label={gameType === 'doubles' ? 'Team 1' : 'Player 1'}
          placeholder={gameType === 'doubles' ? 'Enter team 1 name' : 'Enter player 1 name'}
          value={team1}
          onChange={(e) => setTeam1(e.target.value)}
        />
        
        <Input
          label={gameType === 'doubles' ? 'Team 2' : 'Player 2'}
          placeholder={gameType === 'doubles' ? 'Enter team 2 name' : 'Enter player 2 name'}
          value={team2}
          onChange={(e) => setTeam2(e.target.value)}
        />
        
        <SelectButtons
          label="Game Type"
          options={GAME_TYPE_OPTIONS}
          value={gameType}
          onChange={(v) => setGameType(v as string)}
        />
        
        <div>
          <SelectButtons
            label="Points to Win"
            options={POINTS_TO_WIN_OPTIONS}
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
        
        <SelectButtons
          label="Match Format"
          options={SETS_TO_WIN_OPTIONS}
          value={setsToWin}
          onChange={(v) => setSetsToWin(v as number)}
        />
        
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
