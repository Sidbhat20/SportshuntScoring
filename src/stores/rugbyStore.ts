import { create } from 'zustand'
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/utils'

type CardInfo = { playerName: string; minute: number; secondsRemaining?: number }

type RugbyState = {
  homeTeam: string
  awayTeam: string
  halfDuration: number
  
  homeScore: number
  awayScore: number
  homeTries: number
  homeConversions: number
  homePenalties: number
  homeDropGoals: number
  awayTries: number
  awayConversions: number
  awayPenalties: number
  awayDropGoals: number
  
  currentHalf: 1 | 2
  timerSeconds: number
  isRunning: boolean
  isComplete: boolean
  
  lastTryTeam: 'home' | 'away' | null
  canConvert: boolean
  
  homeYellowCards: CardInfo[]
  homeRedCards: CardInfo[]
  awayYellowCards: CardInfo[]
  awayRedCards: CardInfo[]
  
  actions: any[]
  
  setSetup: (homeTeam: string, awayTeam: string, halfDuration: number) => void
  addTry: (team: 'home' | 'away') => void
  addConversion: (team: 'home' | 'away', made: boolean) => void
  addPenalty: (team: 'home' | 'away') => void
  addDropGoal: (team: 'home' | 'away') => void
  addPenaltyTry: (team: 'home' | 'away') => void
  addCard: (team: 'home' | 'away', type: 'yellow' | 'red', playerName: string) => void
  startTimer: () => void
  stopTimer: () => void
  tick: () => void
  endHalf: () => void
  undo: () => void
  reset: () => void
  loadState: () => void
}

const STORAGE_KEY = 'sportshunt-rugby'

