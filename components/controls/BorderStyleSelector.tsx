"use client";

import * as React from "react";
import { ImageBorder } from "@/lib/store";
import { cn } from "@/lib/utils";

interface BorderStyleSelectorProps {
  border: ImageBorder;
  onBorderChange: (border: ImageBorder | Partial<ImageBorder>) => void;
}

type BorderStyle = {
  id: ImageBorder["style"];
  label: string;
  preview: React.ReactNode;
};

export function BorderStyleSelector({
  border,
  onBorderChange,
}: BorderStyleSelectorProps) {
  const borderStyles: BorderStyle[] = [
    {
      id: "default",
      label: "Default",
      preview: (
        <div className="w-full h-full rounded-lg bg-background shadow-[0_4px_12px_rgba(0,0,0,0.15)]" />
      ),
    },
    {
      id: "solid",
      label: "Solid",
      preview: (
        <div className="w-full h-full rounded-lg bg-background border-[3px] border-border shadow-[0_4px_12px_rgba(0,0,0,0.15)]" />
      ),
    },
    {
      id: "dashed",
      label: "Dashed",
      preview: (
        <div className="w-full h-full rounded-lg bg-white border-[3px] border-dashed border-gray-400 shadow-[0_4px_12px_rgba(0,0,0,0.15)]" />
      ),
    },
    {
      id: "dotted",
      label: "Dotted",
      preview: (
        <div className="w-full h-full rounded-lg bg-white border-[3px] border-dotted border-gray-400 shadow-[0_4px_12px_rgba(0,0,0,0.15)]" />
      ),
    },
    {
      id: "double",
      label: "Double",
      preview: (
        <div className="w-full h-full rounded-lg bg-white border-4 border-double border-gray-400 shadow-[0_4px_12px_rgba(0,0,0,0.15)]" />
      ),
    },
  ];

  const handleStyleSelect = (styleId: ImageBorder["style"]) => {
    onBorderChange({ style: styleId, enabled: true });
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Style
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {borderStyles.map((style) => {
          const isSelected = border.style === style.id && border.enabled;
          return (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={cn(
                "relative aspect-square rounded-lg p-2 transition-all cursor-pointer group",
                "hover:scale-105 active:scale-95",
                "focus:outline-none",
                isSelected
                  ? "bg-primary/5 shadow-sm border border-primary/50"
                  : "bg-muted hover:bg-muted/80 border border-border/50 hover:border-border",
              )}
              title={style.label}
            >
              <div className="w-full h-full rounded-md overflow-hidden">
                {style.preview}
              </div>
              <div
                className={cn(
                  "absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-medium truncate max-w-[90%] px-1 rounded",
                  isSelected
                    ? "text-primary font-semibold"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {style.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
