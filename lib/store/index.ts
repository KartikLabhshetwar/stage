'use client'

import React from 'react'
import { create } from 'zustand'
import { temporal } from 'zundo'
import { exportImageWithGradient } from './export-utils'
import { GradientKey } from '@/lib/constants/gradient-colors'
import { AspectRatioKey } from '@/lib/constants/aspect-ratios'
import { BackgroundConfig, BackgroundType } from '@/lib/constants/backgrounds'
import { gradientColors } from '@/lib/constants/gradient-colors'
import { solidColors } from '@/lib/constants/solid-colors'
import type { Mockup } from '@/types/mockup'

interface TextShadow {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export interface TextOverlay {
  id: string
  text: string
  position: { x: number; y: number }
  fontSize: number
  fontWeight: string
  fontFamily: string
  color: string
  opacity: number
  isVisible: boolean
  orientation: 'horizontal' | 'vertical'
  textShadow: TextShadow
}

export interface ImageOverlay {
  id: string
  src: string
  position: { x: number; y: number } // Position in pixels relative to canvas
  size: number // Size in pixels
  rotation: number // Rotation in degrees
  opacity: number
  flipX: boolean
  flipY: boolean
  isVisible: boolean
  isCustom?: boolean // Whether it's a custom uploaded overlay
}

export interface ImageBorder {
  enabled: boolean
  width: number
  color: string
  type: 'none' | 'arc-light' | 'arc-dark' | 'macos-light' | 'macos-dark' | 'windows-light' | 'windows-dark' | 'photograph'
  padding?: number
  title?: string
}

export interface ImageShadow {
  enabled: boolean
  blur: number
  offsetX: number
  offsetY: number
  spread: number
  color: string
}

// Helper function to parse gradient string and extract colors
function parseGradientColors(gradientStr: string): { colorA: string; colorB: string; direction: number } {
  // Default fallback
  let colorA = '#4168d0'
  let colorB = '#c850c0'
  let direction = 43

  try {
    // Extract angle from linear-gradient(angle, ...)
    const angleMatch = gradientStr.match(/linear-gradient\((\d+)deg/)
    if (angleMatch) {
      direction = parseInt(angleMatch[1], 10)
    }

    // Extract RGB colors
    const rgbMatches = gradientStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)
    if (rgbMatches && rgbMatches.length >= 2) {
      colorA = rgbMatches[0]
      colorB = rgbMatches[rgbMatches.length - 1]
    } else {
      // Try hex colors
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

// helper function that omits setter types from EditorState and ImageState; only keeps the properties; excludes any functions
export type OmitFunctions<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

export interface EditorState {
  // Screenshot/image state
  screenshot: {
    src: string | null
    scale: number
    offsetX: number
    offsetY: number
    rotation: number
    radius: number
  }
  
  // Background state (for Konva)
  background: {
    mode: 'solid' | 'gradient'
    colorA: string
    colorB: string
    gradientDirection: number
  }
  
  // Shadow state (for Konva)
  shadow: {
    enabled: boolean
    elevation: number
    side: 'bottom' | 'right' | 'bottom-right'
    softness: number
    color: string
    intensity: number
    offsetX: number
    offsetY: number
  }
  
  // Pattern state
  pattern: {
    enabled: boolean
    type: string
    scale: number
    spacing: number
    color: string
    rotation: number
    blur: number
    opacity: number
  }
  
  // Frame state (same as imageBorder)
  frame: {
    enabled: boolean
    type: 'none' | 'arc-light' | 'arc-dark' | 'macos-light' | 'macos-dark' | 'windows-light' | 'windows-dark' | 'photograph'
    width: number
    color: string
    padding?: number
    title?: string
  }
  
  // Canvas state
  canvas: {
    aspectRatio: 'square' | '4:3' | '2:1' | '3:2' | 'free'
    padding: number
  }
  
  // Noise state
  noise: {
    enabled: boolean
    type: string
    opacity: number
  }
  
  // Setters
  setScreenshot: (screenshot: Partial<EditorState['screenshot']>) => void
  setBackground: (background: Partial<EditorState['background']>) => void
  setShadow: (shadow: Partial<EditorState['shadow']>) => void
  setPattern: (pattern: Partial<EditorState['pattern']>) => void
  setFrame: (frame: Partial<EditorState['frame']>) => void
  setCanvas: (canvas: Partial<EditorState['canvas']>) => void
  setNoise: (noise: Partial<EditorState['noise']>) => void
}

// Create editor store
export const useEditorStore = create<EditorState>((set, get) => ({
  screenshot: {
    src: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    radius: 0,
  },
  
  background: {
    mode: 'gradient',
    colorA: '#4168d0',
    colorB: '#c850c0',
    gradientDirection: 43,
  },
  
  shadow: {
    enabled: false,
    elevation: 10,
    side: 'bottom',
    softness: 10,
    color: 'rgba(0, 0, 0, 0.3)',
    intensity: 1,
    offsetX: 0,
    offsetY: 4,
  },
  
  pattern: {
    enabled: false,
    type: 'grid',
    scale: 1,
    spacing: 20,
    color: '#000000',
    rotation: 0,
    blur: 0,
    opacity: 0.5,
  },
  
  frame: {
    enabled: false,
    type: 'none',
    width: 8,
    color: '#000000',
    padding: 20,
    title: '',
  },
  
  canvas: {
    aspectRatio: 'free',
    padding: 40,
  },
  
  noise: {
    enabled: false,
    type: 'none',
    opacity: 0.5,
  },
  
  setScreenshot: (screenshot) => {
    set((state) => ({
      screenshot: { ...state.screenshot, ...screenshot },
    }))
  },
  
  setBackground: (background) => {
    set((state) => ({
      background: { ...state.background, ...background },
    }))
  },
  
  setShadow: (shadow) => {
    set((state) => ({
      shadow: { ...state.shadow, ...shadow },
    }))
  },
  
  setPattern: (pattern) => {
    set((state) => ({
      pattern: { ...state.pattern, ...pattern },
    }))
  },
  
  setFrame: (frame) => {
    set((state) => ({
      frame: { ...state.frame, ...frame },
    }))
  },
  
  setCanvas: (canvas) => {
    set((state) => ({
      canvas: { ...state.canvas, ...canvas },
    }))
  },
  
  setNoise: (noise) => {
    set((state) => ({
      noise: { ...state.noise, ...noise },
    }))
  },
}))

// Sync hook to keep editor store in sync with image store
export function useEditorStoreSync() {
  const imageStore = useImageStore();
  const editorStore = useEditorStore();

  // Sync when image store changes
  React.useEffect(() => {
    // Sync screenshot src
    if (imageStore.uploadedImageUrl !== editorStore.screenshot.src) {
      editorStore.setScreenshot({ src: imageStore.uploadedImageUrl })
    }
    
    // Sync screenshot scale
    if (imageStore.imageScale / 100 !== editorStore.screenshot.scale) {
      editorStore.setScreenshot({ scale: imageStore.imageScale / 100 })
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
    
    if (
      editorStore.shadow.enabled !== shadow.enabled ||
      editorStore.shadow.softness !== shadow.blur ||
      editorStore.shadow.color !== shadow.color ||
      editorStore.shadow.offsetX !== offsetX ||
      editorStore.shadow.offsetY !== offsetY
    ) {
      editorStore.setShadow({
        enabled: shadow.enabled,
        softness: shadow.blur,
        color: shadow.color,
        elevation,
        side,
        intensity: 1,
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
  ])
}

// Re-export existing ImageState interface and store
export interface ImageState {
  uploadedImageUrl: string | null
  imageName: string | null
  selectedGradient: GradientKey
  borderRadius: number
  backgroundBorderRadius: number
  selectedAspectRatio: AspectRatioKey
  backgroundConfig: BackgroundConfig
  backgroundBlur: number
  backgroundNoise: number
  textOverlays: TextOverlay[]
  imageOverlays: ImageOverlay[]
  mockups: Mockup[]
  imageOpacity: number
  imageScale: number
  imageBorder: ImageBorder
  imageShadow: ImageShadow
  perspective3D: {
    perspective: number
    rotateX: number
    rotateY: number
    rotateZ: number
    translateX: number
    translateY: number
    scale: number;
  };
  setUploadedImageUrl: (url: string | null, name: string | null) => void;
  setImage: (file: File) => void
  clearImage: () => void
  setGradient: (gradient: GradientKey) => void
  setBorderRadius: (radius: number) => void
  setBackgroundBorderRadius: (radius: number) => void
  setAspectRatio: (aspectRatio: AspectRatioKey) => void
  setBackgroundConfig: (config: BackgroundConfig) => void
  setBackgroundType: (type: BackgroundType) => void
  setBackgroundValue: (value: string) => void
  setBackgroundOpacity: (opacity: number) => void
  setBackgroundBlur: (blur: number) => void
  setBackgroundNoise: (noise: number) => void
  addTextOverlay: (overlay: Omit<TextOverlay, 'id'>) => void
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void
  removeTextOverlay: (id: string) => void
  clearTextOverlays: () => void
  addImageOverlay: (overlay: Omit<ImageOverlay, 'id'>) => void
  updateImageOverlay: (id: string, updates: Partial<ImageOverlay>) => void
  removeImageOverlay: (id: string) => void
  clearImageOverlays: () => void
  addMockup: (mockup: Omit<Mockup, 'id'>) => void
  updateMockup: (id: string, updates: Partial<Mockup>) => void
  removeMockup: (id: string) => void
  clearMockups: () => void
  setImageOpacity: (opacity: number) => void
  setImageScale: (scale: number) => void
  setImageBorder: (border: ImageBorder | Partial<ImageBorder>) => void
  setImageShadow: (shadow: ImageShadow | Partial<ImageShadow>) => void
  setPerspective3D: (perspective: Partial<ImageState['perspective3D']>) => void
  exportImage: () => Promise<void>
}

export const useImageStore = create<ImageState>()(temporal((set, get) => ({
  uploadedImageUrl: null,
  imageName: null,
  selectedGradient: 'vibrant_orange_pink',
  borderRadius: 10,
  backgroundBorderRadius: 10,
  selectedAspectRatio: '16_9',
  backgroundConfig: {
    type: 'image',
    value: 'backgrounds/backgrounds/assets/asset-26',
    opacity: 1,
  },
  backgroundBlur: 0,
  backgroundNoise: 0,
  textOverlays: [],
  imageOverlays: [],
  mockups: [],
  imageOpacity: 1,
  imageScale: 100,
  imageBorder: {
    enabled: false,
    width: 8,
    color: '#000000',
    type: 'none',
    padding: 20,
    title: '',
  },
  imageShadow: {
    enabled: true,
    blur: 24,
    offsetX: 0,
    offsetY: 6,
    spread: 3,
    color: 'rgba(0, 0, 0, 0.25)',
  },
  perspective3D: {
    perspective: 200, // em units, converted to px
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    translateX: 0,
    translateY: 0,
    scale: 1,
  },

  setUploadedImageUrl: (url: string | null, name: string | null = null) => {
    set({
      uploadedImageUrl: url,
      imageName: name,
    });
  },

  setImage: (file: File) => {
    const imageUrl = URL.createObjectURL(file)
    set({
      uploadedImageUrl: imageUrl,
      imageName: file.name,
      imageScale: 100,
      borderRadius: 10,
      backgroundConfig: {
        type: 'image',
        value: 'backgrounds/backgrounds/assets/asset-26',
        opacity: 1,
      },
      selectedGradient: 'pink_orange',
      imageShadow: {
        enabled: true,
        blur: 24,
        offsetX: 0,
        offsetY: 6,
        spread: 3,
        color: 'rgba(0, 0, 0, 0.25)',
      },
      perspective3D: {
        perspective: 200,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        translateX: 0,
        translateY: 0,
        scale: 1,
      },
    })
  },

  clearImage: () => {
    const { uploadedImageUrl } = get()
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl)
    }
    set({
      uploadedImageUrl: null,
      imageName: null,
    })
  },

  setGradient: (gradient: GradientKey) => {
    set({ selectedGradient: gradient })
  },

  setBorderRadius: (radius: number) => {
    set({ borderRadius: radius })
  },

  setBackgroundBorderRadius: (radius: number) => {
    set({ backgroundBorderRadius: radius })
  },

  setAspectRatio: (aspectRatio: AspectRatioKey) => {
    set({ selectedAspectRatio: aspectRatio })
  },

  setBackgroundConfig: (config: BackgroundConfig) => {
    set({ backgroundConfig: config })
  },

  setBackgroundType: (type: BackgroundType) => {
    const { backgroundConfig } = get()
    
    // If switching to 'image' type and current value is not a valid image, set default to radiant9
    if (type === 'image') {
      const currentValue = backgroundConfig.value
      const isGradientKey = currentValue in gradientColors
      const isSolidColorKey = currentValue in solidColors
      const isValidImage = 
        typeof currentValue === 'string' &&
        (currentValue.startsWith('blob:') ||
         currentValue.startsWith('http') ||
         currentValue.startsWith('data:') ||
         // Check if it's a Cloudinary public ID (contains '/' but not a gradient/solid key)
         (currentValue.includes('/') && !isGradientKey && !isSolidColorKey))
      
      // If current value is a gradient or solid color key, or not a valid image, set default to asset-26
      const newValue = (isGradientKey || isSolidColorKey || !isValidImage) 
        ? 'backgrounds/backgrounds/assets/asset-26' 
        : currentValue
      
      set({
        backgroundConfig: {
          ...backgroundConfig,
          type,
          value: newValue,
        },
      })
    } else {
      set({
        backgroundConfig: {
          ...backgroundConfig,
          type,
        },
      })
    }
  },

  setBackgroundValue: (value: string) => {
    const { backgroundConfig } = get()
    set({
      backgroundConfig: {
        ...backgroundConfig,
        value,
      },
    })
  },

  setBackgroundOpacity: (opacity: number) => {
    const { backgroundConfig } = get()
    set({
      backgroundConfig: {
        ...backgroundConfig,
        opacity,
      },
    })
  },

  setBackgroundBlur: (blur: number) => {
    set({ backgroundBlur: blur })
  },

  setBackgroundNoise: (noise: number) => {
    set({ backgroundNoise: noise })
  },

  addTextOverlay: (overlay) => {
    const id = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    set((state) => ({
      textOverlays: [...state.textOverlays, { ...overlay, id }],
    }))
  },

  updateTextOverlay: (id, updates) => {
    set((state) => ({
      textOverlays: state.textOverlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      ),
    }))
  },

  removeTextOverlay: (id) => {
    set((state) => ({
      textOverlays: state.textOverlays.filter((overlay) => overlay.id !== id),
    }))
  },

  clearTextOverlays: () => {
    set({ textOverlays: [] })
  },

  addImageOverlay: (overlay) => {
    const id = `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    set((state) => ({
      imageOverlays: [...state.imageOverlays, { ...overlay, id }],
    }))
  },

  updateImageOverlay: (id, updates) => {
    set((state) => ({
      imageOverlays: state.imageOverlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      ),
    }))
  },

  removeImageOverlay: (id) => {
    set((state) => ({
      imageOverlays: state.imageOverlays.filter((overlay) => overlay.id !== id),
    }))
  },

  clearImageOverlays: () => {
    set({ imageOverlays: [] })
  },

  addMockup: (mockup) => {
    const id = `mockup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    set((state) => ({
      mockups: [...state.mockups, { ...mockup, id }],
    }))
  },

  updateMockup: (id, updates) => {
    set((state) => ({
      mockups: state.mockups.map((mockup) =>
        mockup.id === id ? { ...mockup, ...updates } : mockup
      ),
    }))
  },

  removeMockup: (id) => {
    set((state) => ({
      mockups: state.mockups.filter((mockup) => mockup.id !== id),
    }))
  },

  clearMockups: () => {
    set({ mockups: [] })
  },

  setImageOpacity: (opacity: number) => {
    set({ imageOpacity: opacity })
  },

  setImageScale: (scale: number) => {
    set({ imageScale: scale })
  },

  setImageBorder: (border: ImageBorder | Partial<ImageBorder>) => {
    const currentBorder = get().imageBorder
    set({
      imageBorder: {
        ...currentBorder,
        ...border,
      },
    })
  },

  setImageShadow: (shadow: ImageShadow | Partial<ImageShadow>) => {
    const currentShadow = get().imageShadow
    set({
      imageShadow: {
        ...currentShadow,
        ...shadow,
      },
    })
  },
  setPerspective3D: (perspective: Partial<ImageState['perspective3D']>) => {
    const currentPerspective = get().perspective3D
    set({
      perspective3D: {
        ...currentPerspective,
        ...perspective,
      },
    })
  },

  exportImage: async () => {
    try {
      await exportImageWithGradient('image-render-card')
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  },
}))
)
