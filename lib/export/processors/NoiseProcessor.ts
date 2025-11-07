import { generateNoiseTexture } from '../export-utils'

/**
 * NoiseProcessor - Handles noise overlay application to canvas
 */
export class NoiseProcessor {
  /**
   * Extract noise texture from preview element
   * This ensures the exported noise matches the preview exactly
   */
  private static async getNoiseTextureFromPreview(): Promise<HTMLCanvasElement | null> {
    // Find the noise overlay element by ID (most reliable)
    let noiseOverlay = document.getElementById('canvas-noise-overlay') as HTMLElement | null

    // Fallback: try to find it by characteristics if ID doesn't exist
    if (!noiseOverlay) {
      const canvasBackground = document.getElementById('canvas-background')
      if (!canvasBackground) return null

      const parent = canvasBackground.parentElement
      if (!parent) return null

      // Look for the noise overlay div - it has:
      // - backgroundImage with a data URL
      // - mixBlendMode: 'overlay'
      // - pointerEvents: 'none'
      const found = Array.from(parent.children).find((child) => {
        if (child instanceof HTMLElement) {
          const style = window.getComputedStyle(child)
          const bgImage = style.backgroundImage
          const mixBlendMode = style.mixBlendMode
          const pointerEvents = style.pointerEvents

          // Match the noise overlay characteristics
          return (
            bgImage &&
            bgImage.includes('data:image') &&
            bgImage.includes('base64') &&
            mixBlendMode === 'overlay' &&
            pointerEvents === 'none'
          )
        }
        return false
      }) as HTMLElement | undefined

      if (!found) return null
      noiseOverlay = found
    }

    if (!noiseOverlay) return null

    // Extract the data URL from the background image
    const style = window.getComputedStyle(noiseOverlay)
    const bgImage = style.backgroundImage
    const urlMatch = bgImage.match(/url\(['"]?(.+?)['"]?\)/)

    if (!urlMatch || !urlMatch[1]) return null

    const dataURL = urlMatch[1]

    // Convert data URL to canvas
    return new Promise<HTMLCanvasElement | null>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve(canvas)
        } else {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = dataURL
    })
  }

  /**
   * Apply noise overlay to a canvas
   * The noise is composited on top of the existing canvas content
   * Matches preview exactly: same texture size, opacity, and blend mode
   */
  static async apply(
    canvas: HTMLCanvasElement,
    noiseIntensity: number,
    width: number,
    height: number,
    scale: number
  ): Promise<HTMLCanvasElement> {
    if (noiseIntensity <= 0) {
      return canvas
    }

    // Use the actual canvas dimensions (html2canvas may have scaled it)
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = canvasWidth
    finalCanvas.height = canvasHeight
    const ctx = finalCanvas.getContext('2d')

    if (!ctx) {
      return canvas
    }

    // Draw the existing canvas first (this includes the blurred background)
    ctx.drawImage(canvas, 0, 0)

    // Try to extract the noise texture from the preview element first
    // This ensures we use the exact same noise pattern the user sees
    let noiseCanvas: HTMLCanvasElement | null = null

    const previewNoiseTexture = await this.getNoiseTextureFromPreview()
    if (previewNoiseTexture) {
      noiseCanvas = previewNoiseTexture
    } else {
      // Fallback: Generate noise texture if we can't extract from preview
      // This should rarely happen, but ensures export still works
      noiseCanvas = generateNoiseTexture(200, 200, noiseIntensity)
    }

    // Apply noise with overlay blend mode (matching preview's mix-blend-mode: overlay)
    // Use the exact same opacity calculation as preview: backgroundNoise / 100
    ctx.save()
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = noiseIntensity // This matches preview's opacity: backgroundNoise / 100

    // Tile the noise texture across the canvas
    // Use imageSmoothingEnabled: false to preserve noise grain sharpness
    ctx.imageSmoothingEnabled = false
    const pattern = ctx.createPattern(noiseCanvas, 'repeat')
    if (pattern) {
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    }
    ctx.imageSmoothingEnabled = true // Restore for future operations

    ctx.restore()

    return finalCanvas
  }
}
