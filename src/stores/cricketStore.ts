import { create } from 'zustand'
import { GameAction } from '@/lib/types'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type CricketFormat = 'T20' | 'ODI' | 'Test' | 'Custom'
type DismissalType = 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket' | 'retired' | 'other'

interface Batsman {
  name: string
  runs: number
  balls: number
  fours: number
  sixes: number
  isOut: boolean
  dismissalType?: DismissalType
  bowlerName?: string
}

interface Bowler {
  name: string
  overs: number
  balls: number
  maidens: number
  runs: number
  wickets: number
}

interface CurrentBatsmen {
  striker: string
  nonStriker: string
  strikerRuns: number
  strikerBalls: number
  strikerFours: number
  strikerSixes: number
  nonStrikerRuns: number
  nonStrikerBalls: number
  nonStrikerFours: number
  nonStrikerSixes: number
}

interface CurrentBowler {
  name: string
  overs: number
  balls: number
  runs: number
  wickets: number
}

interface FallOfWicket {
  wicketNumber: number
  runs: number
  batsmanName: string
  dismissalType: DismissalType
  bowlerName: string
  overs: number
  balls: number
}

interface OverBall {
  runs: number
  isWicket: boolean
  isExtra: boolean
  extraType?: 'wide' | 'noBall' | 'byes' | 'legByes'
  isFour: boolean
  isSix: boolean
}

interface CricketState {
  homeTeam: string
  awayTeam: string
  format: CricketFormat
  maxOvers: number
  homeRuns: number
  homeWickets: number
  homeOvers: number
  homeBalls: number
  homeExtras: { wide: number; noBall: number; byes: number; legByes: number }
  awayRuns: number
  awayWickets: number
  awayOvers: number
  awayBalls: number
  awayExtras: { wide: number; noBall: number; byes: number; legByes: number }
  battingTeam: 'home' | 'away'
  innings: 1 | 2
  target: number | null
  isComplete: boolean
  actions: GameAction[]
  
  // Player tracking
  currentBatsmen: CurrentBatsmen
  currentBowler: CurrentBowler
  homeBattingCard: Batsman[]
  awayBattingCard: Batsman[]
  homeBowlingCard: Bowler[]
  awayBowlingCard: Bowler[]
  homeFallOfWickets: FallOfWicket[]
  awayFallOfWickets: FallOfWicket[]
  currentPartnership: number
  recentOvers: OverBall[][]
  currentOver: OverBall[]
  
  setSetup: (homeTeam: string, awayTeam: string, format: CricketFormat, maxOvers: number) => void
  addRuns: (runs: number, isFour?: boolean, isSix?: boolean) => void
  addWicket: (dismissalType?: DismissalType) => void
  addExtra: (type: 'wide' | 'noBall' | 'byes' | 'legByes', runs?: number) => void
  nextBall: () => void
  switchInnings: () => void
  endMatch: () => void
  toggleStriker: () => void
  updateBatsman: (position: 'striker' | 'nonStriker', name: string) => void
  updateBowler: (name: string) => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-cricket'

const getInitialBatsmen = (): CurrentBatsmen => ({
  striker: 'Batsman 1',
  nonStriker: 'Batsman 2',
  strikerRuns: 0,
  strikerBalls: 0,
  strikerFours: 0,
  strikerSixes: 0,
  nonStrikerRuns: 0,
  nonStrikerBalls: 0,
  nonStrikerFours: 0,
  nonStrikerSixes: 0,
})

const getInitialBowler = (): CurrentBowler => ({
  name: 'Bowler 1',
  overs: 0,
  balls: 0,
  runs: 0,
  wickets: 0,
})

export const useCricketStore = create<CricketState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  format: 'T20',
  maxOvers: 20,
  homeRuns: 0,
  homeWickets: 0,
  homeOvers: 0,
  homeBalls: 0,
  homeExtras: { wide: 0, noBall: 0, byes: 0, legByes: 0 },
  awayRuns: 0,
  awayWickets: 0,
  awayOvers: 0,
  awayBalls: 0,
  awayExtras: { wide: 0, noBall: 0, byes: 0, legByes: 0 },
  battingTeam: 'home',
  innings: 1,
  target: null,
  isComplete: false,
  actions: [],
  
