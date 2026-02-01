import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type GolfState = {
  players: string[]
  holes: number
  gameMode: 'stroke' | 'match'
  parPerHole: number[]
  
  scores: number[][] // [player][hole]
  currentHole: number
  isComplete: boolean
  
  actions: any[]
  
  setSetup: (players: string[], holes: number, gameMode: 'stroke' | 'match', parPerHole: number[]) => void
  setScore: (playerIndex: number, hole: number, strokes: number) => void
  nextHole: () => void
  prevHole: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-golf'

export const useGolfStore = create<GolfState>((set, get) => ({
  players: [],
  holes: 18,
  gameMode: 'stroke',
  parPerHole: Array(18).fill(4),
  scores: [],
  currentHole: 1,
  isComplete: false,
  actions: [],
  
  setSetup: (players, holes, gameMode, parPerHole) => {
    const scores = players.map(() => Array(holes).fill(0))
    set({ players, holes, gameMode, parPerHole, scores })
    saveToStorage(STORAGE_KEY, get())
  },
  
  setScore: (playerIndex, hole, strokes) => {
    const state = get()
    const prev = { ...state, actions: [] }
    const newScores = state.scores.map((ps, i) => 
      i === playerIndex ? ps.map((s, h) => h === hole ? strokes : s) : [...ps]
    )
    set({
      scores: newScores,
      actions: [...state.actions, { type: 'score', playerIndex, hole, strokes, previousState: prev }]
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  nextHole: () => {
    const state = get()
    if (state.currentHole < state.holes) {
      set({ currentHole: state.currentHole + 1 })
    } else {
      set({ isComplete: true })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  prevHole: () => {
    const state = get()
    if (state.currentHole > 1) {
      set({ currentHole: state.currentHole - 1 })
    }
  },
  
  undo: () => {
    const state = get()
    if (state.actions.length === 0) return
    const last = state.actions[state.actions.length - 1]
    set({ ...last.previousState, actions: state.actions.slice(0, -1) })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    const state = get()
    set({ scores: state.players.map(() => Array(state.holes).fill(0)), currentHole: 1, isComplete: false, actions: [] })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<GolfState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))

export function getTotalScore(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0)
}

export function getRelativeToPar(scores: number[], parPerHole: number[]): number {
  const total = getTotalScore(scores)
  const par = parPerHole.slice(0, scores.filter(s => s > 0).length).reduce((a, b) => a + b, 0)
  return total - par
}

export function formatRelativeToPar(diff: number): string {
  if (diff === 0) return 'E'
  return diff > 0 ? `+${diff}` : `${diff}`
}
