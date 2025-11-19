'use client';

import { Layer, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';
import { useRef, useEffect } from 'react';
import type { ImageOverlay } from '@/lib/store';

interface ImageOverlayLayerProps {
  imageOverlays: ImageOverlay[];
  loadedOverlayImages: Record<string, HTMLImageElement>;
  selectedOverlayId: string | null;
  setSelectedOverlayId: (id: string | null) => void;
  setIsMainImageSelected: (selected: boolean) => void;
  setSelectedTextId: (id: string | null) => void;
  updateImageOverlay: (id: string, updates: Partial<ImageOverlay>) => void;
}

export function ImageOverlayLayer({
  imageOverlays,
  loadedOverlayImages,
  selectedOverlayId,
  setSelectedOverlayId,
  setIsMainImageSelected,
  setSelectedTextId,
  updateImageOverlay,
}: ImageOverlayLayerProps) {
  const overlayRefs = useRef<Record<string, Konva.Image>>({});
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);

  useEffect(() => {
    if (transformerRef.current) {
      if (selectedOverlayId && overlayRefs.current[selectedOverlayId]) {
        const node = overlayRefs.current[selectedOverlayId];
        transformerRef.current.nodes([node]);
      } else {
        transformerRef.current.nodes([]);
      }
      layerRef.current?.batchDraw();
    }
  }, [selectedOverlayId, imageOverlays]);

  return (
    <Layer ref={layerRef}>
      {imageOverlays.map((overlay) => {
        if (!overlay.isVisible) return null;

        const overlayImg = loadedOverlayImages[overlay.id];
        if (!overlayImg) return null;

        return (
          <KonvaImage
            key={overlay.id}
            ref={(node) => {
              if (node) {
                overlayRefs.current[overlay.id] = node;
              } else {
                delete overlayRefs.current[overlay.id];
              }
            }}
            image={overlayImg}
            x={overlay.position.x}
            y={overlay.position.y}
            width={overlay.size}
            height={overlay.size}
            opacity={overlay.opacity}
            rotation={overlay.rotation}
            scaleX={overlay.flipX ? -1 : 1}
            scaleY={overlay.flipY ? -1 : 1}
            offsetX={overlay.size / 2}
            offsetY={overlay.size / 2}
            draggable={true}
            onClick={(e) => {
              e.cancelBubble = true;
              setSelectedOverlayId(overlay.id);
              setIsMainImageSelected(false);
              setSelectedTextId(null);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              setSelectedOverlayId(overlay.id);
              setIsMainImageSelected(false);
              setSelectedTextId(null);
            }}
            onDragEnd={(e) => {
              const node = e.target;
              updateImageOverlay(overlay.id, {
                position: { x: node.x(), y: node.y() },
              });
            }}
            onTransform={(e) => {
              const node = e.target;
              node.setAttrs({
                width: overlay.size,
                height: overlay.size,
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
              });
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();

              const baseScaleX = overlay.flipX ? -1 : 1;

              const actualScaleX = scaleX / baseScaleX;

              const newSize = Math.max(
                Math.round(overlay.size * Math.abs(actualScaleX)),
                20
              );

              updateImageOverlay(overlay.id, {
                position: { x: node.x(), y: node.y() },
                size: newSize,
                rotation: node.rotation(),
              });
            }}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container();
              if (container) {
                container.style.cursor = 'move';
              }
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container();
              if (container) {
                container.style.cursor = 'default';
              }
            }}
          />
        );
      })}
      <Transformer
        ref={transformerRef}
        keepRatio={false}
        boundBoxFunc={(oldBox, newBox) => {
          if (
            Math.abs(newBox.width) < 20 ||
            Math.abs(newBox.height) < 20
          ) {
            return oldBox;
          }
          return newBox;
        }}
      />
    </Layer>
  );
}

