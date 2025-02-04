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

interface MediaSheetProps {
  media: Media | null
  onClose: () => void
  onDelete: (id: string) => void
  onUpdate: (
    id: string,
    note: string,
    duration: number,
    rating: number,
    category: "Watched" | "Wishlist" | "Streaming",
    watchedSeasons?: number,
    seasons?: number,
    episodesPerSeason?: number,
    episodeDuration?: number,
  ) => void
}

export function MediaSheet({ media, onClose, onDelete, onUpdate }: MediaSheetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState("")
  const [duration, setDuration] = useState(0)
  const [originalDuration, setOriginalDuration] = useState(0)
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

  useEffect(() => {
    if (media) {
      const mediaRuntime = media.runtime || 0
      setNote(media.note || "")
      setDuration(media.customDuration || mediaRuntime)
      setOriginalDuration(mediaRuntime)
      setIsCustomDuration(!!media.customDuration)
      setRating(media.rating)
      setCategory(media.category || "Watched")
      setWatchedSeasons(media.watchedSeasons || 0)
      setSeasons(media.seasons || 0)
      setEpisodesPerSeason(media.episodesPerSeason || 0)
      setEpisodeDuration(media.episodeDuration || 0)
    }
  }, [media])

  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault()
      handleClose()
    }

    window.history.pushState(null, "", window.location.pathname)
    window.addEventListener("popstate", handleBackButton)

    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [])

  const handleDurationToggle = useCallback(() => {
    setIsCustomDuration(!isCustomDuration)
    if (isCustomDuration) {
      setDuration(originalDuration)
    }
  }, [isCustomDuration, originalDuration])

  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(Math.max(0, newDuration))
  }, [])

  const handleUpdate = useCallback(() => {
    if (!media) return
    onUpdate(
      media.id,
      note,
      isCustomDuration ? duration : originalDuration,
      rating,
      category,
      category === "Streaming" && media.type === "tv" ? watchedSeasons : undefined,
      seasons,
      episodesPerSeason,
      episodeDuration,
    )
    setIsEditing(false)
  }, [
    media,
    note,
    isCustomDuration,
    duration,
    originalDuration,
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
      const updatedMedia: Media = {
        ...media,
        title: updatedDetails.title || updatedDetails.name || media.title,
        posterPath: updatedDetails.poster_path || media.posterPath,
        backdropPath: updatedDetails.backdrop_path || media.backdropPath,
        tmdbRating: updatedDetails.vote_average,
        runtime: media.type === "movie" ? updatedDetails.runtime || media.runtime : media.runtime,
        overview: updatedDetails.overview || media.overview,
        seasons: media.type === "tv" ? updatedDetails.number_of_seasons || media.seasons : media.seasons,
        episodesPerSeason:
          media.type === "tv"
            ? Math.ceil((updatedDetails.number_of_episodes || 0) / (updatedDetails.number_of_seasons || 1))
            : media.episodesPerSeason,
        episodeDuration:
          media.type === "tv" ? updatedDetails.episode_run_time?.[0] || media.episodeDuration : media.episodeDuration,
        release_date: media.type === "movie" ? updatedDetails.release_date || media.release_date : media.release_date,
        first_air_date:
          media.type === "tv" ? updatedDetails.first_air_date || media.first_air_date : media.first_air_date,
      }
      onUpdate(
        updatedMedia.id,
        updatedMedia.note || "",
        updatedMedia.customDuration || updatedMedia.runtime,
        updatedMedia.rating,
        updatedMedia.category,
        updatedMedia.watchedSeasons,
        updatedMedia.seasons,
        updatedMedia.episodesPerSeason,
        updatedMedia.episodeDuration,
      )
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
        {media?.category !== "Wishlist" && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground ml-1">Your rating</span>
          </div>
        )}
        {media?.tmdbRating > 0 && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-blue-500 fill-current mr-1" />
            <span className="font-medium">{media.tmdbRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground ml-1">TMDB</span>
          </div>
        )}
        {media?.category !== "Wishlist" && rating === 0 && (
          <div className="flex items-center text-muted-foreground text-sm">Not rated yet</div>
        )}
      </div>
    )
  }

  return (
    <Sheet open={!!media} onOpenChange={handleClose}>
      <SheetContent className="p-0 sm:max-w-xl w-full" {...swipeHandlers}>
        {media && (
          <div className="relative h-full flex flex-col">
            <div className="absolute inset-0 z-0">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500${media?.posterPath})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(20px)",
                  opacity: "0.15",
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b bg-black/20 backdrop-blur-sm">
                <h2 className="text-xl font-semibold">{media?.title}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-6 p-4">
                  <div className="w-full aspect-[16/9] relative overflow-hidden rounded-lg shadow-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${media?.posterPath}`}
                      alt={media?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{media?.type === "movie" ? "Movie" : "TV Show"}</Badge>
                      <Badge variant="outline">
                        {media?.type === "movie"
                          ? media?.release_date
                            ? new Date(media.release_date).getFullYear()
                            : "Unknown"
                          : media?.first_air_date
                            ? new Date(media.first_air_date).getFullYear()
                            : "Unknown"}
                      </Badge>
                      <Badge variant="outline">
                        {media?.type === "movie"
                          ? `${duration || "?"} min`
                          : `${seasons || "?"} season${seasons !== 1 ? "s" : ""}`}
                      </Badge>
                    </div>

                    <RatingDisplay />

                    {media?.category === "Streaming" && media.type === "tv" && (
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

                  <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-2">
                    <h3 className="font-medium">Overview</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{media?.overview}</p>
                  </div>

                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleUpdate()
                      }}
                      className="space-y-4 bg-black/20 backdrop-blur-sm p-4 rounded-lg"
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

                      {media.type === "movie" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Duration (minutes)</label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDurationToggle}
                              className="h-8 px-2"
                            >
                              {isCustomDuration ? (
                                <>
                                  <Lock className="h-4 w-4 mr-1" />
                                  <span className="text-xs">Lock</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 mr-1" />
                                  <span className="text-xs">Unlock</span>
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={duration}
                              onChange={(e) => handleDurationChange(Number(e.target.value))}
                              className={`bg-black/20 ${!isCustomDuration && "opacity-50"}`}
                              disabled={!isCustomDuration}
                              min="0"
                            />
                            {isCustomDuration && originalDuration > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Original: {originalDuration}m
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {media.type === "tv" && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-sm font-medium">TV Show Details</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCustomTVDetails(!isCustomTVDetails)}
                              >
                                {isCustomTVDetails ? (
                                  <Lock className="h-4 w-4 mr-2" />
                                ) : (
                                  <Unlock className="h-4 w-4 mr-2" />
                                )}
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
                    <div className="space-y-4 bg-black/20 backdrop-blur-sm p-4 rounded-lg">
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
              </div>

              <div className="p-4 border-t bg-black/20 backdrop-blur-sm">
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
          </div>
        )}
      </SheetContent>

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}