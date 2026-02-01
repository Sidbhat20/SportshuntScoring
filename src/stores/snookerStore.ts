import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type SnookerState = {
  playerA: string
  playerB: string
  bestOf: number
  
  frameScoreA: number
  frameScoreB: number
  framesA: number
  framesB: number
  currentFrame: number
  currentPlayer: 'A' | 'B'
  currentBreak: number
  isComplete: boolean
  winner: 'A' | 'B' | null
  
  actions: any[]
  
  setSetup: (playerA: string, playerB: string, bestOf: number) => void
  addPoints: (points: number) => void
  foul: (points: number) => void
  endBreak: () => void
  winFrame: (player: 'A' | 'B') => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-snooker'

export const useSnookerStore = create<SnookerState>((set, get) => ({
  playerA: '',
  playerB: '',
  bestOf: 7,
  frameScoreA: 0,
  frameScoreB: 0,
  framesA: 0,
  framesB: 0,
  currentFrame: 1,
  currentPlayer: 'A',
  currentBreak: 0,
  isComplete: false,
  winner: null,
  actions: [],
  
  setSetup: (playerA, playerB, bestOf) => {
    set({ playerA, playerB, bestOf })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPoints: (points) => {
    const state = get()
    const prev = { ...state, actions: [] }
    
    if (state.currentPlayer === 'A') {
      set({
        frameScoreA: state.frameScoreA + points,
        currentBreak: state.currentBreak + points,
        actions: [...state.actions, { type: 'points', points, previousState: prev }]
      })
    } else {
      set({
        frameScoreB: state.frameScoreB + points,
        currentBreak: state.currentBreak + points,
        actions: [...state.actions, { type: 'points', points, previousState: prev }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  foul: (points) => {
    const state = get()
    const prev = { ...state, actions: [] }
    const foulPoints = Math.max(4, points)
    
    if (state.currentPlayer === 'A') {
      set({
        frameScoreB: state.frameScoreB + foulPoints,
        currentPlayer: 'B',
        currentBreak: 0,
        actions: [...state.actions, { type: 'foul', points: foulPoints, previousState: prev }]
      })
    } else {
      set({
        frameScoreA: state.frameScoreA + foulPoints,
        currentPlayer: 'A',
        currentBreak: 0,
        actions: [...state.actions, { type: 'foul', points: foulPoints, previousState: prev }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  endBreak: () => {
    const state = get()
    const prev = { ...state, actions: [] }
    set({
      currentPlayer: state.currentPlayer === 'A' ? 'B' : 'A',
      currentBreak: 0,
      actions: [...state.actions, { type: 'endBreak', previousState: prev }]
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  winFrame: (player) => {
    const state = get()
    const prev = { ...state, actions: [] }
    
    let newFramesA = state.framesA
    let newFramesB = state.framesB
    let isComplete = false
    let winner: 'A' | 'B' | null = null
    
    if (player === 'A') newFramesA++
    else newFramesB++
    
    const framesToWin = Math.ceil(state.bestOf / 2)
    if (newFramesA >= framesToWin) {
      isComplete = true
      winner = 'A'
    } else if (newFramesB >= framesToWin) {
      isComplete = true
      winner = 'B'
    }
    
    set({
      framesA: newFramesA,
      framesB: newFramesB,
      currentFrame: state.currentFrame + 1,
      frameScoreA: 0,
      frameScoreB: 0,
      currentPlayer: 'A',
      currentBreak: 0,
      isComplete,
      winner,
      actions: [...state.actions, { type: 'winFrame', player, previousState: prev }]
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
    set({ frameScoreA: 0, frameScoreB: 0, framesA: 0, framesB: 0, currentFrame: 1, currentPlayer: 'A', currentBreak: 0, isComplete: false, winner: null, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<SnookerState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
