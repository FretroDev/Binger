import type { Media, Movie, Show } from "@/types";
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

export async function handleAddMedia({
  tmdbId,
  type,
  duration,
  rating,
  category,
  note,
  watchedSeasons,
}: {
  id: number;
  media_type: "movie" | "tv";
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

  let newMedia: Media = {
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

    releaseDate: details?.release_date || details?.first_air_date,
  };

  if (media_type === "movie") {
    newMedia = {
      runtime: duration || details.runtime,
    } as Movie;
  } else {
    newMedia = {
      ...newMedia,
      numOfSeasons: details.number_of_seasons || 0,
      episodeRuntime: details.episode_run_time?.[0] || 0,
      watchedSeasons: watchedSeasons ? parseInt(watchedSeasons) : 0,
    } as Show;
  }

  media.push(newMedia);
  storeMedia(media);
}

export async function handleUpdateMedia(
  id: string,
  note: string,
  duration: number,
  rating: number,
  category: "Watched" | "Wishlist" | "Streaming",
  watchedSeasons?: number,
  seasons?: number,
  episodesPerSeason?: number,
  episodeDuration?: number,
) {
  try {
    const updatedMedia = media.map((item) => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          note,
          customDuration: duration !== item.runtime ? duration : undefined,
          rating,
          category,
          watchedSeasons:
            category === "Streaming" && item.type === "tv"
              ? watchedSeasons
              : undefined,
          seasons,
          episodesPerSeason,
          episodeDuration,
        };

        return updatedItem;
      }
      return item;
    });

    if (isSupabaseReady && session) {
      const { error } = await supabase!
        .from("media")
        .update({
          note,
          customDuration:
            duration !== updatedMedia.find((m) => m.id === id)?.runtime
              ? duration
              : null,
          rating,
          category,
          watchedSeasons: category === "Streaming" ? watchedSeasons : null,
          seasons,
          episodesPerSeason,
          episodeDuration,
        })
        .eq("id", id);
      if (error) throw error;
    }

    setMedia(updatedMedia);
    storeMedia(updatedMedia);
    setSelectedMedia(updatedMedia.find((item) => item.id === id) || null);
    toast({
      title: "Success",
      description: "Media updated successfully.",
    });
  } catch (error) {
    console.error("Error updating media:", error);
  }
}

export async function handleDeleteMedia(id: number) {
  // Remove the media item from the local state
  const media = getStoredMedia();
  const updatedMedia = media.filter((item) => item.id !== id);
  storeMedia(updatedMedia);
}
