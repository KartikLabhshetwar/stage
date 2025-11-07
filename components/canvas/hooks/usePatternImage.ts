'use client'

import { useEffect, useState } from 'react'
import { generatePattern } from '@/lib/patterns'

interface PatternStyle {
  enabled: boolean
  type: string
  scale: number
  spacing: number
  color: string
  rotation: number
  blur: number
}

/**
 * Custom hook for generating pattern images
 */
export function usePatternImage(patternStyle: PatternStyle): HTMLCanvasElement | null {
  const [patternImage, setPatternImage] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!patternStyle.enabled) {
      setPatternImage(null)
      return
    }

    const newPattern = generatePattern(
      patternStyle.type,
      patternStyle.scale,
      patternStyle.spacing,
      patternStyle.color,
      patternStyle.rotation,
      patternStyle.blur
    )
    setPatternImage(newPattern)
  }, [
    patternStyle.enabled,
    patternStyle.type,
    patternStyle.scale,
    patternStyle.spacing,
    patternStyle.color,
    patternStyle.rotation,
    patternStyle.blur,
  ])

  return patternImage
}
