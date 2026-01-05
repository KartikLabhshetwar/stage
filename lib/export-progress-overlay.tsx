"use client";

import { useExportProgress } from "@/hooks/useExportProgress";

export function ExportProgressOverlay() {
  const { active, progress } = useExportProgress();

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-black/70 flex items-center justify-center">
      <div className="w-[320px] bg-background rounded-lg p-6 space-y-4">
        <p className="text-sm font-medium text-center">Rendering video…</p>
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
