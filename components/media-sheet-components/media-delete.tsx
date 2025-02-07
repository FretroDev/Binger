import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Media } from "@/types";
import { handleDeleteMedia } from "@/lib/storage";
import Router from "next/router";

export const MediaDelete = ({ media }: { media: Media }) => {
  const handleDelete = async () => {
    await handleDeleteMedia(media.id);
    Router.reload();
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="destructive" className="flex-1">
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {media.title}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove this item from your library. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
