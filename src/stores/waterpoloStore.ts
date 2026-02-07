import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type WaterPoloState = {
  homeTeam: string
  awayTeam: string
  periodDuration: number
  
  homeScore: number
  awayScore: number
  currentPeriod: 1 | 2 | 3 | 4
  periodSeconds: number
  shotClockSeconds: number
  isRunning: boolean
  isComplete: boolean
  
  homeExclusions: number
  awayExclusions: number
  homeTimeouts: number
  awayTimeouts: number
  
  actions: any[]
  
  setSetup: (homeTeam: string, awayTeam: string) => void
  addGoal: (team: 'home' | 'away') => void
  addExclusion: (team: 'home' | 'away') => void
  useTimeout: (team: 'home' | 'away') => void
  startTimer: () => void
  stopTimer: () => void
  tick: () => void
  resetShotClock: () => void
  endPeriod: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-waterpolo'

export const useWaterPoloStore = create<WaterPoloState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  periodDuration: 8,
  homeScore: 0,
  awayScore: 0,
  currentPeriod: 1,
  periodSeconds: 8 * 60,
  shotClockSeconds: 30,
  isRunning: false,
  isComplete: false,
  homeExclusions: 0,
  awayExclusions: 0,
  homeTimeouts: 2,
  awayTimeouts: 2,
  actions: [],
  
  setSetup: (homeTeam, awayTeam) => {
    set({ homeTeam, awayTeam, periodSeconds: 8 * 60 })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addGoal: (team) => {
    const state = get()
    const prev = { ...state, actions: [] }
    if (team === 'home') {
      set({ homeScore: state.homeScore + 1, shotClockSeconds: 30, actions: [...state.actions, { type: 'goal', team, previousState: prev }] })
    } else {
      set({ awayScore: state.awayScore + 1, shotClockSeconds: 30, actions: [...state.actions, { type: 'goal', team, previousState: prev }] })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addExclusion: (team) => {
    const state = get()
    const prev = { ...state, actions: [] }
    if (team === 'home') {
      set({ homeExclusions: state.homeExclusions + 1, actions: [...state.actions, { type: 'exclusion', team, previousState: prev }] })
    } else {
      set({ awayExclusions: state.awayExclusions + 1, actions: [...state.actions, { type: 'exclusion', team, previousState: prev }] })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  useTimeout: (team) => {
    const state = get()
    const prev = { ...state, actions: [] }
    if (team === 'home' && state.homeTimeouts > 0) {
      set({ homeTimeouts: state.homeTimeouts - 1, isRunning: false, actions: [...state.actions, { type: 'timeout', team, previousState: prev }] })
    } else if (team === 'away' && state.awayTimeouts > 0) {
      set({ awayTimeouts: state.awayTimeouts - 1, isRunning: false, actions: [...state.actions, { type: 'timeout', team, previousState: prev }] })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  startTimer: () => set({ isRunning: true }),
  stopTimer: () => set({ isRunning: false }),
  
  tick: () => {
    const state = get()
    if (state.isRunning) {
      const newPeriod = Math.max(0, state.periodSeconds - 1)
      const newShot = Math.max(0, state.shotClockSeconds - 1)
      set({ periodSeconds: newPeriod, shotClockSeconds: newShot })
      if (newPeriod === 0 || newShot === 0) set({ isRunning: false })
      saveToStorage(STORAGE_KEY, get())
    }
  },
  
  resetShotClock: () => set({ shotClockSeconds: 30 }),
  
  endPeriod: () => {
    const state = get()
    if (state.currentPeriod < 4) {
      set({ currentPeriod: (state.currentPeriod + 1) as 1 | 2 | 3 | 4, periodSeconds: 8 * 60, shotClockSeconds: 30, isRunning: false })
    } else {
      set({ isComplete: true, isRunning: false })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  undo: () => {
    const state = get()
    if (state.actions.length === 0) return
    const last = state.actions[state.actions.length - 1]
    set({ ...last.previousState, actions: state.actions.slice(0, -1) })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    set({ homeScore: 0, awayScore: 0, currentPeriod: 1, periodSeconds: 8 * 60, shotClockSeconds: 30, isRunning: false, isComplete: false, homeExclusions: 0, awayExclusions: 0, homeTimeouts: 2, awayTimeouts: 2, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<WaterPoloState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
