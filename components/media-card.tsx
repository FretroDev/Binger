import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Media } from "@/types";
import { Star } from "lucide-react";
import { MediaSheet } from "./media-sheet";

interface MediaCardProps {
  media: Media;
  onClick: () => void;
  index: number;
}

export function MediaCard({ media, index }: MediaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-95 hover:shadow-xl h-full
          ${
            media.category === "Wishlist"
              ? "border-[5] border-white"
              : media.category === "Streaming"
                ? "border-[5] border-purple-500"
                : "border-0"
          }`}
      >
        {/* Poster Image */}
        <div className="aspect-[2/3] relative">
          <img
            src={`https://image.tmdb.org/t/p/w500${media.posterPath}`}
            alt={media.title}
            className="object-cover w-full h-full"
          />

          {/* Rating Badge - Always visible */}
          <div className="absolute top-2 right-2 z-20">
            {media.category === "Streaming" || media.category === "Wishlist" ? (
              <Badge className="bg-black/20 hover:bg-black/30 backdrop-blur-lg text-white flex items-center gap-1">
                <Star className="w-3 h-3 text-blue-400 fill-current" />
                <span>{media.tmdbRating.toFixed(1)}</span>
              </Badge>
            ) : (
              <Badge className="bg-black/20 hover:bg-black/30 backdrop-blur-lg text-white flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{media.rating.toFixed(1)}</span>
              </Badge>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Content Container */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              initial={false}
            >
              <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                {media.title}
              </h3>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-white/10 text-white border-none backdrop-blur-sm"
                >
                  {media.type === "tv" ? `TV` : `Movie`}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-white/10 text-white border-none backdrop-blur-sm"
                >
                  {media.type === "tv"
                    ? `${media.seasons || 0} Season${media.seasons !== 1 ? "s" : ""}`
                    : `${media.customDuration || media.runtime} mins`}
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
