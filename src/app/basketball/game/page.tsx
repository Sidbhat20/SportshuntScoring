'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel, TimerDisplay } from '@/components/game'
import { Button, Card } from '@/components/ui'
import { useBasketballStore } from '@/stores/basketballStore'

export default function BasketballGamePage() {
  const router = useRouter()
  const store = useBasketballStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const violationTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) {
      router.push('/basketball/setup')
    }
  }, [])
  
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
  
  // Handle shot clock violation - auto reset after 2 seconds
  useEffect(() => {
    if (store.shotClockViolation) {
      violationTimerRef.current = setTimeout(() => {
        store.clearViolation()
      }, 2000)
    }
    return () => {
      if (violationTimerRef.current) {
        clearTimeout(violationTimerRef.current)
      }
    }
  }, [store.shotClockViolation])
  
  const handleReset = () => {
    if (confirm('Reset game? All progress will be lost.')) {
      store.reset()
      router.push('/basketball/setup')
    }
  }
  
  if (!store.homeTeam) {
    return null
  }
  
  const quarterLabel = `Q${store.currentQuarter}`
  
  return (
    <GameLayout
      title={quarterLabel}
      onUndo={store.undo}
      onReset={handleReset}
      canUndo={store.actions.length > 0}
    >
      {/* Shot Clock Violation Alert */}
      {store.shotClockViolation && (
        <div className="bg-action-danger text-white text-center py-2 px-4 rounded-lg mb-4 animate-pulse">
          SHOT CLOCK VIOLATION - Auto-resetting in 2 seconds...
        </div>
      )}
      
      {/* Timers */}
      <div className="flex justify-center items-center gap-8 mb-4">
        <div className="text-center">
          <TimerDisplay 
            seconds={store.gameClockSeconds} 
            isRunning={store.isRunning}
            isDanger={store.gameClockSeconds <= 60}
            size="lg"
          />
          <div className="text-xs text-text-muted uppercase mt-1">Game Clock</div>
        </div>
        <div className="text-center">
          <div className={`font-mono text-3xl font-bold tabular-nums ${store.shotClockSeconds <= 5 || store.shotClockViolation ? 'text-action-danger' : 'text-text-primary'}`}>
            {store.shotClockSeconds}
          </div>
          <div className="text-xs text-text-muted uppercase mt-1">Shot Clock</div>
        </div>
      </div>
      
      {/* Scoreboard */}
      <Scoreboard
        homeTeam={store.homeTeam}
        awayTeam={store.awayTeam}
        homeScore={store.homeScore}
        awayScore={store.awayScore}
        homeExtra={
          <div className="flex justify-center gap-4 text-sm">
            <span className={`${store.homeFouls >= 5 ? 'text-action-danger font-medium' : 'text-text-muted'}`}>
              Fouls: {store.homeFouls}{store.homeFouls >= 5 && ' (BONUS)'}
            </span>
            <span className="text-text-muted">TO: {store.homeTimeouts}</span>
          </div>
        }
        awayExtra={
          <div className="flex justify-center gap-4 text-sm">
            <span className={`${store.awayFouls >= 5 ? 'text-action-danger font-medium' : 'text-text-muted'}`}>
              Fouls: {store.awayFouls}{store.awayFouls >= 5 && ' (BONUS)'}
            </span>
            <span className="text-text-muted">TO: {store.awayTimeouts}</span>
          </div>
        }
      />
      
      {/* Controls - disabled when game is complete */}
      {!store.isComplete && (
      <ControlPanel
        homeLabel={store.homeTeam}
        awayLabel={store.awayTeam}
        centerLabel="Game"
        homeControls={
          <>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => store.addPoints('home', 1)}>+1</Button>
              <Button variant="secondary" onClick={() => store.addPoints('home', 2)}>+2</Button>
              <Button variant="secondary" onClick={() => store.addPoints('home', 3)}>+3</Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => store.addFoul('home')}>
              Foul
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => store.useTimeout('home')}
              disabled={store.homeTimeouts === 0}
            >
              Timeout ({store.homeTimeouts})
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
              <Button variant="success" className="w-full" onClick={store.startTimer} disabled={store.shotClockViolation}>
                Start
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => store.resetShotClock(24)}>
                24 sec
              </Button>
              <Button variant="secondary" onClick={() => store.resetShotClock(14)}>
                14 sec
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={store.nextQuarter}>
              {store.currentQuarter < 4 ? 'Next Quarter' : 'End Game'}
            </Button>
          </>
        }
        awayControls={
          <>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => store.addPoints('away', 1)}>+1</Button>
              <Button variant="secondary" onClick={() => store.addPoints('away', 2)}>+2</Button>
              <Button variant="secondary" onClick={() => store.addPoints('away', 3)}>+3</Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => store.addFoul('away')}>
              Foul
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => store.useTimeout('away')}
              disabled={store.awayTimeouts === 0}
            >
              Timeout ({store.awayTimeouts})
            </Button>
          </>
        }
      />
      )}
      
      {/* Game Complete */}
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Game Complete</h2>
          <p className="text-text-muted mb-4">
            Final Score: {store.homeTeam} {store.homeScore} - {store.awayScore} {store.awayTeam}
          </p>
          <Button variant="primary" onClick={handleReset}>
            New Game
          </Button>
        </Card>
      )}
    </GameLayout>
  )
}
