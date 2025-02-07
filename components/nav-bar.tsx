import { ThemeToggle } from "@/components/theme-toggle";
import { AddMediaDialog } from "@/components/add-media-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
