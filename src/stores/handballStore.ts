import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type Suspension = { player: string; secondsRemaining: number; count: number }

type HandballState = {
  homeTeam: string
  awayTeam: string
  halfDuration: number
  
  homeScore: number
  awayScore: number
  currentHalf: 1 | 2
  timerSeconds: number
  isRunning: boolean
  isComplete: boolean
  
  homeSuspensions: Suspension[]
  awaySuspensions: Suspension[]
  homeTimeouts: number
  awayTimeouts: number
  homeTimeoutsUsedThisHalf: number
  awayTimeoutsUsedThisHalf: number
  
  actions: any[]
  
  setSetup: (homeTeam: string, awayTeam: string) => void
  addGoal: (team: 'home' | 'away') => void
  addSuspension: (team: 'home' | 'away', player: string) => void
  useTimeout: (team: 'home' | 'away') => void
  startTimer: () => void
  stopTimer: () => void
  tick: () => void
  endHalf: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-handball'

export const useHandballStore = create<HandballState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  halfDuration: 30,
  homeScore: 0,
  awayScore: 0,
  currentHalf: 1,
  timerSeconds: 30 * 60,
  isRunning: false,
  isComplete: false,
  homeSuspensions: [],
  awaySuspensions: [],
  homeTimeouts: 3,
  awayTimeouts: 3,
  homeTimeoutsUsedThisHalf: 0,
  awayTimeoutsUsedThisHalf: 0,
  actions: [],
  
  setSetup: (homeTeam, awayTeam) => {
    set({ homeTeam, awayTeam, timerSeconds: 30 * 60 })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addGoal: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      set({
        homeScore: state.homeScore + 1,
        actions: [...state.actions, { type: 'goal', team, previousState }]
      })
    } else {
      set({
        awayScore: state.awayScore + 1,
        actions: [...state.actions, { type: 'goal', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addSuspension: (team, player) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    const suspensions = team === 'home' ? state.homeSuspensions : state.awaySuspensions
    const existingIdx = suspensions.findIndex(s => s.player.toLowerCase() === player.toLowerCase())
    
    if (existingIdx >= 0) {
      const existing = suspensions[existingIdx]
      if (existing.count >= 2) {
        // Third suspension = disqualification (red card)
        const newSuspensions = suspensions.filter((_, i) => i !== existingIdx)
        if (team === 'home') {
          set({
            homeSuspensions: newSuspensions,
            actions: [...state.actions, { type: 'disqualification', team, player, previousState }]
          })
        } else {
          set({
            awaySuspensions: newSuspensions,
            actions: [...state.actions, { type: 'disqualification', team, player, previousState }]
          })
        }
      } else {
        // Add another suspension
        const newSuspensions = [...suspensions]
        newSuspensions[existingIdx] = { ...existing, secondsRemaining: 120, count: existing.count + 1 }
        if (team === 'home') {
          set({
            homeSuspensions: newSuspensions,
            actions: [...state.actions, { type: 'suspension', team, player, previousState }]
          })
        } else {
          set({
            awaySuspensions: newSuspensions,
            actions: [...state.actions, { type: 'suspension', team, player, previousState }]
          })
        }
      }
    } else {
      const newSuspension: Suspension = { player, secondsRemaining: 120, count: 1 }
      if (team === 'home') {
        set({
          homeSuspensions: [...state.homeSuspensions, newSuspension],
          actions: [...state.actions, { type: 'suspension', team, player, previousState }]
        })
      } else {
        set({
          awaySuspensions: [...state.awaySuspensions, newSuspension],
          actions: [...state.actions, { type: 'suspension', team, player, previousState }]
        })
      }
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  useTimeout: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home' && state.homeTimeouts > 0 && state.homeTimeoutsUsedThisHalf < 2) {
      set({
        homeTimeouts: state.homeTimeouts - 1,
        homeTimeoutsUsedThisHalf: state.homeTimeoutsUsedThisHalf + 1,
        isRunning: false,
        actions: [...state.actions, { type: 'timeout', team, previousState }]
      })
    } else if (team === 'away' && state.awayTimeouts > 0 && state.awayTimeoutsUsedThisHalf < 2) {
      set({
        awayTimeouts: state.awayTimeouts - 1,
        awayTimeoutsUsedThisHalf: state.awayTimeoutsUsedThisHalf + 1,
        isRunning: false,
        actions: [...state.actions, { type: 'timeout', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  startTimer: () => set({ isRunning: true }),
  stopTimer: () => set({ isRunning: false }),
  
  tick: () => {
    const state = get()
    if (state.isRunning && state.timerSeconds > 0) {
      const newHomeSuspensions = state.homeSuspensions
        .map(s => ({ ...s, secondsRemaining: s.secondsRemaining - 1 }))
        .filter(s => s.secondsRemaining > 0)
      const newAwaySuspensions = state.awaySuspensions
        .map(s => ({ ...s, secondsRemaining: s.secondsRemaining - 1 }))
        .filter(s => s.secondsRemaining > 0)
      
      set({ 
        timerSeconds: state.timerSeconds - 1,
        homeSuspensions: newHomeSuspensions,
        awaySuspensions: newAwaySuspensions
      })
      saveToStorage(STORAGE_KEY, get())
    }
  },
  
  endHalf: () => {
    const state = get()
    if (state.currentHalf === 1) {
      set({
        currentHalf: 2,
        timerSeconds: 30 * 60,
        isRunning: false,
        homeSuspensions: [],
        awaySuspensions: [],
        homeTimeoutsUsedThisHalf: 0,
        awayTimeoutsUsedThisHalf: 0
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
    set({
      homeScore: 0,
      awayScore: 0,
      currentHalf: 1,
      timerSeconds: 30 * 60,
      isRunning: false,
      isComplete: false,
      homeSuspensions: [],
      awaySuspensions: [],
      homeTimeouts: 3,
      awayTimeouts: 3,
      homeTimeoutsUsedThisHalf: 0,
      awayTimeoutsUsedThisHalf: 0,
      actions: []
    })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<HandballState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
