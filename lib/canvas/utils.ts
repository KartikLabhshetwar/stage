import type { Template, TemplateBackground } from "@/types/canvas";
import { Circle, Rect, Gradient } from "fabric";

/**
 * Apply a template background to a canvas context
 */
export async function applyTemplateBackground(
  canvas: any,
  template: Template
): Promise<void> {
  if (!canvas) return;

  const { background } = template;

  switch (background.type) {
    case "solid":
      canvas.backgroundColor = background.color || "#ffffff";
      canvas.renderAll();
      break;

    case "gradient":
      if (background.gradient) {
        const gradient = new Gradient({
          type: background.gradient.type,
          coords: {
            x1: 0,
            y1: 0,
            x2: background.gradient.type === "linear" ? canvas.getWidth() : 0,
            y2: background.gradient.type === "linear" ? canvas.getHeight() : canvas.getWidth(),
            r1: 0,
            r2: canvas.getWidth() / 2,
          },
          colorStops: background.gradient.colors.map((color, index) => ({
            offset: index / (background.gradient!.colors.length - 1),
            color,
          })),
        });

        canvas.backgroundColor = gradient as any;
        canvas.renderAll();
      }
      break;

    case "shapes":
      // First set base color
      canvas.backgroundColor = background.color || "#ffffff";
      // Then add shapes as canvas objects
      if (background.shapes) {
        background.shapes.forEach((shape) => {
          let fabricShape;
          if (shape.type === "circle") {
            fabricShape = new Circle({
              left: shape.x,
              top: shape.y,
              radius: shape.width / 2,
              fill: shape.color,
              opacity: shape.opacity ?? 1,
              selectable: false,
              evented: false,
            });
          } else if (shape.type === "rect") {
            fabricShape = new Rect({
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
              fill: shape.color,
              opacity: shape.opacity ?? 1,
              selectable: false,
              evented: false,
            });
          }

          if (fabricShape) {
            canvas.add(fabricShape);
            canvas.sendToBack(fabricShape);
          }
        });
        canvas.renderAll();
      }
      break;

    default:
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();
  }
}

