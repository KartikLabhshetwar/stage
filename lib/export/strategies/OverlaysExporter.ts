import html2canvas from 'html2canvas'
import { getFontCSS } from '@/lib/constants/fonts'
import { convertStylesToRGB, injectRGBOverrides } from '../export-utils'

export interface OverlaysExportOptions {
  width: number
  height: number
  scale: number
  textOverlays: any[]
  imageOverlays: any[]
}

/**
 * OverlaysExporter - Handles export of text and image overlays using html2canvas
 * Exports overlays on a transparent background so they can be composited on top of the user image
 */
export class OverlaysExporter {
  /**
   * Export text and image overlays as a separate canvas
   */
  async export(options: OverlaysExportOptions): Promise<HTMLCanvasElement | null> {
    const { width, height, scale, textOverlays, imageOverlays } = options

    // Check if there are any visible overlays
    const hasVisibleTextOverlays = textOverlays.some((o) => o.isVisible)
    const hasVisibleImageOverlays = imageOverlays.some((o) => o.isVisible)

    if (!hasVisibleTextOverlays && !hasVisibleImageOverlays) {
      // No overlays to export, return null
      return null
    }

    // Create export container with transparent background
    const container = this.createExportContainer(width, height)
    document.body.appendChild(container)

    try {
      // Get scaling factors
      const { scaleX, scaleY } = this.getScalingFactors(width, height)

      // Add text overlays
      await this.addTextOverlays(container, textOverlays, width, height, scaleX, scaleY)

      // Add image overlays
      await this.addImageOverlays(container, imageOverlays, scaleX, scaleY)

      // Wait for fonts and styles
      await this.waitForFontsAndStyles()

      // Note: OKLCH color conversion happens in captureWithHtml2Canvas's onclone callback

      // Capture with html2canvas
      const canvas = await this.captureWithHtml2Canvas(container, width, height, scale)

      document.body.removeChild(container)

      return canvas
    } catch (error) {
      // Clean up container on error
      if (container.parentNode) {
        document.body.removeChild(container)
      }
      throw error
    }
  }

  private createExportContainer(width: number, height: number): HTMLDivElement {
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-99999px'
    container.style.top = '0'
    container.style.width = `${width}px`
    container.style.height = `${height}px`
    container.style.overflow = 'visible'
    container.style.backgroundColor = 'transparent' // Transparent background for overlays
    return container
  }

  private getScalingFactors(width: number, height: number): { scaleX: number; scaleY: number } {
    // Get display canvas dimensions from DOM
    const displayCanvas = document.querySelector('.hires-stage') as HTMLElement
    if (!displayCanvas) {
      return { scaleX: 1, scaleY: 1 }
    }

    const displayWidth = displayCanvas.offsetWidth
    const displayHeight = displayCanvas.offsetHeight

    return {
      scaleX: width / displayWidth,
      scaleY: height / displayHeight,
    }
  }

  private async addTextOverlays(
    container: HTMLDivElement,
    textOverlays: any[],
    width: number,
    height: number,
    scaleX: number,
    scaleY: number
  ): Promise<void> {
    for (const overlay of textOverlays) {
      if (!overlay.isVisible) continue

      const textElement = document.createElement('div')
      textElement.style.position = 'absolute'
      textElement.style.left = `${(overlay.position.x / 100) * width}px`
      textElement.style.top = `${(overlay.position.y / 100) * height}px`
      textElement.style.transform = 'translate(-50%, -50%)'
      textElement.style.fontSize = `${overlay.fontSize * scaleX}px`
      textElement.style.fontWeight = overlay.fontWeight
      textElement.style.fontFamily = getFontCSS(overlay.fontFamily)
      textElement.style.color = overlay.color // OKLCH conversion handled in html2canvas onclone
      textElement.style.opacity = overlay.opacity.toString()
      textElement.style.whiteSpace = 'nowrap'
      textElement.style.pointerEvents = 'none'
      textElement.style.zIndex = '1000'
      textElement.style.visibility = 'visible'
      textElement.style.display = 'block'
      textElement.textContent = overlay.text

      if (overlay.orientation === 'vertical') {
        textElement.style.writingMode = 'vertical-rl'
      }

      if (overlay.textShadow?.enabled) {
        // OKLCH conversion for shadow color handled in html2canvas onclone
        textElement.style.textShadow = `${overlay.textShadow.offsetX * scaleX}px ${
          overlay.textShadow.offsetY * scaleY
        }px ${overlay.textShadow.blur * scaleX}px ${overlay.textShadow.color}`
      }

      container.appendChild(textElement)
    }
  }

  private async addImageOverlays(
    container: HTMLDivElement,
    imageOverlays: any[],
    scaleX: number,
    scaleY: number
  ): Promise<void> {
    for (const overlay of imageOverlays) {
      if (!overlay.isVisible) {
        continue
      }

      const overlayElement = document.createElement('div')
      overlayElement.style.position = 'absolute'
      overlayElement.style.left = `${overlay.position.x * scaleX}px`
      overlayElement.style.top = `${overlay.position.y * scaleY}px`
      overlayElement.style.width = `${overlay.size * scaleX}px`
      overlayElement.style.height = `${overlay.size * scaleY}px`
      overlayElement.style.opacity = overlay.opacity.toString()
      overlayElement.style.transform = `
        rotate(${overlay.rotation}deg)
        scaleX(${overlay.flipX ? -1 : 1})
        scaleY(${overlay.flipY ? -1 : 1})
      `
      overlayElement.style.transformOrigin = 'center center'
      overlayElement.style.pointerEvents = 'none'
      overlayElement.style.overflow = 'hidden'
      overlayElement.style.zIndex = '1001'
      overlayElement.style.visibility = 'visible'
      overlayElement.style.display = 'block'

      const img = document.createElement('img')
      img.crossOrigin = 'anonymous'
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'contain'
      img.style.display = 'block'

      // Wait for image to load
      try {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            overlayElement.appendChild(img)
            resolve()
          }
          img.onerror = () => {
            reject(new Error(`Failed to load overlay image: ${overlay.src}`))
          }
          img.src = overlay.src
        })

        container.appendChild(overlayElement)
      } catch (error) {
        // Continue with other overlays even if one fails
        console.error('Error loading overlay image:', error)
      }
    }
  }

  private async waitForFontsAndStyles(): Promise<void> {
    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  private async captureWithHtml2Canvas(
    container: HTMLDivElement,
    width: number,
    height: number,
    scale: number
  ): Promise<HTMLCanvasElement> {
    // Force a reflow
    void container.offsetHeight

    // Capture with html2canvas
    const canvas = await html2canvas(container, {
      width: width,
      height: height,
      scale: scale,
      backgroundColor: null, // Transparent background for overlays
      logging: false,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('div') as HTMLElement
        if (!clonedElement) return

        injectRGBOverrides(clonedDoc)

        const clonedElements = clonedElement.querySelectorAll('*')
        clonedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            convertStylesToRGB(el, clonedDoc)
          }
        })
        convertStylesToRGB(clonedElement as HTMLElement, clonedDoc)
      },
    })

    return canvas
  }
}
