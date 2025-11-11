/**
 * Watermark utility for adding watermarks to exported images
 */

export interface WatermarkOptions {
  text?: string
  fontSize?: number
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  opacity?: number
  backgroundColor?: string
  textColor?: string
}

const DEFAULT_OPTIONS: Required<WatermarkOptions> = {
  text: 'stagee.art',
  fontSize: 0, // Will be calculated based on canvas size
  position: 'bottom-right',
  opacity: 0.7,
  backgroundColor: 'transparent', // No background
  textColor: 'rgba(255, 255, 255, 0.7)', // Lightened text
}

/**
 * Add watermark to canvas element
 */
export function addWatermarkToCanvas(
  canvas: HTMLCanvasElement,
  options: WatermarkOptions = {}
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.error('Failed to get 2d context for watermark')
    return
  }

  const width = canvas.width
  const height = canvas.height

  // Validate canvas dimensions
  if (width === 0 || height === 0) {
    console.error('Canvas has invalid dimensions:', { width, height })
    return
  }

  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Calculate font size based on canvas dimensions
  const minDimension = Math.min(width, height)
  const fontSize = opts.fontSize || Math.max(24, Math.min(minDimension * 0.04, 48))
  const text = opts.text

  // Set up font
  ctx.save()
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'

  const textMetrics = ctx.measureText(text)
  const textWidth = textMetrics.width
  const textHeight = fontSize

  // Calculate position based on option with proper padding
  // Use larger padding to ensure watermark is fully visible
  const edgePadding = Math.max(fontSize * 2, 32) // Minimum 32px or 2x font size

  let x: number, y: number

  switch (opts.position) {
    case 'bottom-left':
      x = edgePadding
      y = height - edgePadding
      break
    case 'top-right':
      x = width - textWidth - edgePadding
      y = fontSize + edgePadding
      break
    case 'top-left':
      x = edgePadding
      y = fontSize + edgePadding
      break
    case 'bottom-right':
    default:
      // Position from right edge with padding
      x = width - textWidth - edgePadding
      // Position from bottom edge with padding
      y = height - edgePadding
      break
  }

  // Ensure within bounds - ensure text is fully visible
  x = Math.max(edgePadding, Math.min(x, width - textWidth - edgePadding))
  y = Math.max(fontSize + edgePadding, Math.min(y, height - edgePadding))

  // Draw text only (no background) - lightened color
  ctx.fillStyle = opts.textColor || 'rgba(255, 255, 255, 0.7)'
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(text, x, y)

  ctx.restore()

  console.log('Watermark added:', {
    canvasSize: { width, height },
    watermarkPosition: { x, y },
    fontSize,
    textWidth,
    textHeight,
    text,
  })
}

/**
 * Create watermark DOM element to be added before html2canvas capture
 */
export function createWatermarkElement(
  container: HTMLElement,
  options: WatermarkOptions = {},
  doc: Document = document
): HTMLElement {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Calculate font size based on container dimensions
  // For cloned documents, use style width/height if available
  let fontSize = opts.fontSize
  if (!fontSize) {
    try {
      const rect = container.getBoundingClientRect()
      const minDimension = Math.min(
        rect.width || parseInt(container.style.width) || 800,
        rect.height || parseInt(container.style.height) || 600
      )
      fontSize = Math.max(24, Math.min(minDimension * 0.04, 48))
    } catch {
      // Fallback if getBoundingClientRect fails (e.g., in cloned doc)
      fontSize = 32 // Default size
    }
  }

  const watermark = doc.createElement('div')
  watermark.id = 'export-watermark'

  // Calculate proper padding from edges (minimum 32px or 2x font size)
  const edgePadding = Math.max(fontSize * 2, 32)

  // Set styles individually for better compatibility - no background, lightened text
  watermark.style.position = 'absolute'
  watermark.style.padding = '0'
  watermark.style.backgroundColor = 'transparent'
  watermark.style.color = opts.textColor || 'rgba(255, 255, 255, 0.7)'
  watermark.style.fontSize = `${fontSize}px`
  watermark.style.fontWeight = 'normal'
  watermark.style.fontFamily = 'system-ui, -apple-system, sans-serif'
  watermark.style.borderRadius = '0'
  watermark.style.zIndex = '9999'
  watermark.style.pointerEvents = 'none'
  watermark.style.userSelect = 'none'
  watermark.style.opacity = String(opts.opacity || 0.7)
  watermark.style.whiteSpace = 'nowrap'

  // Position with proper padding from edges
  if (opts.position === 'bottom-right') {
    watermark.style.bottom = `${edgePadding}px`
    watermark.style.right = `${edgePadding}px`
  } else if (opts.position === 'bottom-left') {
    watermark.style.bottom = `${edgePadding}px`
    watermark.style.left = `${edgePadding}px`
  } else if (opts.position === 'top-right') {
    watermark.style.top = `${edgePadding}px`
    watermark.style.right = `${edgePadding}px`
  } else if (opts.position === 'top-left') {
    watermark.style.top = `${edgePadding}px`
    watermark.style.left = `${edgePadding}px`
  }

  watermark.textContent = opts.text

  return watermark
}

/**
 * Add watermark to DOM element before export
 */
export function addWatermarkToElement(
  element: HTMLElement,
  options: WatermarkOptions = {}
): () => void {
  // Check if watermark already exists
  const existingWatermark = element.querySelector('#export-watermark')
  if (existingWatermark) {
    existingWatermark.remove()
  }

  // Make sure element has position relative or absolute
  const computedStyle = window.getComputedStyle(element)
  if (computedStyle.position === 'static') {
    element.style.position = 'relative'
  }

  // Create and add watermark
  const watermark = createWatermarkElement(element, options)
  element.appendChild(watermark)

  // Return cleanup function
  return () => {
    watermark.remove()
  }
}
