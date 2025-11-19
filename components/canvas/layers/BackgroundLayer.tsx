'use client';

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
  return (
    <Layer>
      {backgroundConfig.type === 'image' && bgImage ? (
        <KonvaImage
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

