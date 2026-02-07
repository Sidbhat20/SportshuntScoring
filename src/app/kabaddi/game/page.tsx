'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard } from '@/components/game'
import { Card, Button } from '@/components/ui'
import { useKabaddiStore } from '@/stores/kabaddiStore'

export default function KabaddiGamePage() {
  const router = useRouter()
  const store = useKabaddiStore()
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) router.push('/kabaddi/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset match?')) { store.reset(); router.push('/kabaddi/setup') } }
  
  if (!store.homeTeam) return null
  
  const PlayerIndicator = ({ count, team }: { count: number; team: 'home' | 'away' }) => (
    <div className="flex gap-1 flex-wrap justify-center">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={`w-4 h-4 rounded-full ${i < count ? 'bg-action-success' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
  
  return (
    <GameLayout title="Kabaddi" subtitle={`Half ${store.half}`} onUndo={store.undo} onReset={handleReset} canUndo={store.actions.length > 0}>
      <Scoreboard homeTeam={store.homeTeam} awayTeam={store.awayTeam} homeScore={store.homeScore} awayScore={store.awayScore} />
      
      {/* Player Count */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">{store.homeTeam} Players</div>
            <PlayerIndicator count={store.homePlayers} team="home" />
            <div className="font-mono font-bold mt-1">{store.homePlayers}/7</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">{store.awayTeam} Players</div>
            <PlayerIndicator count={store.awayPlayers} team="away" />
            <div className="font-mono font-bold mt-1">{store.awayPlayers}/7</div>
          </div>
        </div>
      </Card>
      
      {/* Scoring Controls */}
      {!store.isComplete && (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3 text-center">{store.homeTeam}</div>
          <div className="space-y-2">
            <Button variant="primary" className="w-full" onClick={() => store.addRaidPoints('home', 1)}>Raid +1</Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => store.addRaidPoints('home', 2)}>+2</Button>
              <Button variant="secondary" className="flex-1" onClick={() => store.addRaidPoints('home', 3)}>+3</Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => store.addTacklePoints('home', 1)}>Tackle +1</Button>
            <Button variant="secondary" className="w-full" onClick={() => store.addBonusPoints('home', 1)}>Bonus +1</Button>
            <Button variant="success" className="w-full" onClick={() => store.addAllOut('home')}>All Out +2</Button>
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3 text-center">{store.awayTeam}</div>
          <div className="space-y-2">
            <Button variant="primary" className="w-full" onClick={() => store.addRaidPoints('away', 1)}>Raid +1</Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => store.addRaidPoints('away', 2)}>+2</Button>
              <Button variant="secondary" className="flex-1" onClick={() => store.addRaidPoints('away', 3)}>+3</Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => store.addTacklePoints('away', 1)}>Tackle +1</Button>
            <Button variant="secondary" className="w-full" onClick={() => store.addBonusPoints('away', 1)}>Bonus +1</Button>
            <Button variant="success" className="w-full" onClick={() => store.addAllOut('away')}>All Out +2</Button>
          </div>
        </Card>
      </div>
      )}
      
      {/* Player Management */}
      {!store.isComplete && (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Player Out</div>
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={() => store.playerOut('home')}>Home</Button>
            <Button variant="danger" className="flex-1" onClick={() => store.playerOut('away')}>Away</Button>
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Revive Player</div>
          <div className="flex gap-2">
            <Button variant="success" className="flex-1" onClick={() => store.revivePlayer('home')}>Home</Button>
            <Button variant="success" className="flex-1" onClick={() => store.revivePlayer('away')}>Away</Button>
          </div>
        </Card>
      </div>
      )}
      
      {!store.isComplete && (
      <div className="flex gap-4">
        {store.half === 1 ? (
          <Button variant="outline" className="flex-1" onClick={store.nextHalf}>End Half 1</Button>
        ) : (
          <Button variant="primary" className="flex-1" onClick={store.endMatch}>End Match</Button>
        )}
      </div>
      )}
      
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold mb-2">Match Over</h2>
          <p className="text-text-muted mb-4">
            {store.homeScore > store.awayScore ? store.homeTeam : store.homeScore < store.awayScore ? store.awayTeam : 'Draw'} 
            {store.homeScore !== store.awayScore && ' wins'} {store.homeScore}-{store.awayScore}
          </p>
          <Button variant="primary" onClick={handleReset}>New Match</Button>
        </Card>
      )}
    </GameLayout>
  )
}
