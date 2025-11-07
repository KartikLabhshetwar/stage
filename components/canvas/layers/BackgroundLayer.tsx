'use client'

import React from 'react'

interface BackgroundLayerProps {
  canvasW: number
  canvasH: number
  backgroundStyle: React.CSSProperties
  backgroundBorderRadius: number
  backgroundBlur: number
  noiseTexture: string | null
  backgroundNoise: number
}

/**
 * BackgroundLayer - Renders the DOM-based background and noise overlay
 * This is rendered as DOM elements (not Konva) for better html2canvas compatibility
 */
export function BackgroundLayer({
  canvasW,
  canvasH,
  backgroundStyle,
  backgroundBorderRadius,
  backgroundBlur,
  noiseTexture,
  backgroundNoise,
}: BackgroundLayerProps) {
  return (
    <>
      {/* Background layer - DOM element for html2canvas compatibility */}
      <div
        id="canvas-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${canvasW}px`,
          height: `${canvasH}px`,
          zIndex: 0,
          borderRadius: `${backgroundBorderRadius}px`,
          filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : 'none',
          ...backgroundStyle,
        }}
      />

      {/* Noise overlay */}
      {noiseTexture && backgroundNoise > 0 && (
        <div
          id="canvas-noise-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${canvasW}px`,
            height: `${canvasH}px`,
            zIndex: 1,
            borderRadius: `${backgroundBorderRadius}px`,
            backgroundImage: `url(${noiseTexture})`,
            backgroundRepeat: 'repeat',
            opacity: backgroundNoise / 100,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </>
  )
}
