'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel, TimerDisplay } from '@/components/game'
import { Button, Card, Modal, Input } from '@/components/ui'
import { useRugbyStore } from '@/stores/rugbyStore'
import { formatTime } from '@/lib/utils'

export default function RugbyGamePage() {
  const router = useRouter()
  const store = useRugbyStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [cardModal, setCardModal] = useState<{ open: boolean; team: 'home' | 'away'; type: 'yellow' | 'red' }>({ 
    open: false, team: 'home', type: 'yellow' 
  })
  const [conversionModal, setConversionModal] = useState(false)
  const [playerName, setPlayerName] = useState('')
  
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) {
      router.push('/rugby/setup')
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
  
  useEffect(() => {
    if (store.canConvert) {
      setConversionModal(true)
    }
  }, [store.canConvert])
  
  const handleReset = () => {
    if (confirm('Reset match? All progress will be lost.')) {
      store.reset()
      router.push('/rugby/setup')
    }
  }
  
  const handleCardSubmit = () => {
    if (playerName.trim()) {
      store.addCard(cardModal.team, cardModal.type, playerName.trim())
      setCardModal({ open: false, team: 'home', type: 'yellow' })
      setPlayerName('')
    }
  }
  
  if (!store.homeTeam) return null
  
  const halfLabel = store.currentHalf === 1 ? '1ST HALF' : '2ND HALF'
  
  return (
    <GameLayout
      title={halfLabel}
      onUndo={store.undo}
      onReset={handleReset}
      canUndo={store.actions.length > 0}
    >
      <div className="text-center mb-4">
        <TimerDisplay 
          seconds={store.timerSeconds} 
          isRunning={store.isRunning}
          size="lg"
        />
      </div>
      
      <Scoreboard
        homeTeam={store.homeTeam}
        awayTeam={store.awayTeam}
        homeScore={store.homeScore}
        awayScore={store.awayScore}
        homeExtra={
          <div className="space-y-2">
            <div className="flex justify-center gap-3 text-xs text-text-muted">
              <span>T: {store.homeTries}</span>
              <span>C: {store.homeConversions}</span>
              <span>P: {store.homePenalties}</span>
              <span>D: {store.homeDropGoals}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {store.homeYellowCards.map((c, i) => (
                <span key={`y-${i}`} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  🟨 {c.playerName} {c.secondsRemaining ? formatTime(c.secondsRemaining) : ''}
                </span>
              ))}
              {store.homeRedCards.map((c, i) => (
                <span key={`r-${i}`} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  🟥 {c.playerName}
                </span>
              ))}
            </div>
          </div>
        }
        awayExtra={
          <div className="space-y-2">
            <div className="flex justify-center gap-3 text-xs text-text-muted">
              <span>T: {store.awayTries}</span>
              <span>C: {store.awayConversions}</span>
              <span>P: {store.awayPenalties}</span>
              <span>D: {store.awayDropGoals}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {store.awayYellowCards.map((c, i) => (
                <span key={`y-${i}`} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  🟨 {c.playerName} {c.secondsRemaining ? formatTime(c.secondsRemaining) : ''}
                </span>
              ))}
              {store.awayRedCards.map((c, i) => (
                <span key={`r-${i}`} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  🟥 {c.playerName}
                </span>
              ))}
            </div>
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
            <Button variant="primary" className="w-full" onClick={() => store.addTry('home')}>Try (+5)</Button>
            <Button variant="secondary" className="w-full" onClick={() => store.addPenalty('home')}>Penalty (+3)</Button>
            <Button variant="secondary" className="w-full" onClick={() => store.addDropGoal('home')}>Drop Goal (+3)</Button>
            <Button variant="outline" className="w-full" onClick={() => store.addPenaltyTry('home')}>Penalty Try (+7)</Button>
          </>
        }
        centerControls={
          <>
            {store.isRunning ? (
              <Button variant="danger" className="w-full" onClick={store.stopTimer}>Stop</Button>
            ) : (
              <Button variant="success" className="w-full" onClick={store.startTimer}>Start</Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="warning" size="sm" onClick={() => setCardModal({ open: true, team: 'home', type: 'yellow' })}>
                Yellow
              </Button>
              <Button variant="danger" size="sm" onClick={() => setCardModal({ open: true, team: 'home', type: 'red' })}>
                Red
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={store.endHalf}>
              {store.currentHalf === 1 ? 'End 1st Half' : 'End Match'}
            </Button>
          </>
        }
        awayControls={
          <>
            <Button variant="primary" className="w-full" onClick={() => store.addTry('away')}>Try (+5)</Button>
            <Button variant="secondary" className="w-full" onClick={() => store.addPenalty('away')}>Penalty (+3)</Button>
            <Button variant="secondary" className="w-full" onClick={() => store.addDropGoal('away')}>Drop Goal (+3)</Button>
            <Button variant="outline" className="w-full" onClick={() => store.addPenaltyTry('away')}>Penalty Try (+7)</Button>
          </>
        }
      />
      )}
      
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Match Complete</h2>
          <p className="text-text-muted mb-4">
            Final: {store.homeTeam} {store.homeScore} - {store.awayScore} {store.awayTeam}
          </p>
          <Button variant="primary" onClick={handleReset}>New Match</Button>
        </Card>
      )}
      
      {/* Conversion Modal */}
      <Modal
        isOpen={conversionModal && store.canConvert}
        onClose={() => {}}
        title={`Conversion - ${store.lastTryTeam === 'home' ? store.homeTeam : store.awayTeam}`}
        actions={
          <>
            <Button variant="ghost" className="flex-1" onClick={() => {
              store.addConversion(store.lastTryTeam!, false)
              setConversionModal(false)
            }}>
              Missed
            </Button>
            <Button variant="success" className="flex-1" onClick={() => {
              store.addConversion(store.lastTryTeam!, true)
              setConversionModal(false)
            }}>
              Made (+2)
            </Button>
          </>
        }
      >
        <p className="text-text-muted">Did the conversion kick succeed?</p>
      </Modal>
      
      {/* Card Modal */}
      <Modal
        isOpen={cardModal.open}
        onClose={() => setCardModal({ open: false, team: 'home', type: 'yellow' })}
        title={`${cardModal.type === 'yellow' ? 'Yellow' : 'Red'} Card`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setCardModal({ open: false, team: 'home', type: 'yellow' })}>Cancel</Button>
            <Button variant="primary" onClick={handleCardSubmit} disabled={!playerName.trim()}>Add Card</Button>
          </>
        }
      >
        <Input
          label="Player Name/Number"
          placeholder="Enter player"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </Modal>
    </GameLayout>
  )
}
