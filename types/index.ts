export type Media = {
  id: string
  tmdbId: number
  title: string
  type: "movie" | "tv"
  posterPath: string
  rating: number
  tmdbRating: number
  watchedAt: Date
  runtime: number
  customDuration?: number
  note?: string
  seasons?: number
  overview?: string
  release_date?: string
  first_air_date?: string
  number_of_seasons?: number
  category: "Watched" | "Wishlist" | "Streaming"
  order?: number
}

export type TMDBSearchResult = {
  id: number
  title?: string
  name?: string
  poster_path: string
  media_type: "movie" | "tv"
  first_air_date?: string
  release_date?: string
  vote_average: number
  overview: string
}

export type TMDBDetails = {
  id: number
  title?: string
  name?: string
  poster_path: string
  runtime?: number
  episode_run_time?: number[]
  number_of_seasons?: number
  vote_average: number
  overview: string
}
