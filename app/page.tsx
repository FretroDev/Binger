"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Stats } from "@/components/stats";
import { MediaGrid } from "@/components/media-grid";
import { NavBar } from "@/components/nav-bar";
import { AddMediaDialog } from "@/components/add-media-dialog";
import { MediaSheet } from "@/components/media-sheet";
import { MediaReorganizer } from "@/components/media-reorganizer";
import { getTMDBDetails, searchTMDB } from "@/lib/tmdb";
import { getStoredMedia, storeMedia } from "@/lib/storage";
import type { Media } from "@/types";
import ErrorBoundary from "@/components/error-boundary";
import { toast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  User,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  FileJson,
  Download,
} from "lucide-react";
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseErrorMessage,
} from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImportDialog } from "@/components/import-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [media, setMedia] = useState<Media[]>(getStoredMedia());
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filterOptions = [
    {
      name: "TMDB Rating",
      key: "tmdbRating",
      options: ["Top Rated", "Lowest Rated"],
    },
    {
      name: "Your Rating",
      key: "userRating",
      options: ["Top Rated", "Lowest Rated"],
    },
    { name: "Date Added", key: "dateAdded", options: ["Latest", "Oldest"] },
  ];

  function applyFilters(newFilters) {
    setActiveFilters(newFilters);
    const filtered = [...media];

    if (newFilters.tmdbRating) {
      filtered.sort((a, b) =>
        newFilters.tmdbRating === "Top Rated"
          ? b.tmdbRating - a.tmdbRating
          : a.tmdbRating - b.tmdbRating,
      );
    }

    if (newFilters.userRating) {
      filtered.sort((a, b) =>
        newFilters.userRating === "Top Rated"
          ? b.rating - a.rating
          : a.rating - b.rating,
      );
    }

    if (newFilters.dateAdded) {
      filtered.sort((a, b) =>
        newFilters.dateAdded === "Latest"
          ? new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
          : new Date(a.watchedAt).getTime() - new Date(b.watchedAt).getTime(),
      );
    }

    setFilteredMedia(filtered);
  }

  function clearFilters() {
    const clearedFilters = {
      tmdbRating: "",
      userRating: "",
      dateAdded: "",
    };
    setActiveFilters(clearedFilters);
    setFilteredMedia([]);
  }

  function exportMedia() {
    const dataStr = JSON.stringify(media);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "binger_media_export.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }

  const handleSaveReorganizedMedia = (newOrder: Media[]) => {
    setMedia(newOrder);
    storeMedia(newOrder);
    toast({
      title: "Success",
      description: "Media order updated successfully.",
    });
  };

  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <motion.div
          className="min-h-screen bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container py-10">
            <NavBar />

            <Stats media={media} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <h2 className="text-2xl font-bold">Collection</h2>
                <Input
                  type="text"
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                />
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Watched">Watched</SelectItem>
                    <SelectItem value="Wishlist">Wishlist</SelectItem>
                    <SelectItem value="Streaming">Streaming</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Filter</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <ScrollArea className="h-[300px]">
                          {filterOptions.map((filterGroup) => (
                            <div key={filterGroup.key}>
                              <DropdownMenuLabel>
                                {filterGroup.name}
                              </DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={activeFilters[filterGroup.key]}
                                onValueChange={(value) => {
                                  const newFilters = {
                                    ...activeFilters,
                                    [filterGroup.key]: value,
                                  };
                                  applyFilters(newFilters);
                                }}
                              >
                                <DropdownMenuRadioItem value="">
                                  All {filterGroup.name}
                                </DropdownMenuRadioItem>
                                {filterGroup.options.map((option) => (
                                  <DropdownMenuRadioItem
                                    key={option}
                                    value={option}
                                  >
                                    {option}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                              <DropdownMenuSeparator />
                            </div>
                          ))}
                        </ScrollArea>
                        <DropdownMenuItem onSelect={clearFilters}>
                          Clear Filters
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem
                      onSelect={() => setIsReorganizerOpen(true)}
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <span>Re-Organize</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setShowImportDialog(true)}
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      <span>Import</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={exportMedia}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isLoading ? (
              <p>Loading your media library...</p>
            ) : (
              <></>
              // media grid here
            )}

            <MediaSheet
              media={selectedMedia}
              onClose={() => setSelectedMedia(null)}
              onDelete={handleDeleteMedia}
              onUpdate={handleUpdateMedia}
            />
            <ImportDialog
              isOpen={showImportDialog}
              onClose={() => setShowImportDialog(false)}
              onImport={handleImportMedia}
            />
            <MediaReorganizer
              isOpen={isReorganizerOpen}
              onClose={() => setIsReorganizerOpen(false)}
              media={media}
              onSave={handleSaveReorganizedMedia}
            />
          </div>
        </motion.div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
