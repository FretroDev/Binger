import React from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MediaType {
  type: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  category?: string;
}

interface MediaStatsProps {
  media?: MediaType;
  rating?: number;
  duration?: number;
  seasons?: number;
  watchedSeasons?: number;
}

const MediaStats = ({
  media,
  rating,
  overview,
  duration,
  seasons,
  watchedSeasons,
}: MediaStatsProps) => {
  const getYear = () => {
    if (media?.type === "movie") {
      return media?.release_date
        ? new Date(media.release_date).getFullYear()
        : "Unknown";
    }
    return media?.first_air_date
      ? new Date(media.first_air_date).getFullYear()
      : "Unknown";
  };

  const getDuration = () => {
    if (media?.type === "movie") {
      return `${duration || "?"} min`;
    }
    return `${seasons || "?"} season${seasons !== 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{media?.type === "movie" ? "Movie" : "TV Show"}</Badge>
          <Badge variant="outline">{getYear()}</Badge>
          <Badge variant="outline">{getDuration()}</Badge>
        </div>

        {rating ? (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-blue-500 fill-current mr-1" />
            <span className="font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground ml-1">TMDB</span>
          </div>
        ) : (
          <div className="flex items-center text-muted-foreground text-sm">
            Not rated yet
          </div>
        )}
      </div>

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
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-2">
        <h3 className="font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {media?.overview}
        </p>
      </div>
    </div>
  );
};

export default MediaStats;
