import html2canvas from 'html2canvas'
import { getBackgroundCSS } from '@/lib/constants/backgrounds'
import { getFontCSS } from '@/lib/constants/fonts'
import { BlurProcessor, NoiseProcessor } from '../processors'
import { convertStylesToRGB, injectRGBOverrides } from '../export-utils'

export interface BackgroundExportOptions {
  width: number
  height: number
  scale: number
  backgroundConfig: any
  borderRadius: number
  textOverlays: any[]
  imageOverlays: any[]
  blur: number
  noise: number
}

/**
 * BackgroundExporter - Handles export of background, text overlays, and image overlays using html2canvas
 */
export class BackgroundExporter {
  /**
   * Export background with text and image overlays
   */
  async export(options: BackgroundExportOptions): Promise<HTMLCanvasElement> {
    const {
      width,
      height,
      scale,
      backgroundConfig,
      borderRadius,
      textOverlays,
      imageOverlays,
      blur: backgroundBlur,
      noise: backgroundNoise,
    } = options

    // Get the existing canvas-background element from the DOM - required for export
    const existingBgElement = document.getElementById('canvas-background')

    if (!existingBgElement) {
      throw new Error('Canvas background element not found. Please ensure the canvas is properly initialized.')
    }

    // Create export container
    const container = this.createExportContainer(width, height)
    document.body.appendChild(container)

    try {
      // Clone and setup background element
      const bgElement = this.setupBackgroundElement(existingBgElement, width, height, backgroundBlur)
      container.appendChild(bgElement)

      // Get scaling factors
      const { scaleX, scaleY } = this.getScalingFactors(width, height)

      // Add text overlays
      await this.addTextOverlays(container, textOverlays, width, height, scaleX, scaleY)

      // Add image overlays
      await this.addImageOverlays(container, imageOverlays, scaleX, scaleY)

      // Wait for background image to load if needed
      await this.waitForBackgroundImage(backgroundConfig)

      // Convert oklch colors
      this.convertOklchColors(container)

      // Wait for fonts and styles
      await this.waitForFontsAndStyles()

      // Capture with html2canvas
      const canvas = await this.captureWithHtml2Canvas(
        container,
        width,
        height,
        scale,
        backgroundBlur
      )

      document.body.removeChild(container)

      // Apply blur and noise
      return await this.applyEffects(canvas, backgroundBlur, backgroundNoise, width, height, scale)
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
    container.style.isolation = 'isolate'
    container.style.background = 'transparent'
    container.style.zIndex = '999999'
    container.style.visibility = 'visible'
    container.style.opacity = '1'
    return container
  }

  private setupBackgroundElement(
    existingBgElement: HTMLElement,
    width: number,
    height: number,
    backgroundBlur: number
  ): HTMLElement {
    const bgElement = existingBgElement.cloneNode(true) as HTMLElement
    bgElement.style.width = `${width}px`
    bgElement.style.height = `${height}px`
    bgElement.style.position = 'absolute'
    bgElement.style.top = '0'
    bgElement.style.left = '0'
    bgElement.id = 'export-background-temp'

    // Remove blur from CSS - we'll apply it via canvas after capture
    bgElement.style.setProperty('filter', 'none', 'important')

    return bgElement
  }

  private getScalingFactors(width: number, height: number): { scaleX: number; scaleY: number } {
    const canvasContainer = document.getElementById('image-render-card')
    if (!canvasContainer) {
      throw new Error('Canvas container not found.')
    }

    const canvasRect = canvasContainer.getBoundingClientRect()
    let scaleX = 1
    let scaleY = 1
    if (canvasRect.width > 0 && canvasRect.height > 0) {
      scaleX = width / canvasRect.width
      scaleY = height / canvasRect.height
    }

    return { scaleX, scaleY }
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

      // Convert oklch color
      let textColor = overlay.color
      if (textColor && textColor.includes('oklch')) {
        textColor = this.convertOklchColor(textColor)
      }
      textElement.style.color = textColor

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
        let shadowColor = overlay.textShadow.color
        if (shadowColor && shadowColor.includes('oklch')) {
          shadowColor = this.convertOklchColor(shadowColor)
        }
        textElement.style.textShadow = `${overlay.textShadow.offsetX * scaleX}px ${
          overlay.textShadow.offsetY * scaleY
        }px ${overlay.textShadow.blur * scaleX}px ${shadowColor}`
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
    console.log('[BackgroundExporter] Adding image overlays:', {
      total: imageOverlays.length,
      visible: imageOverlays.filter(o => o.isVisible).length,
    })

    for (const overlay of imageOverlays) {
      if (!overlay.isVisible) {
        console.log('[BackgroundExporter] Skipping invisible overlay:', overlay.id)
        continue
      }

      console.log('[BackgroundExporter] Adding overlay:', {
        id: overlay.id,
        src: overlay.src?.substring(0, 50) + '...',
        position: overlay.position,
        size: overlay.size,
      })

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
            console.log('[BackgroundExporter] Overlay image loaded successfully:', overlay.id)
            overlayElement.appendChild(img)
            resolve()
          }
          img.onerror = (error) => {
            console.error('[BackgroundExporter] Failed to load overlay image:', {
              id: overlay.id,
              src: overlay.src,
              error,
            })
            reject(new Error(`Failed to load overlay image: ${overlay.src}`))
          }
          img.src = overlay.src
        })

