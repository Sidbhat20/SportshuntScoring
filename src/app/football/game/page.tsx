'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel, TimerDisplay } from '@/components/game'
import { Button, Card, Modal, Input } from '@/components/ui'
import { useFootballStore } from '@/stores/footballStore'

export default function FootballGamePage() {
  const router = useRouter()
  const store = useFootballStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [cardModal, setCardModal] = useState<{ open: boolean; team: 'home' | 'away'; type: 'yellow' | 'red' }>({ 
    open: false, 
    team: 'home', 
    type: 'yellow' 
  })
  const [playerName, setPlayerName] = useState('')
  const [showDrawOptions, setShowDrawOptions] = useState(false)
  const [extraTimeMinutes, setExtraTimeMinutes] = useState('15')
  
  // Load state and redirect if not setup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) {
      router.push('/football/setup')
    }
  }, [])
  
  // Timer effect
  useEffect(() => {
    if (store.isRunning) {
      timerRef.current = setInterval(() => {
        store.tick()
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [store.isRunning])
  
  const openCardModal = (team: 'home' | 'away', type: 'yellow' | 'red') => {
    setCardModal({ open: true, team, type })
    setPlayerName('')
  }
  
  const handleCardSubmit = () => {
    if (playerName.trim()) {
      store.addCard(cardModal.team, cardModal.type, playerName.trim())
      setCardModal({ open: false, team: 'home', type: 'yellow' })
      setPlayerName('')
    }
  }
  
  const handleEndPhase = () => {
    const isDraw = store.homeScore === store.awayScore
    const isRegularTimeEnd = store.gamePhase === 'second-half'
    const isExtraTimeEnd = store.gamePhase === 'extra-second'
    
    if ((isRegularTimeEnd || isExtraTimeEnd) && isDraw) {
      store.endPhase()
      setShowDrawOptions(true)
    } else {
      store.endPhase()
      if (store.gamePhase === 'second-half' || store.gamePhase === 'extra-second') {
        // Non-draw ending
      }
    }
  }
  
  const handleReset = () => {
    if (confirm('Reset match? All progress will be lost.')) {
      store.reset()
      router.push('/football/setup')
    }
  }
  
  const getYellowWarning = () => {
    if (cardModal.type !== 'yellow' || !playerName.trim()) return null
    const existingYellows = cardModal.team === 'home' ? store.homeYellowCards : store.awayYellowCards
    const hasYellow = existingYellows.some(c => c.playerName.toLowerCase() === playerName.trim().toLowerCase())
    if (hasYellow) {
      return 'This player already has a yellow card. This will result in a RED card.'
    }
    return null
  }
  
  if (!store.homeTeam) {
    return null
  }
  
  const getPhaseLabel = () => {
    switch (store.gamePhase) {
      case 'first-half': return '1ST HALF'
      case 'second-half': return '2ND HALF'
      case 'extra-first': return 'EXTRA TIME 1ST'
      case 'extra-second': return 'EXTRA TIME 2ND'
      case 'penalties': return 'PENALTY SHOOTOUT'
      case 'complete': return 'MATCH COMPLETE'
    }
  }
  
  const getEndPhaseLabel = () => {
    switch (store.gamePhase) {
      case 'first-half': return 'End 1st Half'
      case 'second-half': return 'End 2nd Half'
      case 'extra-first': return 'End ET 1st'
      case 'extra-second': return 'End ET 2nd'
      default: return 'End'
    }
  }
  
  const stoppageLabel = store.stoppageTime > 0 ? `+${store.stoppageTime}` : ''
  
  // Penalty shootout stats
  const homeScored = store.homePenalties.filter(Boolean).length
  const awayScored = store.awayPenalties.filter(Boolean).length
  const isComplete = store.gamePhase === 'complete'
  
  // Check if regular time or extra time just ended with draw (show options)
  const showEndOptions = showDrawOptions && !isComplete && store.gamePhase !== 'penalties'
  
  return (
    <GameLayout
      title={getPhaseLabel()}
      subtitle={stoppageLabel && store.gamePhase !== 'penalties' ? `Stoppage: ${stoppageLabel} min` : undefined}
      onUndo={store.undo}
      onReset={handleReset}
      canUndo={store.actions.length > 0}
    >
      {/* Timer (not shown during penalties) */}
      {store.gamePhase !== 'penalties' && store.gamePhase !== 'complete' && (
        <div className="text-center mb-4">
          <TimerDisplay 
            seconds={store.timerSeconds} 
            isRunning={store.isRunning}
            size="lg"
          />
        </div>
      )}
      
      {/* Scoreboard */}
      <Scoreboard
        homeTeam={store.homeTeam}
        awayTeam={store.awayTeam}
        homeScore={store.homeScore}
        awayScore={store.awayScore}
        homeExtra={
          <div className="flex flex-wrap justify-center gap-1">
            {store.homeYellowCards.map((card, i) => (
              <span key={`y-${i}`} className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                🟨 {card.playerName} {card.minute}'
              </span>
            ))}
            {store.homeRedCards.map((card, i) => (
              <span key={`r-${i}`} className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                🟥 {card.playerName} {card.minute}'
              </span>
            ))}
          </div>
        }
        awayExtra={
          <div className="flex flex-wrap justify-center gap-1">
            {store.awayYellowCards.map((card, i) => (
              <span key={`y-${i}`} className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                🟨 {card.playerName} {card.minute}'
              </span>
            ))}
            {store.awayRedCards.map((card, i) => (
              <span key={`r-${i}`} className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                🟥 {card.playerName} {card.minute}'
              </span>
            ))}
          </div>
        }
      />
      
      {/* Penalty Shootout Display */}
      {store.gamePhase === 'penalties' && (
        <Card className="mt-4">
          <h3 className="text-lg font-semibold text-text-primary text-center mb-4">
            Penalty Shootout - Round {store.currentPenaltyRound <= 5 ? store.currentPenaltyRound : `${store.currentPenaltyRound} (Sudden Death)`}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-text-muted text-center mb-2">{store.homeTeam}</h4>
              <div className="flex justify-center gap-2 flex-wrap">
                {store.homePenalties.map((scored, i) => (
                  <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${scored ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {scored ? '✓' : '✗'}
                  </span>
                ))}
                {store.homePenalties.length < 5 && Array(5 - store.homePenalties.length).fill(0).map((_, i) => (
                  <span key={`empty-${i}`} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-400">
                    -
                  </span>
                ))}
              </div>
              <p className="text-center mt-2 text-lg font-bold">{homeScored}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-text-muted text-center mb-2">{store.awayTeam}</h4>
              <div className="flex justify-center gap-2 flex-wrap">
                {store.awayPenalties.map((scored, i) => (
                  <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${scored ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {scored ? '✓' : '✗'}
                  </span>
                ))}
                {store.awayPenalties.length < 5 && Array(5 - store.awayPenalties.length).fill(0).map((_, i) => (
                  <span key={`empty-${i}`} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-400">
                    -
                  </span>
                ))}
              </div>
              <p className="text-center mt-2 text-lg font-bold">{awayScored}</p>
            </div>
          </div>
          
          <p className="text-center text-sm text-text-muted">
            {store.penaltyTeam === 'home' ? store.homeTeam : store.awayTeam} to take penalty
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="success"
              onClick={() => store.recordPenalty(store.penaltyTeam, true)}
              className="w-full"
            >
              Scored
            </Button>
            <Button
              variant="danger"
              onClick={() => store.recordPenalty(store.penaltyTeam, false)}
              className="w-full"
            >
              Missed
            </Button>
          </div>
        </Card>
      )}
      
      {/* Controls (not shown during penalties) */}
      {store.gamePhase !== 'penalties' && store.gamePhase !== 'complete' && (
        <ControlPanel
          homeLabel={store.homeTeam}
          awayLabel={store.awayTeam}
          centerLabel="Match"
          homeControls={
            <>
              <Button variant="primary" className="w-full" onClick={() => store.addGoal('home')}>
                Goal
              </Button>
              <Button variant="warning" className="w-full" onClick={() => openCardModal('home', 'yellow')}>
                Yellow Card
              </Button>
              <Button variant="danger" className="w-full" onClick={() => openCardModal('home', 'red')}>
                Red Card
              </Button>
            </>
          }
          centerControls={
            <>
              {store.isRunning ? (
                <Button variant="danger" className="w-full" onClick={store.stopTimer}>
                  Stop
                </Button>
              ) : (
                <Button variant="success" className="w-full" onClick={store.startTimer}>
                  Start
                </Button>
              )}
              <Button variant="secondary" className="w-full" onClick={store.addStoppage}>
                +1 Stoppage
              </Button>
              <Button variant="outline" className="w-full" onClick={handleEndPhase}>
                {getEndPhaseLabel()}
              </Button>
            </>
          }
          awayControls={
            <>
              <Button variant="primary" className="w-full" onClick={() => store.addGoal('away')}>
                Goal
              </Button>
              <Button variant="warning" className="w-full" onClick={() => openCardModal('away', 'yellow')}>
                Yellow Card
              </Button>
              <Button variant="danger" className="w-full" onClick={() => openCardModal('away', 'red')}>
                Red Card
              </Button>
            </>
          }
        />
      )}
      
      {/* Draw Options Modal */}
      {showEndOptions && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Match Ended in Draw</h2>
          <p className="text-text-muted mb-4">
            Score: {store.homeTeam} {store.homeScore} - {store.awayScore} {store.awayTeam}
          </p>
          <div className="space-y-3">
            {store.gamePhase !== 'extra-second' && (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <label className="text-sm text-text-muted">Extra Time per half:</label>
                  <Input
                    type="number"
                    value={extraTimeMinutes}
                    onChange={(e) => setExtraTimeMinutes(e.target.value)}
                    className="w-20 text-center"
                    min={1}
                    max={30}
                  />
                  <span className="text-sm text-text-muted">min</span>
                </div>
                <Button variant="primary" className="w-full" onClick={() => { 
                  const mins = parseInt(extraTimeMinutes) || 15;
                  store.setExtraTimeDuration(mins * 60);
                  setShowDrawOptions(false); 
                  store.startExtraTime(); 
                }}>
                  Start Extra Time (2×{extraTimeMinutes || 15} min)
                </Button>
              </>
            )}
            <Button variant="secondary" className="w-full" onClick={() => { setShowDrawOptions(false); store.startPenalties(); }}>
              Go to Penalty Shootout
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { setShowDrawOptions(false); store.endAsDraw(); }}>
              End as Draw
            </Button>
          </div>
        </Card>
      )}
      
      {/* Match Complete */}
      {isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Match Complete</h2>
          <p className="text-text-muted mb-2">
            Final Score: {store.homeTeam} {store.homeScore} - {store.awayScore} {store.awayTeam}
          </p>
          {store.homePenalties.length > 0 && (
            <p className="text-text-muted mb-4">
              Penalties: {homeScored} - {awayScored}
            </p>
          )}
          <Button variant="primary" onClick={handleReset}>
            New Match
          </Button>
        </Card>
      )}
      
      {/* Card Modal */}
      <Modal
        isOpen={cardModal.open}
        onClose={() => setCardModal({ open: false, team: 'home', type: 'yellow' })}
        title={`${cardModal.type === 'yellow' ? 'Yellow' : 'Red'} Card - ${cardModal.team === 'home' ? store.homeTeam : store.awayTeam}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setCardModal({ open: false, team: 'home', type: 'yellow' })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCardSubmit} disabled={!playerName.trim()}>
              Add Card
            </Button>
          </>
        }
      >
        <Input
          label="Player Name"
          placeholder="Enter player name or number"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          autoFocus
        />
        {getYellowWarning() && (
          <p className="mt-2 text-sm text-action-warning">{getYellowWarning()}</p>
        )}
      </Modal>
    </GameLayout>
  )
}
