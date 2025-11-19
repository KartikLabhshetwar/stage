import type { MockupDefinition } from '@/types/mockup'

export const MOCKUP_DEFINITIONS: MockupDefinition[] = [
  {
    id: 'mac-1',
    name: 'MacBook',
    type: 'macbook',
    src: '/mockups/mac/macbook.png',
    screenArea: {
      x: 0.116,
      y: 0.060,
      width: 0.770,
      height: 0.865,
    },
  },
  {
    id: 'imac-1',
    name: 'iMac',
    type: 'imac',
    src: '/mockups/mac/imac.png',
    screenArea: {
      x: 0.023,
      y: 0.028,
      width: 0.956,
      height: 0.724,
      borderRadius: 8,
    },
  },
  {
    id: 'iwatch-1',
    name: 'Apple Watch',
    type: 'iwatch',
    src: '/mockups/mac/iwatch.png',
    screenArea: {
      x: 0.042,
      y: 0.18,
      width: 0.900,
      height: 0.632,
      borderRadius: 40,
    },
  },
  {
    id: 'iphone-1',
    name: 'iPhone',
    type: 'iphone',
    src: '/mockups/iphone/iphone.png',
    screenArea: {
      x: 0.045,
      y: 0.015,
      width: 0.908,
      height: 0.97,
      borderRadius: 40,
      notch: {
        x: 0.31,
        y: 0.022,
        width: 0.38,
        height: 0.034,
        borderRadius: 18,
      },
    },
  },
]

export const getMockupDefinition = (id: string): MockupDefinition | undefined => {
  return MOCKUP_DEFINITIONS.find((def) => def.id === id)
}

export const getMockupsByType = (type: 'iphone' | 'macbook' | 'imac' | 'iwatch'): MockupDefinition[] => {
  return MOCKUP_DEFINITIONS.filter((def) => def.type === type)
}

