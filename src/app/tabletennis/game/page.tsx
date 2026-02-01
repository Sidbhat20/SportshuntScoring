'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel } from '@/components/game'
import { Button, Card } from '@/components/ui'
import { useTableTennisStore } from '@/stores/tabletennisStore'

export default function TableTennisGamePage() {
  const router = useRouter()
  const store = useTableTennisStore()
  
  useEffect(() => {
    store.loadState()
    if (!store.playerA) router.push('/tabletennis/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset match?')) { store.reset(); router.push('/tabletennis/setup') } }
  
  if (!store.playerA) return null
  const gamesToWin = store.bestOf === 5 ? 3 : 4
  
  return (
    <GameLayout title={`GAME ${store.currentGame}`} subtitle={`Best of ${store.bestOf}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.playerA}:</span>
          <div className="flex gap-1">
            {Array.from({ length: gamesToWin }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < store.gamesA ? 'bg-action-success' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.playerB}:</span>
          <div className="flex gap-1">
            {Array.from({ length: gamesToWin }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < store.gamesB ? 'bg-action-success' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
      
      <Scoreboard homeTeam={store.playerA} awayTeam={store.playerB} homeScore={store.pointsA} awayScore={store.pointsB}
        homeExtra={store.server === 'A' && <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />Serving ({store.servesRemaining})</div>}
        awayExtra={store.server === 'B' && <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />Serving ({store.servesRemaining})</div>}
      />
      
      {!store.isComplete && (
      <ControlPanel homeLabel={store.playerA} awayLabel={store.playerB} centerLabel="Match"
        homeControls={<Button variant="primary" className="w-full" size="lg" onClick={() => store.addPoint('A')}>Point</Button>}
        centerControls={<div className="text-center text-sm text-text-muted"><div>Server: {store.server === 'A' ? store.playerA : store.playerB}</div>{store.pointsA >= 10 && store.pointsB >= 10 && <div className="text-action-warning font-medium mt-2">DEUCE</div>}</div>}
        awayControls={<Button variant="primary" className="w-full" size="lg" onClick={() => store.addPoint('B')}>Point</Button>}
      />
      )}
      
      {store.isComplete && <Card className="mt-4 text-center"><h2 className="text-xl font-bold mb-2">Match Complete</h2><p className="text-text-muted mb-4">Winner: {store.winner === 'A' ? store.playerA : store.playerB}</p><p className="text-sm text-text-muted mb-4">Games: {store.gamesA} - {store.gamesB}</p><Button variant="primary" onClick={handleReset}>New Match</Button></Card>}
    </GameLayout>
  )
}
