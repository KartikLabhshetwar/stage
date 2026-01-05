'use client'

import { useEffect } from 'react'
import { useImageStore, useEditorStore } from '@/lib/store'
import { gradientColors } from '@/lib/constants/gradient-colors'
import { solidColors } from '@/lib/constants/solid-colors'
import { GradientKey } from '@/lib/constants/gradient-colors'
import { AspectRatioKey } from '@/lib/constants/aspect-ratios'

// Helper function to parse gradient string and extract colors
function parseGradientColors(gradientStr: string): { colorA: string; colorB: string; direction: number } {
  let colorA = '#4168d0'
  let colorB = '#c850c0'
  let direction = 43

  try {
    const angleMatch = gradientStr.match(/linear-gradient\((\d+)deg/)
    if (angleMatch) {
      direction = parseInt(angleMatch[1], 10)
    }

    const rgbMatches = gradientStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)
    if (rgbMatches && rgbMatches.length >= 2) {
      colorA = rgbMatches[0]
      colorB = rgbMatches[rgbMatches.length - 1]
    } else {
      const hexMatches = gradientStr.match(/#[0-9A-Fa-f]{6}/g)
      if (hexMatches && hexMatches.length >= 2) {
        colorA = hexMatches[0]
        colorB = hexMatches[hexMatches.length - 1]
      }
    }
  } catch (e) {
    // Use defaults
  }

  return { colorA, colorB, direction }
}

export function EditorStoreSync() {
  const imageStore = useImageStore()
  const editorStore = useEditorStore()

  useEffect(() => {
    // Sync screenshot src
    if (imageStore.uploadedImageUrl !== editorStore.screenshot.src) {
      editorStore.setScreenshot({ src: imageStore.uploadedImageUrl })
    }

    // Sync screenshot scale
    const scale = imageStore.imageScale / 100
    if (scale !== editorStore.screenshot.scale) {
      editorStore.setScreenshot({ scale })
    }

    // Sync screenshot radius
    if (imageStore.borderRadius !== editorStore.screenshot.radius) {
      editorStore.setScreenshot({ radius: imageStore.borderRadius })
    }

    // Sync background
    const bgConfig = imageStore.backgroundConfig
    if (bgConfig.type === 'gradient') {
      const gradientStr = gradientColors[bgConfig.value as GradientKey] || gradientColors.vibrant_orange_pink
      const { colorA, colorB, direction } = parseGradientColors(gradientStr)
      if (
        editorStore.background.mode !== 'gradient' ||
        editorStore.background.colorA !== colorA ||
        editorStore.background.colorB !== colorB ||
        editorStore.background.gradientDirection !== direction
      ) {
        editorStore.setBackground({
          mode: 'gradient',
          colorA,
          colorB,
          gradientDirection: direction,
        })
      }
    } else if (bgConfig.type === 'solid') {
      const color = (solidColors as Record<string, string>)[bgConfig.value as string] || '#ffffff'
      if (editorStore.background.mode !== 'solid' || editorStore.background.colorA !== color) {
        editorStore.setBackground({
          mode: 'solid',
          colorA: color,
          colorB: color,
        })
      }
    }

    // Sync frame
    const frame = imageStore.imageBorder
    if (
      editorStore.frame.enabled !== frame.enabled ||
      editorStore.frame.type !== frame.type ||
      editorStore.frame.width !== frame.width ||
      editorStore.frame.color !== frame.color ||
      editorStore.frame.padding !== frame.padding ||
      editorStore.frame.title !== frame.title
    ) {
      editorStore.setFrame({
        enabled: frame.enabled,
        type: frame.type,
        width: frame.width,
        color: frame.color,
        padding: frame.padding,
        title: frame.title,
      })
    }

    // Sync shadow
    const shadow = imageStore.imageShadow
    const offsetX = shadow.offsetX || 0
    const offsetY = shadow.offsetY || 0
    const elevation = Math.max(Math.abs(offsetX), Math.abs(offsetY)) || 4
    
    let side: 'bottom' | 'right' | 'bottom-right' = 'bottom'
    if (Math.abs(offsetX) > Math.abs(offsetY)) {
      side = 'right'
    } else if (Math.abs(offsetX) > 0 && Math.abs(offsetY) > 0) {
      side = 'bottom-right'
    }
    
    const colorMatch = shadow.color.match(/rgba?\(([^)]+)\)/)
    let shadowColor = shadow.color
    let intensity = 1
    if (colorMatch) {
      const parts = colorMatch[1].split(',').map(s => s.trim())
      if (parts.length === 4) {
        intensity = parseFloat(parts[3]) || 0.3
        shadowColor = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, 1)`
      } else if (parts.length === 3) {
        shadowColor = `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`
        intensity = 0.3
      }
    } else if (shadow.color.startsWith('#')) {
      shadowColor = shadow.color
      intensity = 0.3
    }
    
    if (
      editorStore.shadow.enabled !== shadow.enabled ||
      editorStore.shadow.softness !== shadow.blur ||
      editorStore.shadow.color !== shadowColor ||
      editorStore.shadow.elevation !== elevation ||
      editorStore.shadow.side !== side ||
      editorStore.shadow.intensity !== intensity ||
      editorStore.shadow.offsetX !== offsetX ||
      editorStore.shadow.offsetY !== offsetY
    ) {
      editorStore.setShadow({
        enabled: shadow.enabled,
        softness: shadow.blur,
        color: shadowColor,
        elevation,
        side,
        intensity,
        offsetX,
        offsetY,
      })
    }

    // Sync canvas aspect ratio
    const aspectRatioMap: Record<AspectRatioKey, 'square' | '4:3' | '2:1' | '3:2' | 'free'> = {
      '1_1': 'square',
      '4_3': '4:3',
      '2_1': '2:1',
      '3_2': '3:2',
      '16_9': 'free',
      '9_16': 'free',
      '4_5': 'free',
      '3_4': 'free',
      '2_3': 'free',
      '5_4': 'free',
      '16_10': 'free',
    }
    const canvasAspectRatio = aspectRatioMap[imageStore.selectedAspectRatio] || 'free'
    if (editorStore.canvas.aspectRatio !== canvasAspectRatio) {
      editorStore.setCanvas({ aspectRatio: canvasAspectRatio })
    }
  }, [
    imageStore.uploadedImageUrl,
    imageStore.imageScale,
    imageStore.borderRadius,
    imageStore.backgroundConfig,
    imageStore.imageBorder,
    imageStore.imageShadow,
    imageStore.selectedAspectRatio,
    editorStore,
  ])

  return null
}

