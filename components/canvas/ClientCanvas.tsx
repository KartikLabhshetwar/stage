'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage } from 'react-konva'
import { useEditorStore } from '@/lib/store'
import { useImageStore } from '@/lib/store'
import { useResponsiveCanvasDimensions } from '@/hooks/useAspectRatioDimensions'
import { getBackgroundCSS } from '@/lib/constants/backgrounds'
import { TextOverlayRenderer } from '@/components/image-render/text-overlay-renderer'
import { OverlayRenderer } from '@/components/overlays/overlay-renderer'

// Import new layer components
import { BackgroundLayer, PatternLayer, NoiseLayer, ImageLayer } from './layers'

// Import custom hooks
import {
  useBackgroundImage,
  useNoiseTexture,
  usePatternImage,
  useKonvaNoiseImage,
  useCanvasDimensions,
} from './hooks'

// Import utility functions
import {
  calculateShadowProps,
  build3DTransform,
  has3DTransform,
  calculate3DImagePosition,
} from './utils'

// Global ref to store the Konva stage for export
let globalKonvaStage: any = null

function CanvasRenderer({ image }: { image: HTMLImageElement }) {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Store stage globally for export
  useEffect(() => {
    const updateStage = () => {
      if (stageRef.current) {
        // react-konva Stage ref gives us the Stage instance directly
        globalKonvaStage = stageRef.current
      }
    }

    updateStage()
    // Also check after a short delay to ensure ref is set
    const timeout = setTimeout(updateStage, 100)

    return () => {
      clearTimeout(timeout)
      globalKonvaStage = null
    }
  })

  // Get store values
  const { screenshot, background, shadow, pattern: patternStyle, frame, canvas, noise } = useEditorStore()
  const {
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    perspective3D,
    imageOpacity,
  } = useImageStore()

  const responsiveDimensions = useResponsiveCanvasDimensions()
  const backgroundStyle = getBackgroundCSS(backgroundConfig)

  // Track viewport size for responsive canvas sizing
  const [viewportSize, setViewportSize] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateViewportSize()
    window.addEventListener('resize', updateViewportSize)
    return () => window.removeEventListener('resize', updateViewportSize)
  }, [])

  // Get container dimensions early for use in custom hooks
  const containerWidth = responsiveDimensions.width
  const containerHeight = responsiveDimensions.height

  // Use custom hooks for images and textures
  const bgImage = useBackgroundImage(backgroundConfig, containerWidth, containerHeight)
  const noiseTexture = useNoiseTexture(backgroundNoise)
  const patternImage = usePatternImage(patternStyle)
  const noiseImage = useKonvaNoiseImage(noise)

  // Calculate canvas dimensions using custom hook
  const dimensions = useCanvasDimensions({
    image,
    containerWidth,
    containerHeight,
    canvasPadding: canvas.padding,
    screenshotScale: screenshot.scale,
    viewportSize,
  })

  const { canvasW, canvasH, imageScaledW, imageScaledH } = dimensions

  // Calculate shadow props using utility function
  const shadowProps = calculateShadowProps(shadow)

  // Calculate 3D transform
  const transform3DString = build3DTransform(perspective3D, screenshot.rotation)
  const has3D = has3DTransform(perspective3D)

  // Calculate frame dimensions for ImageLayer
  const showFrame = frame.enabled && frame.type !== 'none'
  const frameOffset =
    showFrame && frame.type === 'solid'
      ? frame.width
      : showFrame && frame.type === 'ruler'
      ? frame.width + 2
      : 0
  const windowPadding = showFrame && frame.type === 'window' ? (frame.padding || 20) : 0
  const windowHeader = showFrame && frame.type === 'window' ? 40 : 0

  // Calculate 3D image position
  const { imageX, imageY } = calculate3DImagePosition(
    canvasW,
    canvasH,
    screenshot.offsetX,
    screenshot.offsetY,
    frameOffset,
    windowPadding,
    windowHeader,
    imageScaledW,
    imageScaledH
  )

  /* ─────────────────── render ─────────────────── */
  return (
    <div
      ref={containerRef}
      id="image-render-card"
      className="flex items-center justify-center relative"
      style={{
        width: '100%',
        maxWidth: `${containerWidth}px`,
        aspectRatio: responsiveDimensions.aspectRatio,
        maxHeight: 'calc(100vh - 200px)',
        backgroundColor: 'transparent',
        padding: '24px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${canvasW}px`,
          height: `${canvasH}px`,
          minWidth: `${canvasW}px`,
          minHeight: `${canvasH}px`,
          overflow: 'hidden',
          borderRadius: `${backgroundBorderRadius}px`,
        }}
      >
        {/* Background Layer (DOM) */}
        <BackgroundLayer
          canvasW={canvasW}
          canvasH={canvasH}
          backgroundStyle={backgroundStyle}
          backgroundBorderRadius={backgroundBorderRadius}
          backgroundBlur={backgroundBlur}
          noiseTexture={noiseTexture}
          backgroundNoise={backgroundNoise}
        />

        {/* Text overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 20,
            overflow: 'hidden',
            borderRadius: `${backgroundBorderRadius}px`,
          }}
        >
          <TextOverlayRenderer />
        </div>

        {/* Image overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 25,
            overflow: 'hidden',
            borderRadius: `${backgroundBorderRadius}px`,
          }}
        >
          <OverlayRenderer />
        </div>

        {/* 3D Transformed Image Overlay - Only when 3D transforms are active */}
        {has3D && (
          <div
            data-3d-overlay="true"
            style={{
              position: 'absolute',
              left: `${imageX}px`,
              top: `${imageY}px`,
              width: `${imageScaledW}px`,
              height: `${imageScaledH}px`,
              perspective: `${perspective3D.perspective}px`,
              transformStyle: 'preserve-3d',
              zIndex: 15,
              pointerEvents: 'none',
            }}
          >
            <img
              src={image.src}
              alt="3D transformed"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageOpacity,
                borderRadius:
                  showFrame && frame.type === 'window'
                    ? '0 0 12px 12px'
                    : showFrame && frame.type === 'ruler'
                    ? `${screenshot.radius * 0.8}px`
                    : `${screenshot.radius}px`,
                transform: transform3DString,
                transformOrigin: 'center center',
                willChange: 'transform',
                transition: 'transform 0.125s linear',
              }}
            />
          </div>
        )}

        {/* Konva Stage - only for user images, frames, patterns, noise */}
        <Stage
          width={canvasW}
          height={canvasH}
          ref={stageRef}
          className="hires-stage"
          style={{
            display: 'block',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Pattern Layer */}
          <PatternLayer
            canvasW={canvasW}
            canvasH={canvasH}
            patternImage={patternImage}
            patternOpacity={patternStyle.opacity}
            patternBlur={patternStyle.blur}
          />

          {/* Konva Noise Layer */}
          <NoiseLayer
            canvasW={canvasW}
            canvasH={canvasH}
            noiseImage={noiseImage}
            noiseOpacity={noise.opacity}
          />

          {/* Image Layer with all frames */}
          <ImageLayer
            image={image}
            canvasW={canvasW}
            canvasH={canvasH}
            screenshot={screenshot}
            frame={frame}
            imageScaledW={imageScaledW}
            imageScaledH={imageScaledH}
            shadowProps={shadowProps}
            imageOpacity={imageOpacity}
            has3DTransform={has3D}
          />
        </Stage>
      </div>
    </div>
  )
}

// Export function to get the Konva stage
export function getKonvaStage(): any {
  return globalKonvaStage
}

export default function ClientCanvas() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const { screenshot, setScreenshot } = useEditorStore()

  useEffect(() => {
    if (!screenshot.src) {
      setImage(null)
      return
    }

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.onerror = () => setScreenshot({ src: null })
    img.src = screenshot.src
  }, [screenshot.src, setScreenshot])

  if (!image) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <CanvasRenderer image={image} />
}