        container.appendChild(overlayElement)
        console.log('[BackgroundExporter] Overlay added to container:', overlay.id)
      } catch (error) {
        console.error('[BackgroundExporter] Error adding overlay:', error)
        // Continue with other overlays even if one fails
      }
    }
  }

  private async waitForBackgroundImage(backgroundConfig: any): Promise<void> {
    if (backgroundConfig.type === 'image' && backgroundConfig.value) {
      await new Promise<void>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          setTimeout(() => resolve(), 100)
        }
        img.onerror = () => resolve()
        const bgStyle = getBackgroundCSS(backgroundConfig)
        if (bgStyle.backgroundImage) {
          const urlMatch = bgStyle.backgroundImage.match(/url\(['"]?(.+?)['"]?\)/)
          if (urlMatch && urlMatch[1]) {
            img.src = urlMatch[1]
          } else {
            resolve()
          }
        } else {
          resolve()
        }
      })
    }
  }

  private convertOklchColors(container: HTMLDivElement): void {
    const allElements = container.querySelectorAll('*')
    allElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const computedStyle = window.getComputedStyle(el)
        const styleProps = ['color', 'backgroundColor', 'background', 'backgroundImage', 'textShadow']

        styleProps.forEach((prop) => {
          try {
            const value = (computedStyle as any)[prop]
            if (value && typeof value === 'string' && value.includes('oklch')) {
              const computed = window.getComputedStyle(el).getPropertyValue(prop)
              if (computed && !computed.includes('oklch')) {
                ;(el.style as any)[prop] = computed
              }
            }
          } catch (e) {
            // Ignore errors
          }
        })
      }
    })
  }

  private convertOklchColor(color: string): string {
    const tempEl = document.createElement('div')
    tempEl.style.color = color
    document.body.appendChild(tempEl)
    const computed = window.getComputedStyle(tempEl).color
    document.body.removeChild(tempEl)
    return computed || color
  }

  private async waitForFontsAndStyles(): Promise<void> {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  private async captureWithHtml2Canvas(
    container: HTMLDivElement,
    width: number,
    height: number,
    scale: number,
    backgroundBlur: number
  ): Promise<HTMLCanvasElement> {
    // Force a reflow
    void container.offsetHeight

    return await html2canvas(container, {
      backgroundColor: null,
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: width,
      height: height,
      windowWidth: width,
      windowHeight: height,
      removeContainer: false,
      ignoreElements: (element) => {
        return element.id === 'export-noise-overlay' || element.id === 'canvas-noise-overlay'
      },
      onclone: (clonedDoc, clonedElement) => {
        try {
          const stylesheets = Array.from(clonedDoc.styleSheets)
          stylesheets.forEach((sheet) => {
            try {
              if (sheet.href && (sheet.href.includes('globals.css') || sheet.href.includes('tailwind'))) {
                ;(sheet as any).disabled = true
              }
            } catch (e) {
              // Ignore cross-origin errors
            }
          })
        } catch (e) {
          // Ignore errors
        }

        injectRGBOverrides(clonedDoc)

        const clonedBgElement = clonedElement.querySelector('#export-background-temp') as HTMLElement
        if (clonedBgElement) {
          if (backgroundBlur > 0) {
            clonedBgElement.style.setProperty('filter', `blur(${backgroundBlur}px)`, 'important')
          } else {
            clonedBgElement.style.setProperty('filter', 'none', 'important')
          }
        }

        const clonedElements = clonedElement.querySelectorAll('*')
        clonedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            convertStylesToRGB(el, clonedDoc)
          }
        })
        convertStylesToRGB(clonedElement as HTMLElement, clonedDoc)
      },
    })
  }

  private async applyEffects(
    canvas: HTMLCanvasElement,
    backgroundBlur: number,
    backgroundNoise: number,
    width: number,
    height: number,
    scale: number
  ): Promise<HTMLCanvasElement> {
    // Step 1: Apply blur
    const blurredCanvas = backgroundBlur > 0 ? BlurProcessor.apply(canvas, backgroundBlur * scale) : canvas

    // Step 2: Apply noise
    if (backgroundNoise > 0) {
      const noiseIntensity = backgroundNoise / 100
      return await NoiseProcessor.apply(blurredCanvas, noiseIntensity, width, height, scale)
    }

    return blurredCanvas
  }
}
