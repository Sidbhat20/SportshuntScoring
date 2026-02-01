import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type VolleyballState = {
  homeTeam: string
  awayTeam: string
  bestOf: number
  pointsToWin: number
  finalSetPoints: number
  
  pointsHome: number
  pointsAway: number
  setsHome: number
  setsAway: number
  currentSet: number
  server: 'home' | 'away'
  homeTimeouts: number
  awayTimeouts: number
  isComplete: boolean
  winner: 'home' | 'away' | null
  
  actions: any[]
  
  setSetup: (homeTeam: string, awayTeam: string, bestOf: number, pointsToWin: number, finalSetPoints: number) => void
  addPoint: (team: 'home' | 'away') => void
  useTimeout: (team: 'home' | 'away') => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-volleyball'

export const useVolleyballStore = create<VolleyballState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  bestOf: 5,
  pointsToWin: 25,
  finalSetPoints: 15,
  pointsHome: 0,
  pointsAway: 0,
  setsHome: 0,
  setsAway: 0,
  currentSet: 1,
  server: 'home',
  homeTimeouts: 2,
  awayTimeouts: 2,
  isComplete: false,
  winner: null,
  actions: [],
  
  setSetup: (homeTeam, awayTeam, bestOf, pointsToWin, finalSetPoints) => {
    set({ homeTeam, awayTeam, bestOf, pointsToWin, finalSetPoints })
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
    let newHomeTimeouts = state.homeTimeouts
    let newAwayTimeouts = state.awayTimeouts
    let isComplete = false
    let winner: 'home' | 'away' | null = null
    
    if (team === 'home') newPointsHome++
    else newPointsAway++
    
    // Service change on point win by non-serving team
    if (team !== state.server) {
      newServer = team
    }
    
    // Determine set point target
    const setsToWin = Math.ceil(state.bestOf / 2)
    const isFinalSet = newSetsHome === setsToWin - 1 && newSetsAway === setsToWin - 1
    const setTarget = isFinalSet ? state.finalSetPoints : state.pointsToWin
    
    // Check set win
    if ((newPointsHome >= setTarget || newPointsAway >= setTarget) && Math.abs(newPointsHome - newPointsAway) >= 2) {
      if (newPointsHome > newPointsAway) newSetsHome++
      else newSetsAway++
      
      if (newSetsHome >= setsToWin) {
        isComplete = true
        winner = 'home'
      } else if (newSetsAway >= setsToWin) {
        isComplete = true
        winner = 'away'
      } else {
        newCurrentSet++
        newPointsHome = 0
        newPointsAway = 0
        newHomeTimeouts = 2
        newAwayTimeouts = 2
      }
    }
    
    set({
      pointsHome: newPointsHome,
      pointsAway: newPointsAway,
      setsHome: newSetsHome,
      setsAway: newSetsAway,
      currentSet: newCurrentSet,
      server: newServer,
      homeTimeouts: newHomeTimeouts,
      awayTimeouts: newAwayTimeouts,
      isComplete,
      winner,
      actions: [...state.actions, { type: 'point', team, previousState: prev }]
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  useTimeout: (team) => {
    const state = get()
    const prev = { ...state, actions: [] }
    if (team === 'home' && state.homeTimeouts > 0) {
      set({ homeTimeouts: state.homeTimeouts - 1, actions: [...state.actions, { type: 'timeout', team, previousState: prev }] })
    } else if (team === 'away' && state.awayTimeouts > 0) {
      set({ awayTimeouts: state.awayTimeouts - 1, actions: [...state.actions, { type: 'timeout', team, previousState: prev }] })
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
    set({ pointsHome: 0, pointsAway: 0, setsHome: 0, setsAway: 0, currentSet: 1, server: 'home', homeTimeouts: 2, awayTimeouts: 2, isComplete: false, winner: null, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<VolleyballState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
