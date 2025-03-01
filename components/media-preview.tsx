"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { Media } from "@/types"

interface MediaPreviewProps {
  media: Media | null
  children: React.ReactNode
}

export function MediaPreview({ media, children }: MediaPreviewProps) {
  const [showVideo, setShowVideo] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleMouseEnter = () => {
    if (!media?.trailerKey) return
    timeoutRef.current = setTimeout(() => {
      setShowVideo(true)
    }, 3000)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowVideo(false)
  }

  if (!media) return null

  return (
    <div
      className="w-full aspect-video relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Backdrop Image */}
      <img
        src={`https://image.tmdb.org/t/p/w1280${media.backdropPath || media.posterPath}`}
        alt={media.title}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* YouTube Video */}
      {media.trailerKey && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            showVideo ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${media.trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${media.trailerKey}&modestbranding=1&rel=0&showinfo=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />

      {/* Content */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${showVideo ? "opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </div>
  )
}

