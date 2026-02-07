'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { useGolfStore, getTotalScore, getRelativeToPar, formatRelativeToPar } from '@/stores/golfStore'

export default function GolfGamePage() {
  const router = useRouter()
  const store = useGolfStore()
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleReset = () => { if (confirm('Reset round?')) { store.reset(); router.push('/golf/setup') } }
  
  if (store.players.length === 0) return null
  
  const currentPar = store.parPerHole[store.currentHole - 1]
  
  return (
    <GameLayout title={`HOLE ${store.currentHole}`} subtitle={`Par ${currentPar} • ${store.gameMode === 'stroke' ? 'Stroke Play' : 'Match Play'}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      {/* Scorecard */}
      <Card className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2 text-text-muted">Hole</th>
              {Array.from({ length: Math.min(store.holes, 9) }).map((_, i) => (
                <th key={i} className={`p-2 text-center min-w-[32px] ${store.currentHole === i + 1 ? 'bg-action-primary text-white rounded' : ''}`}>{i + 1}</th>
              ))}
              <th className="p-2 text-center font-bold">Total</th>
              <th className="p-2 text-center font-bold">+/-</th>
            </tr>
            <tr className="border-b border-border bg-gray-50">
              <td className="p-2 text-text-muted">Par</td>
              {Array.from({ length: Math.min(store.holes, 9) }).map((_, i) => (
                <td key={i} className="p-2 text-center text-text-muted">{store.parPerHole[i]}</td>
              ))}
              <td className="p-2 text-center text-text-muted">{store.parPerHole.slice(0, Math.min(store.holes, 9)).reduce((a, b) => a + b, 0)}</td>
              <td className="p-2 text-center">-</td>
            </tr>
          </thead>
          <tbody>
            {store.players.map((player, pi) => (
              <tr key={pi} className="border-b border-border">
                <td className="p-2 font-medium truncate max-w-[100px]">{player}</td>
                {Array.from({ length: Math.min(store.holes, 9) }).map((_, i) => (
                  <td key={i} className={`p-2 text-center font-mono ${store.scores[pi][i] > 0 ? 'text-text-primary' : 'text-text-placeholder'}`}>
                    {store.scores[pi][i] || '-'}
                  </td>
                ))}
                <td className="p-2 text-center font-mono font-bold">{getTotalScore(store.scores[pi])}</td>
                <td className={`p-2 text-center font-mono font-bold ${getRelativeToPar(store.scores[pi], store.parPerHole) < 0 ? 'text-action-danger' : getRelativeToPar(store.scores[pi], store.parPerHole) > 0 ? 'text-action-success' : ''}`}>
                  {formatRelativeToPar(getRelativeToPar(store.scores[pi], store.parPerHole))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      
      {/* Score Entry */}
      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Hole {store.currentHole} Scores</div>
        <div className="space-y-4">
          {store.players.map((player, pi) => (
            <div key={pi}>
              <div className="text-sm font-medium mb-2">{player}</div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((strokes) => (
                  <button key={strokes} onClick={() => store.setScore(pi, store.currentHole - 1, strokes)}
                    className={`w-10 h-10 rounded-lg font-mono font-bold ${store.scores[pi][store.currentHole - 1] === strokes ? 'bg-action-primary text-white' : 'bg-action-secondary text-text-primary hover:bg-gray-200'}`}>
                    {strokes}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1" onClick={store.prevHole} disabled={store.currentHole === 1}>Previous Hole</Button>
        <Button variant="primary" className="flex-1" onClick={store.nextHole}>
          {store.currentHole < store.holes ? 'Next Hole' : 'Finish Round'}
        </Button>
      </div>
      
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold mb-2">Round Complete</h2>
          <div className="space-y-1 mb-4">
            {store.players.map((player, pi) => (
              <p key={pi} className="text-text-muted">
                {player}: {getTotalScore(store.scores[pi])} ({formatRelativeToPar(getRelativeToPar(store.scores[pi], store.parPerHole))})
              </p>
            ))}
          </div>
          <Button variant="primary" onClick={handleReset}>New Round</Button>
        </Card>
      )}
    </GameLayout>
  )
}
