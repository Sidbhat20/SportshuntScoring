'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { useSnookerStore } from '@/stores/snookerStore'

export default function SnookerSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useSnookerStore()
  const [playerA, setPlayerA] = useState('')
  const [playerB, setPlayerB] = useState('')
  const [bestOf, setBestOf] = useState<number>(7)
  const canStart = playerA.trim() !== '' && playerB.trim() !== ''
  
  const handleStart = () => {
    reset()
    setSetup(playerA.trim(), playerB.trim(), bestOf)
    router.push('/snooker/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Snooker">
      <Card className="space-y-6">
        <Input label="Player A" placeholder="Enter name" value={playerA} onChange={(e) => setPlayerA(e.target.value)} />
        <Input label="Player B" placeholder="Enter name" value={playerB} onChange={(e) => setPlayerB(e.target.value)} />
        <SelectButtons label="Match Format" options={[{ value: 3, label: 'Best of 3' }, { value: 5, label: 'Best of 5' }, { value: 7, label: 'Best of 7' }, { value: 9, label: 'Best of 9' }, { value: 11, label: 'Best of 11' }]} value={bestOf} onChange={(v) => setBestOf(v as number)} />
        <Button variant="primary" disabled={!canStart} onClick={handleStart} className="w-full">Start Match</Button>
      </Card>
    </SetupLayout>
  )
}
