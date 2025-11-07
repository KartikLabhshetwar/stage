'use client'

import { useEffect, useState } from 'react'
import { generateNoiseTexture } from '@/lib/export/export-utils'

/**
 * Custom hook for generating noise texture
 */
export function useNoiseTexture(backgroundNoise: number): string | null {
  const [noiseTexture, setNoiseTexture] = useState<string | null>(null)

  useEffect(() => {
    if (backgroundNoise > 0) {
      // Generate noise texture using Gaussian distribution for realistic grain
      const intensity = backgroundNoise / 100 // Convert percentage to 0-1 range
      const noiseCanvas = generateNoiseTexture(200, 200, intensity)
      setNoiseTexture(noiseCanvas.toDataURL())
    } else {
      setNoiseTexture(null)
    }
  }, [backgroundNoise])

  return noiseTexture
}
