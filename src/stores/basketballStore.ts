import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type BasketballState = {
  // Setup
  homeTeam: string
  awayTeam: string
  quarterDurationSeconds: number
  
  // Game state
  homeScore: number
  awayScore: number
  currentQuarter: 1 | 2 | 3 | 4
  gameClockSeconds: number
  shotClockSeconds: number
  isRunning: boolean
  isComplete: boolean
  shotClockViolation: boolean
  
  // Stats
  homeFouls: number
  awayFouls: number
  homeTimeouts: number
  awayTimeouts: number
  
  // Action history
  actions: any[]
  
  // Actions
  setSetup: (homeTeam: string, awayTeam: string, quarterDurationSeconds: number) => void
  addPoints: (team: 'home' | 'away', points: number) => void
  addFoul: (team: 'home' | 'away') => void
  useTimeout: (team: 'home' | 'away') => void
  startTimer: () => void
  stopTimer: () => void
  tick: () => void
  resetShotClock: (seconds: number) => void
  clearViolation: () => void
  nextQuarter: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-basketball'

export const useBasketballStore = create<BasketballState>((set, get) => ({
  // Initial state
  homeTeam: '',
  awayTeam: '',
  quarterDurationSeconds: 12 * 60,
  homeScore: 0,
  awayScore: 0,
  currentQuarter: 1,
  gameClockSeconds: 12 * 60,
  shotClockSeconds: 24,
  isRunning: false,
  isComplete: false,
  shotClockViolation: false,
  homeFouls: 0,
  awayFouls: 0,
  homeTimeouts: 5,
  awayTimeouts: 5,
  actions: [],
  
  setSetup: (homeTeam, awayTeam, quarterDurationSeconds) => {
    set({ 
      homeTeam, 
      awayTeam, 
      quarterDurationSeconds,
      gameClockSeconds: quarterDurationSeconds,
      shotClockSeconds: 24
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPoints: (team, points) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      set({
        homeScore: state.homeScore + points,
        actions: [...state.actions, { type: 'points', team, points, previousState }]
      })
    } else {
      set({
        awayScore: state.awayScore + points,
        actions: [...state.actions, { type: 'points', team, points, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addFoul: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      set({
        homeFouls: state.homeFouls + 1,
        actions: [...state.actions, { type: 'foul', team, previousState }]
      })
    } else {
      set({
        awayFouls: state.awayFouls + 1,
        actions: [...state.actions, { type: 'foul', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  useTimeout: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home' && state.homeTimeouts > 0) {
      set({
        homeTimeouts: state.homeTimeouts - 1,
        isRunning: false,
        actions: [...state.actions, { type: 'timeout', team, previousState }]
      })
    } else if (team === 'away' && state.awayTimeouts > 0) {
      set({
        awayTimeouts: state.awayTimeouts - 1,
        isRunning: false,
        actions: [...state.actions, { type: 'timeout', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  startTimer: () => {
    set({ isRunning: true })
    saveToStorage(STORAGE_KEY, get())
  },
  
  stopTimer: () => {
    set({ isRunning: false })
    saveToStorage(STORAGE_KEY, get())
  },
  
  tick: () => {
    const state = get()
    if (state.isRunning) {
      const newGameClock = Math.max(0, state.gameClockSeconds - 1)
      const newShotClock = Math.max(0, state.shotClockSeconds - 1)
      
      set({ 
        gameClockSeconds: newGameClock,
        shotClockSeconds: newShotClock
      })
      
      // Auto stop at game clock 0
      if (newGameClock === 0) {
        set({ isRunning: false })
      }
      
      // Shot clock violation - stop and set flag for 2 sec delay then auto-reset
      if (newShotClock === 0 && newGameClock > 0) {
        set({ isRunning: false, shotClockViolation: true })
      }
      
      saveToStorage(STORAGE_KEY, get())
        homeFouls: 0,
        awayFouls: 0,
        isRunning: false
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
    const newActions = state.actions.slice(0, -1)
    
    set({
      homeScore: lastAction.previousState.homeScore,
      awayScore: lastAction.previousState.awayScore,
      homeFouls: lastAction.previousState.homeFouls,
      awayFouls: lastAction.previousState.awayFouls,
      homeTimeouts: lastAction.previousState.homeTimeouts,
      awayTimeouts: lastAction.previousState.awayTimeouts,
      actions: newActions
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    const state = get()
    set({
      homeScore: 0,
      awayScore: 0,
      currentQuarter: 1,
      gameClockSeconds: state.quarterDurationSeconds,
      shotClockSeconds: 24,
      isRunning: false,
      isComplete: false,
      homeFouls: 0,
      awayFouls: 0,
      homeTimeouts: 5,
      awayTimeouts: 5,
      actions: []
    })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<BasketballState>(STORAGE_KEY)
    if (saved) {
      set(saved)
    }
  }
}))
