'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel, TimerDisplay } from '@/components/game'
import { Button, Card, Modal, Input } from '@/components/ui'
import { useHandballStore } from '@/stores/handballStore'
import { formatTime } from '@/lib/utils'

export default function HandballGamePage() {
  const router = useRouter()
  const store = useHandballStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [suspensionModal, setSuspensionModal] = useState<{ open: boolean; team: 'home' | 'away' }>({ open: false, team: 'home' })
  const [playerName, setPlayerName] = useState('')
  
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) router.push('/handball/setup')
  }, [])
  
  useEffect(() => {
    if (store.isRunning) {
      timerRef.current = setInterval(() => store.tick(), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [store.isRunning])
  
  const handleReset = () => {
    if (confirm('Reset match?')) {
      store.reset()
      router.push('/handball/setup')
    }
  }
  
  const handleSuspensionSubmit = () => {
    if (playerName.trim()) {
      store.addSuspension(suspensionModal.team, playerName.trim())
      setSuspensionModal({ open: false, team: 'home' })
      setPlayerName('')
    }
  }
  
  if (!store.homeTeam) return null
  
  return (
    <GameLayout title={store.currentHalf === 1 ? '1ST HALF' : '2ND HALF'} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      <div className="text-center mb-4">
        <TimerDisplay seconds={store.timerSeconds} isRunning={store.isRunning} isDanger={store.timerSeconds <= 60} size="lg" />
      </div>
      
      <Scoreboard
        homeTeam={store.homeTeam}
        awayTeam={store.awayTeam}
        homeScore={store.homeScore}
        awayScore={store.awayScore}
        homeExtra={
          <div className="space-y-1">
            {store.homeSuspensions.map((s, i) => (
              <div key={i} className="text-xs bg-action-warning/10 text-action-warning px-2 py-1 rounded">
                {s.player}: {formatTime(s.secondsRemaining)} ({s.count}/3)
              </div>
            ))}
          </div>
        }
        awayExtra={
          <div className="space-y-1">
            {store.awaySuspensions.map((s, i) => (
              <div key={i} className="text-xs bg-action-warning/10 text-action-warning px-2 py-1 rounded">
                {s.player}: {formatTime(s.secondsRemaining)} ({s.count}/3)
              </div>
            ))}
          </div>
        }
      />
      
      {!store.isComplete && (
      <ControlPanel
        homeLabel={store.homeTeam}
        awayLabel={store.awayTeam}
        centerLabel="Match"
        homeControls={
          <>
            <Button variant="primary" className="w-full" onClick={() => store.addGoal('home')}>Goal</Button>
            <Button variant="warning" className="w-full" onClick={() => setSuspensionModal({ open: true, team: 'home' })}>2 Min</Button>
            <Button variant="outline" className="w-full" onClick={() => store.useTimeout('home')} disabled={store.homeTimeouts === 0 || store.homeTimeoutsUsedThisHalf >= 2}>
              Timeout ({store.homeTimeouts})
            </Button>
          </>
        }
        centerControls={
          <>
            {store.isRunning ? (
              <Button variant="danger" className="w-full" onClick={store.stopTimer}>Stop</Button>
            ) : (
              <Button variant="success" className="w-full" onClick={store.startTimer}>Start</Button>
            )}
            <Button variant="outline" className="w-full" onClick={store.endHalf}>
              {store.currentHalf === 1 ? 'End 1st Half' : 'End Match'}
            </Button>
          </>
        }
        awayControls={
          <>
            <Button variant="primary" className="w-full" onClick={() => store.addGoal('away')}>Goal</Button>
            <Button variant="warning" className="w-full" onClick={() => setSuspensionModal({ open: true, team: 'away' })}>2 Min</Button>
            <Button variant="outline" className="w-full" onClick={() => store.useTimeout('away')} disabled={store.awayTimeouts === 0 || store.awayTimeoutsUsedThisHalf >= 2}>
              Timeout ({store.awayTimeouts})
            </Button>
          </>
        }
      />
      )}
      
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold mb-2">Match Complete</h2>
          <p className="text-text-muted mb-4">{store.homeTeam} {store.homeScore} - {store.awayScore} {store.awayTeam}</p>
          <Button variant="primary" onClick={handleReset}>New Match</Button>
        </Card>
      )}
      
      <Modal isOpen={suspensionModal.open} onClose={() => setSuspensionModal({ open: false, team: 'home' })} title="2-Minute Suspension"
        actions={<><Button variant="ghost" onClick={() => setSuspensionModal({ open: false, team: 'home' })}>Cancel</Button><Button variant="primary" onClick={handleSuspensionSubmit} disabled={!playerName.trim()}>Add</Button></>}>
        <Input label="Player" placeholder="Enter player name/number" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
      </Modal>
    </GameLayout>
  )
}
