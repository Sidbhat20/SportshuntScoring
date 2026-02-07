'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard } from '@/components/game'
import { Card, Button } from '@/components/ui'
import { useTugOfWarStore } from '@/stores/tugofwarStore'

export default function TugOfWarGamePage() {
  const router = useRouter()
  const store = useTugOfWarStore()

  // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleReset = () => {
    if (confirm('Reset match?')) {
      store.reset()
      router.push('/tugofwar/setup')
    }
  }

  if (!store.homeTeam) return null

  // Pull indicator dots
  const PullIndicator = ({ won, total }: { won: number; total: number }) => (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-full border-2 ${
            i < won
              ? 'bg-action-success border-green-600'
              : 'bg-gray-100 border-gray-300'
          }`}
        />
      ))}
    </div>
  )

  // Foul indicator
  const FoulIndicator = ({ fouls }: { fouls: number }) => (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-sm ${
            i < fouls
              ? 'bg-action-danger'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )

  return (
    <GameLayout
      title="Tug of War"
      subtitle={store.isComplete ? 'Match Over' : `Pull ${store.currentPull} · Best of ${store.bestOf}`}
      onUndo={store.undo}
      onReset={handleReset}
      canUndo={store.actions.length > 0}
    >
      {/* Scoreboard — pulls won */}
      <Scoreboard
        homeTeam={store.homeTeam}
        awayTeam={store.awayTeam}
        homeScore={store.homePullsWon}
        awayScore={store.awayPullsWon}
        centerContent={
          <div>
            <div className="text-xs text-text-muted uppercase mb-1">Pulls</div>
            <div className="text-2xl font-bold text-text-primary">
              {store.homePullsWon} — {store.awayPullsWon}
            </div>
          </div>
        }
        homeExtra={<PullIndicator won={store.homePullsWon} total={store.pullsToWin} />}
        awayExtra={<PullIndicator won={store.awayPullsWon} total={store.pullsToWin} />}
      />

      {/* Fouls Tracker */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
              {store.homeTeam} Cautions
            </div>
            <FoulIndicator fouls={store.homeFouls} />
            <div className="text-sm text-text-muted mt-1">{store.homeFouls} / 2</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
              {store.awayTeam} Cautions
            </div>
            <FoulIndicator fouls={store.awayFouls} />
            <div className="text-sm text-text-muted mt-1">{store.awayFouls} / 2</div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      {!store.isComplete && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Home Controls */}
          <Card>
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3 text-center">
              {store.homeTeam}
            </div>
            <div className="space-y-2">
              <Button variant="success" className="w-full" size="lg" onClick={() => store.winPull('home')}>
                Won Pull
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => store.addFoul('home')}
                disabled={store.homeFouls >= 2}
              >
                Caution ⚠
              </Button>
            </div>
          </Card>

          {/* Away Controls */}
          <Card>
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3 text-center">
              {store.awayTeam}
            </div>
            <div className="space-y-2">
              <Button variant="success" className="w-full" size="lg" onClick={() => store.winPull('away')}>
                Won Pull
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => store.addFoul('away')}
                disabled={store.awayFouls >= 2}
              >
                Caution ⚠
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Match Complete */}
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold mb-2">Match Over</h2>
          {store.winner && (
            <p className="text-lg text-text-muted mb-1">
              🏆 <span className="font-semibold text-text-primary">{store.winner}</span> wins!
            </p>
          )}
          <p className="text-text-muted mb-4">
            {store.homePullsWon} — {store.awayPullsWon}
            {(store.homeFouls >= 2 || store.awayFouls >= 2) && (
              <span className="block text-sm text-action-danger mt-1">
                {store.homeFouls >= 2 ? store.homeTeam : store.awayTeam} disqualified (2 cautions)
              </span>
            )}
          </p>
          <Button variant="primary" onClick={handleReset}>New Match</Button>
        </Card>
      )}
    </GameLayout>
  )
}
