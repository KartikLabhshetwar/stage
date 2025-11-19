'use client';

import { Layer, Rect } from 'react-konva';

interface PatternLayerProps {
  patternImage: HTMLCanvasElement | null;
  canvasW: number;
  canvasH: number;
  patternOpacity: number;
}

export function PatternLayer({
  patternImage,
  canvasW,
  canvasH,
  patternOpacity,
}: PatternLayerProps) {
  if (!patternImage) return null;

  return (
    <Layer>
      <Rect
        width={canvasW}
        height={canvasH}
        fillPatternImage={patternImage as unknown as HTMLImageElement}
        fillPatternRepeat="repeat"
        opacity={patternOpacity}
        perfectDrawEnabled={false}
      />
    </Layer>
  );
}

