import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type CardInfo = {
  playerName: string
  minute: number
  type: 'yellow' | 'red'
}

type GamePhase = 'first-half' | 'second-half' | 'extra-first' | 'extra-second' | 'penalties' | 'complete'

type FootballState = {
  // Setup
  homeTeam: string
  awayTeam: string
  halfDurationSeconds: number
  extraTimeHalfSeconds: number
  
  // Game state
  homeScore: number
  awayScore: number
  gamePhase: GamePhase
  timerSeconds: number
  isRunning: boolean
  stoppageTime: number
  
  // Penalty shootout
  homePenalties: boolean[]
  awayPenalties: boolean[]
  currentPenaltyRound: number
  penaltyTeam: 'home' | 'away'
  
  // Cards
  homeYellowCards: CardInfo[]
  homeRedCards: CardInfo[]
  awayYellowCards: CardInfo[]
  awayRedCards: CardInfo[]
  
  // Action history
  actions: any[]
  
  // Actions
  setSetup: (homeTeam: string, awayTeam: string, halfDurationSeconds: number) => void
  setExtraTimeDuration: (seconds: number) => void
  addGoal: (team: 'home' | 'away') => void
  addCard: (team: 'home' | 'away', type: 'yellow' | 'red', playerName: string) => void
  startTimer: () => void
  stopTimer: () => void
  tick: () => void
  addStoppage: () => void
  endPhase: () => void
  startExtraTime: () => void
  startPenalties: () => void
  endAsDraw: () => void
  recordPenalty: (team: 'home' | 'away', scored: boolean) => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-football'

export const useFootballStore = create<FootballState>((set, get) => ({
  // Initial state
  homeTeam: '',
  awayTeam: '',
  halfDurationSeconds: 45 * 60,
  extraTimeHalfSeconds: 15 * 60,
  homeScore: 0,
  awayScore: 0,
  gamePhase: 'first-half',
  timerSeconds: 0,
  isRunning: false,
  stoppageTime: 0,
  homePenalties: [],
  awayPenalties: [],
  currentPenaltyRound: 1,
  penaltyTeam: 'home',
  homeYellowCards: [],
  homeRedCards: [],
  awayYellowCards: [],
  awayRedCards: [],
  actions: [],
  
  setSetup: (homeTeam, awayTeam, halfDurationSeconds) => {
    set({ homeTeam, awayTeam, halfDurationSeconds })
    saveToStorage(STORAGE_KEY, get())
  },
  
  setExtraTimeDuration: (seconds) => {
    set({ extraTimeHalfSeconds: seconds })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addGoal: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      set({
        homeScore: state.homeScore + 1,
        actions: [...state.actions, { type: 'goal', team, previousState }]
      })
    } else {
      set({
        awayScore: state.awayScore + 1,
        actions: [...state.actions, { type: 'goal', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addCard: (team, type, playerName) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    const minute = Math.floor(state.timerSeconds / 60)
    const cardInfo: CardInfo = { playerName, minute, type }
    
    const existingYellows = team === 'home' ? state.homeYellowCards : state.awayYellowCards
    const hasYellow = existingYellows.some(c => c.playerName.toLowerCase() === playerName.toLowerCase())
    
    if (type === 'yellow' && hasYellow) {
      if (team === 'home') {
        set({
          homeRedCards: [...state.homeRedCards, { ...cardInfo, type: 'red' }],
          actions: [...state.actions, { type: 'card', team, cardType: 'second-yellow', playerName, previousState }]
        })
      } else {
        set({
          awayRedCards: [...state.awayRedCards, { ...cardInfo, type: 'red' }],
          actions: [...state.actions, { type: 'card', team, cardType: 'second-yellow', playerName, previousState }]
        })
      }
    } else if (type === 'yellow') {
      if (team === 'home') {
        set({
          homeYellowCards: [...state.homeYellowCards, cardInfo],
          actions: [...state.actions, { type: 'card', team, cardType: 'yellow', playerName, previousState }]
        })
      } else {
        set({
          awayYellowCards: [...state.awayYellowCards, cardInfo],
          actions: [...state.actions, { type: 'card', team, cardType: 'yellow', playerName, previousState }]
        })
      }
    } else {
      if (team === 'home') {
        set({
          homeRedCards: [...state.homeRedCards, cardInfo],
          actions: [...state.actions, { type: 'card', team, cardType: 'red', playerName, previousState }]
        })
      } else {
        set({
          awayRedCards: [...state.awayRedCards, cardInfo],
          actions: [...state.actions, { type: 'card', team, cardType: 'red', playerName, previousState }]
        })
      }
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  startTimer: () => {
    set({ isRunning: true })
    saveToStorage(STORAGE_KEY, get())
  },
  
  stopTimer: () => {
    set({ isRunning: false })
    saveToStorage(STORAGE_KEY, get())
  },
  
  tick: () => {
    const state = get()
    if (state.isRunning) {
      set({ timerSeconds: state.timerSeconds + 1 })
    }
  },
  
  addStoppage: () => {
    const state = get()
    set({ stoppageTime: state.stoppageTime + 1 })
    saveToStorage(STORAGE_KEY, get())
  },
  
  endPhase: () => {
    const state = get()
    if (state.gamePhase === 'first-half') {
      set({
        gamePhase: 'second-half',
        timerSeconds: 0,
        stoppageTime: 0,
        isRunning: false
      })
    } else if (state.gamePhase === 'second-half') {
      // Game ends - check for draw
      set({ isRunning: false })
      // Note: we don't auto-complete here, user will choose extra time / penalties / draw
    } else if (state.gamePhase === 'extra-first') {
      set({
        gamePhase: 'extra-second',
        timerSeconds: 0,
        stoppageTime: 0,
        isRunning: false
      })
    } else if (state.gamePhase === 'extra-second') {
      // Extra time ends - check for draw
      set({ isRunning: false })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  startExtraTime: () => {
    set({
      gamePhase: 'extra-first',
      timerSeconds: 0,
      stoppageTime: 0,
      isRunning: false
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  startPenalties: () => {
    set({
      gamePhase: 'penalties',
      homePenalties: [],
      awayPenalties: [],
      currentPenaltyRound: 1,
      penaltyTeam: 'home',
      isRunning: false
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  endAsDraw: () => {
    set({ gamePhase: 'complete' })
    saveToStorage(STORAGE_KEY, get())
  },
  
  recordPenalty: (team, scored) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      const newHomePenalties = [...state.homePenalties, scored]
      set({
        homePenalties: newHomePenalties,
        penaltyTeam: 'away',
        actions: [...state.actions, { type: 'penalty', team, scored, previousState }]
      })
    } else {
      const newAwayPenalties = [...state.awayPenalties, scored]
      const newRound = state.currentPenaltyRound + 1
      set({
        awayPenalties: newAwayPenalties,
        penaltyTeam: 'home',
        currentPenaltyRound: newRound,
        actions: [...state.actions, { type: 'penalty', team, scored, previousState }]
      })
    }
    
    // Check for winner
    const newState = get()
    const homeScored = newState.homePenalties.filter(Boolean).length
    const awayScored = newState.awayPenalties.filter(Boolean).length
    const homeTaken = newState.homePenalties.length
    const awayTaken = newState.awayPenalties.length
    const round = newState.currentPenaltyRound
    
    // After 5 rounds each
    if (homeTaken >= 5 && awayTaken >= 5 && round > 5) {
      // Sudden death - check if one team has won
      if (homeTaken === awayTaken && homeScored !== awayScored) {
        set({ gamePhase: 'complete' })
      }
    } else if (round <= 5) {
      // First 5 rounds - check if one team has mathematically won
      const homeRemaining = 5 - homeTaken
      const awayRemaining = 5 - awayTaken
      
      if (homeScored > awayScored + awayRemaining) {
        set({ gamePhase: 'complete' })
      } else if (awayScored > homeScored + homeRemaining) {
        set({ gamePhase: 'complete' })
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
      homeScore: lastAction.previousState.homeScore,
      awayScore: lastAction.previousState.awayScore,
      homeYellowCards: lastAction.previousState.homeYellowCards,
      homeRedCards: lastAction.previousState.homeRedCards,
      awayYellowCards: lastAction.previousState.awayYellowCards,
      awayRedCards: lastAction.previousState.awayRedCards,
      homePenalties: lastAction.previousState.homePenalties || [],
      awayPenalties: lastAction.previousState.awayPenalties || [],
      currentPenaltyRound: lastAction.previousState.currentPenaltyRound || 1,
      penaltyTeam: lastAction.previousState.penaltyTeam || 'home',
      gamePhase: lastAction.previousState.gamePhase || state.gamePhase,
      actions: newActions
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    set({
      homeScore: 0,
      awayScore: 0,
      gamePhase: 'first-half',
      timerSeconds: 0,
      isRunning: false,
      stoppageTime: 0,
      homePenalties: [],
      awayPenalties: [],
      currentPenaltyRound: 1,
      penaltyTeam: 'home',
      homeYellowCards: [],
      homeRedCards: [],
      awayYellowCards: [],
      awayRedCards: [],
      actions: []
    })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<FootballState>(STORAGE_KEY)
    if (saved) {
      set(saved)
    }
  }
}))
