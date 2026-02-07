'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { useBaseballStore } from '@/stores/baseballStore'

export default function BaseballGamePage() {
  const router = useRouter()
  const store = useBaseballStore()
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) router.push('/baseball/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset game?')) { store.reset(); router.push('/baseball/setup') } }
  
  if (!store.homeTeam) return null
  
  const homeTotalRuns = store.homeRuns.reduce((a, b) => a + b, 0)
  const awayTotalRuns = store.awayRuns.reduce((a, b) => a + b, 0)
  const battingTeam = store.isTopHalf ? 'away' : 'home'
  const battingTeamName = store.isTopHalf ? store.awayTeam : store.homeTeam
  
  return (
    <GameLayout title="Baseball" subtitle={`${store.isTopHalf ? 'Top' : 'Bottom'} ${store.currentInning}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      {/* Scoreboard */}
      <Card className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2 text-text-muted min-w-[80px]">Team</th>
              {Array.from({ length: Math.max(store.innings, store.homeRuns.length) }).map((_, i) => (
                <th key={i} className={`p-2 text-center min-w-[28px] ${store.currentInning === i + 1 ? 'bg-action-primary text-white rounded' : ''}`}>{i + 1}</th>
              ))}
              <th className="p-2 text-center font-bold">R</th>
              <th className="p-2 text-center font-bold">H</th>
              <th className="p-2 text-center font-bold">E</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className={`p-2 font-medium ${store.isTopHalf ? 'text-action-primary' : ''}`}>{store.awayTeam}</td>
              {store.awayRuns.map((runs, i) => (
                <td key={i} className="p-2 text-center font-mono">{runs}</td>
              ))}
              <td className="p-2 text-center font-mono font-bold">{awayTotalRuns}</td>
              <td className="p-2 text-center font-mono">{store.awayHits}</td>
              <td className="p-2 text-center font-mono">{store.awayErrors}</td>
            </tr>
            <tr>
              <td className={`p-2 font-medium ${!store.isTopHalf ? 'text-action-primary' : ''}`}>{store.homeTeam}</td>
              {store.homeRuns.map((runs, i) => (
                <td key={i} className="p-2 text-center font-mono">{runs}</td>
              ))}
              <td className="p-2 text-center font-mono font-bold">{homeTotalRuns}</td>
              <td className="p-2 text-center font-mono">{store.homeHits}</td>
              <td className="p-2 text-center font-mono">{store.homeErrors}</td>
            </tr>
          </tbody>
        </table>
      </Card>
      
      {/* Outs Indicator */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Batting</div>
            <div className="text-lg font-bold">{battingTeamName}</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Outs</div>
            <div className="flex gap-2 mt-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${store.outs > i ? 'bg-action-danger' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Score Controls */}
      {!store.isComplete && (
      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Add Runs ({battingTeamName})</div>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((runs) => (
            <Button key={runs} variant="primary" className="flex-1 min-w-[60px]" onClick={() => store.addRuns(battingTeam, runs)}>+{runs}</Button>
          ))}
        </div>
      </Card>
      )}
      
      {!store.isComplete && (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Hit</div>
          <Button variant="secondary" className="w-full" onClick={() => store.addHit(battingTeam)}>+1</Button>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Error</div>
          <Button variant="secondary" className="w-full" onClick={() => store.addError(store.isTopHalf ? 'home' : 'away')}>+1</Button>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Out</div>
          <Button variant="danger" className="w-full" onClick={store.addOut}>+1</Button>
        </Card>
      </div>
      )}
      
      {!store.isComplete && (
      <Button variant="outline" className="w-full" onClick={store.nextHalfInning}>End Half Inning</Button>
      )}
      
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold mb-2">Game Over</h2>
          <p className="text-text-muted mb-4">
            {homeTotalRuns > awayTotalRuns ? store.homeTeam : store.awayTeam} wins {Math.max(homeTotalRuns, awayTotalRuns)}-{Math.min(homeTotalRuns, awayTotalRuns)}
          </p>
          <Button variant="primary" onClick={handleReset}>New Game</Button>
        </Card>
      )}
    </GameLayout>
  )
}
