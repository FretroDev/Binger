export type Settings = {
  showMovieLogos: boolean
  animateCards?: boolean
  autoplayTrailers?: boolean
}

export type Media = {
  episodeDuration: number
  episodesPerSeason: number
  id: string
  tmdbId: number
  title: string
  type: "movie" | "tv"
  posterPath: string
  backdropPath?: string
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
  watchedSeasons?: number
  trailerKey?: string | null
}

export type TMDBSearchResult = {
  id: number
  title?: string
  name?: string
  poster_path: string
  backdrop_path?: string
  media_type: "movie" | "tv"
  first_air_date?: string
  release_date?: string
  vote_average: number
  overview: string
}

export type TMDBVideo = {
  key: string
  site: string
  type: string
  official: boolean
}

export type TMDBDetails = {
  id: number
  title?: string
  name?: string
  poster_path: string
  backdrop_path?: string
  runtime?: number
  episode_run_time?: number[]
  number_of_seasons?: number
  vote_average: number
  overview: string
  videos?: {
    results: TMDBVideo[]
  }
}
