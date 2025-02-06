import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Media } from "@/types";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (mediaToImport: Media[]) => void;
}

export function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importedMedia, setImportedMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        const text = await file.text();
        const parsedMedia: Media[] = JSON.parse(text);
        setImportedMedia(parsedMedia);
        setSelectedMedia(new Set(parsedMedia.map((item) => item.id)));
      } catch (error) {
        console.error("Error parsing import file:", error);
        // You might want to show an error message to the user here
      }
    }
  };

  const toggleMediaSelection = (id: string) => {
    const newSelection = new Set(selectedMedia);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMedia(newSelection);
  };

  const handleImport = () => {
    try {
      const mediaToImport = importedMedia.filter((item) =>
        selectedMedia.has(item.id),
      );
      onImport(mediaToImport);
      onClose();
    } catch (error) {
      console.error("Error in ImportDialog handleImport:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Media</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Select File
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
              />
            </label>
          </Button>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected file: {selectedFile.name}
            </p>
          )}
          {importedMedia.length > 0 && (
            <>
              <p className="text-sm font-medium">Select media to import:</p>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {importedMedia.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <Checkbox
                      id={item.id}
                      checked={selectedMedia.has(item.id)}
                      onCheckedChange={() => toggleMediaSelection(item.id)}
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item.title}
                    </label>
                  </div>
                ))}
              </ScrollArea>
              <Button onClick={handleImport}>
                Import Selected ({selectedMedia.size})
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
