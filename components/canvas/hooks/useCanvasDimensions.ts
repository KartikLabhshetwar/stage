'use client'

import { useMemo } from 'react'

interface DimensionInputs {
  image: HTMLImageElement
  containerWidth: number
  containerHeight: number
  canvasPadding: number
  screenshotScale: number
  viewportSize: { width: number; height: number }
}

interface CanvasDimensions {
  canvasW: number
  canvasH: number
  contentW: number
  contentH: number
  imageScaledW: number
  imageScaledH: number
}

/**
 * Custom hook for calculating canvas and image dimensions
 * Memoized for performance - only recalculates when inputs change
 */
export function useCanvasDimensions({
  image,
  containerWidth,
  containerHeight,
  canvasPadding,
  screenshotScale,
  viewportSize,
}: DimensionInputs): CanvasDimensions {
  return useMemo(() => {
    const imageAspect = image.naturalWidth / image.naturalHeight
    const canvasAspect = containerWidth / containerHeight

    // Calculate content area (image area without padding)
    // Use viewport-aware dimensions, respecting the selected aspect ratio
    const availableWidth = Math.min(viewportSize.width * 1.1, containerWidth)
    const availableHeight = Math.min(viewportSize.height * 1.1, containerHeight)

    // Calculate canvas dimensions that maintain the selected aspect ratio
    let canvasW, canvasH
    if (availableWidth / availableHeight > canvasAspect) {
      // Height is the limiting factor
      canvasH = availableHeight - canvasPadding * 2
      canvasW = canvasH * canvasAspect
    } else {
      // Width is the limiting factor
      canvasW = availableWidth - canvasPadding * 2
      canvasH = canvasW / canvasAspect
    }

    // Ensure reasonable dimensions
    const minContentSize = 300
    canvasW = Math.max(canvasW, minContentSize)
    canvasH = Math.max(canvasH, minContentSize)

    // Content dimensions (without padding)
    const contentW = canvasW - canvasPadding * 2
    const contentH = canvasH - canvasPadding * 2

    // Calculate scaled image dimensions
    let imageScaledW, imageScaledH
    if (contentW / contentH > imageAspect) {
      imageScaledH = contentH * screenshotScale
      imageScaledW = imageScaledH * imageAspect
    } else {
      imageScaledW = contentW * screenshotScale
      imageScaledH = imageScaledW / imageAspect
    }

    return {
      canvasW,
      canvasH,
      contentW,
      contentH,
      imageScaledW,
      imageScaledH,
    }
  }, [image, containerWidth, containerHeight, canvasPadding, screenshotScale, viewportSize])
}