  // Player tracking
  currentBatsmen: getInitialBatsmen(),
  currentBowler: getInitialBowler(),
  homeBattingCard: [],
  awayBattingCard: [],
  homeBowlingCard: [],
  awayBowlingCard: [],
  homeFallOfWickets: [],
  awayFallOfWickets: [],
  currentPartnership: 0,
  recentOvers: [],
  currentOver: [],
  
  setSetup: (homeTeam, awayTeam, format, maxOvers) => {
    const state = {
      homeTeam,
      awayTeam,
      format,
      maxOvers,
      homeRuns: 0,
      homeWickets: 0,
      homeOvers: 0,
      homeBalls: 0,
      homeExtras: { wide: 0, noBall: 0, byes: 0, legByes: 0 },
      awayRuns: 0,
      awayWickets: 0,
      awayOvers: 0,
      awayBalls: 0,
      awayExtras: { wide: 0, noBall: 0, byes: 0, legByes: 0 },
      battingTeam: 'home' as const,
      innings: 1 as const,
      target: null,
      isComplete: false,
      actions: [],
      currentBatsmen: getInitialBatsmen(),
      currentBowler: getInitialBowler(),
      homeBattingCard: [],
      awayBattingCard: [],
      homeBowlingCard: [],
      awayBowlingCard: [],
      homeFallOfWickets: [],
      awayFallOfWickets: [],
      currentPartnership: 0,
      recentOvers: [],
      currentOver: [],
    }
    set(state)
    saveToStorage(STORAGE_KEY, state)
  },
  
