'use client'

import { IphoneMockupRenderer } from './IphoneMockupRenderer'
import { MacbookMockupRenderer } from './MacbookMockupRenderer'
import { ImacMockupRenderer } from './ImacMockupRenderer'
import { IwatchMockupRenderer } from './IwatchMockupRenderer'
import { getMockupDefinition } from '@/lib/constants/mockups'
import type { Mockup } from '@/types/mockup'

interface MockupRendererProps {
  mockup: Mockup
  canvasWidth: number
  canvasHeight: number
}

export function MockupRenderer({ mockup, canvasWidth, canvasHeight }: MockupRendererProps) {
  const definition = getMockupDefinition(mockup.definitionId)
  if (!definition) return null
  
  switch (definition.type) {
    case 'iphone':
      return <IphoneMockupRenderer mockup={mockup} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    case 'macbook':
      return <MacbookMockupRenderer mockup={mockup} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    case 'imac':
      return <ImacMockupRenderer mockup={mockup} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    case 'iwatch':
      return <IwatchMockupRenderer mockup={mockup} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    default:
      return null
  }
}

