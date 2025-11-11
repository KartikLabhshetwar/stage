import type { Template } from '@/types/canvas'
import Konva from 'konva'

/**
 * Apply a template background to a canvas context
 */
export async function applyTemplateBackground(
  stage: Konva.Stage | null,
  layer: Konva.Layer | null,
  template: Template
): Promise<void> {
  if (!stage || !layer) return

  const { background } = template

  switch (background.type) {
    case 'solid':
      // Set stage background color via CSS or add a background rect
      const bgRect = layer.findOne('#background-rect')
      if (bgRect) {
        bgRect.destroy()
      }

      const rect = new Konva.Rect({
        id: 'background-rect',
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: background.color || '#ffffff',
        listening: false,
      })
      layer.add(rect)
      rect.moveToBottom()
      layer.batchDraw()
      break

    case 'gradient':
      if (background.gradient) {
        const bgRect2 = layer.findOne('#background-rect')
        if (bgRect2) {
          bgRect2.destroy()
        }

        const gradientColors = background.gradient.colors
        let gradient

        if (background.gradient.type === 'linear') {
          gradient = {
            start: { x: 0, y: 0 },
            end: { x: stage.width(), y: stage.height() },
            colorStops: gradientColors.map((color, index) => ({
              offset: index / (gradientColors.length - 1),
              color,
            })),
          }
        } else {
          // radial
          const centerX = stage.width() / 2
          const centerY = stage.height() / 2
          const radius = Math.max(stage.width(), stage.height()) / 2
          gradient = {
            start: { x: centerX, y: centerY },
            end: { x: centerX + radius, y: centerY },
            colorStops: gradientColors.map((color, index) => ({
              offset: index / (gradientColors.length - 1),
              color,
            })),
          }
        }

        const gradientRect = new Konva.Rect({
          id: 'background-rect',
          x: 0,
          y: 0,
          width: stage.width(),
          height: stage.height(),
          fillLinearGradientColorStops:
            background.gradient.type === 'linear'
              ? gradientColors.flatMap((color, i) => [i / (gradientColors.length - 1), color])
              : undefined,
          fillRadialGradientColorStops:
            background.gradient.type === 'radial'
              ? gradientColors.flatMap((color, i) => [i / (gradientColors.length - 1), color])
              : undefined,
          fillRadialGradientStartPoint:
            background.gradient.type === 'radial'
              ? { x: stage.width() / 2, y: stage.height() / 2 }
              : undefined,
          fillRadialGradientStartRadius: background.gradient.type === 'radial' ? 0 : undefined,
          fillRadialGradientEndPoint:
            background.gradient.type === 'radial'
              ? { x: stage.width() / 2, y: stage.height() / 2 }
              : undefined,
          fillRadialGradientEndRadius:
            background.gradient.type === 'radial'
              ? Math.max(stage.width(), stage.height()) / 2
              : undefined,
          listening: false,
        })

        // For linear gradient, use fillLinearGradientColorStops
        if (background.gradient.type === 'linear') {
          const colorStops: (number | string)[] = []
          gradientColors.forEach((color, index) => {
            colorStops.push(index / Math.max(1, gradientColors.length - 1))
            colorStops.push(color)
          })
          gradientRect.fillLinearGradientColorStops(colorStops)
          gradientRect.fillLinearGradientStartPoint({ x: 0, y: 0 })
          gradientRect.fillLinearGradientEndPoint({ x: stage.width(), y: stage.height() })
        } else {
          // radial
          const colorStops: (number | string)[] = []
          gradientColors.forEach((color, index) => {
            colorStops.push(index / Math.max(1, gradientColors.length - 1))
            colorStops.push(color)
          })
          gradientRect.fillRadialGradientColorStops(colorStops)
          gradientRect.fillRadialGradientStartPoint({ x: stage.width() / 2, y: stage.height() / 2 })
          gradientRect.fillRadialGradientStartRadius(0)
          gradientRect.fillRadialGradientEndPoint({ x: stage.width() / 2, y: stage.height() / 2 })
          gradientRect.fillRadialGradientEndRadius(Math.max(stage.width(), stage.height()) / 2)
        }

        layer.add(gradientRect)
        gradientRect.moveToBottom()
        layer.batchDraw()
      }
      break

    case 'shapes':
      // First set base color
      const bgRect3 = layer.findOne('#background-rect')
      if (bgRect3) {
        bgRect3.destroy()
      }

      const baseRect = new Konva.Rect({
        id: 'background-rect',
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: background.color || '#ffffff',
        listening: false,
      })
      layer.add(baseRect)
      baseRect.moveToBottom()

      // Then add shapes as canvas objects
      if (background.shapes) {
        background.shapes.forEach((shape) => {
          let konvaShape: Konva.Shape | null = null

          if (shape.type === 'circle') {
            konvaShape = new Konva.Circle({
              x: shape.x,
              y: shape.y,
              radius: shape.width / 2,
              fill: shape.color,
              opacity: shape.opacity ?? 1,
              listening: false,
            })
          } else if (shape.type === 'rect') {
            konvaShape = new Konva.Rect({
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height,
              fill: shape.color,
              opacity: shape.opacity ?? 1,
              listening: false,
            })
          }

          if (konvaShape) {
            layer.add(konvaShape)
            konvaShape.moveToBottom()
          }
        })
        layer.batchDraw()
      }
      break

    default:
      const defaultRect = layer.findOne('#background-rect')
      if (defaultRect) {
        defaultRect.destroy()
      }

      const rect2 = new Konva.Rect({
        id: 'background-rect',
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: '#ffffff',
        listening: false,
      })
      layer.add(rect2)
      rect2.moveToBottom()
      layer.batchDraw()
  }
}
