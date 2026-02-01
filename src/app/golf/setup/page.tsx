'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupLayout } from '@/components/layout'
import { Card, Input, Button, SelectButtons } from '@/components/ui'
import { useGolfStore } from '@/stores/golfStore'

export default function GolfSetupPage() {
  const router = useRouter()
  const { setSetup, reset } = useGolfStore()
  const [players, setPlayers] = useState(['', ''])
  const [holes, setHoles] = useState<number>(18)
  const [gameMode, setGameMode] = useState<'stroke' | 'match'>('stroke')
  
  const canStart = players.filter(p => p.trim() !== '').length >= 2
  
  const addPlayer = () => { if (players.length < 4) setPlayers([...players, '']) }
  const updatePlayer = (index: number, value: string) => {
    const newPlayers = [...players]
    newPlayers[index] = value
    setPlayers(newPlayers)
  }
  
  const handleStart = () => {
    reset()
    const validPlayers = players.filter(p => p.trim() !== '').map(p => p.trim())
    const parPerHole = Array(holes).fill(4)
    setSetup(validPlayers, holes, gameMode, parPerHole)
    router.push('/golf/game')
  }
  
  return (
    <SetupLayout title="Round Setup" sportName="Golf">
      <Card className="space-y-6">
        {players.map((player, i) => (
          <Input key={i} label={`Player ${i + 1}`} placeholder="Enter name" value={player} onChange={(e) => updatePlayer(i, e.target.value)} />
        ))}
        {players.length < 4 && (
          <Button variant="ghost" onClick={addPlayer} className="w-full">+ Add Player</Button>
        )}
        <SelectButtons label="Number of Holes" options={[{ value: 9, label: '9 Holes' }, { value: 18, label: '18 Holes' }]} value={holes} onChange={(v) => setHoles(v as number)} />
        <SelectButtons label="Game Mode" options={[{ value: 'stroke', label: 'Stroke Play' }, { value: 'match', label: 'Match Play' }]} value={gameMode} onChange={(v) => setGameMode(v as 'stroke' | 'match')} />
        <Button variant="primary" disabled={!canStart} onClick={handleStart} className="w-full">Start Round</Button>
      </Card>
    </SetupLayout>
  )
}
