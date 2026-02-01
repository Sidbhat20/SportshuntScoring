export type Sport = {
  id: string
  name: string
}

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'hockey', name: 'Hockey' },
  { id: 'rugby', name: 'Rugby' },
  { id: 'handball', name: 'Handball' },
  { id: 'waterpolo', name: 'Water Polo' },
  { id: 'tabletennis', name: 'Table Tennis' },
  { id: 'badminton', name: 'Badminton' },
  { id: 'pickleball', name: 'Pickleball' },
  { id: 'volleyball', name: 'Volleyball' },
  { id: 'pool', name: 'Pool' },
  { id: 'snooker', name: 'Snooker' },
  { id: 'golf', name: 'Golf' },
  { id: 'baseball', name: 'Baseball' },
  { id: 'kabaddi', name: 'Kabaddi' },
  { id: 'squash', name: 'Squash' },
  { id: 'cricket', name: 'Cricket' },
]

export type GameAction = {
  type: string
  team: 'home' | 'away' | null
  value: any
  timestamp: number
  previousState: any
}

export type BaseGameState = {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  isRunning: boolean
  isComplete: boolean
  actions: GameAction[]
}
