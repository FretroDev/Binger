"use client"

import { useState, useEffect, useCallback } from "react"
import { Pencil, Star, Trash, RefreshCw, Lock, Unlock, X } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getTMDBDetails } from "@/lib/tmdb"
import type { Media } from "@/types"
import { Label } from "@/components/ui/label"
import { useSwipeable } from "react-swipeable"
import { MediaPreview } from "@/components/media-preview"
import { useSettings } from "@/hooks/use-settings"

interface MediaSheetProps {
  media: Media | null
  onClose: () => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Media>) => void
}

export function MediaSheet({ media, onClose, onDelete, onUpdate }: MediaSheetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState("")
  const [duration, setDuration] = useState(0)
  const [isCustomDuration, setIsCustomDuration] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState<"Watched" | "Wishlist" | "Streaming">("Watched")
  const [watchedSeasons, setWatchedSeasons] = useState(0)
  const [seasons, setSeasons] = useState(0)
  const [episodesPerSeason, setEpisodesPerSeason] = useState(0)
  const [episodeDuration, setEpisodeDuration] = useState(0)
  const [isCustomTVDetails, setIsCustomTVDetails] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { settings } = useSettings()

  useEffect(() => {
    if (media) {
      setNote(media.note || "")
      setDuration(media.customDuration || media.runtime)
      setIsCustomDuration(!!media.customDuration)
      setRating(media.rating)
      setCategory(media.category || "Watched")
      setWatchedSeasons(media.watchedSeasons || 0)
      setSeasons(media.seasons || 0)
      setEpisodesPerSeason(media.episodesPerSeason || 0)
      setEpisodeDuration(media.episodeDuration || 0)
    }
  }, [media])

  const handleUpdate = useCallback(() => {
    if (!media) return
    onUpdate(media.id, {
      note,
      customDuration: isCustomDuration ? duration : undefined,
      runtime: media.type === "movie" ? (isCustomDuration ? duration : media.runtime) : media.runtime,
      rating,
      category,
      watchedSeasons: category === "Streaming" && media.type === "tv" ? watchedSeasons : undefined,
      seasons,
      episodesPerSeason,
      episodeDuration,
    })
    setIsEditing(false)
  }, [
    media,
    note,
    isCustomDuration,
    duration,
    rating,
    category,
    watchedSeasons,
    seasons,
    episodesPerSeason,
    episodeDuration,
    onUpdate,
  ])

  const handleDelete = useCallback(() => {
    if (!media) return
    onDelete(media.id)
    setShowDeleteDialog(false)
    onClose()
  }, [media, onDelete, onClose])

  const handleRefresh = useCallback(async () => {
    if (!media) return
    setIsRefreshing(true)
    try {
      const updatedDetails = await getTMDBDetails(media.tmdbId, media.type)

      const videos = updatedDetails.videos?.results || []
      const trailer = videos.find(
        (video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser") && video.official,
      )

      onUpdate(media.id, {
        title: updatedDetails.title || updatedDetails.name || media.title,
        posterPath: updatedDetails.poster_path || media.posterPath,
        backdropPath: updatedDetails.backdrop_path || media.backdropPath,
        tmdbRating: updatedDetails.vote_average,
        runtime: media.type === "movie" ? updatedDetails.runtime || media.runtime : media.runtime,
        overview: updatedDetails.overview || media.overview,
        seasons: media.type === "tv" ? updatedDetails.number_of_seasons || media.seasons : media.seasons,
        trailerKey: trailer?.key || null,
      })
    } catch (error) {
      console.error("Error refreshing media data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [media, onUpdate])

  const handleClose = useCallback(() => {
    if (isEditing) {
      setIsEditing(false)
      if (media) {
        setNote(media.note || "")
        setDuration(media.customDuration || media.runtime)
        setIsCustomDuration(!!media.customDuration)
        setRating(media.rating)
        setCategory(media.category || "Watched")
        setWatchedSeasons(media.watchedSeasons || 0)
        setSeasons(media.seasons || 0)
        setEpisodesPerSeason(media.episodesPerSeason || 0)
        setEpisodeDuration(media.episodeDuration || 0)
      }
    }
    onClose()
  }, [isEditing, media, onClose])

  const swipeHandlers = useSwipeable({
    onSwipedRight: handleClose,
    trackMouse: true,
  })

  if (!media) return null

  const RatingDisplay = () => {
    return (
      <div className="flex gap-4">
        {/* Show user rating for Watched and Streaming items */}
        {media?.category !== "Wishlist" && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground ml-1">Your rating</span>
          </div>
        )}
        {/* Always show TMDB rating if available */}
        {media?.tmdbRating > 0 && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-blue-500 fill-current mr-1" />
            <span className="font-medium">{media.tmdbRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground ml-1">TMDB</span>
          </div>
        )}
        {/* Show "Not rated" for non-wishlist items without rating */}
        {media?.category !== "Wishlist" && rating === 0 && (
          <div className="flex items-center text-muted-foreground text-sm">Not rated yet</div>
        )}
      </div>
    )
  }

  return (
    <Sheet open={!!media} onOpenChange={handleClose}>
      <SheetContent className="p-0 w-full sm:max-w-xl" {...swipeHandlers}>
        {/* Fixed position buttons for close and refresh */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
          <Button
            variant="outline"
            size="icon"
            className="bg-background/20 backdrop-blur-sm hover:bg-background/40 border-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-background/20 backdrop-blur-sm hover:bg-background/40 border-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-[calc(100vh-2rem)] overflow-y-auto">
          {/* Media preview section */}
          <div className="relative">
            <MediaPreview media={media}>
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-4">
                <img
                  src={`https://image.tmdb.org/t/p/w500${media.posterPath}`}
                  alt={media.title}
                  className="w-20 sm:w-24 aspect-[2/3] rounded-lg shadow-lg hidden sm:block"
                />
                <div className="flex-1">
                  {settings.showMovieLogos && media.logo ? (
                    <img
                      src={media.logo || "/placeholder.svg"}
                      alt={media.title}
                      className="h-16 object-contain mb-2"
                    />
                  ) : (
                    <h2 className="text-2xl font-semibold text-white mb-1">{media.title}</h2>
                  )}
                  {media.type === "movie" ? (
                    <p className="text-sm text-white/80">
                      {media.release_date ? new Date(media.release_date).getFullYear() : "Unknown"} •{" "}
                      {media.customDuration || media.runtime} mins
                    </p>
                  ) : (
                    <p className="text-sm text-white/80">
                      {media.first_air_date ? new Date(media.first_air_date).getFullYear() : "Unknown"} •{" "}
                      {media.seasons} Season{media.seasons !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </MediaPreview>
          </div>

          {/* Content sections */}
          <div className="space-y-4 sm:space-y-6 pb-4">
            {/* Info Section */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 space-y-4 mx-2 sm:mx-4 mt-4">
              <RatingDisplay />
              <div className="flex flex-wrap gap-2">
                <Badge>{media.type === "movie" ? "Movie" : "TV Show"}</Badge>
                <Badge variant="outline">
                  {media.type === "movie"
                    ? media.release_date
                      ? new Date(media.release_date).getFullYear()
                      : "Unknown"
                    : media.first_air_date
                      ? new Date(media.first_air_date).getFullYear()
                      : "Unknown"}
                </Badge>
                <Badge variant="outline">
                  {media.type === "movie"
                    ? `${duration || "?"} min`
                    : `${seasons || "?"} season${seasons !== 1 ? "s" : ""}`}
                </Badge>
              </div>

              {media.category === "Streaming" && media.type === "tv" && (
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm">
                      {watchedSeasons || 0} / {seasons || 0} seasons
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Overview Section */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 space-y-2 mx-2 sm:mx-4">
              <h3 className="font-medium">Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{media.overview}</p>
            </div>
            {/* Content (Edit form or display) */}
            {isEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdate()
                }}
                className="space-y-4 bg-black/20 backdrop-blur-sm p-3 sm:p-4 rounded-lg mx-2 sm:mx-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-black/20"
                  />
                </div>

                {media.type === "movie" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="bg-black/20 mr-2"
                        disabled={!isCustomDuration}
                      />
                      <Button variant="outline" size="icon" onClick={() => setIsCustomDuration(!isCustomDuration)}>
                        {isCustomDuration ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">TV Show Details</Label>
                        <Button variant="outline" size="sm" onClick={() => setIsCustomTVDetails(!isCustomTVDetails)}>
                          {isCustomTVDetails ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                          {isCustomTVDetails ? "Lock" : "Unlock"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Seasons</Label>
                          <Input
                            type="number"
                            value={seasons}
                            onChange={(e) => setSeasons(Number(e.target.value))}
                            disabled={!isCustomTVDetails}
                            className="bg-black/20 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Episodes/Season</Label>
                          <Input
                            type="number"
                            value={episodesPerSeason}
                            onChange={(e) => setEpisodesPerSeason(Number(e.target.value))}
                            disabled={!isCustomTVDetails}
                            className="bg-black/20 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Episode Duration</Label>
                          <Input
                            type="number"
                            value={episodeDuration}
                            onChange={(e) => setEpisodeDuration(Number(e.target.value))}
                            disabled={!isCustomTVDetails}
                            className="bg-black/20 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    {category === "Streaming" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Completed Seasons</label>
                        <Input
                          type="number"
                          value={watchedSeasons}
                          onChange={(e) => setWatchedSeasons(Number(e.target.value))}
                          max={seasons}
                          className="bg-black/20"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[100px] bg-black/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={category}
                    onValueChange={(value: "Watched" | "Wishlist" | "Streaming") => setCategory(value)}
                  >
                    <SelectTrigger className="bg-black/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Watched">Watched</SelectItem>
                      <SelectItem value="Wishlist">Wishlist</SelectItem>
                      <SelectItem value="Streaming">Streaming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 bg-black/20 backdrop-blur-sm p-3 sm:p-4 rounded-lg mx-2 sm:mx-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Notes</h3>
                  <p className="text-sm text-muted-foreground">{note || "No notes added."}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Category</h3>
                  <p className="text-sm text-muted-foreground">{category}</p>
                </div>
                {media.type === "tv" && (
                  <div className="space-y-2">
                    <h3 className="font-medium">TV Show Details</h3>
                    <p className="text-sm text-muted-foreground">
                      {seasons} season{seasons !== 1 ? "s" : ""}, {episodesPerSeason} episode
                      {episodesPerSeason !== 1 ? "s" : ""} per season
                    </p>
                    <p className="text-sm text-muted-foreground">Episode duration: {episodeDuration} minutes</p>
                    {category === "Streaming" && (
                      <p className="text-sm text-muted-foreground">Completed seasons: {watchedSeasons}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Actions Section */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 mx-2 sm:mx-4">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(!isEditing)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => setShowDeleteDialog(true)}>
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {media.title}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this item from your library. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}

