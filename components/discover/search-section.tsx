"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchTMDB } from "@/lib/tmdb"
import { MediaGrid } from "@/components/discover/media-grid"
import type { TMDBSearchResult } from "@/types"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchSectionProps {
  query: string
  onQueryChange: (query: string) => void
}

export function SearchSection({ query, onQueryChange }: SearchSectionProps) {
  const [results, setResults] = useState<TMDBSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await searchTMDB(debouncedQuery)
        setResults(searchResults.filter((r) => r.media_type === "movie" || r.media_type === "tv"))
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search movies and TV shows..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10 w-full max-w-xl"
        />
      </div>
      {query && <MediaGrid items={results} isLoading={isLoading} />}
    </div>
  )
}

