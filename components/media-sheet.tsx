import { useState, useEffect } from "react"
import { Pencil, Star, Trash, RefreshCw } from "lucide-react"
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
import { storeMedia, getStoredMedia } from "@/lib/storage"
import type { Media } from "@/types"

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
  ) => void
}

export function MediaSheet({ media, onClose, onDelete, onUpdate }: MediaSheetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState("")
  const [duration, setDuration] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState<"Watched" | "Wishlist" | "Streaming">("Watched")
  const [watchedSeasons, setWatchedSeasons] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (media) {
      setNote(media.note || "")
      setDuration(media.customDuration ? media.customDuration.toString() : "")
      setRating(media.rating || 0)
      setCategory(media.category || "Watched")
      setWatchedSeasons(media.watchedSeasons || 0)
    }
  }, [media])

  if (!media) return null

  const handleUpdate = () => {
    onUpdate(
      media.id,
      note,
      duration ? Number(duration) : media.runtime,
      rating,
      category,
      category === "Streaming" && media.type === "tv" ? watchedSeasons : undefined,
    )
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(media.id)
    setShowDeleteDialog(false)
    onClose()
  }

  const handleRefresh = async () => {
    if (!media) return
    setIsRefreshing(true)
    try {
      const updatedDetails = await getTMDBDetails(media.tmdbId, media.type)
      const updatedMedia: Media = {
        ...media,
        title: updatedDetails.title || updatedDetails.name || media.title,
        posterPath: updatedDetails.poster_path || media.posterPath,
        tmdbRating: updatedDetails.vote_average,
        runtime: media.type === "movie" ? updatedDetails.runtime || media.runtime : media.runtime,
        overview: updatedDetails.overview || media.overview,
        seasons: media.type === "tv" ? updatedDetails.number_of_seasons || media.seasons : media.seasons,
        release_date: media.type === "movie" ? updatedDetails.release_date || media.release_date : media.release_date,
        first_air_date: media.type === "tv" ? updatedDetails.first_air_date || media.first_air_date : media.first_air_date,
      }
      onUpdate(
        updatedMedia.id,
        updatedMedia.note || "",
        updatedMedia.customDuration || updatedMedia.runtime,
        updatedMedia.rating,
        updatedMedia.category,
        updatedMedia.watchedSeasons,
      )
      const storedMedia = getStoredMedia()
      const updatedStoredMedia = storedMedia.map((item) => (item.id === updatedMedia.id ? updatedMedia : item))
      storeMedia(updatedStoredMedia)
    } catch (error) {
      console.error("Error refreshing media data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }


  const RatingDisplay = () => {
    return (
      <div className="flex gap-4">
        {/* Show user rating for Watched and Streaming items */}
        {media?.category !== "Wishlist" && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground ml-1">Your Rating</span>
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
          <div className="flex items-center text-muted-foreground text-sm">
            Not rated yet
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={!!media} onOpenChange={onClose}>
      <SheetContent className="p-0 sm:max-w-xl w-full">
        <div className="relative h-full flex flex-col">
          {/* Blur Background */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500${media?.posterPath})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(20px)',
                opacity: '0.15',
              }}
            />
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with updated refresh button */}
            <div className="flex items-center justify-between p-4 border-b bg-black/20 backdrop-blur-sm">
              <h2 className="text-xl font-semibold">{media?.title}</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mr-8"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-4">
                {/* Media Preview Section */}
                <div className="w-full aspect-[16/9] relative overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${media?.posterPath}`}
                    alt={media?.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Section */}
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
                        ? `${media.runtime || "?"} min`
                        : `${media.seasons || "?"} season${media?.seasons !== 1 ? "s" : ""}`}
                    </Badge>
                  </div>

                  <RatingDisplay />

                  {media?.category === "Streaming" && media.type === "tv" && (
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm">
                          {media.watchedSeasons || 0} / {media.seasons || 0} seasons
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Overview Section */}
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-2">
                  <h3 className="font-medium">Overview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{media?.overview}</p>
                </div>

                {/* Content (Edit form or display) */}
                {isEditing ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4 bg-black/20 backdrop-blur-sm p-4 rounded-lg">
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="bg-black/20"
                      />
                    </div>

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
                      <Select value={category} onValueChange={(value: "Watched" | "Wishlist" | "Streaming") => setCategory(value)}>
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

                    {category === "Streaming" && media?.type === "tv" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Watched Seasons</label>
                        <Input
                          type="number"
                          min="0"
                          max={media.seasons || 0}
                          value={watchedSeasons}
                          onChange={(e) => setWatchedSeasons(Math.min(Number(e.target.value), media.seasons || 0))}
                          className="bg-black/20"
                        />
                      </div>
                    )}

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
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
