/**
 * BlurProcessor - Applies blur effect to canvas
 */
export class BlurProcessor {
  /**
   * Apply blur effect to a canvas using Canvas 2D context filter
   * This is more reliable than relying on html2canvas to capture CSS filters
   */
  static apply(canvas: HTMLCanvasElement, blurAmount: number): HTMLCanvasElement {
    if (blurAmount <= 0) {
      return canvas
    }

    const blurredCanvas = document.createElement('canvas')
    blurredCanvas.width = canvas.width
    blurredCanvas.height = canvas.height
    const ctx = blurredCanvas.getContext('2d')

    if (!ctx) {
      return canvas
    }

    // Apply blur filter using Canvas 2D context
    // This is the most reliable way to ensure blur is captured in exports
    ctx.filter = `blur(${blurAmount}px)`
    ctx.drawImage(canvas, 0, 0)
    ctx.filter = 'none'

    return blurredCanvas
  }
}
