import Konva from 'konva'

export interface KonvaExportOptions {
  width: number
  height: number
  scale: number
  format: 'png'
  quality: number
}

/**
 * KonvaExporter - Handles export of Konva stage (excluding background layer)
 */
export class KonvaExporter {
  /**
   * Export Konva stage as canvas
   */
  async export(
    stage: Konva.Stage | null,
    options: KonvaExportOptions
  ): Promise<HTMLCanvasElement> {
    if (!stage) {
      throw new Error('Konva stage not found')
    }

    const { width: targetWidth, height: targetHeight, scale, format, quality } = options

    // Get current stage dimensions (display dimensions)
    const originalWidth = stage.width()
    const originalHeight = stage.height()

    // Get all layers
    const layers = stage.getLayers()

    // Find background layer (first layer typically contains backgrounds)
    const backgroundLayer = layers[0]
    const wasBackgroundVisible = backgroundLayer ? backgroundLayer.visible() : true

    try {
      // Temporarily hide background layer
      if (backgroundLayer) {
        backgroundLayer.visible(false)
      }

      // Calculate scale factor to match export dimensions
      const scaleX = targetWidth / originalWidth
      const scaleY = targetHeight / originalHeight

      // Export Konva stage at its current dimensions with high pixelRatio
      // This preserves exact positioning
      const exportPixelRatio = scale * Math.max(scaleX, scaleY)
      const dataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: quality,
        pixelRatio: exportPixelRatio,
      })

      // Convert data URL to canvas
      const tempCanvas = document.createElement('canvas')
      const tempImg = new Image()
      await new Promise<void>((resolve, reject) => {
        tempImg.onload = () => {
          tempCanvas.width = tempImg.width
          tempCanvas.height = tempImg.height
          const tempCtx = tempCanvas.getContext('2d')
          if (!tempCtx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          tempCtx.drawImage(tempImg, 0, 0)
          resolve()
        }
        tempImg.onerror = reject
        tempImg.src = dataURL
      })

      // Now scale the canvas to match export dimensions
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = targetWidth * scale
      finalCanvas.height = targetHeight * scale
      const ctx = finalCanvas.getContext('2d')

      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Use high-quality image scaling
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw the scaled image
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
        0,
        0,
        targetWidth * scale,
        targetHeight * scale
      )

      return finalCanvas
    } finally {
      // Restore visibility
      if (backgroundLayer) {
        backgroundLayer.visible(wasBackgroundVisible)
      }
      stage.getLayers().forEach((layer) => layer.draw())
    }
  }
}
