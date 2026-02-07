'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel } from '@/components/game'
import { Button, Card } from '@/components/ui'
import { usePoolStore } from '@/stores/poolStore'

export default function PoolGamePage() {
  const router = useRouter()
  const store = usePoolStore()
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.playerA) router.push('/pool/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset match?')) { store.reset(); router.push('/pool/setup') } }
  
  if (!store.playerA) return null
  
  return (
    <GameLayout title={store.gameType === '8ball' ? '8-BALL' : '9-BALL'} subtitle={`Race to ${store.raceTo}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      <Scoreboard homeTeam={store.playerA} awayTeam={store.playerB} homeScore={store.racksA} awayScore={store.racksB}
        homeExtra={store.currentPlayer === 'A' && <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />At Table</div>}
        awayExtra={store.currentPlayer === 'B' && <div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />At Table</div>}
      />
      
      {!store.isComplete && (
      <ControlPanel homeLabel={store.playerA} awayLabel={store.playerB} centerLabel="Match"
        homeControls={<Button variant="primary" className="w-full" onClick={() => store.winRack('A')}>Win Rack</Button>}
        centerControls={<><Button variant="secondary" className="w-full" onClick={store.switchPlayer}>Switch Player</Button><Button variant="outline" className="w-full" onClick={store.foul}>Foul</Button></>}
        awayControls={<Button variant="primary" className="w-full" onClick={() => store.winRack('B')}>Win Rack</Button>}
      />
      )}
      
      {store.isComplete && <Card className="mt-4 text-center"><h2 className="text-xl font-bold mb-2">Match Complete</h2><p className="text-text-muted mb-4">Winner: {store.winner === 'A' ? store.playerA : store.playerB}</p><p className="text-sm text-text-muted mb-4">Racks: {store.racksA} - {store.racksB}</p><Button variant="primary" onClick={handleReset}>New Match</Button></Card>}
    </GameLayout>
  )
}
