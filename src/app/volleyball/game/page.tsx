'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel } from '@/components/game'
import { Button, Card } from '@/components/ui'
import { useVolleyballStore } from '@/stores/volleyballStore'

export default function VolleyballGamePage() {
  const router = useRouter()
  const store = useVolleyballStore()
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) router.push('/volleyball/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset match?')) { store.reset(); router.push('/volleyball/setup') } }
  
  if (!store.homeTeam) return null
  const setsToWin = store.bestOf === 3 ? 2 : 3
  const isFinalSet = store.setsHome === setsToWin - 1 && store.setsAway === setsToWin - 1
  
  return (
    <GameLayout title={`SET ${store.currentSet}`} subtitle={isFinalSet ? 'Final Set (to 15)' : `First to ${store.pointsToWin}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.homeTeam}:</span>
          <div className="flex gap-1">
            {Array.from({ length: setsToWin }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < store.setsHome ? 'bg-action-success' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.awayTeam}:</span>
          <div className="flex gap-1">
            {Array.from({ length: setsToWin }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < store.setsAway ? 'bg-action-success' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
      
      <Scoreboard homeTeam={store.homeTeam} awayTeam={store.awayTeam} homeScore={store.pointsHome} awayScore={store.pointsAway}
        homeExtra={<div className="space-y-1">{store.server === 'home' && <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />Serving</div>}<div className="text-xs text-text-muted">TO: {store.homeTimeouts}</div></div>}
        awayExtra={<div className="space-y-1">{store.server === 'away' && <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />Serving</div>}<div className="text-xs text-text-muted">TO: {store.awayTimeouts}</div></div>}
      />
      
      {!store.isComplete && (
      <ControlPanel homeLabel={store.homeTeam} awayLabel={store.awayTeam} centerLabel="Match"
        homeControls={<><Button variant="primary" className="w-full" size="lg" onClick={() => store.addPoint('home')}>Point</Button><Button variant="outline" className="w-full" onClick={() => store.useTimeout('home')} disabled={store.homeTimeouts === 0}>Timeout ({store.homeTimeouts})</Button></>}
        centerControls={<div className="text-center text-sm text-text-muted"><div>Server: {store.server === 'home' ? store.homeTeam : store.awayTeam}</div></div>}
        awayControls={<><Button variant="primary" className="w-full" size="lg" onClick={() => store.addPoint('away')}>Point</Button><Button variant="outline" className="w-full" onClick={() => store.useTimeout('away')} disabled={store.awayTimeouts === 0}>Timeout ({store.awayTimeouts})</Button></>}
      />
      )}
      
      {store.isComplete && <Card className="mt-4 text-center"><h2 className="text-xl font-bold mb-2">Match Complete</h2><p className="text-text-muted mb-4">Winner: {store.winner === 'home' ? store.homeTeam : store.awayTeam}</p><p className="text-sm text-text-muted mb-4">Sets: {store.setsHome} - {store.setsAway}</p><Button variant="primary" onClick={handleReset}>New Match</Button></Card>}
    </GameLayout>
  )
}
