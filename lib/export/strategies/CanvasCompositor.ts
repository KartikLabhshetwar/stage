export interface CompositorOptions {
  width: number
  height: number
  scale: number
}

/**
 * CanvasCompositor - Composites multiple canvases into a single final canvas
 */
export class CanvasCompositor {
  /**
   * Composite background and Konva stage into final canvas
   */
  composite(
    backgroundCanvas: HTMLCanvasElement,
    konvaCanvas: HTMLCanvasElement,
    options: CompositorOptions
  ): HTMLCanvasElement {
    const { width, height, scale } = options

    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = width * scale
    finalCanvas.height = height * scale
    const ctx = finalCanvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw background first
    ctx.drawImage(backgroundCanvas, 0, 0, width * scale, height * scale)

    // Draw Konva canvas on top
    ctx.drawImage(konvaCanvas, 0, 0, width * scale, height * scale)

    return finalCanvas
  }
}
