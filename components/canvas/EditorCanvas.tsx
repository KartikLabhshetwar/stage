"use client";

import dynamic from "next/dynamic";
import { useEditorStore } from "@/lib/store";
import { useImageStore } from "@/lib/store";
import { UploadDropzone } from "@/components/controls/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Download, Copy, Trash2 } from "lucide-react";
import { useExport } from "@/hooks/useExport";
import { useState } from "react";
import { ExportDialog } from "@/components/canvas/dialogs/ExportDialog";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { DraftIndicator } from "../editor/DraftIndicator";
import React from "react";
import { exportSlideshowVideo } from "@/lib/export-slideshow-video";
import { ExportSlideshowDialog } from "@/lib/export-slideshow-dialog";
import { ExportProgressOverlay } from "@/lib/export-progress-overlay";

const ClientCanvas = dynamic(() => import("@/components/canvas/ClientCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

export function EditorCanvas() {
  const { screenshot } = useEditorStore();
  const {
    slides,
    setActiveSlide,
    activeSlideId,
    slideshow,
    removeSlide,
    startPreview,
    previewIndex,
    isPreviewing,
    stopPreview,
    uploadedImageUrl,
    selectedAspectRatio,
    clearImage,
  } = useImageStore();
  const [exportOpen, setExportOpen] = useState(false);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { isSaving, lastSaved, clearDraft } = useAutosaveDraft();

  const {
    copyImage,
    isExporting,
    settings: exportSettings,
    exportImage,
    updateScale,
  } = useExport(selectedAspectRatio);

  React.useEffect(() => {
    if (!isPreviewing) return;
    if (slides.length === 0) {
      stopPreview();
      return;
    }

    if (previewIndex >= slides.length) {
      stopPreview();
      return;
    }

    const slide = slides[previewIndex];
    setActiveSlide(slide.id);

    const timer = setTimeout(() => {
      useImageStore.setState((state) => {
        if (state.previewIndex + 1 >= state.slides.length) {
          return {
            isPreviewing: false,
            previewIndex: 0,
          };
        }

        return {
          previewIndex: state.previewIndex + 1,
        };
      });
    }, slide.duration * 1000);

    return () => clearTimeout(timer);
  }, [isPreviewing, previewIndex, slides.length]);

  if (!screenshot.src) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <UploadDropzone />
      </div>
    );
  }
  console.log("slides:", slides);

  return (
    <>
      <ExportProgressOverlay />

      <div className="flex flex-col h-full w-full ">
        <div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
          <DraftIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            onClearDraft={clearDraft}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setExportDialogOpen(true)}
              disabled={!uploadedImageUrl}
              className="h-9 justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all font-medium px-4"
            >
              <Download className="size-4" />
              <span>Download</span>
            </Button>

            {slides.length > 0 && (
              <Button onClick={() => setExportOpen(true)}>Export Video</Button>
            )}

            <ExportSlideshowDialog
              open={exportOpen}
              onOpenChange={setExportOpen}
            />
            <Button
              onClick={() => copyImage()}
              disabled={!uploadedImageUrl || isExporting}
              className="h-9 justify-center gap-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground shadow-sm hover:shadow-md transition-all font-medium border border-border px-4"
            >
              <Copy className="size-4" />
              <span>Copy</span>
            </Button>
            <Button
              onClick={clearImage}
              disabled={!uploadedImageUrl}
              variant="secondary"
              className="h-9 justify-center gap-2 px-4"
            >
              <Trash2 className="size-4" />
              <span>Remove Image</span>
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
          <ClientCanvas />
        </div>
      </div>
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={() => exportImage().then(() => {})}
        scale={exportSettings.scale}
        isExporting={isExporting}
        onScaleChange={updateScale}
      />
      {slides.length > 1 && (
        <div className="border-t bg-background p-2 absolute bottom-0 left-0 right-0 overflow-x-auto">
          <div className="flex gap-2 overflow-x-auto">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className={`relative w-28 shrink-0 h-16 rounded overflow-hidden border cursor-pointer ${
                  slide.id === activeSlideId ? "ring-2 ring-primary" : ""
                }`}
              >
                {/* Thumbnail click */}
                <button
                  onClick={() => setActiveSlide(slide.id)}
                  className="h-full w-full"
                >
                  <img
                    src={slide.src}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSlide(slide.id);
                  }}
                  className="absolute top-1 right-1 z-10 rounded bg-white/70 text-black hover:text-white cursor-pointer hover:bg-red-600 transition h-5 w-5 flex items-center justify-center text-xs"
                  title="Delete slide"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
