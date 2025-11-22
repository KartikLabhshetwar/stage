'use client'

import { useImageStore } from '@/lib/store'
import { useResponsiveCanvasDimensions } from '@/hooks/useAspectRatioDimensions'

const OVERLAY_SHADOW_IDS = [
  '023', '001', '002', '007', '017', '019', '031', '037', '041', '050',
  '053', '057', '063', '064', '082', '083', '088', '097', '099'
]

const OVERLAY_SHADOW_URLS = OVERLAY_SHADOW_IDS.map(
  (id) => `/overlay-shadow/${id}.webp`
)

export function OverlayShadowsGallery() {
  const { addImageOverlay, imageOverlays, removeImageOverlay } = useImageStore()
  const responsiveDimensions = useResponsiveCanvasDimensions()

  const getFullCanvasOverlay = () => {
    const canvasWidth = responsiveDimensions.width || 1920
    const canvasHeight = responsiveDimensions.height || 1080
    return {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      size: Math.max(canvasWidth, canvasHeight),
    }
  }

  const handleAddShadow = (shadowUrl: string) => {
    const { x, y, size } = getFullCanvasOverlay()
    addImageOverlay({
      src: shadowUrl,
      position: { x, y },
      size,
      rotation: 0,
      opacity: 0.5,
      flipX: false,
      flipY: false,
      isVisible: true,
    })
  }

  const handleRemoveShadows = () => {
    imageOverlays.forEach((overlay) => {
      if (typeof overlay.src === 'string' && overlay.src.includes('overlay-shadow')) {
        removeImageOverlay(overlay.id)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Overlay Shadows</h3>
      </div>

      <div className="overflow-x-auto scrollbar-hide p-1.5">
        <div
          className="grid grid-flow-col gap-2 w-max"
          style={{
            gridTemplateRows: 'repeat(2, minmax(2rem, 1fr))',
            gridAutoFlow: 'column dense',
          }}
        >
          <button
            onClick={handleRemoveShadows}
            className="flex items-center justify-center w-16 h-9 text-xs dark:text-gray-500 cursor-pointer hover:scale-105 transition-all duration-200"
          >
            None
          </button>
          {OVERLAY_SHADOW_URLS.map((shadowUrl, index) => (
            <button
              key={index}
              onClick={() => handleAddShadow(shadowUrl)}
              className="block w-16 h-9 shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 rounded-sm bg-gray-300"
              title={`Overlay Shadow ${OVERLAY_SHADOW_IDS[index]}`}
            >
              <img
                src={shadowUrl}
                alt={`OVERLAYS ${index + 1}`}
                className="w-full h-full object-cover rounded-sm"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

