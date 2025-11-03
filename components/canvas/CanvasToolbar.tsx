"use client";

import { useState } from "react";
import { CloudArrowUp, TextT, PaintBrush, Download, ArrowsOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/hooks/useCanvas";
import { useCanvasContext } from "./CanvasContext";
import { UploadDialog } from "./dialogs/UploadDialog";
import { TextDialog } from "./dialogs/TextDialog";
import { BackgroundDialog } from "./dialogs/BackgroundDialog";
import { AspectRatioDialog } from "./dialogs/AspectRatioDialog";
import { ExportDialog } from "./dialogs/ExportDialog";

export function CanvasToolbar() {
  const { operations, canvas } = useCanvas();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [aspectRatioDialogOpen, setAspectRatioDialogOpen] = useState(false);

  const handleUpload = async (imageUrl: string) => {
    await operations.addImage(imageUrl);
  };

  const handleAddText = async (text: string, options: { fontSize: number; color: string; x: number; y: number }) => {
    if (!canvas) return;
      const width = typeof canvas.width === 'function' ? canvas.width() : canvas.width || 1920;
      const height = typeof canvas.height === 'function' ? canvas.height() : canvas.height || 1080;
      await operations.addText(text, {
      ...options,
      x: options.x ?? width / 2,
      y: options.y ?? height / 2,
    });
  };

  const handleExport = async (format: "png" | "jpg", quality: number): Promise<string> => {
    return await operations.exportCanvas(format, quality);
  };

  return (
    <>
      <div className="w-full flex justify-center z-50 py-4">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/80 px-3 py-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setUploadDialogOpen(true)}
          className="h-9 w-9 rounded-lg hover:bg-gray-100/80 hover:scale-105 active:scale-95"
          aria-label="Upload Image"
          title="Upload Image"
        >
          <CloudArrowUp size={18} weight="regular" className="text-gray-700" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTextDialogOpen(true)}
          className="h-9 w-9 rounded-lg hover:bg-gray-100/80 hover:scale-105 active:scale-95"
          aria-label="Add Text"
          title="Add Text"
        >
          <TextT size={18} weight="regular" className="text-gray-700" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setColorDialogOpen(true)}
          className="h-9 w-9 rounded-lg hover:bg-gray-100/80 hover:scale-105 active:scale-95"
          aria-label="Change Background"
          title="Change Background"
        >
          <PaintBrush size={18} weight="regular" className="text-gray-700" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAspectRatioDialogOpen(true)}
          className="h-9 w-9 rounded-lg hover:bg-gray-100/80 hover:scale-105 active:scale-95"
          aria-label="Canvas Size"
          title="Canvas Size"
        >
          <ArrowsOut size={18} weight="regular" className="text-gray-700" />
        </Button>

        <div className="w-px h-6 bg-gray-200 mx-1.5" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExportDialogOpen(true)}
          className="h-9 w-9 rounded-lg hover:bg-gray-100/80 hover:scale-105 active:scale-95"
          aria-label="Export Canvas"
          title="Export Canvas"
        >
          <Download size={18} weight="regular" className="text-gray-700" />
        </Button>
        </div>
      </div>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
      />

      <TextDialog
        open={textDialogOpen}
        onOpenChange={setTextDialogOpen}
        onAddText={handleAddText}
      />

      <BackgroundDialog
        open={colorDialogOpen}
        onOpenChange={setColorDialogOpen}
      />

      <AspectRatioDialog
        open={aspectRatioDialogOpen}
        onOpenChange={setAspectRatioDialogOpen}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
      />
    </>
  );
}
