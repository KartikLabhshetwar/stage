"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import Konva from "konva";
import type { CanvasOperations } from "@/types/editor";
import type { AspectRatioPreset } from "@/lib/constants";
import { DEFAULT_ASPECT_RATIO } from "@/lib/constants";
import { saveImageBlob, getBlobUrlFromStored, deleteImageBlob } from "@/lib/image-storage";

const CANVAS_OBJECTS_KEY = "canvas-objects";

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
    
    // Restore objects from localStorage
    try {
      const saved = localStorage.getItem(CANVAS_OBJECTS_KEY);
      if (saved) {
        const savedObjects: CanvasObject[] = JSON.parse(saved);
        // Restore image objects by recreating the images from their URLs
        const restorePromises = savedObjects.map(async (obj) => {
          if (obj.type === "image" && obj.imageUrl) {
            let imageSrc = obj.imageUrl;
            
            // If it's a stored image ID (not starting with blob: or http: or data:), get from IndexedDB
            if (!imageSrc.startsWith("blob:") && !imageSrc.startsWith("http") && !imageSrc.startsWith("data:")) {
              const blobUrl = await getBlobUrlFromStored(imageSrc);
              if (blobUrl) {
                imageSrc = blobUrl;
              } else {
                console.warn(`Image blob not found for ID: ${imageSrc}`);
                return null; // Skip this object if blob not found
              }
            }
            
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              const image = new Image();
              image.crossOrigin = "anonymous";
              image.onload = () => resolve(image);
              image.onerror = reject;
              image.src = imageSrc;
            });
            return { ...obj, image: img, imageUrl: imageSrc };
          }
          return obj;
        });
        
        Promise.all(restorePromises).then((restoredObjects) => {
          // Filter out null objects (failed restorations)
          const validObjects = restoredObjects.filter(obj => obj !== null) as CanvasObject[];
          setObjects(validObjects);
          historyRef.current.present = [...validObjects];
          // Trigger a draw after a short delay to ensure layer is ready
          setTimeout(() => {
            if (layerInstance) {
              layerInstance.batchDraw();
            }
          }, 100);
        });
      }
    } catch (error) {
      console.error("Failed to restore canvas objects:", error);
    }
  }, []);

  const saveState = useCallback(() => {
    const currentState = [...objects];
    historyRef.current.past.push([...historyRef.current.present]);
    historyRef.current.present = [...currentState];
    historyRef.current.future = [];
  }, [objects]);

  // Helper function to save objects to localStorage
  const saveObjectsToStorage = useCallback((objectsToSave: CanvasObject[]) => {
    try {
      localStorage.setItem(CANVAS_OBJECTS_KEY, JSON.stringify(objectsToSave.map(obj => ({
        ...obj,
        image: undefined, // Don't store image element, just the URL
      }))));
    } catch (error) {
      console.error("Failed to save canvas objects:", error);
    }
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    const previous = historyRef.current.past.pop()!;
    if (previous && Array.isArray(previous)) {
      historyRef.current.future.unshift([...historyRef.current.present]);
      historyRef.current.present = [...previous];
      setObjects([...previous]);
      saveObjectsToStorage(previous);
      setSelectedObject(null);
    }
  }, [saveObjectsToStorage]);

  const redo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;
    const next = historyRef.current.future.shift()!;
    if (next && Array.isArray(next)) {
      historyRef.current.past.push([...historyRef.current.present]);
      historyRef.current.present = [...next];
      setObjects([...next]);
      saveObjectsToStorage(next);
      setSelectedObject(null);
    }
  }, [saveObjectsToStorage]);

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

      const imageId = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // If it's a blob URL, save the blob to IndexedDB for persistence
      if (imageUrl.startsWith("blob:")) {
        try {
          // Fetch the blob from the blob URL
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          // Save to IndexedDB
          await saveImageBlob(blob, imageId);
        } catch (error) {
          console.error("Failed to save image blob:", error);
        }
      }
      
      const newObject: CanvasObject = {
        id: imageId,
        type: "image",
        x: options.x ?? (canvasWidth - imgWidth * scale) / 2,
        y: options.y ?? (canvasHeight - imgHeight * scale) / 2,
        width: imgWidth * scale,
        height: imgHeight * scale,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        imageUrl: imageUrl.startsWith("blob:") ? imageId : imageUrl, // Store ID for blob URLs, URL for others
        image: img,
      };

      // For backward compatibility, also set left/top
      (newObject as any).left = newObject.x;
      (newObject as any).top = newObject.y;
      (newObject as any).angle = newObject.rotation;

        setObjects((prev) => {
          const updated = [...prev, newObject];
          saveState();
          saveObjectsToStorage(updated);
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
        saveObjectsToStorage(updated);
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
        saveObjectsToStorage(updated);
        return updated;
      });
      
      layer.batchDraw();
    },

    deleteObject: (objectId) => {
      if (!layer) return;
      
      const idToDelete = objectId || selectedObject?.id;
      if (!idToDelete) return;

      // Find the object to check if it's a stored image
      const objectToDelete = objects.find(obj => obj.id === idToDelete);
      if (objectToDelete && objectToDelete.type === "image" && objectToDelete.imageUrl) {
        // If it's a stored image (not a blob URL, http, or data URL), delete from IndexedDB
        const imageUrl = objectToDelete.imageUrl;
        if (!imageUrl.startsWith("blob:") && !imageUrl.startsWith("http") && !imageUrl.startsWith("data:")) {
          deleteImageBlob(imageUrl).catch(err => {
            console.error("Failed to delete image blob:", err);
          });
        }
      }

      setObjects((prev) => {
        const updated = prev.filter((obj) => obj.id !== idToDelete);
        saveState();
        saveObjectsToStorage(updated);
        return updated;
      });
      
      if (selectedObject?.id === idToDelete) {
        setSelectedObject(null);
      }
      
      layer.batchDraw();
    },

    exportCanvas: async (format, quality = 1) => {
      if (!stage || !layer) return "";
      
      return new Promise((resolve) => {
        // Create a temporary layer for watermark
        const watermarkLayer = new Konva.Layer();
        
        // Create watermark text
        const canvasWidth = stage.width();
        const canvasHeight = stage.height();
        const fontSize = Math.max(16, canvasWidth * 0.02); // Responsive font size
        const padding = Math.max(15, canvasWidth * 0.015); // Responsive padding
        
        // Create watermark text only (no background)
        const watermarkText = new Konva.Text({
          text: "Stage",
          fontSize: fontSize,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fill: "rgba(255, 255, 255, 0.8)",
          fontStyle: "normal",
          fontVariant: "normal",
          x: canvasWidth - padding - 60, // Approximate width for "Stage"
          y: canvasHeight - fontSize - padding,
        });
        
        // Adjust position based on actual text width
        watermarkText.x(canvasWidth - watermarkText.width() - padding);
        
        watermarkLayer.add(watermarkText);
        stage.add(watermarkLayer);
        watermarkLayer.draw();

        // Export the Konva Stage as a data URL
        // This captures the entire canvas including all objects, background, and watermark
        const dataURL = stage.toDataURL({
          mimeType: format === "jpg" ? "image/jpeg" : "image/png",
          quality: quality, // For JPEG, 0-1 quality
          pixelRatio: 1, // Use 1 for standard resolution, increase for higher quality
        });

        // Clean up watermark layer
        watermarkLayer.destroy();

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