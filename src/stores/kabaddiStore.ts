import { create } from 'zustand'
import { GameAction } from '@/lib/types'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

interface KabaddiState {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  homePlayers: number
  awayPlayers: number
  half: 1 | 2
  isComplete: boolean
  actions: GameAction[]
  
  setSetup: (homeTeam: string, awayTeam: string) => void
  addRaidPoints: (team: 'home' | 'away', points: number) => void
  addTacklePoints: (team: 'home' | 'away', points: number) => void
  addBonusPoints: (team: 'home' | 'away', points: number) => void
  addAllOut: (team: 'home' | 'away') => void
  playerOut: (team: 'home' | 'away') => void
  revivePlayer: (team: 'home' | 'away') => void
  nextHalf: () => void
  endMatch: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-kabaddi'

export const useKabaddiStore = create<KabaddiState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  homeScore: 0,
  awayScore: 0,
  homePlayers: 7,
  awayPlayers: 7,
  half: 1,
  isComplete: false,
  actions: [],
  
  setSetup: (homeTeam, awayTeam) => {
    const state = {
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      homePlayers: 7,
      awayPlayers: 7,
      half: 1 as const,
      isComplete: false,
      actions: [],
    }
    set(state)
    saveToStorage(STORAGE_KEY, state)
  },
  
  addRaidPoints: (team, points) => {
    const state = get()
    const newState = {
      ...state,
      homeScore: team === 'home' ? state.homeScore + points : state.homeScore,
      awayScore: team === 'away' ? state.awayScore + points : state.awayScore,
      actions: [...state.actions, { type: 'addRaidPoints', team, value: points, timestamp: Date.now(), previousState: { homeScore: state.homeScore, awayScore: state.awayScore } }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  addTacklePoints: (team, points) => {
    const state = get()
    const newState = {
      ...state,
      homeScore: team === 'home' ? state.homeScore + points : state.homeScore,
      awayScore: team === 'away' ? state.awayScore + points : state.awayScore,
      actions: [...state.actions, { type: 'addTacklePoints', team, value: points, timestamp: Date.now(), previousState: { homeScore: state.homeScore, awayScore: state.awayScore } }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  addBonusPoints: (team, points) => {
    const state = get()
    const newState = {
      ...state,
      homeScore: team === 'home' ? state.homeScore + points : state.homeScore,
      awayScore: team === 'away' ? state.awayScore + points : state.awayScore,
      actions: [...state.actions, { type: 'addBonusPoints', team, value: points, timestamp: Date.now(), previousState: { homeScore: state.homeScore, awayScore: state.awayScore } }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  addAllOut: (team) => {
    const state = get()
    // All-out gives 2 bonus points and revives all players
    const newState = {
      ...state,
      homeScore: team === 'home' ? state.homeScore + 2 : state.homeScore,
      awayScore: team === 'away' ? state.awayScore + 2 : state.awayScore,
      homePlayers: team === 'away' ? 7 : state.homePlayers,
      awayPlayers: team === 'home' ? 7 : state.awayPlayers,
      actions: [...state.actions, { type: 'addAllOut', team, value: 2, timestamp: Date.now(), previousState: { homeScore: state.homeScore, awayScore: state.awayScore, homePlayers: state.homePlayers, awayPlayers: state.awayPlayers } }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  playerOut: (team) => {
    const state = get()
    const newState = {
      ...state,
      homePlayers: team === 'home' ? Math.max(0, state.homePlayers - 1) : state.homePlayers,
      awayPlayers: team === 'away' ? Math.max(0, state.awayPlayers - 1) : state.awayPlayers,
      actions: [...state.actions, { type: 'playerOut', team, value: null, timestamp: Date.now(), previousState: { homePlayers: state.homePlayers, awayPlayers: state.awayPlayers } }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  revivePlayer: (team) => {
    const state = get()
    const newState = {
      ...state,
      homePlayers: team === 'home' ? Math.min(7, state.homePlayers + 1) : state.homePlayers,
      awayPlayers: team === 'away' ? Math.min(7, state.awayPlayers + 1) : state.awayPlayers,
      actions: [...state.actions, { type: 'revivePlayer', team, value: null, timestamp: Date.now(), previousState: { homePlayers: state.homePlayers, awayPlayers: state.awayPlayers } }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  nextHalf: () => {
    const state = get()
    const newState = {
      ...state,
      half: 2 as const,
      homePlayers: 7,
      awayPlayers: 7,
      actions: [...state.actions, { type: 'nextHalf', team: null, value: 2, timestamp: Date.now(), previousState: { half: state.half } }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  endMatch: () => {
    const state = get()
    const newState = { ...state, isComplete: true, actions: [...state.actions, { type: 'endMatch', team: null, value: null, timestamp: Date.now(), previousState: { isComplete: state.isComplete } }] }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  undo: () => {
    const state = get()
    if (state.actions.length === 0) return
    const actions = [...state.actions]
    const lastAction = actions.pop()!
    
    let newState = { ...state, actions, isComplete: false }
    
    if (lastAction.type === 'addRaidPoints' && lastAction.team && lastAction.value) {
      if (lastAction.team === 'home') newState.homeScore = Math.max(0, state.homeScore - (lastAction.value as number))
      else newState.awayScore = Math.max(0, state.awayScore - (lastAction.value as number))
    } else if (lastAction.type === 'addTacklePoints' && lastAction.team && lastAction.value) {
      if (lastAction.team === 'home') newState.homeScore = Math.max(0, state.homeScore - (lastAction.value as number))
      else newState.awayScore = Math.max(0, state.awayScore - (lastAction.value as number))
    } else if (lastAction.type === 'addBonusPoints' && lastAction.team && lastAction.value) {
      if (lastAction.team === 'home') newState.homeScore = Math.max(0, state.homeScore - (lastAction.value as number))
      else newState.awayScore = Math.max(0, state.awayScore - (lastAction.value as number))
    } else if (lastAction.type === 'addAllOut' && lastAction.team) {
      if (lastAction.team === 'home') {
        newState.homeScore = Math.max(0, state.homeScore - 2)
        // Restore the state before all-out: opposing team had 0 players
        newState.awayPlayers = state.awayPlayers > 0 ? 0 : state.awayPlayers
      } else {
        newState.awayScore = Math.max(0, state.awayScore - 2)
        // Restore the state before all-out: opposing team had 0 players
        newState.homePlayers = state.homePlayers > 0 ? 0 : state.homePlayers
      }
    } else if (lastAction.type === 'playerOut' && lastAction.team) {
      if (lastAction.team === 'home') newState.homePlayers = Math.min(7, state.homePlayers + 1)
      else newState.awayPlayers = Math.min(7, state.awayPlayers + 1)
    } else if (lastAction.type === 'revivePlayer' && lastAction.team) {
      if (lastAction.team === 'home') newState.homePlayers = Math.max(0, state.homePlayers - 1)
      else newState.awayPlayers = Math.max(0, state.awayPlayers - 1)
    } else if (lastAction.type === 'nextHalf') {
      newState.half = 1
    }
    
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },
  
  reset: () => {
    clearStorage(STORAGE_KEY)
    set({
      homeTeam: '',
      awayTeam: '',
      homeScore: 0,
      awayScore: 0,
      homePlayers: 7,
      awayPlayers: 7,
      half: 1,
      isComplete: false,
      actions: [],
    })
  },
  
  loadState: () => {
    const saved = loadFromStorage(STORAGE_KEY)
    if (saved) set(saved)
  },
}))
