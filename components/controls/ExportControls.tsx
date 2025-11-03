"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useCanvas } from "@/hooks/useCanvas";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportControlsProps {
  className?: string;
}

export function ExportControls({ className }: ExportControlsProps) {
  const { operations } = useCanvas();
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [quality, setQuality] = useState(0.92);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const dataURL = await operations.exportCanvas(format, quality);
      
      // Create download link
      const link = document.createElement("a");
      link.download = `showcase.${format}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [format, quality, operations]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </CardTitle>
        <CardDescription>Download your showcase image</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <div className="flex gap-2">
            <Button
              variant={format === "png" ? "default" : "outline"}
              onClick={() => setFormat("png")}
              className="flex-1"
            >
              PNG
            </Button>
            <Button
              variant={format === "jpg" ? "default" : "outline"}
              onClick={() => setFormat("jpg")}
              className="flex-1"
            >
              JPG
            </Button>
          </div>
        </div>

        {/* Quality (only for JPG) */}
        {format === "jpg" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Quality</label>
              <span className="text-sm text-muted-foreground">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              min={0.1}
              max={1}
              step={0.01}
            />
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
          size="lg"
        >
          {isExporting ? "Exporting..." : `Export as ${format.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
}
