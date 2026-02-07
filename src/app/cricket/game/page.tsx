'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout'
import { Scoreboard } from '@/components/game'
import { Card, Button, Modal, Input } from '@/components/ui'
import { useCricketStore, formatOvers, calculateRunRate, calculateRequiredRunRate, calculateStrikeRate, calculateEconomy, isPowerplay, isDeathOvers, formatBallInOver, getDismissalText } from '@/stores/cricketStore'

export default function CricketGamePage() {
  const router = useRouter()
  const store = useCricketStore()
  const [extrasModal, setExtrasModal] = useState(false)
  const [dismissalModal, setDismissalModal] = useState(false)
  const [scorecardModal, setScorecardModal] = useState(false)
  const [penaltyModal, setPenaltyModal] = useState(false)
  const [penaltyRuns, setPenaltyRuns] = useState('5')
  const [playerModal, setPlayerModal] = useState<{ type: 'striker' | 'nonStriker' | 'bowler'; open: boolean }>({ type: 'striker', open: false })
  const [playerName, setPlayerName] = useState('')
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    store.loadState()
    if (!store.homeTeam) router.push('/cricket/setup')
  }, [])
  
  const handleReset = () => { if (confirm('Reset match?')) { store.reset(); router.push('/cricket/setup') } }
  
  const handleRunClick = (runs: number, isFour = false, isSix = false) => {
    store.addRuns(runs, isFour, isSix)
    store.nextBall()
  }
  
  const handleDotBall = () => {
    // Add 0 runs to track the ball
    store.addRuns(0, false, false)
    store.nextBall()
  }
  
  const handleWicket = () => {
    setDismissalModal(true)
  }
  
  const handleDismissalSelect = (type: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket' | 'retired' | 'other') => {
    store.addWicket(type)
    store.nextBall()
    setDismissalModal(false)
  }
  
  const handleRetiredHurt = () => {
    store.addWicket('retired', true)
    setDismissalModal(false)
  }
  
  const handlePenaltyRuns = () => {
    const runs = parseInt(penaltyRuns) || 5
    store.addPenaltyRuns(runs)
    setPenaltyModal(false)
  }
  
  const handlePlayerUpdate = () => {
    if (playerName.trim()) {
      if (playerModal.type === 'bowler') {
        store.updateBowler(playerName.trim())
      } else {
        store.updateBatsman(playerModal.type, playerName.trim())
      }
      setPlayerModal({ ...playerModal, open: false })
      setPlayerName('')
    }
  }
  
  const openPlayerModal = (type: 'striker' | 'nonStriker' | 'bowler') => {
    const name = type === 'bowler' ? store.currentBowler.name : store.currentBatsmen[type]
    setPlayerName(name)
    setPlayerModal({ type, open: true })
  }
  
  if (!store.homeTeam) return null
  
  const batting = store.battingTeam
  const battingTeamName = batting === 'home' ? store.homeTeam : store.awayTeam
  const bowlingTeamName = batting === 'home' ? store.awayTeam : store.homeTeam
  const runs = batting === 'home' ? store.homeRuns : store.awayRuns
  const wickets = batting === 'home' ? store.homeWickets : store.awayWickets
  const overs = batting === 'home' ? store.homeOvers : store.awayOvers
  const balls = batting === 'home' ? store.homeBalls : store.awayBalls
  const runRate = calculateRunRate(runs, overs, balls)
  const inPowerplay = isPowerplay(overs, store.format)
  const inDeathOvers = isDeathOvers(overs, store.maxOvers, store.format)
  
  const requiredRunRate = store.innings === 2 && store.target
    ? calculateRequiredRunRate(store.target, runs, store.maxOvers, overs, balls)
    : null
  
  const strikerSR = calculateStrikeRate(store.currentBatsmen.strikerRuns, store.currentBatsmen.strikerBalls)
  const nonStrikerSR = calculateStrikeRate(store.currentBatsmen.nonStrikerRuns, store.currentBatsmen.nonStrikerBalls)
  const bowlerEcon = calculateEconomy(store.currentBowler.runs, store.currentBowler.overs, store.currentBowler.balls)
  
  return (
    <GameLayout 
      title="Cricket" 
      subtitle={`Innings ${store.innings} • ${store.format}${inPowerplay ? ' • Powerplay' : ''}${inDeathOvers ? ' • Death Overs' : ''}`}
      onUndo={store.undo} 
      onReset={handleReset} 
      canUndo={store.actions.length > 0}
    >
      {/* Scoreboard */}
      <Scoreboard
        homeTeam={battingTeamName}
        awayTeam={bowlingTeamName}
        homeScore={`${runs}/${wickets}`}
        awayScore={store.innings === 2 ? `${batting === 'home' ? store.awayRuns : store.homeRuns}/${batting === 'home' ? store.awayWickets : store.homeWickets}` : '-'}
        homeExtra={
          <div className="space-y-1">
            {store.isFreeHit && (
              <div className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold animate-pulse">
                ⚡ FREE HIT
              </div>
            )}
            <div className="text-lg font-mono">
              ({formatOvers(overs, balls)} ov)
            </div>
            <div className="text-sm text-text-muted">
              RR: {runRate.toFixed(2)}
              {store.target && ` • Target: ${store.target}`}
              {requiredRunRate !== null && requiredRunRate > 0 && ` • RRR: ${requiredRunRate.toFixed(2)}`}
            </div>
            {store.target && (
              <div className="text-xs text-text-muted">
                Need {store.target - runs} runs from {(store.maxOvers - overs) * 6 - balls} balls
              </div>
            )}
          </div>
        }
        awayExtra={
          store.innings === 2 ? (
            <div className="text-sm text-text-muted">
              1st Innings
            </div>
          ) : undefined
        }
      />
      
      {/* Current Batsmen */}
      {!store.isComplete && (
        <Card className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Current Batsmen</div>
            <Button variant="outline" size="sm" onClick={store.toggleStriker}>↔️ Switch</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1" onClick={() => openPlayerModal('striker')} style={{ cursor: 'pointer' }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="font-medium text-sm">{store.currentBatsmen.striker}</span>
              </div>
              <div className="font-mono text-2xl font-bold">{store.currentBatsmen.strikerRuns}</div>
              <div className="text-xs text-text-muted">
                {store.currentBatsmen.strikerBalls} balls • SR: {strikerSR.toFixed(1)}
              </div>
              <div className="text-xs text-text-muted">
                4s: {store.currentBatsmen.strikerFours} • 6s: {store.currentBatsmen.strikerSixes}
              </div>
            </div>
            <div className="space-y-1" onClick={() => openPlayerModal('nonStriker')} style={{ cursor: 'pointer' }}>
              <div className="font-medium text-sm">{store.currentBatsmen.nonStriker}</div>
              <div className="font-mono text-2xl font-bold">{store.currentBatsmen.nonStrikerRuns}</div>
              <div className="text-xs text-text-muted">
                {store.currentBatsmen.nonStrikerBalls} balls • SR: {nonStrikerSR.toFixed(1)}
              </div>
              <div className="text-xs text-text-muted">
                4s: {store.currentBatsmen.nonStrikerFours} • 6s: {store.currentBatsmen.nonStrikerSixes}
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Current Bowler & Partnership */}
      {!store.isComplete && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div onClick={() => openPlayerModal('bowler')} className="cursor-pointer">
            <Card>
              <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Bowler</div>
              <div className="font-medium">{store.currentBowler.name}</div>
              <div className="font-mono text-sm text-text-muted">
                {formatOvers(store.currentBowler.overs, store.currentBowler.balls)}-{store.currentBowler.wickets}-{store.currentBowler.runs}
              </div>
              <div className="text-xs text-text-muted">Econ: {bowlerEcon.toFixed(2)}</div>
            </Card>
          </div>
          <Card>
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Partnership</div>
            <div className="font-mono text-2xl font-bold">{store.currentPartnership}</div>
            <div className="text-xs text-text-muted">runs</div>
          </Card>
        </div>
      )}
      
      {/* Recent Overs */}
      {store.recentOvers.length > 0 && (
        <Card className="mb-4">
          <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Recent Overs</div>
          <div className="space-y-2">
            {store.recentOvers.slice(-3).reverse().map((over, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-xs text-text-muted w-12">Over {store.recentOvers.length - idx - 1}</span>
                <div className="flex gap-1 flex-wrap">
                  {over.map((ball, ballIdx) => (
                    <span 
                      key={ballIdx} 
                      className={`inline-flex items-center justify-center w-7 h-7 text-xs font-mono rounded ${
                        ball.isWicket ? 'bg-red-100 text-red-700 font-bold' :
                        ball.isSix ? 'bg-purple-100 text-purple-700 font-bold' :
                        ball.isFour ? 'bg-blue-100 text-blue-700 font-bold' :
                        ball.isExtra ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {formatBallInOver(ball)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {store.currentOver.length > 0 && (
              <div className="flex gap-2 items-center border-t border-border pt-2">
                <span className="text-xs text-text-muted w-12">This Over</span>
                <div className="flex gap-1 flex-wrap">
                  {store.currentOver.map((ball, ballIdx) => (
                    <span 
                      key={ballIdx} 
                      className={`inline-flex items-center justify-center w-7 h-7 text-xs font-mono rounded ${
                        ball.isWicket ? 'bg-red-100 text-red-700 font-bold' :
                        ball.isSix ? 'bg-purple-100 text-purple-700 font-bold' :
                        ball.isFour ? 'bg-blue-100 text-blue-700 font-bold' :
                        ball.isExtra ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {formatBallInOver(ball)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Run Buttons */}
      {!store.isComplete && (
      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">Runs</div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[0, 1, 2, 3].map((r) => (
            <Button key={r} variant="primary" className="text-lg" onClick={() => handleRunClick(r)}>{r}</Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="success" className="text-lg" onClick={() => handleRunClick(4, true, false)}>4</Button>
          <Button variant="success" className="text-lg" onClick={() => handleRunClick(6, false, true)}>6</Button>
          <Button variant="secondary" onClick={handleDotBall}>Dot</Button>
        </div>
      </Card>
      )}
      
      {/* Action Buttons */}
      {!store.isComplete && (
      <div className="grid grid-cols-3 gap-3">
        <Button variant="danger" className="h-14" onClick={handleWicket}>Wicket</Button>
        <Button variant="warning" className="h-14" onClick={() => setExtrasModal(true)}>Extras</Button>
        <Button variant="outline" className="h-14" onClick={() => setPenaltyModal(true)}>Penalty</Button>
      </div>
      )}
      
      {/* Match Controls */}
      {!store.isComplete && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {store.innings === 1 && (
            <Button variant="outline" onClick={store.switchInnings}>End Innings</Button>
          )}
          {store.innings === 2 && (
            <Button variant="outline" onClick={store.endMatch}>End Match</Button>
          )}
          <Button variant="outline" onClick={() => setScorecardModal(true)}>📊 Scorecard</Button>
        </div>
      )}
      
      {/* Match Complete */}
      {store.isComplete && (
        <Card className="text-center">
          <h2 className="text-xl font-bold mb-2">Match Over</h2>
          <p className="text-text-muted mb-4">
            {store.homeRuns > store.awayRuns 
              ? `${store.homeTeam} wins by ${store.innings === 2 && batting === 'home' ? 10 - store.homeWickets + ' wickets' : store.homeRuns - store.awayRuns + ' runs'}`
              : store.awayRuns > store.homeRuns
              ? `${store.awayTeam} wins by ${store.innings === 2 && batting === 'away' ? 10 - store.awayWickets + ' wickets' : store.awayRuns - store.homeRuns + ' runs'}`
              : 'Match Tied'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="primary" onClick={handleReset}>New Match</Button>
            <Button variant="outline" onClick={() => setScorecardModal(true)}>📊 Scorecard</Button>
          </div>
        </Card>
      )}
      
      {/* Extras Modal */}
      <Modal isOpen={extrasModal} onClose={() => setExtrasModal(false)} title="Extras">
        <div className="space-y-3">
          <Button variant="secondary" className="w-full" onClick={() => { store.addExtra('wide'); setExtrasModal(false) }}>Wide (+1)</Button>
          <Button variant="secondary" className="w-full" onClick={() => { store.addExtra('noBall'); setExtrasModal(false) }}>No Ball (+1) - Free Hit Next</Button>
          <Button variant="secondary" className="w-full" onClick={() => { store.addExtra('byes', 1); store.nextBall(); setExtrasModal(false) }}>Byes (+1)</Button>
          <Button variant="secondary" className="w-full" onClick={() => { store.addExtra('legByes', 1); store.nextBall(); setExtrasModal(false) }}>Leg Byes (+1)</Button>
          <div className="border-t border-border pt-3 mt-3">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Wide + Runs</div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <Button key={r} variant="outline" onClick={() => { store.addExtra('wide', r); setExtrasModal(false) }}>W+{r}</Button>
              ))}
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">No Ball + Runs</div>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((r) => (
                <Button key={r} variant="outline" onClick={() => { store.addExtra('noBall', r); setExtrasModal(false) }}>NB+{r}</Button>
              ))}
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Byes/Leg Byes + Overthrows</div>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((r) => (
                <Button key={r} variant="outline" onClick={() => { store.addExtra('byes', r); store.nextBall(); setExtrasModal(false) }}>{r}b</Button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[2, 3, 4, 5].map((r) => (
                <Button key={r} variant="outline" onClick={() => { store.addExtra('legByes', r); store.nextBall(); setExtrasModal(false) }}>{r}lb</Button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      
      {/* Dismissal Type Modal */}
      <Modal isOpen={dismissalModal} onClose={() => setDismissalModal(false)} title="How Out?">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => handleDismissalSelect('bowled')}>Bowled</Button>
          <Button variant="secondary" onClick={() => handleDismissalSelect('caught')}>Caught</Button>
          <Button variant="secondary" onClick={() => handleDismissalSelect('lbw')}>LBW</Button>
          <Button variant="secondary" onClick={() => handleDismissalSelect('runout')}>Run Out</Button>
          <Button variant="secondary" onClick={() => handleDismissalSelect('stumped')}>Stumped</Button>
          <Button variant="secondary" onClick={() => handleDismissalSelect('hitwicket')}>Hit Wicket</Button>
          <Button variant="secondary" onClick={() => handleDismissalSelect('retired')}>Retired Out</Button>
          <Button variant="secondary" onClick={() => handleDismissalSelect('other')}>Other</Button>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <Button variant="outline" className="w-full" onClick={handleRetiredHurt}>Retired Hurt (Not Out)</Button>
        </div>
      </Modal>
      
      {/* Player Name Modal */}
      <Modal isOpen={playerModal.open} onClose={() => setPlayerModal({ ...playerModal, open: false })} title={`Edit ${playerModal.type === 'bowler' ? 'Bowler' : playerModal.type === 'striker' ? 'Striker' : 'Non-Striker'}`}>
        <div className="space-y-3">
          <Input
            label="Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter name"
          />
          <Button variant="primary" className="w-full" onClick={handlePlayerUpdate}>Update</Button>
        </div>
      </Modal>
      
      {/* Penalty Runs Modal */}
      <Modal isOpen={penaltyModal} onClose={() => setPenaltyModal(false)} title="Penalty Runs">
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Award penalty runs to the batting team (typically 5 for ball tampering, field infractions, etc.)</p>
          <Input
            label="Penalty Runs"
            type="number"
            value={penaltyRuns}
            onChange={(e) => setPenaltyRuns(e.target.value)}
            placeholder="5"
            min="1"
          />
          <Button variant="primary" className="w-full" onClick={handlePenaltyRuns}>Add Penalty Runs</Button>
        </div>
      </Modal>
      
      {/* Scorecard Modal */}
      <Modal isOpen={scorecardModal} onClose={() => setScorecardModal(false)} title="Match Scorecard">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Home Team Batting */}
          <div>
            <h3 className="font-bold mb-2">{store.homeTeam} Batting</h3>
            <div className="text-sm space-y-1">
              {store.homeBattingCard.map((batsman, idx) => (
                <div key={idx} className="flex justify-between border-b border-border pb-1">
                  <div>
                    <div className="font-medium">{batsman.name}</div>
                    <div className="text-xs text-text-muted">
                      {batsman.isOut ? `${getDismissalText(batsman.dismissalType!)} b ${batsman.bowlerName}` : 'Not Out'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{batsman.runs} ({batsman.balls})</div>
                    <div className="text-xs text-text-muted">
                      4s:{batsman.fours} 6s:{batsman.sixes} SR:{calculateStrikeRate(batsman.runs, batsman.balls).toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
              {!store.isComplete && store.battingTeam === 'home' && (
                <>
                  <div className="flex justify-between border-b border-border pb-1">
                    <div>
                      <div className="font-medium">{store.currentBatsmen.striker} ⚡</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{store.currentBatsmen.strikerRuns} ({store.currentBatsmen.strikerBalls})</div>
                      <div className="text-xs text-text-muted">
                        4s:{store.currentBatsmen.strikerFours} 6s:{store.currentBatsmen.strikerSixes} SR:{strikerSR.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <div>
                      <div className="font-medium">{store.currentBatsmen.nonStriker}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{store.currentBatsmen.nonStrikerRuns} ({store.currentBatsmen.nonStrikerBalls})</div>
                      <div className="text-xs text-text-muted">
                        4s:{store.currentBatsmen.nonStrikerFours} 6s:{store.currentBatsmen.nonStrikerSixes} SR:{nonStrikerSR.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-2 text-sm">
              <div className="font-bold">Total: {store.homeRuns}/{store.homeWickets} ({formatOvers(store.homeOvers, store.homeBalls)} ov)</div>
              <div className="text-xs text-text-muted">
                Extras: {Object.values(store.homeExtras).reduce((a, b) => a + b, 0)} 
                (wd {store.homeExtras.wide}, nb {store.homeExtras.noBall}, b {store.homeExtras.byes}, lb {store.homeExtras.legByes})
              </div>
            </div>
            {store.homeFallOfWickets.length > 0 && (
              <div className="mt-2 text-xs text-text-muted">
                <div className="font-medium">Fall of Wickets:</div>
                {store.homeFallOfWickets.map((fow, idx) => (
                  <span key={idx}>
                    {fow.wicketNumber}-{fow.runs} ({fow.batsmanName}, {formatOvers(fow.overs, fow.balls)} ov)
                    {idx < store.homeFallOfWickets.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Away Team Bowling */}
          {store.awayBowlingCard.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">{store.awayTeam} Bowling</h3>
              <div className="text-sm space-y-1">
                {store.awayBowlingCard.map((bowler, idx) => (
                  <div key={idx} className="flex justify-between border-b border-border pb-1">
                    <div className="font-medium">{bowler.name}</div>
                    <div className="font-mono text-right">
                      {formatOvers(bowler.overs, bowler.balls)}-{bowler.maidens}-{bowler.runs}-{bowler.wickets}
                      <span className="text-xs text-text-muted ml-2">
                        (Econ: {calculateEconomy(bowler.runs, bowler.overs, bowler.balls).toFixed(2)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Away Team Batting (if innings 2) */}
          {store.innings === 2 && (
            <>
              <div>
                <h3 className="font-bold mb-2">{store.awayTeam} Batting</h3>
                <div className="text-sm space-y-1">
                  {store.awayBattingCard.map((batsman, idx) => (
                    <div key={idx} className="flex justify-between border-b border-border pb-1">
                      <div>
                        <div className="font-medium">{batsman.name}</div>
                        <div className="text-xs text-text-muted">
                          {batsman.isOut ? `${getDismissalText(batsman.dismissalType!)} b ${batsman.bowlerName}` : 'Not Out'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">{batsman.runs} ({batsman.balls})</div>
                        <div className="text-xs text-text-muted">
                          4s:{batsman.fours} 6s:{batsman.sixes} SR:{calculateStrikeRate(batsman.runs, batsman.balls).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!store.isComplete && store.battingTeam === 'away' && (
                    <>
                      <div className="flex justify-between border-b border-border pb-1">
                        <div>
                          <div className="font-medium">{store.currentBatsmen.striker} ⚡</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">{store.currentBatsmen.strikerRuns} ({store.currentBatsmen.strikerBalls})</div>
                          <div className="text-xs text-text-muted">
                            4s:{store.currentBatsmen.strikerFours} 6s:{store.currentBatsmen.strikerSixes} SR:{strikerSR.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between border-b border-border pb-1">
                        <div>
                          <div className="font-medium">{store.currentBatsmen.nonStriker}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">{store.currentBatsmen.nonStrikerRuns} ({store.currentBatsmen.nonStrikerBalls})</div>
                          <div className="text-xs text-text-muted">
                            4s:{store.currentBatsmen.nonStrikerFours} 6s:{store.currentBatsmen.nonStrikerSixes} SR:{nonStrikerSR.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  <div className="font-bold">Total: {store.awayRuns}/{store.awayWickets} ({formatOvers(store.awayOvers, store.awayBalls)} ov)</div>
                  <div className="text-xs text-text-muted">
                    Extras: {Object.values(store.awayExtras).reduce((a, b) => a + b, 0)} 
                    (wd {store.awayExtras.wide}, nb {store.awayExtras.noBall}, b {store.awayExtras.byes}, lb {store.awayExtras.legByes})
                  </div>
                </div>
                {store.awayFallOfWickets.length > 0 && (
                  <div className="mt-2 text-xs text-text-muted">
                    <div className="font-medium">Fall of Wickets:</div>
                    {store.awayFallOfWickets.map((fow, idx) => (
                      <span key={idx}>
                        {fow.wicketNumber}-{fow.runs} ({fow.batsmanName}, {formatOvers(fow.overs, fow.balls)} ov)
                        {idx < store.awayFallOfWickets.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Home Team Bowling */}
              {store.homeBowlingCard.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">{store.homeTeam} Bowling</h3>
                  <div className="text-sm space-y-1">
                    {store.homeBowlingCard.map((bowler, idx) => (
                      <div key={idx} className="flex justify-between border-b border-border pb-1">
                        <div className="font-medium">{bowler.name}</div>
                        <div className="font-mono text-right">
                          {formatOvers(bowler.overs, bowler.balls)}-{bowler.maidens}-{bowler.runs}-{bowler.wickets}
                          <span className="text-xs text-text-muted ml-2">
                            (Econ: {calculateEconomy(bowler.runs, bowler.overs, bowler.balls).toFixed(2)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
      
      {store.isComplete && (
        <Card className="mt-4 text-center">
          <h2 className="text-xl font-bold mb-2">Match Over</h2>
          <p className="text-text-muted mb-4">
            {store.homeRuns > store.awayRuns 
              ? `${store.homeTeam} wins by ${store.innings === 2 && batting === 'home' ? 10 - store.homeWickets + ' wickets' : store.homeRuns - store.awayRuns + ' runs'}`
              : store.awayRuns > store.homeRuns
              ? `${store.awayTeam} wins by ${store.innings === 2 && batting === 'away' ? 10 - store.awayWickets + ' wickets' : store.awayRuns - store.homeRuns + ' runs'}`
              : 'Match Tied'}
          </p>
          <Button variant="primary" onClick={handleReset}>New Match</Button>
        </Card>
      )}
    </GameLayout>
  )
}
