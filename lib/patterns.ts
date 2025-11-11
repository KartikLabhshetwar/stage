export function generatePattern(
  type: string,
  scale: number = 1,
  spacing: number = 20,
  color: string = '#000000',
  rotation: number = 0,
  blur: number = 0
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const size = 100 * scale
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  if (!ctx) return canvas

  ctx.save()
  ctx.translate(size / 2, size / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-size / 2, -size / 2)

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 1

  switch (type) {
    case 'grid':
      for (let i = 0; i <= size; i += spacing) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, size)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(size, i)
        ctx.stroke()
      }
      break
    case 'dots':
      for (let x = spacing / 2; x < size; x += spacing) {
        for (let y = spacing / 2; y < size; y += spacing) {
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break
    case 'lines':
      for (let i = 0; i <= size; i += spacing) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, size)
        ctx.stroke()
      }
      break
    default:
      // Default to grid
      for (let i = 0; i <= size; i += spacing) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, size)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(size, i)
        ctx.stroke()
      }
  }

  ctx.restore()

  if (blur > 0) {
    ctx.filter = `blur(${blur}px)`
    const imageData = ctx.getImageData(0, 0, size, size)
    ctx.putImageData(imageData, 0, 0)
    ctx.filter = 'none'
  }

  return canvas
}
