'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { usePoolStore } from '@/stores/poolStore'

export default function PoolSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = usePoolStore()
  const [playerA, setPlayerA] = useState('')
  const [playerB, setPlayerB] = useState('')
  const [gameType, setGameType] = useState<'8ball' | '9ball'>('8ball')
  const [raceTo, setRaceTo] = useState<number>(5)
  const canStart = playerA.trim() !== '' && playerB.trim() !== ''
  
  const handleStart = () => {
    reset()
    setSetup(playerA.trim(), playerB.trim(), gameType, raceTo)
    router.push('/pool/game')
  }
  
  return (
    <SetupLayout title="Match Setup" sportName="Pool">
      <Card className="space-y-6">
        <Input label="Player A" placeholder="Enter name" value={playerA} onChange={(e) => setPlayerA(e.target.value)} />
        <Input label="Player B" placeholder="Enter name" value={playerB} onChange={(e) => setPlayerB(e.target.value)} />
        <SelectButtons label="Game Type" options={[{ value: '8ball', label: '8-Ball' }, { value: '9ball', label: '9-Ball' }]} value={gameType} onChange={(v) => setGameType(v as '8ball' | '9ball')} />
        <SelectButtons label="Race To" options={[{ value: 3, label: '3' }, { value: 5, label: '5' }, { value: 7, label: '7' }, { value: 9, label: '9' }]} value={raceTo} onChange={(v) => setRaceTo(v as number)} />
        <Button variant="primary" disabled={!canStart} onClick={handleStart} className="w-full">Start Match</Button>
      </Card>
    </SetupLayout>
  )
}
