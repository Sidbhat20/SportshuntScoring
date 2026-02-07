'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard, ControlPanel } from '@/components/game'
import { Button, Card, Modal } from '@/components/ui'
import { useSnookerStore } from '@/stores/snookerStore'

const BALL_VALUES = [
  { name: 'Red', value: 1, color: 'bg-red-600' },
  { name: 'Yellow', value: 2, color: 'bg-yellow-400' },
  { name: 'Green', value: 3, color: 'bg-green-600' },
  { name: 'Brown', value: 4, color: 'bg-amber-700' },
  { name: 'Blue', value: 5, color: 'bg-blue-600' },
  { name: 'Pink', value: 6, color: 'bg-pink-400' },
  { name: 'Black', value: 7, color: 'bg-gray-900' },
]

export default function SnookerGamePage() {
  const router = useRouter()
  const store = useSnookerStore()
  const [foulModal, setFoulModal] = useState(false)
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.playerA) router.push('/snooker/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset match?')) { store.reset(); router.push('/snooker/setup') } }
  
  if (!store.playerA) return null
  const framesToWin = Math.ceil(store.bestOf / 2)
  
  return (
    <GameLayout title={`FRAME ${store.currentFrame}`} subtitle={`Best of ${store.bestOf}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      <div className="flex justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.playerA}:</span>
          <div className="flex gap-1">
            {Array.from({ length: framesToWin }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < store.framesA ? 'bg-action-success' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{store.playerB}:</span>
          <div className="flex gap-1">
            {Array.from({ length: framesToWin }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < store.framesB ? 'bg-action-success' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
      
      <Scoreboard homeTeam={store.playerA} awayTeam={store.playerB} homeScore={store.frameScoreA} awayScore={store.frameScoreB}
        homeExtra={<div className="space-y-1">{store.currentPlayer === 'A' && <><div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />At Table</div><div className="text-xs text-text-muted">Break: {store.currentBreak}</div></>}</div>}
        awayExtra={<div className="space-y-1">{store.currentPlayer === 'B' && <><div className="inline-flex items-center gap-1 text-xs bg-action-success/10 text-action-success px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-action-success" />At Table</div><div className="text-xs text-text-muted">Break: {store.currentBreak}</div></>}</div>}
      />
      
      {!store.isComplete && (
      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Balls</div>
        <div className="flex flex-wrap gap-2">
          {BALL_VALUES.map((ball) => (
            <button key={ball.value} onClick={() => store.addPoints(ball.value)} className={`w-12 h-12 rounded-full ${ball.color} text-white font-bold flex items-center justify-center hover:opacity-80`}>
              {ball.value}
            </button>
          ))}
        </div>
      </Card>
      )}
      
      {!store.isComplete && (
      <ControlPanel homeLabel={store.playerA} awayLabel={store.playerB} centerLabel="Match"
        homeControls={<Button variant="primary" className="w-full" onClick={() => store.winFrame('A')}>Win Frame</Button>}
        centerControls={<><Button variant="secondary" className="w-full" onClick={store.endBreak}>End Break</Button><Button variant="outline" className="w-full" onClick={() => setFoulModal(true)}>Foul</Button></>}
        awayControls={<Button variant="primary" className="w-full" onClick={() => store.winFrame('B')}>Win Frame</Button>}
      />
      )}
      
      {store.isComplete && <Card className="mt-4 text-center"><h2 className="text-xl font-bold mb-2">Match Complete</h2><p className="text-text-muted mb-4">Winner: {store.winner === 'A' ? store.playerA : store.playerB}</p><p className="text-sm text-text-muted mb-4">Frames: {store.framesA} - {store.framesB}</p><Button variant="primary" onClick={handleReset}>New Match</Button></Card>}
      
      <Modal isOpen={foulModal} onClose={() => setFoulModal(false)} title="Foul Points" actions={<Button variant="ghost" onClick={() => setFoulModal(false)}>Cancel</Button>}>
        <div className="text-sm text-text-muted mb-3">Select foul value (minimum 4 points)</div>
        <div className="flex flex-wrap gap-2">
          {[4, 5, 6, 7].map((pts) => (
            <Button key={pts} variant="secondary" onClick={() => { store.foul(pts); setFoulModal(false) }}>{pts} pts</Button>
          ))}
        </div>
      </Modal>
    </GameLayout>
  )
}
