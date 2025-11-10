"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScaleSlider } from "@/components/export";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => Promise<void>;
  scale: number;
  isExporting: boolean;
  onScaleChange: (scale: number) => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  onExport,
  scale,
  isExporting,
  onScaleChange,
}: ExportDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    try {
      await onExport();
      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to export image. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">
            Export Canvas
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-5">
          <ScaleSlider scale={scale} onScaleChange={onScaleChange} />

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
            </div>
          )}

          <div className="pt-2 pb-1">
            <p className="text-xs text-muted-foreground text-center">
              Exported images will include Stage watermark
            </p>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isExporting ? "Exporting..." : "Export as PNG"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
