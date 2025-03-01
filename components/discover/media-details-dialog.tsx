"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Plus, Calendar, Clock, Check, Play } from "lucide-react"
import { getTMDBDetails } from "@/lib/tmdb"
import type { TMDBDetails } from "@/types"
import { AddToLibrary } from "@/components/discover/add-to-library"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaLibrary } from "@/hooks/use-media-library"
import { toast } from "@/components/ui/use-toast"
import { useSettings } from "@/hooks/use-settings"

interface MediaDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  mediaId: number
  mediaType: "movie" | "tv"
}

export function MediaDetailsDialog({ isOpen, onClose, mediaId, mediaType }: MediaDetailsDialogProps) {
  const [details, setDetails] = useState<TMDBDetails | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { media, addMedia } = useMediaLibrary()
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const { settings } = useSettings()

  // Check if media is already in library
  const existingMedia = media.find((m) => m.tmdbId === mediaId && m.type === mediaType)

  useEffect(() => {
    async function fetchDetails() {
      if (!isOpen) return
      try {
        const result = await getTMDBDetails(mediaId, mediaType)
        setDetails(result)

        // Find trailer
        const videos = result.videos?.results || []
        const trailer = videos.find(
          (video) =>
            video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser") && video.official,
        )

        if (trailer) {
          setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`)
        } else {
          setTrailerUrl(null)
        }

        // Find logo
        const englishLogo = result.images?.logos.find((logo) => logo.iso_639_1 === "en")
        if (englishLogo) {
          setLogo(`https://image.tmdb.org/t/p/w500${englishLogo.file_path}`)
        } else {
          setLogo(null)
        }
      } catch (error) {
        console.error("Error fetching details:", error)
      }
    }

    fetchDetails()
  }, [isOpen, mediaId, mediaType])

  const handleAddToLibrary = async (
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
      await addMedia(
        tmdbId,
        type,
        rating,
        category,
        note,
        customDuration,
        seasons,
        episodesPerSeason,
        episodeDuration,
        completedSeasons,
      )
      toast({
        title: "Success",
        description: "Added to your library",
      })
      setShowAddDialog(false)
      onClose()
    } catch (error) {
      console.error("Error adding media:", error)
      toast({
        title: "Error",
        description: "Failed to add to library",
        variant: "destructive",
      })
    }
  }

  if (!details) return null

  const releaseYear = details.release_date
    ? new Date(details.release_date).getFullYear()
    : details.first_air_date
      ? new Date(details.first_air_date).getFullYear()
      : null

  const runtime =
    mediaType === "movie"
      ? `${details.runtime} min`
      : details.number_of_seasons
        ? `${details.number_of_seasons} Season${details.number_of_seasons !== 1 ? "s" : ""}`
        : null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <ScrollArea className="max-h-[90vh]">
            {/* Hero Section */}
            <div className="relative">
              <div className="aspect-video w-full">
                <img
                  src={`https://image.tmdb.org/t/p/original${details?.backdrop_path}`}
                  alt={details?.title || details?.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end gap-4">
                  <div className="relative w-32 rounded-lg shadow-lg hidden sm:block">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${details?.poster_path}`}
                      alt={details?.title || details?.name}
                      className="w-full rounded-lg"
                      style={{ display: "block" }}
                    />
                  </div>
                  <div className="flex-1">
                    {settings.showMovieLogos && logo ? (
                      <img
                        src={logo || "/placeholder.svg"}
                        alt={details?.title || details?.name}
                        className="h-16 object-contain mb-2"
                      />
                    ) : (
                      <h2 className="text-2xl font-semibold text-white mb-2">{details?.title || details?.name}</h2>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                      <Badge variant="secondary" className="capitalize">
                        {mediaType}
                      </Badge>
                      {releaseYear && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{releaseYear}</span>
                        </div>
                      )}
                      {runtime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{runtime}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-blue-400 fill-current" />
                        <span>{details.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Overview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{details.overview}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {trailerUrl && (
                  <Button
                    variant="destructive"
                    onClick={() => window.open(trailerUrl, "_blank")}
                    className="w-full sm:w-auto"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}

                {existingMedia ? (
                  <Button variant="outline" disabled className="w-full sm:w-auto">
                    <Check className="w-4 h-4 mr-2" />
                    In Library
                  </Button>
                ) : (
                  <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {showAddDialog && details && (
        <AddToLibrary
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          details={details}
          mediaType={mediaType}
          onAdd={handleAddToLibrary}
        />
      )}
    </>
  )
}