export const useRugbyStore = create<RugbyState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  halfDuration: 40,
  homeScore: 0,
  awayScore: 0,
  homeTries: 0,
  homeConversions: 0,
  homePenalties: 0,
  homeDropGoals: 0,
  awayTries: 0,
  awayConversions: 0,
  awayPenalties: 0,
  awayDropGoals: 0,
  currentHalf: 1,
  timerSeconds: 0,
  isRunning: false,
  isComplete: false,
  lastTryTeam: null,
  canConvert: false,
  homeYellowCards: [],
  homeRedCards: [],
  awayYellowCards: [],
  awayRedCards: [],
  actions: [],
  
  setSetup: (homeTeam, awayTeam, halfDuration) => {
    set({ homeTeam, awayTeam, halfDuration })
    saveToStorage(STORAGE_KEY, get())
  },
  
  addTry: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      set({
        homeScore: state.homeScore + 5,
        homeTries: state.homeTries + 1,
        lastTryTeam: 'home',
        canConvert: true,
        actions: [...state.actions, { type: 'try', team, previousState }]
      })
    } else {
      set({
        awayScore: state.awayScore + 5,
        awayTries: state.awayTries + 1,
        lastTryTeam: 'away',
        canConvert: true,
        actions: [...state.actions, { type: 'try', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addConversion: (team, made) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (made && team === 'home') {
      set({
        homeScore: state.homeScore + 2,
        homeConversions: state.homeConversions + 1,
        canConvert: false,
        lastTryTeam: null,
        actions: [...state.actions, { type: 'conversion', team, made, previousState }]
      })
    } else if (made && team === 'away') {
      set({
        awayScore: state.awayScore + 2,
        awayConversions: state.awayConversions + 1,
        canConvert: false,
        lastTryTeam: null,
        actions: [...state.actions, { type: 'conversion', team, made, previousState }]
      })
    } else {
      set({
        canConvert: false,
        lastTryTeam: null,
        actions: [...state.actions, { type: 'conversion', team, made, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPenalty: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      set({
        homeScore: state.homeScore + 3,
        homePenalties: state.homePenalties + 1,
        actions: [...state.actions, { type: 'penalty', team, previousState }]
      })
    } else {
      set({
        awayScore: state.awayScore + 3,
        awayPenalties: state.awayPenalties + 1,
        actions: [...state.actions, { type: 'penalty', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addDropGoal: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      set({
        homeScore: state.homeScore + 3,
        homeDropGoals: state.homeDropGoals + 1,
        actions: [...state.actions, { type: 'dropGoal', team, previousState }]
      })
    } else {
      set({
        awayScore: state.awayScore + 3,
        awayDropGoals: state.awayDropGoals + 1,
        actions: [...state.actions, { type: 'dropGoal', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addPenaltyTry: (team) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    
    if (team === 'home') {
      set({
        homeScore: state.homeScore + 7,
        homeTries: state.homeTries + 1,
        homeConversions: state.homeConversions + 1,
        actions: [...state.actions, { type: 'penaltyTry', team, previousState }]
      })
    } else {
      set({
        awayScore: state.awayScore + 7,
        awayTries: state.awayTries + 1,
        awayConversions: state.awayConversions + 1,
        actions: [...state.actions, { type: 'penaltyTry', team, previousState }]
      })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  addCard: (team, type, playerName) => {
    const state = get()
    const previousState = { ...state, actions: [] }
    const minute = Math.floor(state.timerSeconds / 60)
    
    if (type === 'yellow') {
      if (team === 'home') {
        set({
          homeYellowCards: [...state.homeYellowCards, { playerName, minute, secondsRemaining: 600 }],
          actions: [...state.actions, { type: 'card', team, cardType: 'yellow', playerName, previousState }]
        })
      } else {
        set({
          awayYellowCards: [...state.awayYellowCards, { playerName, minute, secondsRemaining: 600 }],
          actions: [...state.actions, { type: 'card', team, cardType: 'yellow', playerName, previousState }]
        })
      }
    } else {
      if (team === 'home') {
        set({
          homeRedCards: [...state.homeRedCards, { playerName, minute }],
          actions: [...state.actions, { type: 'card', team, cardType: 'red', playerName, previousState }]
        })
      } else {
        set({
          awayRedCards: [...state.awayRedCards, { playerName, minute }],
          actions: [...state.actions, { type: 'card', team, cardType: 'red', playerName, previousState }]
        })
      }
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  startTimer: () => set({ isRunning: true }),
  stopTimer: () => set({ isRunning: false }),
  
  tick: () => {
    const state = get()
    if (state.isRunning) {
      // Update yellow card timers
      const newHomeYellowCards = state.homeYellowCards
        .map(c => ({ ...c, secondsRemaining: (c.secondsRemaining || 0) - 1 }))
        .filter(c => (c.secondsRemaining || 0) > 0)
      const newAwayYellowCards = state.awayYellowCards
        .map(c => ({ ...c, secondsRemaining: (c.secondsRemaining || 0) - 1 }))
        .filter(c => (c.secondsRemaining || 0) > 0)
      
      set({ 
        timerSeconds: state.timerSeconds + 1,
        homeYellowCards: newHomeYellowCards,
        awayYellowCards: newAwayYellowCards
      })
      saveToStorage(STORAGE_KEY, get())
    }
  },
  
  endHalf: () => {
    const state = get()
    if (state.currentHalf === 1) {
      set({
        currentHalf: 2,
        timerSeconds: 0,
        isRunning: false,
        canConvert: false,
        lastTryTeam: null
      })
    } else {
      set({ isComplete: true, isRunning: false })
    }
    saveToStorage(STORAGE_KEY, get())
  },
  
  undo: () => {
    const state = get()
    if (state.actions.length === 0) return
    const lastAction = state.actions[state.actions.length - 1]
    set({
      ...lastAction.previousState,
      actions: state.actions.slice(0, -1)
    })
    saveToStorage(STORAGE_KEY, get())
  },
  
  reset: () => {
    set({
      homeScore: 0,
      awayScore: 0,
      homeTries: 0,
      homeConversions: 0,
      homePenalties: 0,
      homeDropGoals: 0,
      awayTries: 0,
      awayConversions: 0,
      awayPenalties: 0,
      awayDropGoals: 0,
      currentHalf: 1,
      timerSeconds: 0,
      isRunning: false,
      isComplete: false,
      lastTryTeam: null,
      canConvert: false,
      homeYellowCards: [],
      homeRedCards: [],
      awayYellowCards: [],
      awayRedCards: [],
      actions: []
    })
    clearStorage(STORAGE_KEY)
  },
  
  loadState: () => {
    const saved = loadFromStorage<RugbyState>(STORAGE_KEY)
    if (saved) set(saved)
  }
}))
