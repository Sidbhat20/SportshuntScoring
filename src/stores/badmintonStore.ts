import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type BadmintonState = {
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
  serviceCourt: 'left' | 'right'
  isComplete: boolean
  winner: 'A' | 'B' | null
  
  actions: any[]
  
  setSetup: (playerA: string, playerB: string, bestOf: number, pointsToWin: number) => void
  addPoint: (player: 'A' | 'B') => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-badminton'

export const useBadmintonStore = create<BadmintonState>((set, get) => ({
  playerA: '',
  playerB: '',
  bestOf: 3,
  pointsToWin: 21,
  pointsA: 0,
  pointsB: 0,
  gamesA: 0,
  gamesB: 0,
  currentGame: 1,
  server: 'A',
  serviceCourt: 'right',
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
    let newServiceCourt = state.serviceCourt
    let isComplete = false
    let winner: 'A' | 'B' | null = null
    
    if (player === 'A') newPointsA++
    else newPointsB++
    
    // Service: only rally winner serves. Service court based on server's score
    if (player !== state.server) {
      newServer = player
    }
    // Service court: right if server's score is even, left if odd
    const serverScore = newServer === 'A' ? newPointsA : newPointsB
    newServiceCourt = serverScore % 2 === 0 ? 'right' : 'left'
    
    // Check game win
    const maxPoints = state.pointsToWin
    const cap = maxPoints + 9 // Cap at 9 above target (e.g., 30 for 21-point game)
    
    if ((newPointsA >= maxPoints || newPointsB >= maxPoints) && Math.abs(newPointsA - newPointsB) >= 2) {
      if (newPointsA > newPointsB) newGamesA++
      else newGamesB++
      checkMatchWin()
    } else if (newPointsA === cap || newPointsB === cap) {
      // Cap reached
      if (newPointsA > newPointsB) newGamesA++
      else newGamesB++
      checkMatchWin()
    }
    
    function checkMatchWin() {
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
        newServiceCourt = 'right'
      }
    }
    
    set({
      pointsA: newPointsA,
      pointsB: newPointsB,
      gamesA: newGamesA,
      gamesB: newGamesB,
      currentGame: newCurrentGame,
      server: newServer,
      serviceCourt: newServiceCourt,
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
    set({ pointsA: 0, pointsB: 0, gamesA: 0, gamesB: 0, currentGame: 1, server: 'A', serviceCourt: 'right', isComplete: false, winner: null, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<BadmintonState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
