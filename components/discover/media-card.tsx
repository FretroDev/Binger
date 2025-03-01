"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Check } from "lucide-react"
import type { TMDBSearchResult } from "@/types"
import { MediaDetailsDialog } from "@/components/discover/media-details-dialog"
import { useMediaLibrary } from "@/hooks/use-media-library"
import { getTMDBDetails } from "@/lib/tmdb"
import { motion } from "framer-motion"

interface MediaCardProps {
  item: TMDBSearchResult
  variant?: "default" | "showcase"
}

export function MediaCard({ item, variant = "default" }: MediaCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { media } = useMediaLibrary()

  const aspectRatio = variant === "showcase" ? "aspect-video" : "aspect-[2/3]"
  const rating = item.vote_average?.toFixed(1) || "N/A"

  const isInLibrary = media.some((m) => m.tmdbId === item.id && m.type === item.media_type)

  useEffect(() => {
    async function fetchLogo() {
      if (variant !== "showcase") return

      try {
        const details = await getTMDBDetails(item.id, item.media_type)
        const englishLogo = details.images?.logos.find((logo) => logo.iso_639_1 === "en")
        if (englishLogo) {
          setLogo(`https://image.tmdb.org/t/p/w500${englishLogo.file_path}`)
        }
      } catch (error) {
        console.error("Error fetching logo:", error)
      }
    }

    fetchLogo()
  }, [item.id, item.media_type, variant])

  return (
    <>
      <Card
        className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-95 hover:shadow-xl"
        onClick={() => setShowDetails(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${aspectRatio} relative`}>
          <img
            src={`https://image.tmdb.org/t/p/w500${variant === "showcase" ? item.backdrop_path : item.poster_path}`}
            alt={item.title || item.name}
            className={`object-cover w-full h-full transition-all duration-300 ${
              variant === "showcase" && isHovered ? "blur-sm scale-105" : ""
            }`}
          />
          {/* Rating badge - top right */}
          <div className="absolute top-2 right-2 z-20">
            <Badge className="bg-black/20 hover:bg-black/30 backdrop-blur-lg text-white flex items-center gap-1">
              <Star className="w-3 h-3 text-blue-400 fill-current" />
              <span>{rating}</span>
            </Badge>
          </div>
          {/* Media type badge - top left */}
          <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant="secondary" className="capitalize bg-black/20 hover:bg-black/30 backdrop-blur-lg">
              {item.media_type === "movie" ? "Movie" : "TV Show"}
            </Badge>
          </div>
          {/* Title and info overlay */}
          {variant === "showcase" ? (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              {logo ? (
                <motion.div
                  className="absolute bottom-4 left-4"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  <img src={logo || "/placeholder.svg"} alt={item.title || item.name} className="object-contain h-12" />
                </motion.div>
              ) : (
                <motion.div
                  className="absolute bottom-4 left-4"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  <h3 className="font-semibold text-white text-lg uppercase">{item.title || item.name}</h3>
                </motion.div>
              )}
              {isInLibrary && (
                <div className="absolute bottom-4 right-4">
                  <Badge variant="outline" className="bg-white/10 border-none text-white">
                    <Check className="w-3 h-3 mr-1" />
                    In Library
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">{item.title || item.name}</h3>
                {isInLibrary && (
                  <Badge variant="outline" className="bg-white/10 border-none text-white">
                    <Check className="w-3 h-3 mr-1" />
                    In Library
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
      <MediaDetailsDialog
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        mediaId={item.id}
        mediaType={item.media_type}
      />
    </>
  )
}

