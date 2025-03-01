"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getTrending } from "@/lib/tmdb"
import { MediaCard } from "@/components/discover/media-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TMDBSearchResult } from "@/types"

function MediaSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function TrailerShowcase() {
  const [items, setItems] = useState<TMDBSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTrailers() {
      try {
        const results = await getTrending()
        const withBackdrops = results.filter((item) => item.backdrop_path)
        setItems(withBackdrops.slice(0, 6))
      } catch (error) {
        console.error("Error fetching trailers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrailers()
  }, [])

  return (
    <section className="py-6 space-y-4">
      <h2 className="text-2xl font-semibold">Featured Trailers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <MediaSkeleton key={i} />
            ))}
          </>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MediaCard item={item} variant="showcase" />
            </motion.div>
          ))
        )}
      </div>
    </section>
  )
}

