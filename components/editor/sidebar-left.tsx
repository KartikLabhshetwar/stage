"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useImageStore } from "@/lib/store";
import { ExportDialog } from "@/components/canvas/dialogs/ExportDialog";
import { StyleTabs } from "./style-tabs";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { PresetSelector } from "@/components/presets/PresetSelector";
import { useExport } from "@/hooks/useExport";
import { FaGithub } from "react-icons/fa";

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const {
    uploadedImageUrl,
    selectedAspectRatio,
    clearImage,
    selectedGradient,
    borderRadius,
    backgroundBorderRadius,
    backgroundConfig,
    textOverlays,
    imageOpacity,
    imageScale,
    imageBorder,
    imageShadow,
  } = useImageStore();
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  const {
    settings: exportSettings,
    isExporting,
    updateScale,
    exportImage,
  } = useExport(selectedAspectRatio);

  return (
    <>
      <Sidebar
        collapsible="none"
        className="border-r border-sidebar-border bg-sidebar backdrop-blur-xl h-screen flex flex-col"
        {...props}
      >
        <SidebarHeader className="p-4 sm:p-5 border-b border-sidebar-border min-w-0 bg-sidebar/50 shrink-0">
          <div className="flex flex-col gap-3">
            <PresetSelector />
            <div className="flex flex-col gap-2.5">
              <Button
                onClick={() => setExportDialogOpen(true)}
                disabled={!uploadedImageUrl}
                className="w-full h-10 justify-center gap-2.5 rounded-lg bg-background hover:bg-accent text-foreground border border-border hover:border-border/80 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-sm px-4 overflow-hidden"
                variant="outline"
                size="sm"
              >
                <Download className="size-4 shrink-0" />
                <span className="truncate">Download</span>
              </Button>
              <Button
                onClick={clearImage}
                disabled={!uploadedImageUrl}
                className="w-full h-9 justify-center gap-2 rounded-lg bg-muted/50 hover:bg-destructive/10 text-destructive border border-destructive/20 hover:border-destructive/40 shadow-none hover:shadow-sm transition-all duration-200 font-medium text-xs px-3 hover:text-destructive overflow-hidden"
                variant="outline"
                size="sm"
              >
                <Trash2 className="size-3.5 shrink-0" />
                <span className="truncate">Remove Image</span>
              </Button>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 sm:px-5 md:px-6 py-5 sm:py-6 md:py-7 space-y-5 sm:space-y-6 overflow-x-hidden overflow-y-auto flex-1 min-h-0">
          <StyleTabs />
        </SidebarContent>
        <SidebarFooter className="p-4 sm:p-5 border-t border-sidebar-border">
          <a
            href="https://github.com/KartikLabhshetwar/stage"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full h-10 justify-center gap-2.5 rounded-lg bg-background hover:bg-accent text-foreground border border-border hover:border-border/80 shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm px-4 overflow-hidden"
            >
              <FaGithub className="size-4 shrink-0" />
              <span className="truncate">Proudly Open Source</span>
            </Button>
          </a>
        </SidebarFooter>
      </Sidebar>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={() => exportImage().then(() => {})}
        scale={exportSettings.scale}
        isExporting={isExporting}
        onScaleChange={updateScale}
      />
    </>
  );
}
