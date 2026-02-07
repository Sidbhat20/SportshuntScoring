'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel, TimerDisplay } from '@/components/game'
import { Button, Card, Modal, Input, SelectButtons } from '@/components/ui'
import { useHockeyStore } from '@/stores/hockeyStore'
import { formatTime } from '@/lib/utils'

export default function HockeyGamePage() {
  const router = useRouter()
  const store = useHockeyStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [penaltyModal, setPenaltyModal] = useState<{ open: boolean; team: 'home' | 'away' }>({ open: false, team: 'home' })
  const [playerName, setPlayerName] = useState('')
  const [penaltyType, setPenaltyType] = useState<'minor' | 'major'>('minor')
  const [timeEditModal, setTimeEditModal] = useState(false)
  const [minutes, setMinutes] = useState('0')
  const [seconds, setSeconds] = useState('0')
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) {
      router.push('/hockey/setup')
    }
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
    if (confirm('Reset game? All progress will be lost.')) {
      store.reset()
      router.push('/hockey/setup')
    }
  }
  
  const openTimeEdit = () => {
    setMinutes(Math.floor(store.timerSeconds / 60).toString())
    setSeconds((store.timerSeconds % 60).toString())
    setTimeEditModal(true)
  }
  
  const handleTimeUpdate = () => {
    const totalSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
    store.setTimer(totalSeconds)
    setTimeEditModal(false)
  }
  
  const handlePenaltySubmit = () => {
    if (playerName.trim()) {
      store.addPenalty(penaltyModal.team, playerName.trim(), penaltyType)
      setPenaltyModal({ open: false, team: 'home' })
      setPlayerName('')
      setPenaltyType('minor')
    }
  }
  
  if (!store.homeTeam) return null
  
  const periodLabel = store.hockeyType === 'ice' 
    ? `P${store.currentPeriod}` 
    : `Q${store.currentPeriod}`
  
  return (
    <GameLayout
      title={periodLabel}
      subtitle={store.hockeyType === 'ice' ? 'Ice Hockey' : 'Field Hockey'}
      onUndo={store.undo}
      onReset={handleReset}
      canUndo={store.actions.length > 0}
    >
      <div className="text-center mb-4">
        <div className="flex items-center gap-2 justify-center mb-1">
          <button onClick={openTimeEdit} className="text-xs text-blue-600 hover:text-blue-700">⏱️ Edit</button>
        </div>
        <TimerDisplay 
          seconds={store.timerSeconds} 
          isRunning={store.isRunning}
          isDanger={store.timerSeconds <= 60}
          size="lg"
        />
      </div>
      
      <Scoreboard
        homeTeam={store.homeTeam}
        awayTeam={store.awayTeam}
        homeScore={store.homeScore}
        awayScore={store.awayScore}
        homeExtra={
          store.hockeyType === 'ice' && store.homePenalties.length > 0 && (
            <div className="space-y-1">
              {store.homePenalties.map((p, i) => (
                <div key={i} className="text-xs bg-action-danger/10 text-action-danger px-2 py-1 rounded">
                  {p.player}: {formatTime(p.seconds)}
                </div>
              ))}
            </div>
          )
        }
        awayExtra={
          store.hockeyType === 'ice' && store.awayPenalties.length > 0 && (
            <div className="space-y-1">
              {store.awayPenalties.map((p, i) => (
                <div key={i} className="text-xs bg-action-danger/10 text-action-danger px-2 py-1 rounded">
                  {p.player}: {formatTime(p.seconds)}
                </div>
              ))}
            </div>
          )
        }
      />
      
      {!store.isComplete && (
      <ControlPanel
        homeLabel={store.homeTeam}
        awayLabel={store.awayTeam}
        centerLabel="Game"
        homeControls={
          <>
            <Button variant="primary" className="w-full" onClick={() => store.addGoal('home')}>
              Goal
            </Button>
            {store.hockeyType === 'ice' && (
              <Button variant="outline" className="w-full" onClick={() => setPenaltyModal({ open: true, team: 'home' })}>
                Penalty
              </Button>
            )}
          </>
        }
        centerControls={
          <>
            {store.isRunning ? (
              <Button variant="danger" className="w-full" onClick={store.stopTimer}>Stop</Button>
            ) : (
              <Button variant="success" className="w-full" onClick={store.startTimer}>Start</Button>
            )}
            <Button variant="outline" className="w-full" onClick={store.endPeriod}>
              End {store.hockeyType === 'ice' ? 'Period' : 'Quarter'}
            </Button>
          </>
        }
        awayControls={
          <>
            <Button variant="primary" className="w-full" onClick={() => store.addGoal('away')}>
              Goal
            </Button>
            {store.hockeyType === 'ice' && (
              <Button variant="outline" className="w-full" onClick={() => setPenaltyModal({ open: true, team: 'away' })}>
                Penalty
              </Button>
            )}
          </>
        }
      />
      )}
      
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Game Complete</h2>
          <p className="text-text-muted mb-4">
            Final: {store.homeTeam} {store.homeScore} - {store.awayScore} {store.awayTeam}
          </p>
          <Button variant="primary" onClick={handleReset}>New Game</Button>
        </Card>
      )}
      
      <Modal
        isOpen={penaltyModal.open}
        onClose={() => setPenaltyModal({ open: false, team: 'home' })}
        title={`Penalty - ${penaltyModal.team === 'home' ? store.homeTeam : store.awayTeam}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setPenaltyModal({ open: false, team: 'home' })}>Cancel</Button>
            <Button variant="primary" onClick={handlePenaltySubmit} disabled={!playerName.trim()}>Add Penalty</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Player Name/Number"
            placeholder="Enter player"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <SelectButtons
            label="Penalty Type"
            options={[
              { value: 'minor', label: 'Minor (2 min)' },
              { value: 'major', label: 'Major (5 min)' },
            ]}
            value={penaltyType}
            onChange={(v) => setPenaltyType(v as 'minor' | 'major')}
          />
        </div>
      </Modal>
      
      {/* Time Edit Modal */}
      <Modal isOpen={timeEditModal} onClose={() => setTimeEditModal(false)} title="Edit Period Time">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              min="0"
            />
            <Input
              label="Seconds"
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              min="0"
              max="59"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <Button variant="outline" onClick={() => { setMinutes((parseInt(minutes) + 1).toString()) }}>+1 min</Button>
            <Button variant="outline" onClick={() => { setSeconds((parseInt(seconds) + 30).toString()) }}>+30 sec</Button>
            <Button variant="outline" onClick={() => { const newMin = Math.max(0, parseInt(minutes) - 1); setMinutes(newMin.toString()) }}>-1 min</Button>
          </div>
          <Button variant="primary" className="w-full" onClick={handleTimeUpdate}>Apply</Button>
        </div>
      </Modal>
    </GameLayout>
  )
}
