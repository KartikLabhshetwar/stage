"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageStore } from "@/lib/store";
import { exportSlideshowVideo } from "@/lib/export-slideshow-video";

export function ExportSlideshowDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { slideshow, setSlideshow } = useImageStore();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(false);
      await exportSlideshowVideo();
    } finally {
      setExporting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Slideshow</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Slide duration (seconds)
            </label>
            <Input
              type="number"
              min={1}
              step={0.5}
              value={slideshow.defaultDuration}
              onChange={(e) =>
                setSlideshow({ defaultDuration: Number(e.target.value) || 3 })
              }
            />
          </div>

          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting…" : "Export Video"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
