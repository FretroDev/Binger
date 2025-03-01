"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ThemeProvider } from "@/components/theme-provider"
import { Stats } from "@/components/stats"
import { MediaGrid } from "@/components/media-grid"
import { getTMDBDetails } from "@/lib/tmdb"
import { getStoredMedia, storeMedia } from "@/lib/storage"
import type { Media } from "@/types"
import ErrorBoundary from "@/components/error-boundary"
import { toast } from "@/components/ui/use-toast"
import { NavBar } from "@/components/nav-bar"
import { MediaFilters } from "@/components/media-filters"
import { ImportDialog } from "@/components/import-dialog"
import { MediaReorganizer } from "@/components/media-reorganizer"
import { useMediaLibrary } from "@/hooks/use-media-library"

export function EmptyMediaState() {
  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-semibold mb-4">Your collection is empty</h2>
      <p>Start adding media to your collection!</p>
    </div>
  )
}

export default function Home() {
  const { media, setMedia } = useMediaLibrary()
  const [isLoading, setIsLoading] = useState(true)
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([])
  const [activeFilters, setActiveFilters] = useState({
    tmdbRating: "",
    userRating: "",
    dateAdded: "",
  })
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isReorganizerOpen, setIsReorganizerOpen] = useState(false)

  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true)
      const storedMedia = getStoredMedia()
      setMedia(storedMedia)
      setIsLoading(false)
    }

    loadMedia()
  }, [setMedia])

  const handleAddMedia = async (
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
    try {
      const existingMedia = media.find((item) => item.tmdbId === tmdbId && item.type === type)
      if (existingMedia) {
        toast({
          title: "Media already exists",
          description: `${existingMedia.title} is already in your library.`,
          variant: "destructive",
        })
        return
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
      }

      const updatedMedia = [newMedia, ...media]
      setMedia(updatedMedia)
      storeMedia(updatedMedia)
      toast({
        title: "Success",
        description: `Added ${newMedia.title} to your library.`,
      })
    } catch (error) {
      console.error("Error adding media:", error)
      toast({
        title: "Error",
        description: "Failed to add media. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMedia = async (id: string, updates: Partial<Media>) => {
    try {
      const updatedMedia = media.map((item) => (item.id === id ? { ...item, ...updates } : item))
      setMedia(updatedMedia)
      storeMedia(updatedMedia)
      toast({
        title: "Success",
        description: "Media updated successfully.",
      })
    } catch (error) {
      console.error("Error updating media:", error)
      toast({
        title: "Error",
        description: "Failed to update media. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMedia = async (id: string) => {
    try {
      const updatedMedia = media.filter((item) => item.id !== id)
      setMedia(updatedMedia)
      storeMedia(updatedMedia)
      toast({
        title: "Success",
        description: "Media deleted from your library.",
      })
    } catch (error) {
      console.error("Error deleting media:", error)
      toast({
        title: "Error",
        description: "Failed to delete media. Please try again.",
        variant: "destructive",
      })
    }
  }

  const applyFilters = (newFilters) => {
    setActiveFilters(newFilters)
    const filtered = [...media]

    if (newFilters.tmdbRating) {
      filtered.sort((a, b) =>
        newFilters.tmdbRating === "Top Rated" ? b.tmdbRating - a.tmdbRating : a.tmdbRating - b.tmdbRating,
      )
    }

    if (newFilters.userRating) {
      filtered.sort((a, b) => (newFilters.userRating === "Top Rated" ? b.rating - a.rating : a.rating - b.rating))
    }

    if (newFilters.dateAdded) {
      filtered.sort((a, b) =>
        newFilters.dateAdded === "Latest"
          ? new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
          : new Date(a.watchedAt).getTime() - new Date(b.watchedAt).getTime(),
      )
    }

    setFilteredMedia(filtered)
  }

  const clearFilters = () => {
    setActiveFilters({
      tmdbRating: "",
      userRating: "",
      dateAdded: "",
    })
    setFilteredMedia([])
  }

  const exportMedia = () => {
    const dataStr = JSON.stringify(media)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "binger_media_export.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImportMedia = async (mediaToImport: Media[]) => {
    try {
      const newMedia = mediaToImport.filter(
        (importedItem) => !media.some((existingItem) => existingItem.id === importedItem.id),
      )
      const updatedMedia = [...media, ...newMedia]
      setMedia(updatedMedia)
      storeMedia(updatedMedia)

      toast({
        title: "Import Successful",
        description: `Added ${newMedia.length} new items to your library.`,
      })
    } catch (error) {
      console.error("Error importing media:", error)
      toast({
        title: "Import Failed",
        description: "There was an error importing the media. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredMediaBySearch = (mediaToFilter: Media[]) => {
    if (!searchQuery) return mediaToFilter
    return mediaToFilter.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const displayedMedia = filteredMedia.length > 0 ? filteredMediaBySearch(filteredMedia) : filteredMediaBySearch(media)

  const handleSaveReorganizedMedia = (newOrder: Media[]) => {
    setMedia(newOrder)
    storeMedia(newOrder)
    toast({
      title: "Success",
      description: "Media order updated successfully.",
    })
  }

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <motion.div
          className="min-h-screen bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container py-10">
            <NavBar onAddMedia={handleAddMedia} />

            <Stats media={media} />

            <MediaFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              activeFilters={activeFilters}
              applyFilters={applyFilters}
              clearFilters={clearFilters}
              setShowImportDialog={setShowImportDialog}
              exportMedia={exportMedia}
              setIsReorganizerOpen={setIsReorganizerOpen}
            />

            {isLoading ? (
              <p>Loading your media library...</p>
            ) : (
              <>
                {media.length === 0 ? (
                  <EmptyMediaState />
                ) : (
                  <MediaGrid
                    media={displayedMedia.filter(
                      (item) => selectedCategory === "All" || item.category === selectedCategory,
                    )}
                    onUpdate={handleUpdateMedia}
                    onDelete={handleDeleteMedia}
                  />
                )}
                {media.length > 0 &&
                  displayedMedia.filter((item) => selectedCategory === "All" || item.category === selectedCategory)
                    .length === 0 && <p className="text-center mt-8">No media found in this category.</p>}
              </>
            )}

            <ImportDialog
              isOpen={showImportDialog}
              onClose={() => setShowImportDialog(false)}
              onImport={handleImportMedia}
            />
          </div>
        </motion.div>
        <MediaReorganizer
          isOpen={isReorganizerOpen}
          onClose={() => setIsReorganizerOpen(false)}
          media={media}
          onSave={handleSaveReorganizedMedia}
        />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

