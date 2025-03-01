import type { Media } from "@/types"

const STORAGE_KEY = "binger-media"

export function getStoredMedia(): Media[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    const parsed = JSON.parse(stored)
    return parsed.map((item: any) => ({
      ...item,
      watchedAt: new Date(item.watchedAt),
    }))
  } catch {
    return []
  }
}

export function storeMedia(media: Media[]) {
  if (typeof window === "undefined") return
  try {
    const mediaToStore = media.map((item) => ({
      ...item,
      watchedAt: item.watchedAt instanceof Date ? item.watchedAt.toISOString() : item.watchedAt,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaToStore))
  } catch (error) {
    console.error("Error storing media in localStorage:", error)
  }
}

