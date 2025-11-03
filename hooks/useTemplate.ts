import { useCallback } from "react";
import { useCanvas } from "./useCanvas";
import { applyTemplateBackground } from "@/lib/canvas/utils";
import type { Template } from "@/types/canvas";

export function useTemplate() {
  const { canvas } = useCanvas();

  const applyTemplate = useCallback(
    async (template: Template) => {
      if (!canvas) return;

      // Remove existing background shapes (non-selectable objects)
      const objectsToRemove = canvas.getObjects().filter(
        (obj: any) => !obj.selectable && !obj.evented
      );
      objectsToRemove.forEach((obj: any) => canvas.remove(obj));

      // Apply new template background
      await applyTemplateBackground(canvas, template);

      // Update canvas dimensions if needed
      if (
        canvas.getWidth() !== template.dimensions.width ||
        canvas.getHeight() !== template.dimensions.height
      ) {
        canvas.setWidth(template.dimensions.width);
        canvas.setHeight(template.dimensions.height);
        canvas.renderAll();
      }
    },
    [canvas]
  );

  return { applyTemplate };
}
