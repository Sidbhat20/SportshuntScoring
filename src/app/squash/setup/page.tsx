'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { useSquashStore } from '@/stores/squashStore'

export default function SquashSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useSquashStore()
  const [playerA, setPlayerA] = useState('')
  const [playerB, setPlayerB] = useState('')
  const [bestOf, setBestOf] = useState<3 | 5>(5)
  const [pointsToWin, setPointsToWin] = useState<11 | 15>(11)
  const canStart = playerA.trim() !== '' && playerB.trim() !== ''
  
  const handleStart = () => {
    reset()
    setSetup(playerA.trim(), playerB.trim(), bestOf, pointsToWin)
    router.push('/squash/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Squash">
      <Card className="space-y-6">
        <Input label="Player A" placeholder="Enter name" value={playerA} onChange={(e) => setPlayerA(e.target.value)} />
        <Input label="Player B" placeholder="Enter name" value={playerB} onChange={(e) => setPlayerB(e.target.value)} />
        <SelectButtons label="Match Format" options={[{ value: 3, label: 'Best of 3' }, { value: 5, label: 'Best of 5' }]} value={bestOf} onChange={(v) => setBestOf(v as 3 | 5)} />
        <SelectButtons label="Points per Game" options={[{ value: 11, label: '11 pts' }, { value: 15, label: '15 pts' }]} value={pointsToWin} onChange={(v) => setPointsToWin(v as 11 | 15)} />
        <Button variant="primary" disabled={!canStart} onClick={handleStart} className="w-full">Start Match</Button>
      </Card>
    </SetupLayout>
  )
}
