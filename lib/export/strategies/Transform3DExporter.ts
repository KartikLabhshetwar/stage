import { domToCanvas } from 'modern-screenshot'

/**
 * Transform3DExporter - Captures 3D transformed elements using modern-screenshot
 */
export class Transform3DExporter {
  /**
   * Capture 3D transformed element
   */
  async capture(elementId: string, scale: number): Promise<HTMLCanvasElement> {
    // Find the 3D overlay element
    const container = document.getElementById(elementId)
    if (!container) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    const overlayElement = container.querySelector('[data-3d-overlay="true"]') as HTMLElement
    if (!overlayElement) {
      throw new Error('3D overlay element not found')
    }

    // Get the bounding box of the overlay element
    const rect = overlayElement.getBoundingClientRect()
    const overlayComputedStyle = window.getComputedStyle(overlayElement)

    // Create a temporary container for capture
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.width = `${rect.width}px`
    tempContainer.style.height = `${rect.height}px`
    tempContainer.style.overflow = 'visible'

    // Clone the overlay element with all its styles
    const clonedOverlay = overlayElement.cloneNode(true) as HTMLElement

    // Preserve all computed styles
    clonedOverlay.style.position = 'relative'
    clonedOverlay.style.left = '0'
    clonedOverlay.style.top = '0'
    clonedOverlay.style.width = overlayComputedStyle.width
    clonedOverlay.style.height = overlayComputedStyle.height
    clonedOverlay.style.perspective = overlayComputedStyle.perspective
    clonedOverlay.style.transformStyle = overlayComputedStyle.transformStyle

    // Clone the image inside with all its transform styles
    const originalImg = overlayElement.querySelector('img')
    if (originalImg) {
      const clonedImg = originalImg.cloneNode(true) as HTMLImageElement
      const imgComputedStyle = window.getComputedStyle(originalImg)

      // Preserve all image styles including the 3D transform
      clonedImg.style.width = imgComputedStyle.width
      clonedImg.style.height = imgComputedStyle.height
      clonedImg.style.objectFit = imgComputedStyle.objectFit
      clonedImg.style.opacity = imgComputedStyle.opacity
      clonedImg.style.borderRadius = imgComputedStyle.borderRadius
      clonedImg.style.transform = imgComputedStyle.transform
      clonedImg.style.transformOrigin = imgComputedStyle.transformOrigin
      clonedImg.style.willChange = imgComputedStyle.willChange

      // Clear and add the cloned image
      clonedOverlay.innerHTML = ''
      clonedOverlay.appendChild(clonedImg)
    }

    tempContainer.appendChild(clonedOverlay)
    document.body.appendChild(tempContainer)

    try {
      // Wait for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Use modern-screenshot to capture the 3D transformed element
      const canvas = await domToCanvas(clonedOverlay, {
        width: rect.width * scale,
        height: rect.height * scale,
      })

      return canvas
    } finally {
      // Clean up
      document.body.removeChild(tempContainer)
    }
  }

  /**
   * Apply 3D transformed canvas to Konva canvas
   */
  async applyToKonvaCanvas(
    konvaCanvas: HTMLCanvasElement,
    elementId: string,
    scale: number,
    perspective3D: any,
    element: HTMLElement,
    exportWidth: number,
    exportHeight: number
  ): Promise<HTMLCanvasElement> {
    const has3DTransform =
      perspective3D.rotateX !== 0 ||
      perspective3D.rotateY !== 0 ||
      perspective3D.rotateZ !== 0 ||
      perspective3D.translateX !== 0 ||
      perspective3D.translateY !== 0 ||
      perspective3D.scale !== 1

    if (!has3DTransform) {
      return konvaCanvas
    }

    try {
      // Find the 3D transformed image overlay
      const overlayContainer = element.querySelector('[data-3d-overlay="true"]') as HTMLElement

      if (!overlayContainer) {
        return konvaCanvas
      }

      // Get dimensions
      const overlayRect = overlayContainer.getBoundingClientRect()
      const innerContainer = element.querySelector('div[style*="position: relative"]') as HTMLElement

      if (!innerContainer) {
        return konvaCanvas
      }

      const innerRect = innerContainer.getBoundingClientRect()

      // Capture 3D transform
      const transformedCanvas = await this.capture(elementId, scale)

      // Calculate position relative to inner container
      const relativeX = overlayRect.left - innerRect.left
      const relativeY = overlayRect.top - innerRect.top

      // Scale to export dimensions
      const scaleX = (exportWidth * scale) / innerRect.width
      const scaleY = (exportHeight * scale) / innerRect.height

      const scaledX = relativeX * scaleX
      const scaledY = relativeY * scaleY
      const scaledWidth = transformedCanvas.width
      const scaledHeight = transformedCanvas.height

      // Composite the transformed canvas onto the Konva canvas
      const compositeCtx = konvaCanvas.getContext('2d')
      if (compositeCtx && transformedCanvas.width > 0 && transformedCanvas.height > 0) {
        compositeCtx.imageSmoothingEnabled = true
        compositeCtx.imageSmoothingQuality = 'high'
        compositeCtx.save()
        compositeCtx.drawImage(
          transformedCanvas,
          0,
          0,
          transformedCanvas.width,
          transformedCanvas.height,
          scaledX,
          scaledY,
          scaledWidth,
          scaledHeight
        )
        compositeCtx.restore()
      }

      return konvaCanvas
    } catch (error) {
      // Fallback to original canvas if 3D capture fails
      return konvaCanvas
    }
  }
}
