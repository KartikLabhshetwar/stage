'use client'

import { useImageStore } from '@/lib/store'
import { getFontCSS } from '@/lib/constants/fonts'

export const TextOverlayRenderer = () => {
  const { textOverlays } = useImageStore()

  return (
    <>
      {textOverlays.map((overlay) => {
        if (!overlay.isVisible) return null

        const textShadowStyle = overlay.textShadow.enabled
          ? {
              textShadow: `${overlay.textShadow.offsetX}px ${overlay.textShadow.offsetY}px ${overlay.textShadow.blur}px ${overlay.textShadow.color}`,
            }
          : {}

        const writingMode = overlay.orientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb'

        return (
          <div
            key={overlay.id}
            data-text-overlay-id={overlay.id}
            className="absolute pointer-events-none"
            style={{
              left: `${overlay.position.x}%`,
              top: `${overlay.position.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${overlay.fontSize}px`,
              fontWeight: overlay.fontWeight,
              fontFamily: getFontCSS(overlay.fontFamily),
              color: overlay.color,
              opacity: overlay.opacity,
              writingMode: writingMode as any,
              whiteSpace: 'nowrap',
              ...textShadowStyle,
            }}
          >
            {overlay.text}
          </div>
        )
      })}
    </>
  )
}
