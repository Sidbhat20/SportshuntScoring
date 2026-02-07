'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel, TimerDisplay } from '@/components/game'
import { Button, Card } from '@/components/ui'
import { useWaterPoloStore } from '@/stores/waterpoloStore'

export default function WaterPoloGamePage() {
  const router = useRouter()
  const store = useWaterPoloStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) router.push('/waterpolo/setup')
  }, [])
  
  useEffect(() => {
    if (store.isRunning) {
      timerRef.current = setInterval(() => store.tick(), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [store.isRunning])
  
  const handleReset = () => { if (confirm('Reset game?')) { store.reset(); router.push('/waterpolo/setup') } }
  
  if (!store.homeTeam) return null
  
  return (
    <GameLayout title={`Q${store.currentPeriod}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      <div className="flex justify-center items-center gap-8 mb-4">
        <div className="text-center">
          <TimerDisplay seconds={store.periodSeconds} isRunning={store.isRunning} isDanger={store.periodSeconds <= 60} size="lg" />
          <div className="text-xs text-text-muted uppercase mt-1">Period</div>
        </div>
        <div className="text-center">
          <div className={`font-mono text-3xl font-bold tabular-nums ${store.shotClockSeconds <= 5 ? 'text-action-danger' : 'text-text-primary'}`}>{store.shotClockSeconds}</div>
          <div className="text-xs text-text-muted uppercase mt-1">Shot Clock</div>
        </div>
      </div>
      
      <Scoreboard homeTeam={store.homeTeam} awayTeam={store.awayTeam} homeScore={store.homeScore} awayScore={store.awayScore}
        homeExtra={<div className="text-sm text-text-muted">Exclusions: {store.homeExclusions} • TO: {store.homeTimeouts}</div>}
        awayExtra={<div className="text-sm text-text-muted">Exclusions: {store.awayExclusions} • TO: {store.awayTimeouts}</div>}
      />
      
      {!store.isComplete && (
      <ControlPanel homeLabel={store.homeTeam} awayLabel={store.awayTeam} centerLabel="Game"
        homeControls={<>
          <Button variant="primary" className="w-full" onClick={() => store.addGoal('home')}>Goal</Button>
          <Button variant="outline" className="w-full" onClick={() => store.addExclusion('home')}>Exclusion</Button>
          <Button variant="outline" className="w-full" onClick={() => store.useTimeout('home')} disabled={store.homeTimeouts === 0}>Timeout ({store.homeTimeouts})</Button>
        </>}
        centerControls={<>
          {store.isRunning ? <Button variant="danger" className="w-full" onClick={store.stopTimer}>Stop</Button> : <Button variant="success" className="w-full" onClick={store.startTimer}>Start</Button>}
          <Button variant="secondary" className="w-full" onClick={store.resetShotClock}>Reset Shot Clock</Button>
          <Button variant="outline" className="w-full" onClick={store.endPeriod}>{store.currentPeriod < 4 ? 'End Period' : 'End Game'}</Button>
        </>}
        awayControls={<>
          <Button variant="primary" className="w-full" onClick={() => store.addGoal('away')}>Goal</Button>
          <Button variant="outline" className="w-full" onClick={() => store.addExclusion('away')}>Exclusion</Button>
          <Button variant="outline" className="w-full" onClick={() => store.useTimeout('away')} disabled={store.awayTimeouts === 0}>Timeout ({store.awayTimeouts})</Button>
        </>}
      />
      )}
      
      {store.isComplete && <Card className="mt-4 text-center"><h2 className="text-xl font-bold mb-2">Game Complete</h2><p className="text-text-muted mb-4">{store.homeTeam} {store.homeScore} - {store.awayScore} {store.awayTeam}</p><Button variant="primary" onClick={handleReset}>New Game</Button></Card>}
    </GameLayout>
  )
}
