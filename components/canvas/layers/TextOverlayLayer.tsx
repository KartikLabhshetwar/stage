'use client';

import { Layer, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { useRef, useEffect } from 'react';
import { getFontCSS } from '@/lib/constants/fonts';
import type { TextOverlay } from '@/lib/store';

interface TextOverlayLayerProps {
  textOverlays: TextOverlay[];
  canvasW: number;
  canvasH: number;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  setSelectedOverlayId: (id: string | null) => void;
  setIsMainImageSelected: (selected: boolean) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
}

export function TextOverlayLayer({
  textOverlays,
  canvasW,
  canvasH,
  selectedTextId,
  setSelectedTextId,
  setSelectedOverlayId,
  setIsMainImageSelected,
  updateTextOverlay,
}: TextOverlayLayerProps) {
  const textRefs = useRef<Record<string, Konva.Text>>({});
  const textTransformerRef = useRef<Konva.Transformer>(null);
  const textLayerRef = useRef<Konva.Layer>(null);

  useEffect(() => {
    if (textTransformerRef.current) {
      if (selectedTextId && textRefs.current[selectedTextId]) {
        const node = textRefs.current[selectedTextId];
        textTransformerRef.current.nodes([node]);
      } else {
        textTransformerRef.current.nodes([]);
      }
      textLayerRef.current?.batchDraw();
    }
  }, [selectedTextId, textOverlays]);

  return (
    <Layer ref={textLayerRef}>
      {textOverlays.map((overlay) => {
        if (!overlay.isVisible) return null;

        const textX = (overlay.position.x / 100) * canvasW;
        const textY = (overlay.position.y / 100) * canvasH;

        return (
          <Text
            key={overlay.id}
            ref={(node) => {
              if (node) {
                textRefs.current[overlay.id] = node;
              } else {
                delete textRefs.current[overlay.id];
              }
            }}
            x={textX}
            y={textY}
            text={overlay.text}
            fontSize={overlay.fontSize}
            fontFamily={getFontCSS(overlay.fontFamily)}
            fill={overlay.color}
            opacity={overlay.opacity}
            offsetX={0}
            offsetY={0}
            align="center"
            verticalAlign="middle"
            shadowColor={
              overlay.textShadow.enabled
                ? overlay.textShadow.color
                : undefined
            }
            shadowBlur={
              overlay.textShadow.enabled ? overlay.textShadow.blur : 0
            }
            shadowOffsetX={
              overlay.textShadow.enabled ? overlay.textShadow.offsetX : 0
            }
            shadowOffsetY={
              overlay.textShadow.enabled ? overlay.textShadow.offsetY : 0
            }
            fontStyle={
              String(overlay.fontWeight).includes('italic')
                ? 'italic'
                : 'normal'
            }
            fontVariant={String(overlay.fontWeight)}
            draggable={true}
            onClick={(e) => {
              e.cancelBubble = true;
              setSelectedTextId(overlay.id);
              setSelectedOverlayId(null);
              setIsMainImageSelected(false);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              setSelectedTextId(overlay.id);
              setSelectedOverlayId(null);
              setIsMainImageSelected(false);
            }}
            onDragEnd={(e) => {
              const newX = (e.target.x() / canvasW) * 100;
              const newY = (e.target.y() / canvasH) * 100;
              updateTextOverlay(overlay.id, {
                position: { x: newX, y: newY },
              });
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();

              const newFontSize = Math.max(
                Math.round(overlay.fontSize * scaleX),
                8
              );

              node.scaleX(1);
              node.scaleY(1);

              const newX = (node.x() / canvasW) * 100;
              const newY = (node.y() / canvasH) * 100;

              updateTextOverlay(overlay.id, {
                position: { x: newX, y: newY },
                fontSize: newFontSize,
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
        ref={textTransformerRef}
        keepRatio={false}
        enabledAnchors={[
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
        ]}
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

