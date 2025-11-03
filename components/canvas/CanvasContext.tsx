"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import Konva from "konva";
import type { CanvasOperations } from "@/types/editor";
import type { AspectRatioPreset } from "@/lib/constants";
import { DEFAULT_ASPECT_RATIO } from "@/lib/constants";

interface CanvasObject {
  id: string;
  type: "image" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  fill?: string;
  fontSize?: number;
  text?: string;
  imageUrl?: string;
  image?: HTMLImageElement;
  [key: string]: any;
}

interface CanvasContextType {
  stage: Konva.Stage | null;
  layer: Konva.Layer | null;
  initializeCanvas: (stage: Konva.Stage, layer: Konva.Layer) => void;
  operations: CanvasOperations;
  selectedObject: CanvasObject | null;
  objects: CanvasObject[];
  history: {
    undo: () => void;
    redo: () => void;
    save: () => void;
  };
  canvasDimensions: { width: number; height: number };
  aspectRatio: AspectRatioPreset;
  setAspectRatio: (preset: AspectRatioPreset) => void;
  setCanvasDimensions: (width: number, height: number) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const [layer, setLayer] = useState<Konva.Layer | null>(null);
  const [selectedObject, setSelectedObject] = useState<CanvasObject | null>(null);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [aspectRatio, setAspectRatioState] = useState<AspectRatioPreset>(DEFAULT_ASPECT_RATIO);
  const [canvasDimensions, setCanvasDimensionsState] = useState<{ width: number; height: number }>({
    width: DEFAULT_ASPECT_RATIO.width,
    height: DEFAULT_ASPECT_RATIO.height,
  });
  const historyRef = useRef<{ past: CanvasObject[][]; present: CanvasObject[]; future: CanvasObject[][] }>({
    past: [],
    present: [],
    future: [],
  });

  const setAspectRatio = useCallback((preset: AspectRatioPreset) => {
    setAspectRatioState(preset);
    setCanvasDimensionsState({
      width: preset.width,
      height: preset.height,
    });
    
    // Update stage dimensions if it exists
    if (stage) {
      stage.width(preset.width);
      stage.height(preset.height);
      if (layer) {
        // Update background rectangle
        const bgRect = layer.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
        if (bgRect && bgRect instanceof Konva.Rect) {
          bgRect.width(preset.width);
          bgRect.height(preset.height);
          layer.batchDraw();
        }
      }
    }
  }, [stage, layer]);

  const setCanvasDimensions = useCallback((width: number, height: number) => {
    setCanvasDimensionsState({ width, height });
    if (stage) {
      stage.width(width);
      stage.height(height);
      if (layer) {
        const bgRect = layer.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
        if (bgRect && bgRect instanceof Konva.Rect) {
          bgRect.width(width);
          bgRect.height(height);
          layer.batchDraw();
        }
      }
    }
  }, [stage, layer]);

  const initializeCanvas = useCallback((stageInstance: Konva.Stage, layerInstance: Konva.Layer) => {
    setStage(stageInstance);
    setLayer(layerInstance);
    
    // Initialize history
    historyRef.current = {
      past: [],
      present: [],
      future: [],
    };
  }, []);

  const saveState = useCallback(() => {
    const currentState = [...objects];
    historyRef.current.past.push([...historyRef.current.present]);
    historyRef.current.present = [...currentState];
    historyRef.current.future = [];
  }, [objects]);

