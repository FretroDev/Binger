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

export function NavBar() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
      <h1 className="text-3xl sm:text-4xl font-bold">Binger</h1>
      <div className="flex flex-wrap items-center gap-4">
        <ThemeToggle />
        <Button onClick={() => router.push("/login")}>Login</Button>
        <AddMediaDialog />
      </div>
    </div>
  );
}
