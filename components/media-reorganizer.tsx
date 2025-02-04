"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { GripVertical } from "lucide-react"
import type { Media } from "@/types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MediaReorganizerProps {
  isOpen: boolean
  onClose: () => void
  media: Media[]
  onSave: (newOrder: Media[]) => void
}

export function MediaReorganizer({ isOpen, onClose, media, onSave }: MediaReorganizerProps) {
  const [reorderedMedia, setReorderedMedia] = useState<Media[]>(media)
  const [filter, setFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Watched" | "Wishlist" | "Streaming">("All")

  useEffect(() => {
    setReorderedMedia(media)
  }, [media])

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(reorderedMedia)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setReorderedMedia(items)
  }

  const handleSave = () => {
    onSave(reorderedMedia)
    onClose()
  }

  const filteredMedia = reorderedMedia.filter((item) => {
    const matchesFilter = item.title.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
    return matchesFilter && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Streaming":
        return "bg-purple-500"
      case "Wishlist":
        return "bg-white"
      case "Watched":
        return "bg-gray-500"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reorganize Media</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Filter by title..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-grow"
          />
          <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Watched">Watched</SelectItem>
              <SelectItem value="Wishlist">Wishlist</SelectItem>
              <SelectItem value="Streaming">Streaming</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-[400px] w-full pr-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="media-list">
              {(provided:any) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {filteredMedia.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided:any) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center space-x-2 bg-secondary p-2 rounded-md"
                        >
                          <span {...provided.dragHandleProps}>
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </span>
                          <span className="flex-grow truncate">{item.title}</span>
                          <span className={`h-3 w-3 rounded-full ${getCategoryColor(item.category)}`} />
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Order</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
