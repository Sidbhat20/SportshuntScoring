'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel } from '@/components/game'
import { Button, Card } from '@/components/ui'
import { useTennisStore, getPointDisplay } from '@/stores/tennisStore'

export default function TennisGamePage() {
  const router = useRouter()
  const store = useTennisStore()
  
  useEffect(() => {
    store.loadState()
    if (!store.playerA) {
      router.push('/tennis/setup')
    }
  }, [])
  
  const handleReset = () => {
    if (confirm('Reset match? All progress will be lost.')) {
      store.reset()
      router.push('/tennis/setup')
    }
  }
  
  if (!store.playerA) {
    return null
  }
  
  const { displayA, displayB } = getPointDisplay(
    store.pointsA, 
    store.pointsB, 
    store.isTiebreak,
    store.tiebreakPointsA,
    store.tiebreakPointsB
  )
  
  const setLabel = store.isTiebreak ? `SET ${store.currentSet} - TIEBREAK` : `SET ${store.currentSet}`
  const setsToWin = store.bestOf === 3 ? 2 : 3
  
  return (
    <GameLayout
      title={setLabel}
      subtitle={`Best of ${store.bestOf}`}
      onUndo={store.undo}
      onReset={handleReset}
      canUndo={store.actions.length > 0}
    >
      {/* Sets indicator */}
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.playerA}:</span>
          <div className="flex gap-1">
            {Array.from({ length: setsToWin }).map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i < store.setsA ? 'bg-action-success' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.playerB}:</span>
          <div className="flex gap-1">
            {Array.from({ length: setsToWin }).map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i < store.setsB ? 'bg-action-success' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Scoreboard */}
      <Scoreboard
        homeTeam={store.playerA}
        awayTeam={store.playerB}
        homeScore={displayA}
        awayScore={displayB}
        centerContent={
          <div className="text-text-muted">
            {store.pointsA >= 3 && store.pointsB >= 3 && store.pointsA === store.pointsB && !store.isTiebreak && (
              <div className="text-sm font-medium">DEUCE</div>
            )}
          </div>
        }
        homeExtra={
          <div className="space-y-2">
            <div className="text-sm text-text-muted">
              Games: {store.gamesA.map((g, i) => (
                <span key={i} className={i === store.currentSet - 1 ? 'font-bold text-text-primary' : ''}>
                  {g}{i < store.gamesA.length - 1 ? '-' : ''}
                </span>
              ))}
            </div>
            {store.server === 'A' && (
              <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-action-success" />
                Serving
              </div>
            )}
          </div>
        }
        awayExtra={
          <div className="space-y-2">
            <div className="text-sm text-text-muted">
              Games: {store.gamesB.map((g, i) => (
                <span key={i} className={i === store.currentSet - 1 ? 'font-bold text-text-primary' : ''}>
                  {g}{i < store.gamesB.length - 1 ? '-' : ''}
                </span>
              ))}
            </div>
            {store.server === 'B' && (
              <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-action-success" />
                Serving
              </div>
            )}
          </div>
        }
      />
      
      {/* Controls */}
      {!store.isComplete && (
      <ControlPanel
        homeLabel={store.playerA}
        awayLabel={store.playerB}
        centerLabel="Match"
        homeControls={
          <Button variant="primary" className="w-full" size="lg" onClick={() => store.addPoint('A')}>
            Point
          </Button>
        }
        centerControls={
          <div className="text-center space-y-3">
            <div className="text-sm text-text-muted">
              Server: <span className="font-medium text-text-primary">{store.server === 'A' ? store.playerA : store.playerB}</span>
            </div>
            {store.isTiebreak && (
              <div className="text-sm text-action-warning font-medium">TIEBREAK</div>
            )}
          </div>
        }
        awayControls={
          <Button variant="primary" className="w-full" size="lg" onClick={() => store.addPoint('B')}>
            Point
          </Button>
        }
      />
      )}
      
      {/* Match Complete */}
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Match Complete</h2>
          <p className="text-text-muted mb-4">
            Winner: {store.winner === 'A' ? store.playerA : store.playerB}
          </p>
          <p className="text-sm text-text-muted mb-4">
            Sets: {store.setsA} - {store.setsB}
          </p>
          <Button variant="primary" onClick={handleReset}>
            New Match
          </Button>
        </Card>
      )}
    </GameLayout>
  )
}
