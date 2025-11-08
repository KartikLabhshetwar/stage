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
   * Composite background, Konva stage, and overlays into final canvas
   * Layer order: background (lowest) -> konva (user image) -> overlays (highest)
   */
  composite(
    backgroundCanvas: HTMLCanvasElement,
    konvaCanvas: HTMLCanvasElement,
    overlaysCanvas: HTMLCanvasElement | null,
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

    // Layer 1: Draw background first (lowest layer)
    ctx.drawImage(backgroundCanvas, 0, 0, width * scale, height * scale)

    // Layer 2: Draw Konva canvas (user image) on top of background
    ctx.drawImage(konvaCanvas, 0, 0, width * scale, height * scale)

    // Layer 3: Draw overlays on top of user image (highest layer)
    if (overlaysCanvas) {
      ctx.drawImage(overlaysCanvas, 0, 0, width * scale, height * scale)
    }

    return finalCanvas
  }
}
