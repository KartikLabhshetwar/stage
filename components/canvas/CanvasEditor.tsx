"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image, Text, Transformer, Rect, Line, Group, Circle } from "react-konva";
import { useCanvasContext } from "./CanvasContext";
import Konva from "konva";

interface CanvasEditorProps {
  backgroundColor?: string;
  className?: string;
  onBackgroundColorChange?: (color: string) => void;
}

export function CanvasEditor({
  backgroundColor = "#ffffff",
  className = "",
  onBackgroundColorChange,
}: CanvasEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { initializeCanvas, objects, selectedObject, operations, layer, canvasDimensions } = useCanvasContext();
  const { width, height } = canvasDimensions;
  const [scale, setScale] = useState(1);
  const [showGuides, setShowGuides] = useState(false);
  const [draggingObject, setDraggingObject] = useState<string | null>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  // Calculate scale to fit canvas in viewport
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate padding (4 * 16px = 64px total padding from parent)
        const padding = 64;
        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;
        
        const scaleX = availableWidth / width;
        const scaleY = availableHeight / height;
        const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
        
        setScale(newScale);
      }
    };

    // Initial update
    const timeoutId = setTimeout(updateScale, 100);
    updateScale();
    
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateScale);
    };
  }, [width, height]);

  useEffect(() => {
    if (stageRef.current && layerRef.current) {
      initializeCanvas(stageRef.current, layerRef.current);
    }
  }, [initializeCanvas]);

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.width(width);
      stageRef.current.height(height);
      // Update background rect dimensions
      if (layerRef.current) {
        const bgRect = layerRef.current.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
        if (bgRect && bgRect instanceof Konva.Rect) {
          bgRect.width(width);
          bgRect.height(height);
          layerRef.current.batchDraw();
        }
      }
    }
  }, [width, height]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !layerRef.current || !selectedObject) {
      transformerRef.current?.nodes([]);
      return;
    }

    // Find the Konva node for the selected object
    const selectedNode = layerRef.current.findOne(`#${selectedObject.id}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      layerRef.current.batchDraw();
    }
  }, [selectedObject, layer]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      operations.clearSelection();
    }
  };

  const handleObjectClick = (obj: typeof objects[0]) => {
    const found = objects.find((o) => o.id === obj.id);
    if (found) {
      if (operations.selectObject) {
        operations.selectObject(obj.id);
      } else {
        // Fallback: trigger selection through transform
        operations.transformObject(obj.id, {});
      }
    }
  };

  // Sync backgroundColor with background rect (only if no gradient/image is set)
  useEffect(() => {
    if (layerRef.current && backgroundColor) {
      const bgRect = layerRef.current.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
      if (bgRect && bgRect instanceof Konva.Rect) {
        // Only update if there's no gradient or pattern
        const hasGradient = bgRect.fillLinearGradientColorStops()?.length > 0 || 
                           bgRect.fillRadialGradientColorStops()?.length > 0;
        const hasPattern = bgRect.fillPatternImage() !== null;
        
        if (!hasGradient && !hasPattern) {
          bgRect.fill(backgroundColor);
          layerRef.current.batchDraw();
        }
      }
    }
  }, [backgroundColor, layer]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-visible flex items-center justify-center ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      <div 
        ref={wrapperRef}
        style={{ 
          width: `${width * scale}px`, 
          height: `${height * scale}px`,
          position: 'relative',
          backgroundColor: backgroundColor,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
        className="rounded-lg overflow-hidden"
      >
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onClick={handleStageClick}
          onTap={handleStageClick}
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            backgroundColor: backgroundColor,
          }}
        >
        <Layer ref={layerRef}>
          {/* Background Rectangle */}
          <Rect
            id="canvas-background"
            x={0}
            y={0}
            width={width}
            height={height}
            fill={backgroundColor}
            listening={false}
          />
          
          {/* Center Guide Lines */}
          {showGuides && (
            <>
              {/* Vertical center line */}
              <Line
                points={[width / 2, 0, width / 2, height]}
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[5, 5]}
                opacity={0.6}
                listening={false}
              />
              {/* Horizontal center line */}
              <Line
                points={[0, height / 2, width, height / 2]}
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[5, 5]}
                opacity={0.6}
                listening={false}
              />
            </>
          )}
          
          {/* Render objects */}
          {objects.map((obj) => {
            const isSelected = selectedObject?.id === obj.id;
            
            if (obj.type === "image" && obj.image) {
              const showDelete = isSelected || hoveredImageId === obj.id;
              const displayWidth = (obj.width || 0) * (obj.scaleX ?? 1);
              const displayHeight = (obj.height || 0) * (obj.scaleY ?? 1);
              
              return (
                <Group
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  rotation={obj.rotation ?? 0}
                  draggable
                  onDragStart={(e) => {
                    setDraggingObject(obj.id);
                    setShowGuides(true);
                    // Select object when dragging starts
                    handleObjectClick(obj);
                  }}
                  onDragMove={(e) => {
                    const node = e.target;
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const objCenterX = node.x() + displayWidth / 2;
                    const objCenterY = node.y() + displayHeight / 2;
                    
                    // Snap to center if within 10px
                    const snapThreshold = 10;
                    if (Math.abs(objCenterX - centerX) < snapThreshold) {
                      node.x(centerX - displayWidth / 2);
                    }
                    if (Math.abs(objCenterY - centerY) < snapThreshold) {
                      node.y(centerY - displayHeight / 2);
                    }
                  }}
                  onDragEnd={(e) => {
                    setDraggingObject(null);
                    setShowGuides(false);
                    operations.transformObject(obj.id, {
                      left: e.target.x(),
                      top: e.target.y(),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    
                    node.scaleX(1);
                    node.scaleY(1);
                    
                    operations.transformObject(obj.id, {
                      left: node.x(),
                      top: node.y(),
                      scaleX: scaleX,
                      scaleY: scaleY,
                      angle: node.rotation(),
                    });
                  }}
                  onMouseEnter={() => setHoveredImageId(obj.id)}
                  onMouseLeave={() => setHoveredImageId(null)}
                  onClick={(e) => {
                    // Don't select if clicking delete button
                    const target = e.target as any;
                    const isDeleteButton = target.getClassName?.() === 'Circle' || 
                                         (target.parent && target.parent.attrs?.name === 'delete-button');
                    if (!isDeleteButton) {
                      handleObjectClick(obj);
                    }
                  }}
                  onTap={(e) => {
                    const target = e.target as any;
                    const isDeleteButton = target.getClassName?.() === 'Circle' || 
                                         (target.parent && target.parent.attrs?.name === 'delete-button');
                    if (!isDeleteButton) {
                      handleObjectClick(obj);
                    }
                  }}
                >
                  <Image
                    image={obj.image}
                    x={0}
                    y={0}
                    width={obj.width}
                    height={obj.height}
                    scaleX={obj.scaleX ?? 1}
                    scaleY={obj.scaleY ?? 1}
                  />
                  
                  {/* Delete button - appears on hover or selection */}
                  {showDelete && (
                    <Group
                      name="delete-button"
                      x={displayWidth - 15}
                      y={-15}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        operations.deleteObject(obj.id);
                      }}
                      onTap={(e) => {
                        e.cancelBubble = true;
                        operations.deleteObject(obj.id);
                      }}
                      listening={true}
                    >
                      {/* Background circle */}
                      <Circle
                        x={10}
                        y={10}
                        radius={12}
                        fill="#ef4444"
                        shadowColor="rgba(0, 0, 0, 0.3)"
                        shadowBlur={4}
                        shadowOffset={{ x: 0, y: 2 }}
                        listening={true}
                      />
                      {/* X icon */}
                      <Line
                        points={[6, 6, 14, 14]}
                        stroke="white"
                        strokeWidth={2.5}
                        lineCap="round"
                        listening={false}
                      />
                      <Line
                        points={[14, 6, 6, 14]}
                        stroke="white"
                        strokeWidth={2.5}
                        lineCap="round"
                        listening={false}
                      />
                    </Group>
                  )}
                </Group>
              );
            }
            
            if (obj.type === "text") {
              return (
                <Text
                  key={obj.id}
                  id={obj.id}
                  text={obj.text || ""}
                  x={obj.x}
                  y={obj.y}
                  fontSize={obj.fontSize || 48}
                  fill={obj.fill || "#000000"}
                  scaleX={obj.scaleX ?? 1}
                  scaleY={obj.scaleY ?? 1}
                  rotation={obj.rotation ?? 0}
                  draggable
                  align="center"
                  offsetX={0}
                  offsetY={0}
                  onClick={() => handleObjectClick(obj)}
                  onTap={() => handleObjectClick(obj)}
                  onDragStart={() => {
                    setDraggingObject(obj.id);
                    setShowGuides(true);
                  }}
                  onDragMove={(e) => {
                    const node = e.target;
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const textWidth = node.width();
                    const textHeight = node.height();
                    const objCenterX = node.x();
                    const objCenterY = node.y();
                    
                    // Snap to center if within 10px
                    const snapThreshold = 10;
                    if (Math.abs(objCenterX - centerX) < snapThreshold) {
                      node.x(centerX);
                    }
                    if (Math.abs(objCenterY - centerY) < snapThreshold) {
                      node.y(centerY);
                    }
                  }}
                  onDragEnd={(e) => {
                    setDraggingObject(null);
                    setShowGuides(false);
                    operations.transformObject(obj.id, {
                      left: e.target.x(),
                      top: e.target.y(),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    
                    node.scaleX(1);
                    node.scaleY(1);
                    
                    operations.transformObject(obj.id, {
                      left: node.x(),
                      top: node.y(),
                      scaleX: scaleX,
                      scaleY: scaleY,
                      angle: node.rotation(),
                    });
                  }}
                />
              );
            }
            
            return null;
          })}
          
          {/* Transformer for selected objects */}
          {selectedObject && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
      </div>
    </div>
  );
}