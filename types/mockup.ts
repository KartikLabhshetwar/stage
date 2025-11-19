export type MockupType = 'iphone' | 'macbook' | 'imac' | 'iwatch'

export interface MockupScreenArea {
  x: number
  y: number
  width: number
  height: number
  borderRadius?: number
  notch?: {
    x: number
    y: number
    width: number
    height: number
    borderRadius?: number
  }
}

export interface MockupDefinition {
  id: string
  name: string
  type: MockupType
  src: string
  screenArea: MockupScreenArea
  preview?: string
}

export interface Mockup {
  id: string
  definitionId: string
  position: { x: number; y: number }
  size: number
  rotation: number
  opacity: number
  isVisible: boolean
  imageFit: 'cover' | 'contain' | 'fill'
}

