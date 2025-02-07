export interface BaseMedia {
  id: number;
  title: string;
  posterPath: string;
  backdropPath: string;
  rating: number;
  tmdbRating: number;
  addedOn: Date;
  releaseDate: string;
  note?: string;
  overview?: string;
  order?: number;
  category: "Watched" | "Wishlist" | "Streaming";
  type: "movie" | "tv";
}

export interface Movie extends BaseMedia {
  type: "movie";
  runtime: number;
}

export const isMovie = (media: Movie | Show): media is Movie =>
  media.type === "movie";

export interface Show extends BaseMedia {
  type: "tv";
  numOfSeasons: number;
  episodesPerSeason: number;
  episodeRuntime: number;
  watchedSeasons: number;
}

export type Media = Movie | Show;

export const isShow = (media: Movie | Show): media is Show =>
  media.type === "tv";

export type TMDBSearchResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  media_type: "movie" | "tv";
  first_air_date?: string;
  release_date?: string;
  vote_average: number;
  overview: string;
};

export type TMDBDetails = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  runtime: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  vote_average: number;
  overview: string;
  first_air_date?: string;
  release_date?: string;
};
