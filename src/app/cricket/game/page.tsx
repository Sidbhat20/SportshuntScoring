'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Card, Button, Modal } from '@/components/ui'
import { useCricketStore, formatOvers, calculateRunRate, calculateRequiredRunRate } from '@/stores/cricketStore'

export default function CricketGamePage() {
  const router = useRouter()
  const store = useCricketStore()
  const [extrasModal, setExtrasModal] = useState(false)
  
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) router.push('/cricket/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset match?')) { store.reset(); router.push('/cricket/setup') } }
  
  if (!store.homeTeam) return null
  
  const batting = store.battingTeam
  const battingTeamName = batting === 'home' ? store.homeTeam : store.awayTeam
  const bowlingTeamName = batting === 'home' ? store.awayTeam : store.homeTeam
  const runs = batting === 'home' ? store.homeRuns : store.awayRuns
  const wickets = batting === 'home' ? store.homeWickets : store.awayWickets
  const overs = batting === 'home' ? store.homeOvers : store.awayOvers
  const balls = batting === 'home' ? store.homeBalls : store.awayBalls
  const runRate = calculateRunRate(runs, overs, balls)
  
  const requiredRunRate = store.innings === 2 && store.target
    ? calculateRequiredRunRate(store.target, runs, store.maxOvers, overs, balls)
    : null
  
  return (
    <GameLayout title="Cricket" subtitle={`Innings ${store.innings} • ${store.format}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      {/* Main Score Display */}
      <Card className="mb-4 text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-1">{battingTeamName}</div>
        <div className="text-5xl font-mono font-bold">
          {runs}/{wickets}
        </div>
        <div className="text-xl font-mono text-text-muted mt-1">
          ({formatOvers(overs, balls)} ov)
        </div>
        <div className="flex justify-center gap-6 mt-3 text-sm">
          <div>
            <span className="text-text-muted">RR: </span>
            <span className="font-mono font-bold">{runRate.toFixed(2)}</span>
          </div>
          {store.target && (
            <div>
              <span className="text-text-muted">Target: </span>
              <span className="font-mono font-bold">{store.target}</span>
            </div>
          )}
          {requiredRunRate !== null && requiredRunRate > 0 && (
            <div>
              <span className="text-text-muted">RRR: </span>
              <span className="font-mono font-bold">{requiredRunRate.toFixed(2)}</span>
            </div>
          )}
        </div>
        {store.target && (
          <div className="mt-2 text-sm text-text-muted">
            Need {store.target - runs} runs from {(store.maxOvers - overs) * 6 - balls} balls
          </div>
        )}
      </Card>
      
      {/* Run Buttons */}
      {!store.isComplete && (
      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Runs</div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[0, 1, 2, 3].map((r) => (
            <Button key={r} variant="primary" className="text-lg" onClick={() => { store.addRuns(r); store.nextBall() }}>{r}</Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[4, 6].map((r) => (
            <Button key={r} variant="success" className="text-lg" onClick={() => { store.addRuns(r); store.nextBall() }}>{r}</Button>
          ))}
          <Button variant="secondary" onClick={() => store.nextBall()}>Dot</Button>
        </div>
      </Card>
      )}
      
      {/* Action Buttons */}
      {!store.isComplete && (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button variant="danger" className="h-14" onClick={() => { store.addWicket(); store.nextBall() }}>Wicket</Button>
        <Button variant="warning" className="h-14" onClick={() => setExtrasModal(true)}>Extras</Button>
      </div>
      )}
      
      {/* Innings Controls */}
      {!store.isComplete && store.innings === 1 && (
        <Button variant="outline" className="w-full mb-4" onClick={store.switchInnings}>End Innings</Button>
      )}
      
      {store.innings === 2 && (
        <Button variant="outline" className="w-full mb-4" onClick={store.endMatch}>End Match</Button>
      )}
      
      {/* First Innings Score (in second innings) */}
      {store.innings === 2 && (
        <Card className="text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-1">{bowlingTeamName} (1st Innings)</div>
          <div className="text-xl font-mono font-bold">
            {batting === 'home' ? store.awayRuns : store.homeRuns}/{batting === 'home' ? store.awayWickets : store.homeWickets}
          </div>
        </Card>
      )}
      
      {/* Extras Modal */}
      <Modal isOpen={extrasModal} onClose={() => setExtrasModal(false)} title="Extras">
        <div className="space-y-3">
          <Button variant="secondary" className="w-full" onClick={() => { store.addExtra('wide'); setExtrasModal(false) }}>Wide (+1)</Button>
          <Button variant="secondary" className="w-full" onClick={() => { store.addExtra('noBall'); setExtrasModal(false) }}>No Ball (+1)</Button>
          <Button variant="secondary" className="w-full" onClick={() => { store.addExtra('byes', 1); store.nextBall(); setExtrasModal(false) }}>Byes (+1)</Button>
          <Button variant="secondary" className="w-full" onClick={() => { store.addExtra('legByes', 1); store.nextBall(); setExtrasModal(false) }}>Leg Byes (+1)</Button>
          <div className="border-t border-border pt-3 mt-3">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Wide + Runs</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((r) => (
                <Button key={r} variant="outline" className="flex-1" onClick={() => { store.addExtra('wide', r); setExtrasModal(false) }}>W+{r}</Button>
              ))}
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">No Ball + Runs</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 6].map((r) => (
                <Button key={r} variant="outline" className="flex-1" onClick={() => { store.addExtra('noBall', r); setExtrasModal(false) }}>NB+{r}</Button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold mb-2">Match Over</h2>
          <p className="text-text-muted mb-4">
            {store.homeRuns > store.awayRuns 
              ? `${store.homeTeam} wins by ${store.innings === 2 && batting === 'home' ? 10 - store.homeWickets + ' wickets' : store.homeRuns - store.awayRuns + ' runs'}`
              : store.awayRuns > store.homeRuns
              ? `${store.awayTeam} wins by ${store.innings === 2 && batting === 'away' ? 10 - store.awayWickets + ' wickets' : store.awayRuns - store.homeRuns + ' runs'}`
              : 'Match Tied'}
          </p>
          <Button variant="primary" onClick={handleReset}>New Match</Button>
        </Card>
      )}
    </GameLayout>
  )
}
