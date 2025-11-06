"use client";

import { templates } from "@/lib/canvas/templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Template } from "@/types/canvas";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selectedTemplateId?: string;
  onSelectTemplate: (template: Template) => void;
  className?: string;
}

export function TemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
  className,
}: TemplateSelectorProps) {
  const getPreviewColor = (template: Template): string => {
    if (template.background.type === "solid") {
      return template.background.color || "#ffffff";
    }
    if (template.background.type === "gradient") {
      return template.background.gradient?.colors[0] || "#ffffff";
    }
    return template.background.color || "#ffffff";
  };

  const getPreviewImage = (template: Template): string | null => {
    if (template.background.type === "mockup") {
      // Use preview if available, otherwise use mockup image URL
      return template.preview || template.background.mockup?.imageUrl || null;
    }
    return template.preview || null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold mb-2">Templates</h2>
        <p className="text-sm text-muted-foreground">
          Choose a background template for your showcase
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map((template) => {
          const previewImage = getPreviewImage(template);
          const previewColor = getPreviewColor(template);

          return (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedTemplateId === template.id && "ring-2 ring-primary"
              )}
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="w-full h-24 rounded-md mb-2 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to color preview if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.backgroundColor = previewColor;
                        }
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: previewColor }}
                    />
                  )}
                </div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.description && (
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
