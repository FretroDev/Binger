import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, Filter, MoreHorizontal, FileJson, Download, Search } from "lucide-react"

interface MediaFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  activeFilters: any
  applyFilters: (filters: any) => void
  clearFilters: () => void
  setShowImportDialog: (show: boolean) => void
  exportMedia: () => void
  setIsReorganizerOpen: (isOpen: boolean) => void
}

export function MediaFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  activeFilters,
  applyFilters,
  clearFilters,
  setShowImportDialog,
  exportMedia,
  setIsReorganizerOpen,
}: MediaFiltersProps) {
  const filterOptions = [
    { name: "TMDB Rating", key: "tmdbRating", options: ["Top Rated", "Lowest Rated"] },
    { name: "Your Rating", key: "userRating", options: ["Top Rated", "Lowest Rated"] },
    { name: "Date Added", key: "dateAdded", options: ["Latest", "Oldest"] },
  ]

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-4 w-full sm:w-auto">
        <h2 className="text-2xl font-bold">Collection</h2>
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                {filterOptions.map((filterGroup) => (
                  <DropdownMenuSub key={filterGroup.key}>
                    <DropdownMenuSubTrigger>{filterGroup.name}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => applyFilters({ ...activeFilters, [filterGroup.key]: "" })}>
                        All {filterGroup.name}
                      </DropdownMenuItem>
                      {filterGroup.options.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => applyFilters({ ...activeFilters, [filterGroup.key]: option })}
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
                <DropdownMenuItem onClick={clearFilters}>Clear Filters</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onSelect={() => setIsReorganizerOpen(true)}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <span>Re-Organize</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowImportDialog(true)}>
              <FileJson className="mr-2 h-4 w-4" />
              <span>Import Data</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={exportMedia}>
              <Download className="mr-2 h-4 w-4" />
              <span>Export Data</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

