export function formatTime(seconds: number): string {
  const mins = Math.floor(Math.abs(seconds) / 60)
  const secs = Math.abs(seconds) % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(Math.abs(seconds) / 3600)
  const mins = Math.floor((Math.abs(seconds) % 3600) / 60)
  const secs = Math.abs(seconds) % 60
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return formatTime(seconds)
}

const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export function saveToStorage(key: string, data: any): void {
  if (typeof window !== 'undefined') {
    if (saveTimers[key]) {
      clearTimeout(saveTimers[key])
    }
    saveTimers[key] = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data))
    }, 150)
  }
}

export function loadFromStorage<T>(key: string): T | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        return JSON.parse(data) as T
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearStorage(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
}
