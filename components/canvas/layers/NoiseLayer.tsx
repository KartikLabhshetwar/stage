'use client';

import { Layer, Rect } from 'react-konva';

interface NoiseLayerProps {
  noiseImage: HTMLImageElement | null;
  canvasW: number;
  canvasH: number;
  noiseOpacity: number;
}

export function NoiseLayer({
  noiseImage,
  canvasW,
  canvasH,
  noiseOpacity,
}: NoiseLayerProps) {
  if (!noiseImage) return null;

  return (
    <Layer>
      <Rect
        width={canvasW}
        height={canvasH}
        fillPatternImage={noiseImage}
        fillPatternRepeat="repeat"
        opacity={noiseOpacity}
        perfectDrawEnabled={false}
      />
    </Layer>
  );
}

