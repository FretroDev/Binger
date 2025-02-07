"use client";
import { useEffect, useState } from "react";
import type { Media } from "@/types";
import { AnimatePresence } from "framer-motion";
import { MediaCard } from "@/components/media-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircleIcon } from "lucide-react";
import FilterMedia from "@/components/filter-media";

const filterMediaBySearch = (media: Media[], query: string) => {
  return media.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  );
};

export const MediaGrid = ({ media }: { media: Media[] }) => {
  let [filterQuery, setFilterQuery] = useState("");
  let [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  useEffect(() => {
    if (filterQuery) {
      setFilteredMedia(filterMediaBySearch(media, filterQuery));
    }
  }, [filterQuery]);

  return (
    <div>
      {media.length === 0 ? (
        <Card className="w-full max-w-[150vh] mx-auto border-dashed border-2 border-muted-foreground">
          <CardHeader className="items-center text-center">
            <PlusCircleIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Add Media to expand your collection
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center"></CardContent>
        </Card>
      ) : filteredMedia.length == 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence>
            {filteredMedia.map((item, index) => (
              <MediaCard key={item.id} media={item} index={index} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-center mt-8">No media added in this category.</p>
      )}
    </div>
  );
};
