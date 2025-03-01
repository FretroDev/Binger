import type { TMDBSearchResult, TMDBDetails } from "../types"

const API_BASE_URL = "/api/tmdb"

export async function searchTMDB(query: string): Promise<TMDBSearchResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}?action=search&query=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return data as TMDBSearchResult[]
  } catch (error) {
    console.error("Error searching TMDB:", error)
    throw error
  }
}

export async function getTMDBDetails(id: number, type: "movie" | "tv"): Promise<TMDBDetails> {
  try {
    const response = await fetch(`${API_BASE_URL}?action=details&id=${id}&type=${type}&append_to_response=videos`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return data as TMDBDetails
  } catch (error) {
    console.error("Error getting TMDB details:", error)
    throw error
  }
}

export async function getTrending(): Promise<TMDBSearchResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}?action=trending`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return data as TMDBSearchResult[]
  } catch (error) {
    console.error("Error getting trending:", error)
    throw error
  }
}

export async function getTopRated(type: "movie" | "tv"): Promise<TMDBSearchResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}?action=top_rated&type=${type}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return data as TMDBSearchResult[]
  } catch (error) {
    console.error("Error getting top rated:", error)
    throw error
  }
}

