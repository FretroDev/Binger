import type { Settings } from "@/types"

const SETTINGS_KEY = "binger-settings"

const DEFAULT_SETTINGS: Settings = {
  showMovieLogos: true,
  animateCards: true,
  autoplayTrailers: true,
}

export function getStoredSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS

  const stored = localStorage.getItem(SETTINGS_KEY)
  if (!stored) return DEFAULT_SETTINGS

  try {
    return JSON.parse(stored) as Settings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function storeSettings(settings: Settings) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("Error storing settings in localStorage:", error)
  }
}

