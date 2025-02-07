import { BaseMedia, isMovie, type Media, type Movie, type Show } from "@/types";
import { getTMDBDetails } from "./tmdb";

const STORAGE_KEY = "binger-media";

export function getStoredMedia(): Media[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      watchedAt: new Date(item.watchedAt),
    }));
  } catch {
    return [];
  }
}

export function storeMedia(media: Media[]) {
  if (typeof window === "undefined") return;
  try {
    const mediaToStore = media.map((item) => ({
      ...item,
      addedOn:
        item.addedOn instanceof Date
          ? item.addedOn.toISOString()
          : item.addedOn,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaToStore));
  } catch (error) {
    console.error("Error storing media in localStorage:", error);
  }
}

export async function handleImportMedia(mediaToImport: Media[]) {
  let media = getStoredMedia();
  const updatedMedia = [...media, ...mediaToImport];
  storeMedia(updatedMedia);
}

export const getMediaDuration = (media: Media) => {
  if (isMovie(media)) {
    return media.runtime;
  } else {
    return (
      media.watchedSeasons * media.episodesPerSeason * media.episodeRuntime
    );
  }
};

export async function handleAddMedia({
  tmdbId,
  type,
  duration,
  rating,
  category,
  note,
  watchedSeasons,
}: {
  tmdbId: number;
  type: "movie" | "tv";
  rating: number;
  category: "Watched" | "Wishlist" | "Streaming";
  note?: string;
  duration?: string;
  watchedSeasons?: string;
}) {
  // Check if the media already exists in the library
  let media = getStoredMedia();
  if (media.find((item) => item.id === tmdbId)) {
    throw "media already exsists";
  }

  const details = await getTMDBDetails(tmdbId, type);

  let baseMedia: BaseMedia = {
    id: tmdbId,
    title: details.title || "",
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    rating,
    tmdbRating: details.vote_average,
    addedOn: new Date(),
    note,
    overview: details.overview,
    category,
    releaseDate: details?.release_date || details?.first_air_date || "N/A",
    type,
  };

  let newMedia: Media;

  if (type == "movie") {
    newMedia = { ...baseMedia, runtime: details.runtime || 0, type: "movie" };
  } else {
    newMedia = {
      ...baseMedia,
      watchedSeasons: parseInt(watchedSeasons || "0"),
      numOfSeasons: details.number_of_seasons || 0,
      episodesPerSeason: details.number_of_seasons || 0,
      episodeRuntime: details.episode_run_time?.[0] || 0,
      type: "tv",
    };
  }

  media.push(newMedia);
  storeMedia(media);
}

export async function handleUpdateMedia(
  id: number,
  note: string,
  duration: number,
  rating: number,
  category: "Watched" | "Wishlist" | "Streaming",
  watchedSeasons?: number,
  seasons?: number,
  episodesPerSeason?: number,
  episodeDuration?: number,
) {
  const updatedItem: Media = {
    id,
    note,
    rating,
    category,
    watchedSeasons,
    runtime: duration,
    numOfSeasons: seasons,
    episodeRuntime: episodeDuration,
    episodeCount: episodesPerSeason,
  };
}

export async function handleDeleteMedia(id: number) {
  // Remove the media item from the local state
  const media = getStoredMedia();
  const updatedMedia = media.filter((item) => item.id !== id);
  storeMedia(updatedMedia);
}
