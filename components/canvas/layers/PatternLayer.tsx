'use client'

import React, { useRef, useEffect } from 'react'
import { Layer, Rect } from 'react-konva'

interface PatternLayerProps {
  canvasW: number
  canvasH: number
  patternImage: HTMLCanvasElement | null
  patternOpacity: number
  patternBlur: number
}

/**
 * PatternLayer - Renders pattern overlay in Konva
 */
export function PatternLayer({
  canvasW,
  canvasH,
  patternImage,
  patternOpacity,
  patternBlur,
}: PatternLayerProps) {
  const patternRectRef = useRef<any>(null)

  useEffect(() => {
    if (patternRectRef.current) {
      patternRectRef.current.cache()
    }
  }, [patternImage, canvasW, canvasH, patternOpacity, patternBlur])

  if (!patternImage) {
    return null
  }

  return (
    <Layer>
      <Rect
        ref={patternRectRef}
        width={canvasW}
        height={canvasH}
        fillPatternImage={patternImage as any}
        fillPatternRepeat="repeat"
        opacity={patternOpacity}
        perfectDrawEnabled={false}
      />
    </Layer>
  )
}
