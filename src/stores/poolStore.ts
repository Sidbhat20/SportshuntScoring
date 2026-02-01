import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type PoolState = {
  playerA: string
  playerB: string
  gameType: '8ball' | '9ball'
  raceTo: number
  
  racksA: number
  racksB: number
  currentPlayer: 'A' | 'B'
  isComplete: boolean
  winner: 'A' | 'B' | null
  
  actions: any[]
  
  setSetup: (playerA: string, playerB: string, gameType: '8ball' | '9ball', raceTo: number) => void
  winRack: (player: 'A' | 'B') => void
  switchPlayer: () => void
  foul: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-pool'

export const usePoolStore = create<PoolState>((set, get) => ({
  playerA: '',
  playerB: '',
  gameType: '8ball',
  raceTo: 5,
  racksA: 0,
  racksB: 0,
  currentPlayer: 'A',
  isComplete: false,
  winner: null,
  actions: [],
  
  setSetup: (playerA, playerB, gameType, raceTo) => {
    set({ playerA, playerB, gameType, raceTo })
    saveToStorage(STORAGE_KEY, get())
  },
  
  winRack: (player) => {
    const state = get()
    const prev = { ...state, actions: [] }
    
    let newRacksA = state.racksA
    let newRacksB = state.racksB
    let isComplete = false
    let winner: 'A' | 'B' | null = null
    
    if (player === 'A') newRacksA++
    else newRacksB++
    
    if (newRacksA >= state.raceTo) {
      isComplete = true
      winner = 'A'
    } else if (newRacksB >= state.raceTo) {
      isComplete = true
      winner = 'B'
    }
    
    set({
      racksA: newRacksA,
      racksB: newRacksB,
      currentPlayer: player === 'A' ? 'B' : 'A',
      isComplete,
      winner,
      actions: [...state.actions, { type: 'winRack', player, previousState: prev }]
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  switchPlayer: () => {
    const state = get()
    const prev = { ...state, actions: [] }
    set({
      currentPlayer: state.currentPlayer === 'A' ? 'B' : 'A',
      actions: [...state.actions, { type: 'switch', previousState: prev }]
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  foul: () => {
    const state = get()
    const prev = { ...state, actions: [] }
    set({
      currentPlayer: state.currentPlayer === 'A' ? 'B' : 'A',
      actions: [...state.actions, { type: 'foul', previousState: prev }]
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
    set({ racksA: 0, racksB: 0, currentPlayer: 'A', isComplete: false, winner: null, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<PoolState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
