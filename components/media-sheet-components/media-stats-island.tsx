import React from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Media, isShow } from "@/types";
import { getMediaDuration } from "@/lib/storage";

const MediaStats = ({ media }: { media: Media }) => {
  return (
    <div className="space-y-4">
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{media.type == "movie" ? "Movie" : "TV Show"}</Badge>
          <Badge variant="outline">{media.releaseDate}</Badge>
          <Badge variant="outline">{getMediaDuration(media)}</Badge>
        </div>

        {media.rating != 0 ? (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-blue-500 fill-current mr-1" />
            <span className="font-medium">{media.rating}</span>
            <span className="text-sm text-muted-foreground ml-1">TMDB</span>
          </div>
        ) : (
          <div className="flex items-center text-muted-foreground text-sm">
            Not rated yet
          </div>
        )}
      </div>

      {media?.category === "Streaming" && isShow(media) && (
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm">
              {media.watchedSeasons} / {media.numOfSeasons} seasons
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
