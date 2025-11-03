import type { FabricObject } from "fabric";

// Template types
export type TemplateType = "solid" | "gradient" | "shapes" | "mockup";

export interface TemplateBackground {
  type: TemplateType;
  // For solid color
  color?: string;
  // For gradient
  gradient?: {
    type: "linear" | "radial";
    colors: string[];
    angle?: number;
  };
  // For shapes
  shapes?: Array<{
    type: "circle" | "rect" | "triangle";
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    opacity?: number;
  }>;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  background: TemplateBackground;
  dimensions: {
    width: number;
    height: number;
  };
  safeZone?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  preview?: string; // URL or data URL for preview image
}

// Canvas object types
export type CanvasObjectType = "image" | "text";

export interface CanvasImageObject extends FabricObject {
  type: "image";
  src?: string;
}

export interface CanvasTextObject extends FabricObject {
  type: "text";
  text?: string;
}

export type CanvasObject = CanvasImageObject | CanvasTextObject;

// Transform properties
export interface TransformProperties {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
}

// Export options
export interface ExportOptions {
  format: "png" | "jpg";
  quality?: number; // 0-1 for JPG
  filename?: string;
}
