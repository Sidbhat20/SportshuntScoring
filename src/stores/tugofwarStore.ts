import { create } from 'zustand'
import { GameAction } from '@/lib/types'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

interface TugOfWarState {
  homeTeam: string
  awayTeam: string
  homePullsWon: number
  awayPullsWon: number
  homeFouls: number
  awayFouls: number
  currentPull: number
  bestOf: 3 | 5
  pullsToWin: number
  isComplete: boolean
  winner: string | null
  actions: GameAction[]

  setSetup: (homeTeam: string, awayTeam: string, bestOf: 3 | 5) => void
  winPull: (team: 'home' | 'away') => void
  addFoul: (team: 'home' | 'away') => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-tugofwar'

function checkWinner(
  homePulls: number,
  awayPulls: number,
  homeFouls: number,
  awayFouls: number,
  pullsToWin: number,
  homeTeam: string,
  awayTeam: string
): string | null {
  // Win by pulls
  if (homePulls >= pullsToWin) return homeTeam
  if (awayPulls >= pullsToWin) return awayTeam
  // Disqualification: 2 fouls (cautions) = disqualified
  if (homeFouls >= 2) return awayTeam
  if (awayFouls >= 2) return homeTeam
  return null
}

export const useTugOfWarStore = create<TugOfWarState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  homePullsWon: 0,
  awayPullsWon: 0,
  homeFouls: 0,
  awayFouls: 0,
  currentPull: 1,
  bestOf: 3,
  pullsToWin: 2,
  isComplete: false,
  winner: null,
  actions: [],

  setSetup: (homeTeam, awayTeam, bestOf) => {
    const state = {
      homeTeam,
      awayTeam,
      homePullsWon: 0,
      awayPullsWon: 0,
      homeFouls: 0,
      awayFouls: 0,
      currentPull: 1,
      bestOf,
      pullsToWin: Math.ceil(bestOf / 2),
      isComplete: false,
      winner: null,
      actions: [],
    }
    set(state)
    saveToStorage(STORAGE_KEY, state)
  },

  winPull: (team) => {
    const state = get()
    if (state.isComplete) return

    const homePulls = team === 'home' ? state.homePullsWon + 1 : state.homePullsWon
    const awayPulls = team === 'away' ? state.awayPullsWon + 1 : state.awayPullsWon

    const winner = checkWinner(
      homePulls, awayPulls,
      state.homeFouls, state.awayFouls,
      state.pullsToWin,
      state.homeTeam, state.awayTeam
    )

    const newState = {
      ...state,
      homePullsWon: homePulls,
      awayPullsWon: awayPulls,
      currentPull: winner ? state.currentPull : state.currentPull + 1,
      isComplete: winner !== null,
      winner,
      actions: [...state.actions, {
        type: 'winPull',
        team,
        value: null,
        timestamp: Date.now(),
        previousState: {
          homePullsWon: state.homePullsWon,
          awayPullsWon: state.awayPullsWon,
          currentPull: state.currentPull,
          isComplete: state.isComplete,
          winner: state.winner,
        },
      }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },

  addFoul: (team) => {
    const state = get()
    if (state.isComplete) return

    const homeFouls = team === 'home' ? state.homeFouls + 1 : state.homeFouls
    const awayFouls = team === 'away' ? state.awayFouls + 1 : state.awayFouls

    const winner = checkWinner(
      state.homePullsWon, state.awayPullsWon,
      homeFouls, awayFouls,
      state.pullsToWin,
      state.homeTeam, state.awayTeam
    )

    const newState = {
      ...state,
      homeFouls,
      awayFouls,
      isComplete: winner !== null,
      winner,
      actions: [...state.actions, {
        type: 'addFoul',
        team,
        value: null,
        timestamp: Date.now(),
        previousState: {
          homeFouls: state.homeFouls,
          awayFouls: state.awayFouls,
          isComplete: state.isComplete,
          winner: state.winner,
        },
      }],
    }
    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },

  undo: () => {
    const state = get()
    if (state.actions.length === 0) return

    const actions = [...state.actions]
    const lastAction = actions.pop()!
    const prev = lastAction.previousState

    let newState = { ...state, actions }

    if (lastAction.type === 'winPull') {
      newState.homePullsWon = prev.homePullsWon
      newState.awayPullsWon = prev.awayPullsWon
      newState.currentPull = prev.currentPull
      newState.isComplete = prev.isComplete
      newState.winner = prev.winner
    } else if (lastAction.type === 'addFoul') {
      newState.homeFouls = prev.homeFouls
      newState.awayFouls = prev.awayFouls
      newState.isComplete = prev.isComplete
      newState.winner = prev.winner
    }

    set(newState)
    saveToStorage(STORAGE_KEY, newState)
  },

  reset: () => {
    clearStorage(STORAGE_KEY)
    set({
      homeTeam: '',
      awayTeam: '',
      homePullsWon: 0,
      awayPullsWon: 0,
      homeFouls: 0,
      awayFouls: 0,
      currentPull: 1,
      bestOf: 3,
      pullsToWin: 2,
      isComplete: false,
      winner: null,
      actions: [],
    })
  },

  loadState: () => {
    const saved = loadFromStorage<any>(STORAGE_KEY)
    if (saved) set(saved)
  },
}))
