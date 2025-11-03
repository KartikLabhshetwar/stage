"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Canvas as FabricCanvas, Image, Text } from "fabric";
import type { CanvasOperations } from "@/types/editor";

interface CanvasContextType {
  canvas: FabricCanvas | null;
  initializeCanvas: (element: HTMLCanvasElement) => void;
  operations: CanvasOperations;
  selectedObject: any;
  history: {
    undo: () => void;
    redo: () => void;
    save: () => void;
  };
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  const initializeCanvas = useCallback((element: HTMLCanvasElement) => {
    const fabricCanvas = new FabricCanvas(element, {
      backgroundColor: "#ffffff",
      selection: true,
    });

    // Handle object selection
    fabricCanvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // Save state on object modification
    fabricCanvas.on("object:modified", () => {
      saveState();
    });

    // Save initial state
    historyRef.current = [JSON.stringify(fabricCanvas.toJSON())];
    historyIndexRef.current = 0;

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const saveState = useCallback(() => {
    if (!canvas) return;
    const state = JSON.stringify(canvas.toJSON());
    // Remove any future states if we're not at the end
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    historyRef.current.push(state);
    historyIndexRef.current = historyRef.current.length - 1;
  }, [canvas]);

  const undo = useCallback(() => {
    if (!canvas || historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const state = historyRef.current[historyIndexRef.current];
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
    });
  }, [canvas]);

  const redo = useCallback(() => {
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const state = historyRef.current[historyIndexRef.current];
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
    });
  }, [canvas]);

  const operations: CanvasOperations = {
    addImage: async (imageUrl, options = {}) => {
      if (!canvas) return;
      try {
        const img = await Image.fromURL(imageUrl, { crossOrigin: "anonymous" });
        
        // Auto-resize to fit canvas while maintaining aspect ratio
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const imgWidth = img.width || 1;
        const imgHeight = img.height || 1;
        
        let scale = 1;
        if (imgWidth > canvasWidth || imgHeight > canvasHeight) {
          scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.8; // 80% of canvas
        } else {
          scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.5; // 50% of canvas
        }

        img.scale(scale);
        img.set({
          id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          left: options.x ?? (canvasWidth - imgWidth * scale) / 2,
          top: options.y ?? (canvasHeight - imgHeight * scale) / 2,
          ...options,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveState();
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    },

    addText: async (text, options = {}) => {
      if (!canvas) return;
      const textObj = new Text(text, {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        left: options.x ?? canvas.getWidth() / 2,
        top: options.y ?? canvas.getHeight() / 2,
        fontSize: options.fontSize ?? 48,
        fill: options.color ?? "#000000",
        originX: "center",
        originY: "center",
        ...options,
      });

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
      saveState();
    },

    transformObject: (objectId, properties) => {
      if (!canvas) return;
      // If no objectId provided, use selected object
      const obj = objectId
        ? canvas.getObjects().find((o: any) => o.id === objectId)
        : canvas.getActiveObject();
      if (obj) {
        obj.set(properties);
        canvas.renderAll();
        saveState();
      }
    },

    deleteObject: (objectId) => {
      if (!canvas) return;
      // If no objectId provided, use selected object
      const obj = objectId
        ? canvas.getObjects().find((o: any) => o.id === objectId)
        : canvas.getActiveObject();
      if (obj) {
        canvas.remove(obj);
        canvas.discardActiveObject();
        canvas.renderAll();
        saveState();
      }
    },

    exportCanvas: async (format, quality = 1) => {
      if (!canvas) return "";
      return new Promise((resolve) => {
        const dataURL = canvas.toDataURL({
          format: format === "jpg" ? "jpeg" : "png",
          quality: quality,
          multiplier: 1,
        });
        resolve(dataURL);
      });
    },

    getSelectedObject: () => {
      return canvas?.getActiveObject() || null;
    },

    clearSelection: () => {
      canvas?.discardActiveObject();
      canvas?.renderAll();
    },
  };

  return (
    <CanvasContext.Provider
      value={{
        canvas,
        initializeCanvas,
        operations,
        selectedObject,
        history: { undo, redo, save: saveState },
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
