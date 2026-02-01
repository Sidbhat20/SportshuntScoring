import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type TableTennisState = {
  playerA: string
  playerB: string
  bestOf: number
  pointsToWin: number
  
  pointsA: number
  pointsB: number
  gamesA: number
  gamesB: number
  currentGame: number
  server: 'A' | 'B'
  servesRemaining: number
  isComplete: boolean
  winner: 'A' | 'B' | null
  
  actions: any[]
  
  setSetup: (playerA: string, playerB: string, bestOf: number, pointsToWin: number) => void
  addPoint: (player: 'A' | 'B') => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-tabletennis'

export const useTableTennisStore = create<TableTennisState>((set, get) => ({
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
  servesRemaining: 2,
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
    let newServer = state.server
    let newServesRemaining = state.servesRemaining
    let isComplete = false
    let winner: 'A' | 'B' | null = null
    
    if (player === 'A') newPointsA++
    else newPointsB++
    
    // Service logic - deuce when both at pointsToWin-1 or higher
    const isDeuce = newPointsA >= state.pointsToWin - 1 && newPointsB >= state.pointsToWin - 1
    const servesPerTurn = isDeuce ? 1 : 2
    
    newServesRemaining--
    if (newServesRemaining <= 0) {
      newServer = state.server === 'A' ? 'B' : 'A'
      newServesRemaining = servesPerTurn
    }
    
    // Check game win (first to pointsToWin, win by 2)
    if ((newPointsA >= state.pointsToWin || newPointsB >= state.pointsToWin) && Math.abs(newPointsA - newPointsB) >= 2) {
      if (newPointsA > newPointsB) newGamesA++
      else newGamesB++
      
      const gamesToWin = Math.ceil(state.bestOf / 2)
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
        newServer = state.server === 'A' ? 'B' : 'A'
        newServesRemaining = 2
      }
    }
    
    set({
      pointsA: newPointsA,
      pointsB: newPointsB,
      gamesA: newGamesA,
      gamesB: newGamesB,
      currentGame: newCurrentGame,
      server: newServer,
      servesRemaining: newServesRemaining,
      isComplete,
      winner,
      actions: [...state.actions, { type: 'point', player, previousState: prev }]
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
    set({ pointsA: 0, pointsB: 0, gamesA: 0, gamesB: 0, currentGame: 1, server: 'A', servesRemaining: 2, isComplete: false, winner: null, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<TableTennisState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