  const undo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    const previous = historyRef.current.past.pop()!;
    if (previous && Array.isArray(previous)) {
      historyRef.current.future.unshift([...historyRef.current.present]);
      historyRef.current.present = [...previous];
      setObjects([...previous]);
      setSelectedObject(null);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;
    const next = historyRef.current.future.shift()!;
    if (next && Array.isArray(next)) {
      historyRef.current.past.push([...historyRef.current.present]);
      historyRef.current.present = [...next];
      setObjects([...next]);
      setSelectedObject(null);
    }
  }, []);

  const operations: CanvasOperations = {
    addImage: async (imageUrl, options = {}) => {
      if (!stage || !layer) return;
      
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = "anonymous";
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = imageUrl;
        });

        const canvasWidth = stage.width();
        const canvasHeight = stage.height();
        const imgWidth = img.width || 1;
        const imgHeight = img.height || 1;

        let scale = 1;
        if (imgWidth > canvasWidth || imgHeight > canvasHeight) {
          scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.8;
        } else {
          scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.5;
        }

      const newObject: CanvasObject = {
        id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "image",
        x: options.x ?? (canvasWidth - imgWidth * scale) / 2,
        y: options.y ?? (canvasHeight - imgHeight * scale) / 2,
        width: imgWidth * scale,
        height: imgHeight * scale,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        imageUrl,
        image: img,
      };

      // For backward compatibility, also set left/top
      (newObject as any).left = newObject.x;
      (newObject as any).top = newObject.y;
      (newObject as any).angle = newObject.rotation;

        setObjects((prev) => {
          const updated = [...prev, newObject];
          saveState();
          return updated;
        });
        setSelectedObject(newObject);
        layer.batchDraw();
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    },

    addText: async (text, options = {}) => {
      if (!stage || !layer) return;
      
      const canvasWidth = stage.width();
      const canvasHeight = stage.height();
      
      const newObject: CanvasObject = {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "text",
        x: options.x ?? canvasWidth / 2,
        y: options.y ?? canvasHeight / 2,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        fill: options.color ?? "#000000",
        fontSize: options.fontSize ?? 48,
        text: text,
      };

      // For backward compatibility, also set left/top
      (newObject as any).left = newObject.x;
      (newObject as any).top = newObject.y;
      (newObject as any).angle = newObject.rotation;

      setObjects((prev) => {
        const updated = [...prev, newObject];
        saveState();
        return updated;
      });
      setSelectedObject(newObject);
      layer.batchDraw();
    },

    transformObject: (objectId, properties) => {
      if (!layer) return;
      
      const idToUpdate = objectId || selectedObject?.id;
      
      setObjects((prev) => {
        const updated = prev.map((obj) => {
          if (obj.id === idToUpdate) {
            const updatedObj: any = { ...obj, ...properties };
            // Map 'left' and 'top' to 'x' and 'y' for Konva compatibility
            if ('left' in properties) {
              updatedObj.x = properties.left!;
              updatedObj.left = properties.left!;
            }
            if ('top' in properties) {
              updatedObj.y = properties.top!;
              updatedObj.top = properties.top!;
            }
            if ('angle' in properties) {
              updatedObj.rotation = properties.angle!;
              updatedObj.angle = properties.angle!;
            }
            // Handle text updates
            if ('text' in properties) {
              updatedObj.text = (properties as any).text;
            }
            
            // Update selected object if it's the one being transformed
            if (selectedObject?.id === idToUpdate) {
              setSelectedObject(updatedObj);
            }
            return updatedObj;
          }
          return obj;
        });
        saveState();
        return updated;
      });
      
      layer.batchDraw();
    },

    deleteObject: (objectId) => {
      if (!layer) return;
      
      const idToDelete = objectId || selectedObject?.id;
      if (!idToDelete) return;

      setObjects((prev) => {
        const updated = prev.filter((obj) => obj.id !== idToDelete);
        saveState();
        return updated;
      });
      
      if (selectedObject?.id === idToDelete) {
        setSelectedObject(null);
      }
      
      layer.batchDraw();
    },

    exportCanvas: async (format, quality = 1) => {
      if (!stage) return "";
      
      return new Promise((resolve) => {
        // Export the Konva Stage as a data URL
        // This captures the entire canvas including all objects, background, etc.
        const dataURL = stage.toDataURL({
          mimeType: format === "jpg" ? "image/jpeg" : "image/png",
          quality: quality, // For JPEG, 0-1 quality
          pixelRatio: 1, // Use 1 for standard resolution, increase for higher quality
        });
        resolve(dataURL);
      });
    },

    getSelectedObject: () => {
      return selectedObject;
    },

    clearSelection: () => {
      setSelectedObject(null);
      if (layer) {
        layer.batchDraw();
      }
    },

    selectObject: (objectId: string) => {
      const obj = objects.find((o) => o.id === objectId);
      if (obj) {
        setSelectedObject(obj);
        if (layer) {
          layer.batchDraw();
        }
      }
    },
  };

  return (
    <CanvasContext.Provider
      value={{
        stage,
        layer,
        initializeCanvas,
        operations,
        selectedObject,
        objects,
        history: { undo, redo, save: saveState },
        canvasDimensions,
        aspectRatio,
        setAspectRatio,
        setCanvasDimensions,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasContext() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvasContext must be used within CanvasProvider");
  }
  return context;
}