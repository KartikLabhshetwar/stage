/**
 * Export service for handling image exports
 * Uses html2canvas for backgrounds, Konva for user-uploaded images,
 * and modern-screenshot for 3D perspective transforms
 */

import Konva from 'konva'
import { addWatermarkToCanvas } from './watermark'
import {
  BackgroundExporter,
  KonvaExporter,
  Transform3DExporter,
  CanvasCompositor,
  OverlaysExporter,
} from './strategies'

export interface ExportOptions {
  format: 'png'
  quality: number
  scale: number
  exportWidth: number
  exportHeight: number
}

export interface ExportResult {
  dataURL: string
  blob: Blob
}

/**
 * Export element using hybrid approach: html2canvas for background, Konva for images
 */
export async function exportElement(
  elementId: string,
  options: ExportOptions,
  konvaStage: Konva.Stage | null,
  backgroundConfig: any,
  backgroundBorderRadius: number,
  textOverlays: any[] = [],
  imageOverlays: any[] = [],
  perspective3D?: any,
  imageSrc?: string,
  screenshotRadius?: number,
  backgroundBlur: number = 0,
  backgroundNoise: number = 0
): Promise<ExportResult> {
  // Wait a bit to ensure DOM is ready
  await new Promise((resolve) => setTimeout(resolve, 200))

  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Image render card not found. Please ensure an image is uploaded.')
  }

  if (!konvaStage) {
    throw new Error('Konva stage not found')
  }

  try {
    // Step 1: Export background (no overlays) using BackgroundExporter
    const backgroundExporter = new BackgroundExporter()
    const backgroundCanvas = await backgroundExporter.export({
      width: options.exportWidth,
      height: options.exportHeight,
      scale: options.scale,
      backgroundConfig,
      borderRadius: backgroundBorderRadius,
      blur: backgroundBlur,
      noise: backgroundNoise,
    })

    // Step 2: Export Konva stage (user uploaded image) using KonvaExporter
    const konvaExporter = new KonvaExporter()
    let konvaCanvas = await konvaExporter.export(konvaStage, {
      width: options.exportWidth,
      height: options.exportHeight,
      scale: options.scale,
      format: options.format,
      quality: options.quality,
    })

    // Step 2.5: If 3D transforms are active, capture using Transform3DExporter
    if (perspective3D && imageSrc) {
      const transform3DExporter = new Transform3DExporter()
      konvaCanvas = await transform3DExporter.applyToKonvaCanvas(
        konvaCanvas,
        elementId,
        options.scale,
        perspective3D,
        element,
        options.exportWidth,
        options.exportHeight
      )
    }

    // Step 3: Export text and image overlays separately using OverlaysExporter
    const overlaysExporter = new OverlaysExporter()
    const overlaysCanvas = await overlaysExporter.export({
      width: options.exportWidth,
      height: options.exportHeight,
      scale: options.scale,
      textOverlays,
      imageOverlays,
    })

    // Step 4: Composite all 3 canvases: background -> konva -> overlays
    const compositor = new CanvasCompositor()
    const finalCanvas = compositor.composite(backgroundCanvas, konvaCanvas, overlaysCanvas, {
      width: options.exportWidth,
      height: options.exportHeight,
      scale: options.scale,
    })

    // Step 5: Add watermark
    addWatermarkToCanvas(finalCanvas, {
      text: 'stage',
      position: 'bottom-right',
      backgroundColor: 'transparent',
      textColor: 'rgba(255, 255, 255, 0.7)',
    })

    // Step 6: Convert to blob and data URL
    const mimeType = 'image/png'

    const blob = await new Promise<Blob>((resolve, reject) => {
      finalCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'))
            return
          }
          resolve(blob)
        },
        mimeType,
        options.quality
      )
    })

    const dataURL = finalCanvas.toDataURL(mimeType, options.quality)

    if (!dataURL || dataURL === 'data:,') {
      throw new Error('Failed to generate image data URL')
    }

    return { dataURL, blob }
  } catch (error) {
    throw error
  }
}
