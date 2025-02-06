import { ThemeToggle } from "@/components/theme-toggle";
import { AddMediaDialog } from "@/components/add-media-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

interface NavBarProps {
  session: Session | null;
  isSupabaseReady: boolean;
  supabase: any;
  onAddMedia: (
    tmdbId: number,
    type: "movie" | "tv",
    rating: number,
    category: "Watched" | "Wishlist" | "Streaming",
    note?: string,
    customDuration?: number,
    seasons?: number,
    episodesPerSeason?: number,
    episodeDuration?: number,
    completedSeasons?: number,
  ) => Promise<void>;
}

export function NavBar({
  session,
  isSupabaseReady,
  supabase,
  onAddMedia,
}: NavBarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
      <h1 className="text-3xl sm:text-4xl font-bold">Binger</h1>
      <div className="flex flex-wrap items-center gap-4">
        <ThemeToggle />
        {isSupabaseReady && session ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={session.user.user_metadata.avatar_url} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await supabase?.auth.signOut();
                  router.push("/login");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => router.push("/login")}>Login</Button>
        )}
        <AddMediaDialog onAdd={onAddMedia} />
      </div>
    </div>
  );
}
