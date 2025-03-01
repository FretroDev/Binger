"use client"

import { useState, useEffect } from "react"
import { getStoredMedia, storeMedia } from "@/lib/storage"
import { getTMDBDetails } from "@/lib/tmdb"
import type { Media } from "@/types"

export function useMediaLibrary() {
  const [media, setMedia] = useState<Media[]>([])

  useEffect(() => {
    const storedMedia = getStoredMedia()
    setMedia(storedMedia)
  }, [])

  const addMedia = async (
    tmdbId: number,
    type: "movie" | "tv",
    rating: number,
    category: "Watched" | "Wishlist" | "Streaming",
    note?: string,
    customDuration?: number,
    seasons?: number,
    episodesPerSeason?: number,
    episodeDuration?: number,
    completedSeasons?: number,
  ) => {
    const existingMedia = media.find((item) => item.tmdbId === tmdbId && item.type === type)
    if (existingMedia) {
      throw new Error("Media already exists in library")
    }

    const details = await getTMDBDetails(tmdbId, type)

    // Find trailer
    const videos = details.videos?.results || []
    const trailer = videos.find(
      (video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser") && video.official,
    )

    let duration = customDuration
    if (type === "tv" && !customDuration && seasons && episodesPerSeason && episodeDuration) {
      duration = seasons * episodesPerSeason * episodeDuration
    }

    const newMedia: Media = {
      id: Math.random().toString(36).substring(7),
      tmdbId,
      title: details.title || details.name || "",
      type,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      rating,
      tmdbRating: details.vote_average,
      watchedAt: new Date(),
      runtime: type === "movie" ? details.runtime || 0 : 0,
      customDuration: duration,
      note,
      overview: details.overview,
      category,
      watchedSeasons: category === "Streaming" && type === "tv" ? completedSeasons : undefined,
      seasons: type === "tv" ? seasons : undefined,
      episodesPerSeason: type === "tv" ? episodesPerSeason : undefined,
      episodeDuration: type === "tv" ? episodeDuration : undefined,
      release_date: details.release_date,
      first_air_date: details.first_air_date,
      trailerKey: trailer?.key || null,
      logo: details.images?.logos.find((logo) => logo.iso_639_1 === "en")?.file_path
        ? `https://image.tmdb.org/t/p/w500${details.images.logos.find((logo) => logo.iso_639_1 === "en")?.file_path}`
        : null,
    }

    const updatedMedia = [newMedia, ...media]
    setMedia(updatedMedia)
    storeMedia(updatedMedia)
    return newMedia
  }

  return {
    media,
    setMedia,
    addMedia,
  }
}

