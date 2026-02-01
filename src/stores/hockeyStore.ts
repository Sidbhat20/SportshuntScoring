import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type HockeyState = {
  homeTeam: string
  awayTeam: string
  hockeyType: 'field' | 'ice'
  periodDuration: number
  totalPeriods: number
  
  homeScore: number
  awayScore: number
  currentPeriod: number
  timerSeconds: number
  isRunning: boolean
  isComplete: boolean
  
  // Ice hockey penalties
  homePenalties: { player: string; seconds: number; type: 'minor' | 'major' }[]
  awayPenalties: { player: string; seconds: number; type: 'minor' | 'major' }[]
  
  actions: any[]
  
  setSetup: (homeTeam: string, awayTeam: string, hockeyType: 'field' | 'ice') => void
  addGoal: (team: 'home' | 'away') => void
  addPenalty: (team: 'home' | 'away', player: string, type: 'minor' | 'major') => void
  startTimer: () => void
  stopTimer: () => void
  tick: () => void
  endPeriod: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-hockey'

export const useHockeyStore = create<HockeyState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  hockeyType: 'ice',
  periodDuration: 20,
  totalPeriods: 3,
  homeScore: 0,
  awayScore: 0,
  currentPeriod: 1,
  timerSeconds: 20 * 60,
  isRunning: false,
  isComplete: false,
  homePenalties: [],
  awayPenalties: [],
  actions: [],
  
  setSetup: (homeTeam, awayTeam, hockeyType) => {
    const periodDuration = hockeyType === 'ice' ? 20 : 15
    const totalPeriods = hockeyType === 'ice' ? 3 : 4
    set({ 
      homeTeam, 
      awayTeam, 
      hockeyType,
      periodDuration,
      totalPeriods,
      timerSeconds: periodDuration * 60
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addGoal: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    // End minor penalties on power play goal
    let newHomePenalties = state.homePenalties
    let newAwayPenalties = state.awayPenalties
    
    if (team === 'home' && state.awayPenalties.some(p => p.type === 'minor')) {
      newAwayPenalties = state.awayPenalties.filter((p, i) => i > 0 || p.type !== 'minor')
    } else if (team === 'away' && state.homePenalties.some(p => p.type === 'minor')) {
      newHomePenalties = state.homePenalties.filter((p, i) => i > 0 || p.type !== 'minor')
    }
    
    if (team === 'home') {
      set({
        homeScore: state.homeScore + 1,
        homePenalties: newHomePenalties,
        awayPenalties: newAwayPenalties,
        actions: [...state.actions, { type: 'goal', team, previousState }]
      })
    } else {
      set({
        awayScore: state.awayScore + 1,
        homePenalties: newHomePenalties,
        awayPenalties: newAwayPenalties,
        actions: [...state.actions, { type: 'goal', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPenalty: (team, player, type) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    const seconds = type === 'minor' ? 120 : 300
    
    if (team === 'home') {
      set({
        homePenalties: [...state.homePenalties, { player, seconds, type }],
        actions: [...state.actions, { type: 'penalty', team, player, penaltyType: type, previousState }]
      })
    } else {
      set({
        awayPenalties: [...state.awayPenalties, { player, seconds, type }],
        actions: [...state.actions, { type: 'penalty', team, player, penaltyType: type, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  startTimer: () => set({ isRunning: true }),
  stopTimer: () => set({ isRunning: false }),
  
  tick: () => {
    const state = get()
    if (state.isRunning && state.timerSeconds > 0) {
      // Decrement penalties
      const newHomePenalties = state.homePenalties
        .map(p => ({ ...p, seconds: p.seconds - 1 }))
        .filter(p => p.seconds > 0)
      const newAwayPenalties = state.awayPenalties
        .map(p => ({ ...p, seconds: p.seconds - 1 }))
        .filter(p => p.seconds > 0)
      
      set({ 
        timerSeconds: state.timerSeconds - 1,
        homePenalties: newHomePenalties,
        awayPenalties: newAwayPenalties
      })
    }
  },
  
  endPeriod: () => {
    const state = get()
    if (state.currentPeriod < state.totalPeriods) {
      set({
        currentPeriod: state.currentPeriod + 1,
        timerSeconds: state.periodDuration * 60,
        isRunning: false,
        homePenalties: [],
        awayPenalties: []
      })
    } else {
      set({ isComplete: true, isRunning: false })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  undo: () => {
    const state = get()
    if (state.actions.length === 0) return
    const lastAction = state.actions[state.actions.length - 1]
    set({
      ...lastAction.previousState,
      actions: state.actions.slice(0, -1)
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    const state = get()
    set({
      homeScore: 0,
      awayScore: 0,
      currentPeriod: 1,
      timerSeconds: state.periodDuration * 60,
      isRunning: false,
      isComplete: false,
      homePenalties: [],
      awayPenalties: [],
      actions: []
    })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<HockeyState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