  addRuns: (runs, isFour = false, isSix = false) => set((state) => {
    const batting = state.battingTeam
    
    // Update striker's stats
    const newBatsmen = {
      ...state.currentBatsmen,
      strikerRuns: state.currentBatsmen.strikerRuns + runs,
      strikerBalls: state.currentBatsmen.strikerBalls + 1,
      strikerFours: isFour ? state.currentBatsmen.strikerFours + 1 : state.currentBatsmen.strikerFours,
      strikerSixes: isSix ? state.currentBatsmen.strikerSixes + 1 : state.currentBatsmen.strikerSixes,
    }
    
    // Update bowler's stats
    const newBowler = {
      ...state.currentBowler,
      runs: state.currentBowler.runs + runs,
    }
    
    // Add to current over
    const newCurrentOver = [...state.currentOver, {
      runs,
      isWicket: false,
      isExtra: false,
      isFour,
      isSix,
    }]
    
    const newState = {
      ...state,
      homeRuns: batting === 'home' ? state.homeRuns + runs : state.homeRuns,
      awayRuns: batting === 'away' ? state.awayRuns + runs : state.awayRuns,
      currentBatsmen: newBatsmen,
      currentBowler: newBowler,
      currentPartnership: state.currentPartnership + runs,
      currentOver: newCurrentOver,
      actions: [...state.actions, { type: 'addRuns', team: batting, value: runs, timestamp: Date.now(), previousState: state }],
    }
    
    // Check if target chased
    if (state.innings === 2 && state.target) {
      const chasingRuns = batting === 'home' ? newState.homeRuns : newState.awayRuns
      if (chasingRuns >= state.target) {
        newState.isComplete = true
        // Save current batsmen as not out
        const striker: Batsman = {
          name: newState.currentBatsmen.striker,
          runs: newState.currentBatsmen.strikerRuns,
          balls: newState.currentBatsmen.strikerBalls,
          fours: newState.currentBatsmen.strikerFours,
          sixes: newState.currentBatsmen.strikerSixes,
          isOut: false,
        }
        const nonStriker: Batsman = {
          name: newState.currentBatsmen.nonStriker,
          runs: newState.currentBatsmen.nonStrikerRuns,
          balls: newState.currentBatsmen.nonStrikerBalls,
          fours: newState.currentBatsmen.nonStrikerFours,
          sixes: newState.currentBatsmen.nonStrikerSixes,
          isOut: false,
        }
        newState.homeBattingCard = batting === 'home' ? [...newState.homeBattingCard, striker, nonStriker] : newState.homeBattingCard
        newState.awayBattingCard = batting === 'away' ? [...newState.awayBattingCard, striker, nonStriker] : newState.awayBattingCard
      }
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  addWicket: (dismissalType: DismissalType = 'other') => set((state) => {
    const batting = state.battingTeam
    const newWickets = batting === 'home' ? state.homeWickets + 1 : state.awayWickets + 1
    const currentRuns = batting === 'home' ? state.homeRuns : state.awayRuns
    const currentOvers = batting === 'home' ? state.homeOvers : state.awayOvers
    const currentBalls = batting === 'home' ? state.homeBalls : state.awayBalls
    
    // Record fall of wicket
    const fallOfWicket: FallOfWicket = {
      wicketNumber: newWickets,
      runs: currentRuns,
      batsmanName: state.currentBatsmen.striker,
      dismissalType,
      bowlerName: state.currentBowler.name,
      overs: currentOvers,
      balls: currentBalls,
    }
    
    // Add batsman to card
    const newBatsman: Batsman = {
      name: state.currentBatsmen.striker,
      runs: state.currentBatsmen.strikerRuns,
      balls: state.currentBatsmen.strikerBalls,
      fours: state.currentBatsmen.strikerFours,
      sixes: state.currentBatsmen.strikerSixes,
      isOut: true,
      dismissalType,
      bowlerName: state.currentBowler.name,
    }
    
    // Update bowler's wicket count
    const newBowler = {
      ...state.currentBowler,
      wickets: state.currentBowler.wickets + 1,
    }
    
    // Add to current over
    const newCurrentOver = [...state.currentOver, {
      runs: 0,
      isWicket: true,
      isExtra: false,
      isFour: false,
      isSix: false,
    }]
    
    // Reset striker for new batsman
    const newBatsmen = {
      ...state.currentBatsmen,
      striker: `Batsman ${newWickets + 2}`,
      strikerRuns: 0,
      strikerBalls: 0,
      strikerFours: 0,
      strikerSixes: 0,
    }
    
    const newState = {
      ...state,
      homeWickets: batting === 'home' ? newWickets : state.homeWickets,
      awayWickets: batting === 'away' ? newWickets : state.awayWickets,
      homeFallOfWickets: batting === 'home' ? [...state.homeFallOfWickets, fallOfWicket] : state.homeFallOfWickets,
      awayFallOfWickets: batting === 'away' ? [...state.awayFallOfWickets, fallOfWicket] : state.awayFallOfWickets,
      homeBattingCard: batting === 'home' ? [...state.homeBattingCard, newBatsman] : state.homeBattingCard,
      awayBattingCard: batting === 'away' ? [...state.awayBattingCard, newBatsman] : state.awayBattingCard,
      currentBatsmen: newBatsmen,
      currentBowler: newBowler,
      currentPartnership: 0,
      currentOver: newCurrentOver,
      actions: [...state.actions, { type: 'addWicket', team: batting, value: null, timestamp: Date.now(), previousState: state }],
    }
    
    // All out (10 wickets)
    if (newWickets >= 10) {
      // Save non-striker as not out
      const nonStrikerBatsman: Batsman = {
        name: state.currentBatsmen.nonStriker,
        runs: state.currentBatsmen.nonStrikerRuns,
        balls: state.currentBatsmen.nonStrikerBalls,
        fours: state.currentBatsmen.nonStrikerFours,
        sixes: state.currentBatsmen.nonStrikerSixes,
        isOut: false,
      }
      newState.homeBattingCard = batting === 'home' ? [...newState.homeBattingCard, nonStrikerBatsman] : newState.homeBattingCard
      newState.awayBattingCard = batting === 'away' ? [...newState.awayBattingCard, nonStrikerBatsman] : newState.awayBattingCard
      
      if (state.innings === 1) {
        newState.target = (batting === 'home' ? newState.homeRuns : newState.awayRuns) + 1
        newState.battingTeam = batting === 'home' ? 'away' : 'home'
        newState.innings = 2
        newState.currentBatsmen = getInitialBatsmen()
        newState.currentBowler = getInitialBowler()
        newState.currentPartnership = 0
        newState.currentOver = []
        newState.recentOvers = []
      } else {
        newState.isComplete = true
      }
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  addExtra: (type, runs = 1) => set((state) => {
    const batting = state.battingTeam
    const extraRuns = type === 'wide' || type === 'noBall' ? runs + 1 : runs
    
    // For byes/leg byes, striker faces the ball
    const isByesOrLegByes = type === 'byes' || type === 'legByes'
    const newBatsmen = isByesOrLegByes ? {
      ...state.currentBatsmen,
      strikerBalls: state.currentBatsmen.strikerBalls + 1,
    } : state.currentBatsmen
    
    // Update bowler's runs (all extras count against bowler)
    const newBowler = {
      ...state.currentBowler,
      runs: state.currentBowler.runs + extraRuns,
    }
    
    // Add to current over
    const newCurrentOver = [...state.currentOver, {
      runs: extraRuns,
      isWicket: false,
      isExtra: true,
      extraType: type,
      isFour: false,
      isSix: false,
    }]
    
    const newState = {
      ...state,
      homeRuns: batting === 'home' ? state.homeRuns + extraRuns : state.homeRuns,
      awayRuns: batting === 'away' ? state.awayRuns + extraRuns : state.awayRuns,
      homeExtras: batting === 'home' ? { ...state.homeExtras, [type]: state.homeExtras[type] + extraRuns } : state.homeExtras,
      awayExtras: batting === 'away' ? { ...state.awayExtras, [type]: state.awayExtras[type] + extraRuns } : state.awayExtras,
      currentBatsmen: newBatsmen,
      currentBowler: newBowler,
      currentPartnership: state.currentPartnership + extraRuns,
      currentOver: newCurrentOver,
      actions: [...state.actions, { type: 'addExtra', team: batting, value: { extraType: type, runs: extraRuns }, timestamp: Date.now(), previousState: state }],
    }
    
    // Check if target chased
    if (state.innings === 2 && state.target) {
      const chasingRuns = batting === 'home' ? newState.homeRuns : newState.awayRuns
      if (chasingRuns >= state.target) {
        newState.isComplete = true
        // Save current batsmen as not out
        const striker: Batsman = {
          name: newState.currentBatsmen.striker,
          runs: newState.currentBatsmen.strikerRuns,
          balls: newState.currentBatsmen.strikerBalls,
          fours: newState.currentBatsmen.strikerFours,
          sixes: newState.currentBatsmen.strikerSixes,
          isOut: false,
        }
        const nonStriker: Batsman = {
          name: newState.currentBatsmen.nonStriker,
          runs: newState.currentBatsmen.nonStrikerRuns,
          balls: newState.currentBatsmen.nonStrikerBalls,
          fours: newState.currentBatsmen.nonStrikerFours,
          sixes: newState.currentBatsmen.nonStrikerSixes,
          isOut: false,
        }
        newState.homeBattingCard = batting === 'home' ? [...newState.homeBattingCard, striker, nonStriker] : newState.homeBattingCard
        newState.awayBattingCard = batting === 'away' ? [...newState.awayBattingCard, striker, nonStriker] : newState.awayBattingCard
      }
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  nextBall: () => set((state) => {
    const batting = state.battingTeam
    let newBalls = batting === 'home' ? state.homeBalls + 1 : state.awayBalls + 1
    let newOvers = batting === 'home' ? state.homeOvers : state.awayOvers
    
    // Update bowler's balls
    const newBowlerBalls = state.currentBowler.balls + 1
    let newBowlerOvers = state.currentBowler.overs
    let finalBowlerBalls = newBowlerBalls
    
    const newState = { ...state }
    
    if (newBalls >= 6) {
      newOvers += 1
      newBalls = 0
      
      // Over completed
      if (newBowlerBalls >= 6) {
        newBowlerOvers += 1
        finalBowlerBalls = 0
        
        // Check for maiden over (no runs in current over)
        const overRuns = state.currentOver.reduce((sum, ball) => sum + ball.runs, 0)
        const isMaiden = overRuns === 0 && state.currentOver.length === 6
        
        // Save completed bowler to bowling card
        const completedBowler: Bowler = {
          name: state.currentBowler.name,
          overs: newBowlerOvers,
          balls: 0,
          maidens: isMaiden ? 1 : 0,
          runs: state.currentBowler.runs,
          wickets: state.currentBowler.wickets,
        }
        
        // Update or add bowler to card (immutable)
        const bowlingCard = batting === 'home' ? [...state.awayBowlingCard] : [...state.homeBowlingCard]
        const existingBowlerIndex = bowlingCard.findIndex(b => b.name === state.currentBowler.name)
        
        if (existingBowlerIndex >= 0) {
          bowlingCard[existingBowlerIndex] = {
            ...bowlingCard[existingBowlerIndex],
            overs: completedBowler.overs,
            maidens: bowlingCard[existingBowlerIndex].maidens + (isMaiden ? 1 : 0),
            runs: completedBowler.runs,
            wickets: completedBowler.wickets,
          }
        } else {
          bowlingCard.push(completedBowler)
        }
        
        if (batting === 'home') {
          newState.awayBowlingCard = bowlingCard
        } else {
          newState.homeBowlingCard = bowlingCard
        }
      }
      
      // Add current over to recent overs
      newState.recentOvers = [...state.recentOvers.slice(-5), state.currentOver]
      newState.currentOver = []
      
      // Rotate strike at end of over
      const tempStriker = state.currentBatsmen.striker
      const tempStrikerRuns = state.currentBatsmen.strikerRuns
      const tempStrikerBalls = state.currentBatsmen.strikerBalls
      const tempStrikerFours = state.currentBatsmen.strikerFours
      const tempStrikerSixes = state.currentBatsmen.strikerSixes
      
      newState.currentBatsmen = {
        striker: state.currentBatsmen.nonStriker,
        nonStriker: tempStriker,
        strikerRuns: state.currentBatsmen.nonStrikerRuns,
        strikerBalls: state.currentBatsmen.nonStrikerBalls,
        strikerFours: state.currentBatsmen.nonStrikerFours,
        strikerSixes: state.currentBatsmen.nonStrikerSixes,
        nonStrikerRuns: tempStrikerRuns,
        nonStrikerBalls: tempStrikerBalls,
        nonStrikerFours: tempStrikerFours,
        nonStrikerSixes: tempStrikerSixes,
      }
    } else {
      // Rotate strike on odd runs (1, 3, 5) - but not for wides or no balls
      const lastBall = state.currentOver[state.currentOver.length - 1]
      const isWideOrNoBall = lastBall?.isExtra && (lastBall.extraType === 'wide' || lastBall.extraType === 'noBall')
      if (lastBall && !isWideOrNoBall && !lastBall.isWicket && lastBall.runs % 2 === 1) {
        const tempStriker = state.currentBatsmen.striker
        const tempStrikerRuns = state.currentBatsmen.strikerRuns
        const tempStrikerBalls = state.currentBatsmen.strikerBalls
        const tempStrikerFours = state.currentBatsmen.strikerFours
        const tempStrikerSixes = state.currentBatsmen.strikerSixes
        
        newState.currentBatsmen = {
          striker: state.currentBatsmen.nonStriker,
          nonStriker: tempStriker,
          strikerRuns: state.currentBatsmen.nonStrikerRuns,
          strikerBalls: state.currentBatsmen.nonStrikerBalls,
          strikerFours: state.currentBatsmen.nonStrikerFours,
          strikerSixes: state.currentBatsmen.nonStrikerSixes,
          nonStrikerRuns: tempStrikerRuns,
          nonStrikerBalls: tempStrikerBalls,
          nonStrikerFours: tempStrikerFours,
          nonStrikerSixes: tempStrikerSixes,
        }
      }
    }
    
    newState.homeBalls = batting === 'home' ? newBalls : state.homeBalls
    newState.homeOvers = batting === 'home' ? newOvers : state.homeOvers
    newState.awayBalls = batting === 'away' ? newBalls : state.awayBalls
    newState.awayOvers = batting === 'away' ? newOvers : state.awayOvers
    newState.currentBowler = {
      ...state.currentBowler,
      overs: newBowlerOvers,
      balls: finalBowlerBalls,
    }
    newState.actions = [...state.actions, { type: 'nextBall', team: batting, value: null, timestamp: Date.now(), previousState: state }]
    
    // Check if overs completed
    if (newOvers >= state.maxOvers && state.format !== 'Test') {
      // Save current batsmen as not out when innings ends
      const striker: Batsman = {
        name: newState.currentBatsmen.striker,
        runs: newState.currentBatsmen.strikerRuns,
        balls: newState.currentBatsmen.strikerBalls,
        fours: newState.currentBatsmen.strikerFours,
        sixes: newState.currentBatsmen.strikerSixes,
        isOut: false,
      }
      const nonStriker: Batsman = {
        name: newState.currentBatsmen.nonStriker,
        runs: newState.currentBatsmen.nonStrikerRuns,
        balls: newState.currentBatsmen.nonStrikerBalls,
        fours: newState.currentBatsmen.nonStrikerFours,
        sixes: newState.currentBatsmen.nonStrikerSixes,
        isOut: false,
      }
      newState.homeBattingCard = batting === 'home' ? [...newState.homeBattingCard, striker, nonStriker] : newState.homeBattingCard
      newState.awayBattingCard = batting === 'away' ? [...newState.awayBattingCard, striker, nonStriker] : newState.awayBattingCard
      
      if (state.innings === 1) {
        newState.target = (batting === 'home' ? newState.homeRuns : newState.awayRuns) + 1
        newState.battingTeam = batting === 'home' ? 'away' : 'home'
        newState.innings = 2
        newState.currentBatsmen = getInitialBatsmen()
        newState.currentBowler = getInitialBowler()
        newState.currentPartnership = 0
        newState.currentOver = []
        newState.recentOvers = []
      } else {
        newState.isComplete = true
      }
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  switchInnings: () => set((state) => {
    const batting = state.battingTeam
    const runs = batting === 'home' ? state.homeRuns : state.awayRuns
    
    // Save current batsmen as not out when manually ending innings
    const striker: Batsman = {
      name: state.currentBatsmen.striker,
      runs: state.currentBatsmen.strikerRuns,
      balls: state.currentBatsmen.strikerBalls,
      fours: state.currentBatsmen.strikerFours,
      sixes: state.currentBatsmen.strikerSixes,
      isOut: false,
    }
    const nonStriker: Batsman = {
      name: state.currentBatsmen.nonStriker,
      runs: state.currentBatsmen.nonStrikerRuns,
      balls: state.currentBatsmen.nonStrikerBalls,
      fours: state.currentBatsmen.nonStrikerFours,
      sixes: state.currentBatsmen.nonStrikerSixes,
      isOut: false,
    }
    
    const newState = {
      ...state,
      target: runs + 1,
      battingTeam: batting === 'home' ? 'away' as const : 'home' as const,
      innings: 2 as const,
      homeBattingCard: batting === 'home' ? [...state.homeBattingCard, striker, nonStriker] : state.homeBattingCard,
      awayBattingCard: batting === 'away' ? [...state.awayBattingCard, striker, nonStriker] : state.awayBattingCard,
      currentBatsmen: getInitialBatsmen(),
      currentBowler: getInitialBowler(),
      currentPartnership: 0,
      currentOver: [],
      recentOvers: [],
      actions: [...state.actions, { type: 'switchInnings', team: null, value: null, timestamp: Date.now(), previousState: state }],
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  endMatch: () => set((state) => {
    // Save current batsmen to card if not already out
    const batting = state.battingTeam
    const striker: Batsman = {
      name: state.currentBatsmen.striker,
      runs: state.currentBatsmen.strikerRuns,
      balls: state.currentBatsmen.strikerBalls,
      fours: state.currentBatsmen.strikerFours,
      sixes: state.currentBatsmen.strikerSixes,
      isOut: false,
    }
    const nonStriker: Batsman = {
      name: state.currentBatsmen.nonStriker,
      runs: state.currentBatsmen.nonStrikerRuns,
      balls: state.currentBatsmen.nonStrikerBalls,
      fours: state.currentBatsmen.nonStrikerFours,
      sixes: state.currentBatsmen.nonStrikerSixes,
      isOut: false,
    }
    
    const newState = { 
      ...state, 
      isComplete: true,
      homeBattingCard: batting === 'home' ? [...state.homeBattingCard, striker, nonStriker] : state.homeBattingCard,
      awayBattingCard: batting === 'away' ? [...state.awayBattingCard, striker, nonStriker] : state.awayBattingCard,
      actions: [...state.actions, { type: 'endMatch', team: null, value: null, timestamp: Date.now(), previousState: state }] 
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  toggleStriker: () => set((state) => {
    const tempStriker = state.currentBatsmen.striker
    const tempStrikerRuns = state.currentBatsmen.strikerRuns
    const tempStrikerBalls = state.currentBatsmen.strikerBalls
    const tempStrikerFours = state.currentBatsmen.strikerFours
    const tempStrikerSixes = state.currentBatsmen.strikerSixes
    
    const newState = {
      ...state,
      currentBatsmen: {
        striker: state.currentBatsmen.nonStriker,
        nonStriker: tempStriker,
        strikerRuns: state.currentBatsmen.nonStrikerRuns,
        strikerBalls: state.currentBatsmen.nonStrikerBalls,
        strikerFours: state.currentBatsmen.nonStrikerFours,
        strikerSixes: state.currentBatsmen.nonStrikerSixes,
        nonStrikerRuns: tempStrikerRuns,
        nonStrikerBalls: tempStrikerBalls,
        nonStrikerFours: tempStrikerFours,
        nonStrikerSixes: tempStrikerSixes,
      },
      actions: [...state.actions, { type: 'toggleStriker', team: null, value: null, timestamp: Date.now(), previousState: state }],
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  updateBatsman: (position, name) => set((state) => {
    const newState = {
      ...state,
      currentBatsmen: {
        ...state.currentBatsmen,
        [position]: name,
      },
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  updateBowler: (name) => set((state) => {
    const newState = {
      ...state,
      currentBowler: {
        ...state.currentBowler,
        name,
      },
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  undo: () => set((state) => {
    if (state.actions.length === 0) return state
    
    // Cannot undo if match is complete without actions
    if (state.isComplete && state.actions.length === 1) return state
    
    const actions = [...state.actions]
    const lastAction = actions.pop()!
    
    let newState = { ...state, actions, isComplete: false }
    const batting = lastAction.team as 'home' | 'away' | null
    
    // Note: Full undo with player tracking would be complex
    // This is a simplified version that handles basic scoring
    if (lastAction.type === 'addRuns' && batting && lastAction.value) {
      if (batting === 'home') newState.homeRuns = Math.max(0, state.homeRuns - (lastAction.value as number))
      else newState.awayRuns = Math.max(0, state.awayRuns - (lastAction.value as number))
    } else if (lastAction.type === 'addWicket' && batting) {
      if (batting === 'home') newState.homeWickets = Math.max(0, state.homeWickets - 1)
      else newState.awayWickets = Math.max(0, state.awayWickets - 1)
      if (state.innings === 2 && ((batting === 'home' && state.homeWickets === 10) || (batting === 'away' && state.awayWickets === 10))) {
        newState.innings = 1
        newState.battingTeam = batting
        newState.target = null
      }
    } else if (lastAction.type === 'addExtra' && batting && lastAction.value) {
      const extraData = lastAction.value as { extraType: string; runs: number }
      if (batting === 'home') {
        newState.homeRuns = Math.max(0, state.homeRuns - extraData.runs)
        newState.homeExtras = { ...state.homeExtras }
        if (extraData.extraType) {
          newState.homeExtras[extraData.extraType as keyof typeof newState.homeExtras] = Math.max(0, state.homeExtras[extraData.extraType as keyof typeof state.homeExtras] - extraData.runs)
        }
      } else {
        newState.awayRuns = Math.max(0, state.awayRuns - extraData.runs)
        newState.awayExtras = { ...state.awayExtras }
        if (extraData.extraType) {
          newState.awayExtras[extraData.extraType as keyof typeof newState.awayExtras] = Math.max(0, state.awayExtras[extraData.extraType as keyof typeof state.awayExtras] - extraData.runs)
        }
      }
    } else if (lastAction.type === 'nextBall' && batting) {
      if (batting === 'home') {
        if (state.homeBalls === 0) {
          newState.homeOvers = Math.max(0, state.homeOvers - 1)
          newState.homeBalls = 5
        } else {
          newState.homeBalls = state.homeBalls - 1
        }
      } else {
        if (state.awayBalls === 0) {
          newState.awayOvers = Math.max(0, state.awayOvers - 1)
          newState.awayBalls = 5
        } else {
          newState.awayBalls = state.awayBalls - 1
        }
      }
      if (state.innings === 2) {
        newState.innings = 1
        newState.battingTeam = batting
        newState.target = null
      }
    } else if (lastAction.type === 'switchInnings') {
      newState.innings = 1
      newState.battingTeam = state.battingTeam === 'home' ? 'away' : 'home'
      newState.target = null
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  reset: () => {
    clearStorage(STORAGE_KEY)
    set({
      homeTeam: '',
      awayTeam: '',
      format: 'T20',
      maxOvers: 20,
      homeRuns: 0,
      homeWickets: 0,
      homeOvers: 0,
      homeBalls: 0,
      homeExtras: { wide: 0, noBall: 0, byes: 0, legByes: 0 },
      awayRuns: 0,
      awayWickets: 0,
      awayOvers: 0,
      awayBalls: 0,
      awayExtras: { wide: 0, noBall: 0, byes: 0, legByes: 0 },
      battingTeam: 'home',
      innings: 1,
      target: null,
      isComplete: false,
      actions: [],
      currentBatsmen: getInitialBatsmen(),
      currentBowler: getInitialBowler(),
      homeBattingCard: [],
      awayBattingCard: [],
      homeBowlingCard: [],
      awayBowlingCard: [],
      homeFallOfWickets: [],
      awayFallOfWickets: [],
      currentPartnership: 0,
      recentOvers: [],
      currentOver: [],
    })
  },
  
  loadState: () => {
    const saved = loadFromStorage(STORAGE_KEY)
    if (saved) set(saved)
  },
}))

export const formatOvers = (overs: number, balls: number) => `${overs}.${balls}`

export const calculateRunRate = (runs: number, overs: number, balls: number) => {
  const totalOvers = overs + balls / 6
  if (totalOvers === 0) return 0
  return runs / totalOvers
}

export const calculateRequiredRunRate = (target: number, currentRuns: number, maxOvers: number, currentOvers: number, currentBalls: number) => {
  const remainingRuns = target - currentRuns
  const remainingOvers = maxOvers - currentOvers - currentBalls / 6
  if (remainingOvers <= 0) return 0
  return remainingRuns / remainingOvers
}

export const calculateStrikeRate = (runs: number, balls: number) => {
  if (balls === 0) return 0
  return (runs / balls) * 100
}

export const calculateEconomy = (runs: number, overs: number, balls: number) => {
  const totalOvers = overs + balls / 6
  if (totalOvers === 0) return 0
  return runs / totalOvers
}

export const isPowerplay = (overs: number, format: CricketFormat) => {
  if (format === 'T20') return overs < 6
  if (format === 'ODI') return overs < 10
  return false
}

export const isDeathOvers = (overs: number, maxOvers: number, format: CricketFormat) => {
  if (format === 'T20') return overs >= maxOvers - 4
  if (format === 'ODI') return overs >= maxOvers - 10
  return false
}

export const formatBallInOver = (ball: OverBall): string => {
  if (ball.isWicket) return 'W'
  if (ball.isExtra) {
    if (ball.extraType === 'wide') return `${ball.runs}wd`
    if (ball.extraType === 'noBall') return `${ball.runs}nb`
    return `${ball.runs}b`
  }
  if (ball.isSix) return '6'
  if (ball.isFour) return '4'
  return ball.runs.toString()
}

export const getDismissalText = (type: DismissalType) => {
  const texts: Record<DismissalType, string> = {
    bowled: 'Bowled',
    caught: 'Caught',
    lbw: 'LBW',
    runout: 'Run Out',
    stumped: 'Stumped',
    hitwicket: 'Hit Wicket',
    retired: 'Retired',
    other: 'Out',
  }
  return texts[type]
}
