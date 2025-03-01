"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTopRated } from "@/lib/tmdb"
import { MediaCard } from "@/components/discover/media-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TMDBSearchResult } from "@/types"

function MediaSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function TopRatedSection() {
  const [movies, setMovies] = useState<TMDBSearchResult[]>([])
  const [shows, setShows] = useState<TMDBSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTopRated() {
      try {
        const [movieResults, showResults] = await Promise.all([getTopRated("movie"), getTopRated("tv")])
        setMovies(movieResults.slice(0, 6))
        setShows(showResults.slice(0, 6))
      } catch (error) {
        console.error("Error fetching top rated:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopRated()
  }, [])

  return (
    <section className="py-6">
      <Tabs defaultValue="movies">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold">Top Rated</h2>
          <TabsList className="grid w-full sm:w-[200px] grid-cols-2 p-0 h-auto bg-background gap-1">
            <TabsTrigger
              value="movies"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Movies
            </TabsTrigger>
            <TabsTrigger
              value="shows"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              TV Shows
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="movies">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <MediaSkeleton key={i} />
                ))}
              </>
            ) : (
              movies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MediaCard item={{ ...movie, media_type: "movie" }} />
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="shows">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <MediaSkeleton key={i} />
                ))}
              </>
            ) : (
              shows.map((show, index) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MediaCard item={{ ...show, media_type: "tv" }} />
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}

