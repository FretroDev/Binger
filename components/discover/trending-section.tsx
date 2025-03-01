"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getTrending } from "@/lib/tmdb"
import { MediaCard } from "@/components/discover/media-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TMDBSearchResult } from "@/types"

function MediaSkeleton() {
  return (
    <div className="w-[200px] flex-none">
      <div className="space-y-3">
        <Skeleton className="aspect-[2/3] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function TrendingSection() {
  const [items, setItems] = useState<TMDBSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTrending() {
      try {
        const results = await getTrending()
        setItems(results)
      } catch (error) {
        console.error("Error fetching trending:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [])

  return (
    <section className="py-6 space-y-4">
      <h2 className="text-2xl font-semibold">Trending Now</h2>
      <ScrollArea>
        <div className="flex space-x-4 pb-4">
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
                className="w-[200px] flex-none"
              >
                <MediaCard item={item} />
              </motion.div>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  )
}

