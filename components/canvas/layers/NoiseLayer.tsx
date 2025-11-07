'use client'

import React, { useRef } from 'react'
import { Layer, Rect } from 'react-konva'

interface NoiseLayerProps {
  canvasW: number
  canvasH: number
  noiseImage: HTMLImageElement | null
  noiseOpacity: number
}

/**
 * NoiseLayer - Renders Konva noise overlay
 * Note: This is different from the DOM noise overlay in BackgroundLayer
 */
export function NoiseLayer({
  canvasW,
  canvasH,
  noiseImage,
  noiseOpacity,
}: NoiseLayerProps) {
  const noiseRectRef = useRef<any>(null)

  if (!noiseImage) {
    return null
  }

  return (
    <Layer>
      <Rect
        ref={noiseRectRef}
        width={canvasW}
        height={canvasH}
        fillPatternImage={noiseImage as any}
        fillPatternRepeat="repeat"
        opacity={noiseOpacity}
        perfectDrawEnabled={false}
      />
    </Layer>
  )
}
