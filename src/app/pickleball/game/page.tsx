'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel } from '@/components/game'
import { Button, Card } from '@/components/ui'
import { usePickleballStore } from '@/stores/pickleballStore'

export default function PickleballGamePage() {
  const router = useRouter()
  const store = usePickleballStore()
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.team1) {
      router.push('/pickleball/setup')
    }
  }, [])
  
  const handleReset = () => {
    if (confirm('Reset game? All progress will be lost.')) {
      store.reset()
      router.push('/pickleball/setup')
    }
  }
  
  if (!store.team1) {
    return null
  }
  
  const gameLabel = store.setsToWin > 1 
    ? `Game ${store.currentSet} • Best of ${store.setsToWin * 2 - 1}`
    : `Game ${store.currentSet}`
  
  // Format score display for pickleball: "serving-score - receiving-score - server#"
  const getScoreDisplay = () => {
    const servingScore = store.servingTeam === 'team1' ? store.team1Score : store.team2Score
    const receivingScore = store.servingTeam === 'team1' ? store.team2Score : store.team1Score
    if (store.isDoubles) {
      return `${servingScore}-${receivingScore}-${store.serverNumber}`
    }
    return `${servingScore}-${receivingScore}`
  }
  
  return (
    <GameLayout
      title={gameLabel}
      subtitle={`To ${store.pointsToWin} • Win by 2`}
      onUndo={store.undo}
      onReset={handleReset}
      canUndo={store.actions.length > 0}
    >
      {/* Service indicator */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface rounded-lg">
          <span className="text-sm text-text-muted">Serving:</span>
          <span className="font-semibold text-text-primary">
            {store.servingTeam === 'team1' ? store.team1 : store.team2}
            {store.isDoubles && ` (Server ${store.serverNumber})`}
          </span>
        </div>
        <div className="mt-2 text-lg font-mono text-text-primary">
          Score: {getScoreDisplay()}
        </div>
      </div>
      
      {/* Scoreboard */}
      <Scoreboard
        homeTeam={store.team1}
        awayTeam={store.team2}
        homeScore={store.team1Score}
        awayScore={store.team2Score}
        homeExtra={
          <div className="text-sm text-text-muted">
            {store.setsToWin > 1 && `Games: ${store.team1Sets}`}
            {store.servingTeam === 'team1' && (
              <span className="ml-2 text-action-primary font-medium">● Serving</span>
            )}
          </div>
        }
        awayExtra={
          <div className="text-sm text-text-muted">
            {store.setsToWin > 1 && `Games: ${store.team2Sets}`}
            {store.servingTeam === 'team2' && (
              <span className="ml-2 text-action-primary font-medium">● Serving</span>
            )}
          </div>
        }
      />
      
      {/* Controls */}
      {!store.isComplete && (
      <ControlPanel
        homeLabel={store.team1}
        awayLabel={store.team2}
        centerLabel="Rally"
        homeControls={
          <>
            <Button 
              variant={store.servingTeam === 'team1' ? 'primary' : 'secondary'} 
              className="w-full" 
              onClick={() => store.addPoint('team1')}
            >
              {store.servingTeam === 'team1' ? 'Point' : 'Rally Won (Side Out)'}
            </Button>
          </>
        }
        centerControls={
          <>
            <div className="text-center text-sm text-text-muted mb-2">
              {store.servingTeam === 'team1' ? store.team1 : store.team2} serving
            </div>
            {store.isDoubles && (
              <Button variant="outline" className="w-full" onClick={store.switchServer}>
                Switch Server ({store.serverNumber === 1 ? '1→2' : '2→1'})
              </Button>
            )}
          </>
        }
        awayControls={
          <>
            <Button 
              variant={store.servingTeam === 'team2' ? 'primary' : 'secondary'} 
              className="w-full" 
              onClick={() => store.addPoint('team2')}
            >
              {store.servingTeam === 'team2' ? 'Point' : 'Rally Won (Side Out)'}
            </Button>
          </>
        }
      />
      )}
      
      {/* Game info */}
      <Card className="mt-4">
        <h3 className="text-sm font-medium text-text-muted mb-2">Pickleball Rules</h3>
        <ul className="text-xs text-text-muted space-y-1">
          <li>• Only serving team can score</li>
          <li>• Rally won by receiving team = side out (service change)</li>
          {store.isDoubles && (
            <>
              <li>• In doubles: both players serve before side out (except at game start)</li>
              <li>• Score called as: serving score - receiving score - server number</li>
            </>
          )}
          <li>• Must win by 2 points</li>
        </ul>
      </Card>
      
      {/* Game Complete */}
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Game Complete!</h2>
          <p className="text-text-muted mb-2">
            Winner: {store.team1Sets > store.team2Sets ? store.team1 : store.team2}
          </p>
          <p className="text-text-muted mb-4">
            {store.setsToWin > 1 
              ? `Games: ${store.team1Sets} - ${store.team2Sets}`
              : `Score: ${store.team1Score} - ${store.team2Score}`
            }
          </p>
          <Button variant="primary" onClick={handleReset}>
            New Game
          </Button>
        </Card>
      )}
    </GameLayout>
  )
}
