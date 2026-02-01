import { create } from 'zustand'
import { GameAction } from '@/lib/types'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type CricketFormat = 'T20' | 'ODI' | 'Test' | 'Custom'

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
  
  setSetup: (homeTeam: string, awayTeam: string, format: CricketFormat, maxOvers: number) => void
  addRuns: (runs: number) => void
  addWicket: () => void
  addExtra: (type: 'wide' | 'noBall' | 'byes' | 'legByes', runs?: number) => void
  nextBall: () => void
  switchInnings: () => void
  endMatch: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-cricket'

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
    }
    set(state)
    saveToStorage(STORAGE_KEY, state)
  },
  
  addRuns: (runs) => set((state) => {
    const batting = state.battingTeam
    const newState = {
      ...state,
      homeRuns: batting === 'home' ? state.homeRuns + runs : state.homeRuns,
      awayRuns: batting === 'away' ? state.awayRuns + runs : state.awayRuns,
      actions: [...state.actions, { type: 'addRuns', runs, batting, timestamp: Date.now() }],
    }
    
    // Check if target chased
    if (state.innings === 2 && state.target) {
      const chasingRuns = batting === 'home' ? newState.homeRuns : newState.awayRuns
      if (chasingRuns >= state.target) {
        newState.isComplete = true
      }
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  addWicket: () => set((state) => {
    const batting = state.battingTeam
    const newWickets = batting === 'home' ? state.homeWickets + 1 : state.awayWickets + 1
    
    const newState = {
      ...state,
      homeWickets: batting === 'home' ? newWickets : state.homeWickets,
      awayWickets: batting === 'away' ? newWickets : state.awayWickets,
      actions: [...state.actions, { type: 'addWicket', batting, timestamp: Date.now() }],
    }
    
    // All out (10 wickets)
    if (newWickets >= 10) {
      if (state.innings === 1) {
        newState.target = (batting === 'home' ? newState.homeRuns : newState.awayRuns) + 1
        newState.battingTeam = batting === 'home' ? 'away' : 'home'
        newState.innings = 2
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
    
    const newState = {
      ...state,
      homeRuns: batting === 'home' ? state.homeRuns + extraRuns : state.homeRuns,
      awayRuns: batting === 'away' ? state.awayRuns + extraRuns : state.awayRuns,
      homeExtras: batting === 'home' ? { ...state.homeExtras, [type]: state.homeExtras[type] + extraRuns } : state.homeExtras,
      awayExtras: batting === 'away' ? { ...state.awayExtras, [type]: state.awayExtras[type] + extraRuns } : state.awayExtras,
      actions: [...state.actions, { type: 'addExtra', extraType: type, runs: extraRuns, batting, timestamp: Date.now() }],
    }
    
    // Check if target chased
    if (state.innings === 2 && state.target) {
      const chasingRuns = batting === 'home' ? newState.homeRuns : newState.awayRuns
      if (chasingRuns >= state.target) {
        newState.isComplete = true
      }
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  nextBall: () => set((state) => {
    const batting = state.battingTeam
    let newBalls = batting === 'home' ? state.homeBalls + 1 : state.awayBalls + 1
    let newOvers = batting === 'home' ? state.homeOvers : state.awayOvers
    
    if (newBalls >= 6) {
      newOvers += 1
      newBalls = 0
    }
    
    const newState = {
      ...state,
      homeBalls: batting === 'home' ? newBalls : state.homeBalls,
      homeOvers: batting === 'home' ? newOvers : state.homeOvers,
      awayBalls: batting === 'away' ? newBalls : state.awayBalls,
      awayOvers: batting === 'away' ? newOvers : state.awayOvers,
      actions: [...state.actions, { type: 'nextBall', batting, timestamp: Date.now() }],
    }
    
    // Check if overs completed
    if (newOvers >= state.maxOvers && state.format !== 'Test') {
      if (state.innings === 1) {
        newState.target = (batting === 'home' ? newState.homeRuns : newState.awayRuns) + 1
        newState.battingTeam = batting === 'home' ? 'away' : 'home'
        newState.innings = 2
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
    
    const newState = {
      ...state,
      target: runs + 1,
      battingTeam: batting === 'home' ? 'away' as const : 'home' as const,
      innings: 2 as const,
      actions: [...state.actions, { type: 'switchInnings', timestamp: Date.now() }],
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  endMatch: () => set((state) => {
    const newState = { ...state, isComplete: true, actions: [...state.actions, { type: 'endMatch', timestamp: Date.now() }] }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  undo: () => set((state) => {
    if (state.actions.length === 0) return state
    const actions = [...state.actions]
    const lastAction = actions.pop()!
    
    let newState = { ...state, actions, isComplete: false }
    const batting = lastAction.batting as 'home' | 'away' | undefined
    
    if (lastAction.type === 'addRuns' && batting && lastAction.runs) {
      if (batting === 'home') newState.homeRuns = Math.max(0, state.homeRuns - lastAction.runs)
      else newState.awayRuns = Math.max(0, state.awayRuns - lastAction.runs)
    } else if (lastAction.type === 'addWicket' && batting) {
      if (batting === 'home') newState.homeWickets = Math.max(0, state.homeWickets - 1)
      else newState.awayWickets = Math.max(0, state.awayWickets - 1)
      if (state.innings === 2 && (state.homeWickets === 0 || state.awayWickets === 0)) {
        newState.innings = 1
        newState.battingTeam = batting
        newState.target = null
      }
    } else if (lastAction.type === 'addExtra' && batting && lastAction.runs) {
      if (batting === 'home') {
        newState.homeRuns = Math.max(0, state.homeRuns - lastAction.runs)
        newState.homeExtras = { ...state.homeExtras }
        if (lastAction.extraType) {
          newState.homeExtras[lastAction.extraType as keyof typeof newState.homeExtras] = Math.max(0, state.homeExtras[lastAction.extraType as keyof typeof state.homeExtras] - lastAction.runs)
        }
      } else {
        newState.awayRuns = Math.max(0, state.awayRuns - lastAction.runs)
        newState.awayExtras = { ...state.awayExtras }
        if (lastAction.extraType) {
          newState.awayExtras[lastAction.extraType as keyof typeof newState.awayExtras] = Math.max(0, state.awayExtras[lastAction.extraType as keyof typeof state.awayExtras] - lastAction.runs)
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
