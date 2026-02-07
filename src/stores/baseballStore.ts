import { create } from 'zustand'
import { GameAction } from '@/lib/types'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

interface BaseballState {
  homeTeam: string
  awayTeam: string
  innings: number
  homeRuns: number[]
  awayRuns: number[]
  homeHits: number
  awayHits: number
  homeErrors: number
  awayErrors: number
  currentInning: number
  isTopHalf: boolean
  outs: number
  isComplete: boolean
  actions: GameAction[]
  
  setSetup: (homeTeam: string, awayTeam: string, innings: number) => void
  addRuns: (team: 'home' | 'away', runs: number) => void
  addHit: (team: 'home' | 'away') => void
  addError: (team: 'home' | 'away') => void
  addOut: () => void
  nextHalfInning: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-baseball'

export const useBaseballStore = create<BaseballState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  innings: 9,
  homeRuns: [],
  awayRuns: [],
  homeHits: 0,
  awayHits: 0,
  homeErrors: 0,
  awayErrors: 0,
  currentInning: 1,
  isTopHalf: true,
  outs: 0,
  isComplete: false,
  actions: [],
  
  setSetup: (homeTeam, awayTeam, innings) => {
    const state = {
      homeTeam,
      awayTeam,
      innings,
      homeRuns: Array(innings).fill(0),
      awayRuns: Array(innings).fill(0),
      homeHits: 0,
      awayHits: 0,
      homeErrors: 0,
      awayErrors: 0,
      currentInning: 1,
      isTopHalf: true,
      outs: 0,
      isComplete: false,
      actions: [],
    }
    set(state)
    saveToStorage(STORAGE_KEY, state)
  },
  
  addRuns: (team, runs) => set((state) => {
    const newHomeRuns = [...state.homeRuns]
    const newAwayRuns = [...state.awayRuns]
    const inningIndex = state.currentInning - 1
    
    if (team === 'home') {
      newHomeRuns[inningIndex] = (newHomeRuns[inningIndex] || 0) + runs
    } else {
      newAwayRuns[inningIndex] = (newAwayRuns[inningIndex] || 0) + runs
    }
    
    const newState = {
      ...state,
      homeRuns: newHomeRuns,
      awayRuns: newAwayRuns,
      actions: [...state.actions, { type: 'addRuns', team, value: runs, timestamp: Date.now(), previousState: state }],
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  addHit: (team) => set((state) => {
    const newState = {
      ...state,
      homeHits: team === 'home' ? state.homeHits + 1 : state.homeHits,
      awayHits: team === 'away' ? state.awayHits + 1 : state.awayHits,
      actions: [...state.actions, { type: 'addHit', team, value: null, timestamp: Date.now(), previousState: state }],
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  addError: (team) => set((state) => {
    const newState = {
      ...state,
      homeErrors: team === 'home' ? state.homeErrors + 1 : state.homeErrors,
      awayErrors: team === 'away' ? state.awayErrors + 1 : state.awayErrors,
      actions: [...state.actions, { type: 'addError', team, value: null, timestamp: Date.now(), previousState: state }],
    }
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  addOut: () => set((state) => {
    const newOuts = state.outs + 1
    let newState = {
      ...state,
      outs: newOuts,
      actions: [...state.actions, { type: 'addOut', team: null, value: null, timestamp: Date.now(), previousState: state }],
    }
    
    if (newOuts >= 3) {
      if (state.isTopHalf) {
        newState.isTopHalf = false
        newState.outs = 0
      } else {
        if (state.currentInning >= state.innings) {
          const homeTotalRuns = newState.homeRuns.reduce((a, b) => a + b, 0)
          const awayTotalRuns = newState.awayRuns.reduce((a, b) => a + b, 0)
          if (homeTotalRuns !== awayTotalRuns) {
            newState.isComplete = true
          } else {
            newState.currentInning = state.currentInning + 1
            newState.isTopHalf = true
            newState.outs = 0
            newState.homeRuns = [...newState.homeRuns, 0]
            newState.awayRuns = [...newState.awayRuns, 0]
          }
        } else {
          newState.currentInning = state.currentInning + 1
          newState.isTopHalf = true
          newState.outs = 0
        }
      }
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  nextHalfInning: () => set((state) => {
    let newState = { ...state, actions: [...state.actions, { type: 'nextHalfInning', team: null, value: null, timestamp: Date.now(), previousState: state }] }
    
    if (state.isTopHalf) {
      newState.isTopHalf = false
      newState.outs = 0
    } else {
      if (state.currentInning >= state.innings) {
        const homeTotalRuns = state.homeRuns.reduce((a, b) => a + b, 0)
        const awayTotalRuns = state.awayRuns.reduce((a, b) => a + b, 0)
        if (homeTotalRuns !== awayTotalRuns) {
          newState.isComplete = true
        } else {
          newState.currentInning = state.currentInning + 1
          newState.isTopHalf = true
          newState.outs = 0
          newState.homeRuns = [...state.homeRuns, 0]
          newState.awayRuns = [...state.awayRuns, 0]
        }
      } else {
        newState.currentInning = state.currentInning + 1
        newState.isTopHalf = true
        newState.outs = 0
      }
    }
    
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  undo: () => set((state) => {
    if (state.actions.length === 0) return state
    const actions = [...state.actions]
    const lastAction = actions.pop()!
    
    let newState = { ...state, actions }
    
    if (lastAction.type === 'addRuns' && lastAction.team && lastAction.value) {
      const inningIndex = state.currentInning - 1
      if (lastAction.team === 'home') {
        const newHomeRuns = [...state.homeRuns]
        newHomeRuns[inningIndex] = Math.max(0, (newHomeRuns[inningIndex] || 0) - lastAction.value)
        newState.homeRuns = newHomeRuns
      } else {
        const newAwayRuns = [...state.awayRuns]
        newAwayRuns[inningIndex] = Math.max(0, (newAwayRuns[inningIndex] || 0) - lastAction.value)
        newState.awayRuns = newAwayRuns
      }
    } else if (lastAction.type === 'addHit' && lastAction.team) {
      if (lastAction.team === 'home') newState.homeHits = Math.max(0, state.homeHits - 1)
      else newState.awayHits = Math.max(0, state.awayHits - 1)
    } else if (lastAction.type === 'addError' && lastAction.team) {
      if (lastAction.team === 'home') newState.homeErrors = Math.max(0, state.homeErrors - 1)
      else newState.awayErrors = Math.max(0, state.awayErrors - 1)
    } else if (lastAction.type === 'addOut') {
      if (state.outs === 0) {
        if (!state.isTopHalf) {
          newState.isTopHalf = true
          newState.outs = 2
        } else if (state.currentInning > 1) {
          newState.currentInning = state.currentInning - 1
          newState.isTopHalf = false
          newState.outs = 2
        }
      } else {
        newState.outs = state.outs - 1
      }
    }
    
    newState.isComplete = false
    saveToStorage(STORAGE_KEY, newState)
    return newState
  }),
  
  reset: () => {
    clearStorage(STORAGE_KEY)
    set({
      homeTeam: '',
      awayTeam: '',
      innings: 9,
      homeRuns: [],
      awayRuns: [],
      homeHits: 0,
      awayHits: 0,
      homeErrors: 0,
      awayErrors: 0,
      currentInning: 1,
      isTopHalf: true,
      outs: 0,
      isComplete: false,
      actions: [],
    })
  },
  
  loadState: () => {
    const saved = loadFromStorage(STORAGE_KEY)
    if (saved) set(saved)
  },
}))
