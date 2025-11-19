'use client'

import { useImageStore } from '@/lib/store'
import { useResponsiveCanvasDimensions } from '@/hooks/useAspectRatioDimensions'

const ARROW_URLS = Array.from({ length: 10 }, (_, i) => 
  `/arrow/arrow-${i + 1}.svg`
)

export function ArrowGallery() {
  const { addImageOverlay } = useImageStore()
  const responsiveDimensions = useResponsiveCanvasDimensions()

  const getDefaultPosition = () => {
    const canvasWidth = responsiveDimensions.width || 1920
    const overlaySize = 150
    return {
      x: Math.max(20, (canvasWidth / 2) - (overlaySize / 2)),
      y: 30,
    }
  }

  const handleAddArrow = (arrowUrl: string) => {
    const defaultPosition = getDefaultPosition()
    addImageOverlay({
      src: arrowUrl,
      position: defaultPosition,
      size: 150,
      rotation: 0,
      opacity: 0.9,
      flipX: false,
      flipY: false,
      isVisible: true,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Arrows</h3>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-h-[50vh] overflow-y-auto pr-2">
        {ARROW_URLS.map((arrowUrl, index) => (
          <button
            key={index}
            onClick={() => handleAddArrow(arrowUrl)}
            className="w-full aspect-square flex items-center justify-center bg-white dark:bg-muted rounded-md p-1 border border-border hover:border-primary transition-colors group"
            title={`Arrow ${index + 1}`}
          >
            <img
              src={arrowUrl}
              alt={`Arrow ${index + 1}`}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              style={{ display: 'block' }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

