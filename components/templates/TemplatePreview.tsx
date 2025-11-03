"use client";

import type { Template } from "@/types/canvas";

interface TemplatePreviewProps {
  template: Template;
  className?: string;
}

export function TemplatePreview({ template, className }: TemplatePreviewProps) {
  const getPreviewColor = (): string => {
    if (template.background.type === "solid") {
      return template.background.color || "#ffffff";
    }
    if (template.background.type === "gradient") {
      return template.background.gradient?.colors[0] || "#ffffff";
    }
    return template.background.color || "#ffffff";
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: getPreviewColor(),
        width: "100%",
        height: "100%",
      }}
    />
  );
}
