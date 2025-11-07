'use client'

import { useEffect, useState } from 'react'

interface NoiseConfig {
  enabled: boolean
  type: string
}

/**
 * Custom hook for loading Konva noise images from files
 * Note: This is different from the generated noise texture for backgrounds
 */
export function useKonvaNoiseImage(noise: NoiseConfig): HTMLImageElement | null {
  const [noiseImage, setNoiseImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!noise.enabled || noise.type === 'none') {
      setNoiseImage(null)
      return
    }

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setNoiseImage(img)
    img.onerror = () => setNoiseImage(null)
    img.src = `/${noise.type}.jpg`
  }, [noise.enabled, noise.type])

  return noiseImage
}
