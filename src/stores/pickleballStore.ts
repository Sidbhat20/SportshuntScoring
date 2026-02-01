import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type PickleballState = {
  // Setup
  team1: string
  team2: string
  pointsToWin: number // Usually 11 or 15
  winByTwo: boolean
  isDoubles: boolean
  
  // Game state
  team1Score: number
  team2Score: number
  currentSet: number
  team1Sets: number
  team2Sets: number
  setsToWin: number
  
  // Service tracking
  servingTeam: 'team1' | 'team2'
  serverNumber: 1 | 2 // For doubles - which player is serving
  
  // Action history
  actions: any[]
  isComplete: boolean
  
  // Actions
  setSetup: (team1: string, team2: string, pointsToWin: number, setsToWin: number, winByTwo: boolean, isDoubles: boolean) => void
  addPoint: (team: 'team1' | 'team2') => void
  switchServer: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-pickleball'

export const usePickleballStore = create<PickleballState>((set, get) => ({
  // Initial state
  team1: '',
  team2: '',
  pointsToWin: 11,
  winByTwo: true,
  isDoubles: false,
  team1Score: 0,
  team2Score: 0,
  currentSet: 1,
  team1Sets: 0,
  team2Sets: 0,
  setsToWin: 1,
  servingTeam: 'team1',
  serverNumber: 2, // In pickleball, starts at 2 for the first service
  actions: [],
  isComplete: false,
  
  setSetup: (team1, team2, pointsToWin, setsToWin, winByTwo, isDoubles) => {
    set({ 
      team1, 
      team2, 
      pointsToWin,
      setsToWin,
      winByTwo,
      isDoubles,
      servingTeam: 'team1',
      serverNumber: isDoubles ? 2 : 1 // Doubles starts with server 2, singles with 1
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPoint: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    // In pickleball, only serving team can score
    // If receiving team wins rally, service changes (no point)
    
    if (team === state.servingTeam) {
      // Serving team scored - add point
      const newScore = team === 'team1' 
        ? { team1Score: state.team1Score + 1 }
        : { team2Score: state.team2Score + 1 }
      
      const score1 = team === 'team1' ? state.team1Score + 1 : state.team1Score
      const score2 = team === 'team2' ? state.team2Score + 1 : state.team2Score
      
      // Check for game win
      const isGameWon = checkGameWon(score1, score2, state.pointsToWin, state.winByTwo)
      
      if (isGameWon) {
        const winner = score1 > score2 ? 'team1' : 'team2'
        const newSets = winner === 'team1' 
          ? { team1Sets: state.team1Sets + 1 }
          : { team2Sets: state.team2Sets + 1 }
        
        const sets1 = winner === 'team1' ? state.team1Sets + 1 : state.team1Sets
        const sets2 = winner === 'team2' ? state.team2Sets + 1 : state.team2Sets
        
        // Check match win
        if (sets1 >= state.setsToWin || sets2 >= state.setsToWin) {
          set({
            ...newScore,
            ...newSets,
            isComplete: true,
            actions: [...state.actions, { type: 'point', team, previousState }]
          })
        } else {
          // New game
          set({
            ...newSets,
            team1Score: 0,
            team2Score: 0,
            currentSet: state.currentSet + 1,
            servingTeam: 'team1',
            serverNumber: state.isDoubles ? 2 : 1,
            actions: [...state.actions, { type: 'point', team, previousState }]
          })
        }
      } else {
        set({
          ...newScore,
          actions: [...state.actions, { type: 'point', team, previousState }]
        })
      }
    } else {
      // Receiving team won rally - side out (service change)
      if (state.isDoubles && state.serverNumber === 1) {
        // In doubles, switch to server 2 first
        set({
          serverNumber: 2,
          actions: [...state.actions, { type: 'sideout', team, previousState }]
        })
      } else {
        // Full side out - switch serving team
        set({
          servingTeam: team,
          serverNumber: state.isDoubles ? 1 : 1,
          actions: [...state.actions, { type: 'sideout', team, previousState }]
        })
      }
    }
    
    saveToStorage(STORAGE_KEY, get())
  },
  
  switchServer: () => {
    const state = get()
    if (!state.isDoubles) return
    
    const previousState = { ...state, actions: [] }
    set({
      serverNumber: state.serverNumber === 1 ? 2 : 1,
      actions: [...state.actions, { type: 'switchServer', previousState }]
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  undo: () => {
    const state = get()
    if (state.actions.length === 0) return
    
    const lastAction = state.actions[state.actions.length - 1]
    const newActions = state.actions.slice(0, -1)
    
    set({
      team1Score: lastAction.previousState.team1Score,
      team2Score: lastAction.previousState.team2Score,
      team1Sets: lastAction.previousState.team1Sets,
      team2Sets: lastAction.previousState.team2Sets,
      currentSet: lastAction.previousState.currentSet,
      servingTeam: lastAction.previousState.servingTeam,
      serverNumber: lastAction.previousState.serverNumber,
      isComplete: lastAction.previousState.isComplete,
      actions: newActions
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    set({
      team1Score: 0,
      team2Score: 0,
      currentSet: 1,
      team1Sets: 0,
      team2Sets: 0,
      servingTeam: 'team1',
      serverNumber: 2,
      actions: [],
      isComplete: false
    })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<PickleballState>(STORAGE_KEY)
    if (saved) {
      set(saved)
    }
  }
}))

function checkGameWon(score1: number, score2: number, pointsToWin: number, winByTwo: boolean): boolean {
  if (winByTwo) {
    return (score1 >= pointsToWin || score2 >= pointsToWin) && Math.abs(score1 - score2) >= 2
  }
  return score1 >= pointsToWin || score2 >= pointsToWin
}
