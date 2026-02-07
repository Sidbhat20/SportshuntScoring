import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type ThrowballState = {
  homeTeam: string
  awayTeam: string
  pointsToWin: number
  
  pointsHome: number
  pointsAway: number
  setsHome: number
  setsAway: number
  currentSet: number
  server: 'home' | 'away'
  isComplete: boolean
  winner: 'home' | 'away' | null
  
  actions: any[]
  
  setSetup: (homeTeam: string, awayTeam: string, pointsToWin: number) => void
  addPoint: (team: 'home' | 'away') => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-throwball'

export const useThrowballStore = create<ThrowballState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  pointsToWin: 25,
  pointsHome: 0,
  pointsAway: 0,
  setsHome: 0,
  setsAway: 0,
  currentSet: 1,
  server: 'home',
  isComplete: false,
  winner: null,
  actions: [],
  
  setSetup: (homeTeam, awayTeam, pointsToWin) => {
    set({ homeTeam, awayTeam, pointsToWin })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPoint: (team) => {
    const state = get()
    const prev = { ...state, actions: [] }
    
    let newPointsHome = state.pointsHome
    let newPointsAway = state.pointsAway
    let newSetsHome = state.setsHome
    let newSetsAway = state.setsAway
    let newCurrentSet = state.currentSet
    let newServer = state.server
    let isComplete = false
    let winner: 'home' | 'away' | null = null
    
    if (team === 'home') newPointsHome++
    else newPointsAway++
    
    // Service change on point win by non-serving team
    if (team !== state.server) {
      newServer = team
    }
    
    // Check set win (must win by 2 if at deuce)
    if ((newPointsHome >= state.pointsToWin || newPointsAway >= state.pointsToWin) && Math.abs(newPointsHome - newPointsAway) >= 2) {
      if (newPointsHome > newPointsAway) newSetsHome++
      else newSetsAway++
      
      // Best of 3: first to 2 sets wins
      if (newSetsHome >= 2) {
        isComplete = true
        winner = 'home'
      } else if (newSetsAway >= 2) {
        isComplete = true
        winner = 'away'
      } else {
        newCurrentSet++
        newPointsHome = 0
        newPointsAway = 0
      }
    }
    
    set({
      pointsHome: newPointsHome,
      pointsAway: newPointsAway,
      setsHome: newSetsHome,
      setsAway: newSetsAway,
      currentSet: newCurrentSet,
      server: newServer,
      isComplete,
      winner,
      actions: [...state.actions, { type: 'point', team, value: 1, timestamp: Date.now(), previousState: prev }]
    })
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
    set({ pointsHome: 0, pointsAway: 0, setsHome: 0, setsAway: 0, currentSet: 1, server: 'home', isComplete: false, winner: null, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<ThrowballState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
