'use client';

import { Layer, Group, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';
import { useRef, useEffect } from 'react';
import { FrameRenderer } from '../frames/FrameRenderer';
import { getShadowProps, type ShadowConfig } from '../utils/shadow-utils';
import type { FrameConfig } from '../frames/FrameRenderer';

interface MainImageLayerProps {
  image: HTMLImageElement;
  canvasW: number;
  canvasH: number;
  framedW: number;
  framedH: number;
  frameOffset: number;
  windowPadding: number;
  windowHeader: number;
  eclipseBorder: number;
  imageScaledW: number;
  imageScaledH: number;
  screenshot: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    radius: number;
  };
  frame: FrameConfig;
  shadow: ShadowConfig;
  showFrame: boolean;
  has3DTransform: boolean;
  imageOpacity: number;
  isMainImageSelected: boolean;
  setIsMainImageSelected: (selected: boolean) => void;
  setSelectedOverlayId: (id: string | null) => void;
  setSelectedTextId: (id: string | null) => void;
  setScreenshot: (updates: Partial<MainImageLayerProps['screenshot']>) => void;
}

export function MainImageLayer({
  image,
  canvasW,
  canvasH,
  framedW,
  framedH,
  frameOffset,
  windowPadding,
  windowHeader,
  eclipseBorder,
  imageScaledW,
  imageScaledH,
  screenshot,
  frame,
  shadow,
  showFrame,
  has3DTransform,
  imageOpacity,
  isMainImageSelected,
  setIsMainImageSelected,
  setSelectedOverlayId,
  setSelectedTextId,
  setScreenshot,
}: MainImageLayerProps) {
  const mainImageRef = useRef<Konva.Image>(null);
  const mainImageTransformerRef = useRef<Konva.Transformer>(null);
  const shadowProps = getShadowProps(shadow);

  useEffect(() => {
    if (mainImageTransformerRef.current) {
      if (isMainImageSelected && mainImageRef.current) {
        mainImageTransformerRef.current.nodes([mainImageRef.current]);
      } else {
        mainImageTransformerRef.current.nodes([]);
      }
      mainImageRef.current?.getLayer()?.batchDraw();
    }
  }, [isMainImageSelected]);

  return (
    <Layer>
      <Group
        x={canvasW / 2 + screenshot.offsetX}
        y={canvasH / 2 + screenshot.offsetY}
        width={framedW}
        height={framedH}
        offsetX={framedW / 2}
        offsetY={framedH / 2}
        rotation={screenshot.rotation}
        draggable={true}
        onDragEnd={(e) => {
          const node = e.target;
          const newOffsetX = node.x() - canvasW / 2;
          const newOffsetY = node.y() - canvasH / 2;
          if (typeof setScreenshot === 'function') {
            setScreenshot({ offsetX: newOffsetX, offsetY: newOffsetY });
          }
        }}
      >
        <FrameRenderer
          frame={frame}
          showFrame={showFrame}
          framedW={framedW}
          framedH={framedH}
          frameOffset={frameOffset}
          windowPadding={windowPadding}
          windowHeader={windowHeader}
          eclipseBorder={eclipseBorder}
          imageScaledW={imageScaledW}
          imageScaledH={imageScaledH}
          screenshotRadius={screenshot.radius}
          shadowProps={shadowProps}
          has3DTransform={has3DTransform}
        />

        <KonvaImage
          ref={mainImageRef}
          image={image}
          x={frameOffset + windowPadding}
          y={frameOffset + windowPadding + windowHeader}
          width={imageScaledW}
          height={imageScaledH}
          opacity={has3DTransform ? 0 : imageOpacity}
          cornerRadius={
            showFrame && frame.type === 'window'
              ? [0, 0, screenshot.radius, screenshot.radius]
              : showFrame && frame.type === 'ruler'
              ? screenshot.radius * 0.8
              : screenshot.radius
          }
          imageSmoothingEnabled={false}
          draggable={false}
          onClick={(e) => {
            e.cancelBubble = true;
            setIsMainImageSelected(true);
            setSelectedOverlayId(null);
            setSelectedTextId(null);
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            setIsMainImageSelected(true);
            setSelectedOverlayId(null);
            setSelectedTextId(null);
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
          {...shadowProps}
        />
        <Transformer
          ref={mainImageTransformerRef}
          keepRatio={true}
          boundBoxFunc={(oldBox, newBox) => {
            if (
              Math.abs(newBox.width) < 50 ||
              Math.abs(newBox.height) < 50
            ) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </Group>
    </Layer>
  );
}

