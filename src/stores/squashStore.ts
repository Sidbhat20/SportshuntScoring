import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type SquashState = {
  playerA: string
  playerB: string
  bestOf: 3 | 5
  pointsToWin: 11 | 15
  
  pointsA: number
  pointsB: number
  gamesA: number
  gamesB: number
  currentGame: number
  server: 'A' | 'B'
  isComplete: boolean
  winner: 'A' | 'B' | null
  
  actions: any[]
  
  setSetup: (playerA: string, playerB: string, bestOf: 3 | 5, pointsToWin: 11 | 15) => void
  addPoint: (player: 'A' | 'B') => void
  awardStroke: (player: 'A' | 'B') => void
  playLet: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-squash'

export const useSquashStore = create<SquashState>((set, get) => ({
  playerA: '',
  playerB: '',
  bestOf: 5,
  pointsToWin: 11,
  pointsA: 0,
  pointsB: 0,
  gamesA: 0,
  gamesB: 0,
  currentGame: 1,
  server: 'A',
  isComplete: false,
  winner: null,
  actions: [],
  
  setSetup: (playerA, playerB, bestOf, pointsToWin) => {
    set({ playerA, playerB, bestOf, pointsToWin })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPoint: (player) => {
    const state = get()
    const prev = { ...state, actions: [] }
    
    let newPointsA = state.pointsA
    let newPointsB = state.pointsB
    let newGamesA = state.gamesA
    let newGamesB = state.gamesB
    let newCurrentGame = state.currentGame
    let newServer = player
    let isComplete = false
    let winner: 'A' | 'B' | null = null
    
    if (player === 'A') newPointsA++
    else newPointsB++
    
    // Check game win
    if ((newPointsA >= state.pointsToWin || newPointsB >= state.pointsToWin) && Math.abs(newPointsA - newPointsB) >= 2) {
      if (newPointsA > newPointsB) newGamesA++
      else newGamesB++
      
      const gamesToWin = state.bestOf === 3 ? 2 : 3
      if (newGamesA >= gamesToWin) {
        isComplete = true
        winner = 'A'
      } else if (newGamesB >= gamesToWin) {
        isComplete = true
        winner = 'B'
      } else {
        newCurrentGame++
        newPointsA = 0
        newPointsB = 0
      }
    }
    
    set({
      pointsA: newPointsA,
      pointsB: newPointsB,
      gamesA: newGamesA,
      gamesB: newGamesB,
      currentGame: newCurrentGame,
      server: newServer,
      isComplete,
      winner,
      actions: [...state.actions, { type: 'point', player, previousState: prev }]
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  awardStroke: (player) => {
    get().addPoint(player)
  },
  
  playLet: () => {
    // Let = replay point, no state change needed
  },
  
  undo: () => {
    const state = get()
    if (state.actions.length === 0) return
    const last = state.actions[state.actions.length - 1]
    set({ ...last.previousState, actions: state.actions.slice(0, -1) })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    set({ pointsA: 0, pointsB: 0, gamesA: 0, gamesB: 0, currentGame: 1, server: 'A', isComplete: false, winner: null, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<SquashState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
