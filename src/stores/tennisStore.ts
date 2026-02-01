import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type TennisState = {
  // Setup
  playerA: string
  playerB: string
  bestOf: 3 | 5
  
  // Game state
  pointsA: number // 0, 1, 2, 3, 4 (0, 15, 30, 40, AD)
  pointsB: number
  gamesA: number[]  // Games won per set
  gamesB: number[]
  setsA: number
  setsB: number
  currentSet: number
  server: 'A' | 'B'
  isTiebreak: boolean
  tiebreakPointsA: number
  tiebreakPointsB: number
  isComplete: boolean
  winner: 'A' | 'B' | null
  
  // Action history
  actions: any[]
  
  // Actions
  setSetup: (playerA: string, playerB: string, bestOf: 3 | 5) => void
  addPoint: (player: 'A' | 'B') => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-tennis'

const POINT_DISPLAY = ['0', '15', '30', '40']

export const useTennisStore = create<TennisState>((set, get) => ({
  playerA: '',
  playerB: '',
  bestOf: 3,
  pointsA: 0,
  pointsB: 0,
  gamesA: [0],
  gamesB: [0],
  setsA: 0,
  setsB: 0,
  currentSet: 1,
  server: 'A',
  isTiebreak: false,
  tiebreakPointsA: 0,
  tiebreakPointsB: 0,
  isComplete: false,
  winner: null,
  actions: [],
  
  setSetup: (playerA, playerB, bestOf) => {
    set({ playerA, playerB, bestOf })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPoint: (player) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (state.isTiebreak) {
      // Tiebreak scoring
      let newTiebreakA = state.tiebreakPointsA
      let newTiebreakB = state.tiebreakPointsB
      
      if (player === 'A') {
        newTiebreakA++
      } else {
        newTiebreakB++
      }
      
      // Check tiebreak win (first to 7, win by 2)
      if ((newTiebreakA >= 7 || newTiebreakB >= 7) && Math.abs(newTiebreakA - newTiebreakB) >= 2) {
        const tiebreakWinner = newTiebreakA > newTiebreakB ? 'A' : 'B'
        winGame(tiebreakWinner, state, previousState)
        return
      }
      
      // Change server every 2 points (after first point)
      const totalPoints = newTiebreakA + newTiebreakB
      let newServer = state.server
      if (totalPoints === 1 || (totalPoints > 1 && (totalPoints - 1) % 2 === 0)) {
        newServer = state.server === 'A' ? 'B' : 'A'
      }
      
      set({
        tiebreakPointsA: newTiebreakA,
        tiebreakPointsB: newTiebreakB,
        server: newServer,
        actions: [...state.actions, { type: 'point', player, previousState }]
      })
    } else {
      // Regular game scoring
      let newPointsA = state.pointsA
      let newPointsB = state.pointsB
      
      if (player === 'A') {
        newPointsA++
      } else {
        newPointsB++
      }
      
      // Check for game win
      if (newPointsA >= 4 || newPointsB >= 4) {
        // Check deuce situations
        if (newPointsA >= 3 && newPointsB >= 3) {
          if (newPointsA - newPointsB >= 2) {
            winGame('A', state, previousState)
            return
          } else if (newPointsB - newPointsA >= 2) {
            winGame('B', state, previousState)
            return
          }
          // Still deuce or advantage
          set({
            pointsA: newPointsA,
            pointsB: newPointsB,
            actions: [...state.actions, { type: 'point', player, previousState }]
          })
        } else if (newPointsA >= 4) {
          winGame('A', state, previousState)
          return
        } else if (newPointsB >= 4) {
          winGame('B', state, previousState)
          return
        }
      } else {
        set({
          pointsA: newPointsA,
          pointsB: newPointsB,
          actions: [...state.actions, { type: 'point', player, previousState }]
        })
      }
    }
    
    saveToStorage(STORAGE_KEY, get())
  },
  
  undo: () => {
    const state = get()
    if (state.actions.length === 0) return
    
    const lastAction = state.actions[state.actions.length - 1]
    const newActions = state.actions.slice(0, -1)
    
    set({
      ...lastAction.previousState,
      actions: newActions
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    set({
      pointsA: 0,
      pointsB: 0,
      gamesA: [0],
      gamesB: [0],
      setsA: 0,
      setsB: 0,
      currentSet: 1,
      server: 'A',
      isTiebreak: false,
      tiebreakPointsA: 0,
      tiebreakPointsB: 0,
      isComplete: false,
      winner: null,
      actions: []
    })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<TennisState>(STORAGE_KEY)
    if (saved) {
      set(saved)
    }
  }
}))

function winGame(winner: 'A' | 'B', state: TennisState, previousState: any) {
  const store = useTennisStore.getState()
  
  let newGamesA = [...state.gamesA]
  let newGamesB = [...state.gamesB]
  let newSetsA = state.setsA
  let newSetsB = state.setsB
  let newCurrentSet = state.currentSet
  let newServer = state.server === 'A' ? 'B' : 'A' as 'A' | 'B'
  let newIsTiebreak = false
  let isComplete = false
  let matchWinner: 'A' | 'B' | null = null
  
  if (winner === 'A') {
    newGamesA[state.currentSet - 1]++
  } else {
    newGamesB[state.currentSet - 1]++
  }
  
  const gamesA = newGamesA[state.currentSet - 1]
  const gamesB = newGamesB[state.currentSet - 1]
  
  // Check for set win
  let setWon = false
  if ((gamesA >= 6 || gamesB >= 6) && Math.abs(gamesA - gamesB) >= 2) {
    setWon = true
    if (gamesA > gamesB) newSetsA++
    else newSetsB++
  } else if (gamesA === 7 || gamesB === 7) {
    // Tiebreak was won
    setWon = true
    if (gamesA > gamesB) newSetsA++
    else newSetsB++
  } else if (gamesA === 6 && gamesB === 6) {
    // Start tiebreak
    newIsTiebreak = true
  }
  
  if (setWon) {
    // Check match win
    const setsToWin = state.bestOf === 3 ? 2 : 3
    if (newSetsA >= setsToWin) {
      isComplete = true
      matchWinner = 'A'
    } else if (newSetsB >= setsToWin) {
      isComplete = true
      matchWinner = 'B'
    } else {
      // Start new set
      newCurrentSet++
      newGamesA.push(0)
      newGamesB.push(0)
    }
  }
  
  useTennisStore.setState({
    pointsA: 0,
    pointsB: 0,
    gamesA: newGamesA,
    gamesB: newGamesB,
    setsA: newSetsA,
    setsB: newSetsB,
    currentSet: newCurrentSet,
    server: newServer,
    isTiebreak: newIsTiebreak,
    tiebreakPointsA: 0,
    tiebreakPointsB: 0,
    isComplete,
    winner: matchWinner,
    actions: [...state.actions, { type: 'point', player: winner, previousState }]
  })
  
  saveToStorage(STORAGE_KEY, useTennisStore.getState())
}

export function getPointDisplay(pointsA: number, pointsB: number, isTiebreak: boolean, tiebreakA: number, tiebreakB: number): { displayA: string; displayB: string } {
  if (isTiebreak) {
    return { displayA: String(tiebreakA), displayB: String(tiebreakB) }
  }
  
  // Deuce situations
  if (pointsA >= 3 && pointsB >= 3) {
    if (pointsA === pointsB) {
      return { displayA: '40', displayB: '40' } // Deuce
    } else if (pointsA > pointsB) {
      return { displayA: 'AD', displayB: '40' }
    } else {
      return { displayA: '40', displayB: 'AD' }
    }
  }
  
  return {
    displayA: POINT_DISPLAY[Math.min(pointsA, 3)],
    displayB: POINT_DISPLAY[Math.min(pointsB, 3)]
  }
}
