interface Perspective3D {
  perspective: number
  rotateX: number
  rotateY: number
  rotateZ: number
  translateX: number
  translateY: number
  scale: number
}

/**
 * Build CSS 3D transform string for image overlay
 * Includes screenshot rotation to match Konva Group rotation
 */
export function build3DTransform(
  perspective3D: Perspective3D,
  screenshotRotation: number
): string {
  return `
    translate(${perspective3D.translateX}%, ${perspective3D.translateY}%)
    scale(${perspective3D.scale})
    rotateX(${perspective3D.rotateX}deg)
    rotateY(${perspective3D.rotateY}deg)
    rotateZ(${perspective3D.rotateZ + screenshotRotation}deg)
  `
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check if 3D transforms are active (any non-default value)
 */
export function has3DTransform(perspective3D: Perspective3D): boolean {
  return (
    perspective3D.rotateX !== 0 ||
    perspective3D.rotateY !== 0 ||
    perspective3D.rotateZ !== 0 ||
    perspective3D.translateX !== 0 ||
    perspective3D.translateY !== 0 ||
    perspective3D.scale !== 1
  )
}

/**
 * Calculate image position for 3D overlay
 */
export function calculate3DImagePosition(
  canvasW: number,
  canvasH: number,
  screenshotOffsetX: number,
  screenshotOffsetY: number,
  frameOffset: number,
  windowPadding: number,
  windowHeader: number,
  imageScaledW: number,
  imageScaledH: number
): { imageX: number; imageY: number } {
  const groupCenterX = canvasW / 2 + screenshotOffsetX
  const groupCenterY = canvasH / 2 + screenshotOffsetY
  const imageX = groupCenterX + frameOffset + windowPadding - imageScaledW / 2
  const imageY = groupCenterY + frameOffset + windowPadding + windowHeader - imageScaledH / 2

  return { imageX, imageY }
}
