"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Unlock } from "lucide-react"
import type { TMDBDetails } from "@/types"

interface AddToLibraryProps {
  isOpen: boolean
  onClose: () => void
  details: TMDBDetails
  mediaType: "movie" | "tv"
  onAdd: (
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
  ) => Promise<void>
}

export function AddToLibrary({ isOpen, onClose, details, mediaType, onAdd }: AddToLibraryProps) {
  const [rating, setRating] = useState([5])
  const [note, setNote] = useState("")
  const [duration, setDuration] = useState(mediaType === "movie" ? details.runtime || 0 : 0)
  const [isCustomDuration, setIsCustomDuration] = useState(false)
  const [category, setCategory] = useState<"Watched" | "Wishlist" | "Streaming">("Watched")
  const [seasons, setSeasons] = useState(details.number_of_seasons || 0)
  const [episodesPerSeason, setEpisodesPerSeason] = useState(
    details.number_of_episodes ? Math.ceil(details.number_of_episodes / (details.number_of_seasons || 1)) : 0,
  )
  const [episodeDuration, setEpisodeDuration] = useState(details.episode_run_time?.[0] || 0)
  const [completedSeasons, setCompletedSeasons] = useState(0)
  const [isCustomTVDetails, setIsCustomTVDetails] = useState(false)

  const handleAdd = async () => {
    await onAdd(
      details.id,
      mediaType,
      rating[0],
      category,
      note,
      isCustomDuration ? duration : undefined,
      seasons,
      episodesPerSeason,
      episodeDuration,
      category === "Streaming" ? completedSeasons : undefined,
    )
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to Your Library</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="text-center mb-2">Rating: {rating[0].toFixed(1)}/10</div>
            <Slider max={10} step={0.1} value={rating} onValueChange={setRating} />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(value: "Watched" | "Wishlist" | "Streaming") => setCategory(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Watched">Watched</SelectItem>
                <SelectItem value="Wishlist">Wishlist</SelectItem>
                <SelectItem value="Streaming">Streaming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mediaType === "movie" ? (
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
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
                  <Label>TV Show Details</Label>
                  <Button variant="outline" size="sm" onClick={() => setIsCustomTVDetails(!isCustomTVDetails)}>
                    {isCustomTVDetails ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                    {isCustomTVDetails ? "Lock" : "Edit"}
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
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Episodes/Season</Label>
                    <Input
                      type="number"
                      value={episodesPerSeason}
                      onChange={(e) => setEpisodesPerSeason(Number(e.target.value))}
                      disabled={!isCustomTVDetails}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Episode Duration</Label>
                    <Input
                      type="number"
                      value={episodeDuration}
                      onChange={(e) => setEpisodeDuration(Number(e.target.value))}
                      disabled={!isCustomTVDetails}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              {category === "Streaming" && (
                <div className="space-y-2">
                  <Label>Completed Seasons</Label>
                  <Input
                    type="number"
                    value={completedSeasons}
                    onChange={(e) => setCompletedSeasons(Number(e.target.value))}
                    max={seasons}
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add your thoughts..." />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add to Library</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

