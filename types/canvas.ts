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
  // For mockup
  mockup?: {
    imageUrl: string; // URL to the mockup image
    safeZone: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
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

export interface CanvasImageObject {
  id: string;
  type: "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  elevationX?: number; // Tilt/perspective around X axis (vertical perspective)
  elevationY?: number; // Tilt/perspective around Y axis (horizontal perspective)
  imageUrl?: string;
  image?: HTMLImageElement;
}

export interface CanvasTextObject {
  id: string;
  type: "text";
  x: number;
  y: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  fill?: string;
  fontSize?: number;
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