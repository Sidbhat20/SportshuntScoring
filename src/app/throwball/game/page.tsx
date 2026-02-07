'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel } from '@/components/game'
import { Button, Card } from '@/components/ui'
import { useThrowballStore } from '@/stores/throwballStore'

export default function ThrowballGamePage() {
  const router = useRouter()
  const store = useThrowballStore()
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) router.push('/throwball/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset match?')) { store.reset(); router.push('/throwball/setup') } }
  
  if (!store.homeTeam) return null
  
  return (
    <GameLayout title={`SET ${store.currentSet}`} subtitle={`First to ${store.pointsToWin} • Best of 3`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.homeTeam}:</span>
          <div className="flex gap-1">
            {[0, 1].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < store.setsHome ? 'bg-action-success' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.awayTeam}:</span>
          <div className="flex gap-1">
            {[0, 1].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < store.setsAway ? 'bg-action-success' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
      
      <Scoreboard homeTeam={store.homeTeam} awayTeam={store.awayTeam} homeScore={store.pointsHome} awayScore={store.pointsAway}
        homeExtra={<div className="space-y-1">{store.server === 'home' && <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />Serving</div>}</div>}
        awayExtra={<div className="space-y-1">{store.server === 'away' && <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />Serving</div>}</div>}
      />
      
      {!store.isComplete && (
      <ControlPanel homeLabel={store.homeTeam} awayLabel={store.awayTeam} centerLabel="Match"
        homeControls={<Button variant="primary" className="w-full" size="lg" onClick={() => store.addPoint('home')}>Point</Button>}
        centerControls={<div className="text-center text-sm text-text-muted"><div>Sets: {store.setsHome} - {store.setsAway}</div><div className="mt-1">Server: {store.server === 'home' ? store.homeTeam : store.awayTeam}</div></div>}
        awayControls={<Button variant="primary" className="w-full" size="lg" onClick={() => store.addPoint('away')}>Point</Button>}
      />
      )}
      
      {store.isComplete && <Card className="mt-4 text-center"><h2 className="text-xl font-bold mb-2">Match Complete</h2><p className="text-text-muted mb-4">Winner: {store.winner === 'home' ? store.homeTeam : store.awayTeam}</p><p className="text-sm text-text-muted mb-4">Sets: {store.setsHome} - {store.setsAway}</p><Button variant="primary" onClick={handleReset}>New Match</Button></Card>}
    </GameLayout>
  )
}
