'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { useTennisStore } from '@/stores/tennisStore'

const FORMAT_OPTIONS = [
  { value: 3, label: 'Best of 3' },
  { value: 5, label: 'Best of 5' },
]

export default function TennisSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useTennisStore()
  
  const [playerA, setPlayerA] = useState('')
  const [playerB, setPlayerB] = useState('')
  const [bestOf, setBestOf] = useState<3 | 5>(3)
  
  const canStart = playerA.trim() !== '' && playerB.trim() !== ''
  
  const handleStart = () => {
    reset()
    setSetup(playerA.trim(), playerB.trim(), bestOf)
    router.push('/tennis/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Tennis">
      <Card className="space-y-6">
        <Input
          label="Player A"
          placeholder="Enter player name"
          value={playerA}
          onChange={(e) => setPlayerA(e.target.value)}
        />
        
        <Input
          label="Player B"
          placeholder="Enter player name"
          value={playerB}
          onChange={(e) => setPlayerB(e.target.value)}
        />
        
        <SelectButtons
          label="Match Format"
          options={FORMAT_OPTIONS}
          value={bestOf}
          onChange={(v) => setBestOf(v as 3 | 5)}
        />
        
        <Button
          variant="primary"
          disabled={!canStart}
          onClick={handleStart}
          className="w-full"
        >
          Start Match
        </Button>
      </Card>
    </SetupLayout>
  )
}
