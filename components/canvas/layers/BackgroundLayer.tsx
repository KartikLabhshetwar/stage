'use client';

import * as React from 'react';
import { Layer, Rect, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { parseLinearGradient } from '../utils/gradient-utils';
import type { BackgroundConfig } from '@/lib/constants/backgrounds';

interface BackgroundLayerProps {
  backgroundConfig: BackgroundConfig;
  backgroundStyle: React.CSSProperties;
  backgroundBlur: number;
  backgroundBorderRadius: number;
  canvasW: number;
  canvasH: number;
  bgImage: HTMLImageElement | null;
  noiseTexture: HTMLCanvasElement | null;
  backgroundNoise: number;
}

export function BackgroundLayer({
  backgroundConfig,
  backgroundStyle,
  backgroundBlur,
  backgroundBorderRadius,
  canvasW,
  canvasH,
  bgImage,
  noiseTexture,
  backgroundNoise,
}: BackgroundLayerProps) {
  const backgroundNodeRef = React.useRef<Konva.Image | Konva.Rect | null>(null);
  const assignBackgroundNode = React.useCallback(
    (node: Konva.Image | Konva.Rect | null) => {
      backgroundNodeRef.current = node;
    },
    []
  );

  React.useEffect(() => {
    const node = backgroundNodeRef.current;
    if (!node) return;

    if (backgroundBlur > 0) {
      node.cache({ pixelRatio: window.devicePixelRatio || 1 });
    } else {
      node.clearCache();
    }

    node.getLayer()?.batchDraw();
  }, [
    backgroundBlur,
    backgroundConfig.type,
    backgroundConfig.value,
    backgroundConfig.opacity,
    bgImage,
    canvasW,
    canvasH,
  ]);

  return (
    <Layer>
      {backgroundConfig.type === 'image' && bgImage ? (
        <KonvaImage
          ref={assignBackgroundNode}
          image={bgImage}
          width={canvasW}
          height={canvasH}
          opacity={backgroundConfig.opacity ?? 1}
          cornerRadius={backgroundBorderRadius}
          filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
          blurRadius={backgroundBlur}
        />
      ) : backgroundConfig.type === 'gradient' &&
        backgroundStyle.background ? (
        (() => {
          const gradientProps = parseLinearGradient(
            backgroundStyle.background as string,
            canvasW,
            canvasH
          );
          return gradientProps ? (
            <Rect
              ref={assignBackgroundNode}
              width={canvasW}
              height={canvasH}
              fillLinearGradientStartPoint={gradientProps.startPoint}
              fillLinearGradientEndPoint={gradientProps.endPoint}
              fillLinearGradientColorStops={gradientProps.colorStops}
              opacity={backgroundConfig.opacity ?? 1}
              cornerRadius={backgroundBorderRadius}
              filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
              blurRadius={backgroundBlur}
            />
          ) : (
            <Rect
              ref={assignBackgroundNode}
              width={canvasW}
              height={canvasH}
              fill="#ffffff"
              opacity={backgroundConfig.opacity ?? 1}
              cornerRadius={backgroundBorderRadius}
            />
          );
        })()
      ) : (
        <Rect
          ref={assignBackgroundNode}
          width={canvasW}
          height={canvasH}
          fill={
            backgroundConfig.type === 'solid'
              ? (backgroundStyle.backgroundColor as string)
              : '#ffffff'
          }
          opacity={backgroundConfig.opacity ?? 1}
          cornerRadius={backgroundBorderRadius}
          filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
          blurRadius={backgroundBlur}
        />
      )}

      {noiseTexture && backgroundNoise > 0 && (
        <Rect
          width={canvasW}
          height={canvasH}
          fillPatternImage={noiseTexture as unknown as HTMLImageElement}
          fillPatternRepeat="repeat"
          opacity={backgroundNoise / 100}
          globalCompositeOperation="overlay"
          cornerRadius={backgroundBorderRadius}
        />
      )}
    </Layer>
  );
}

