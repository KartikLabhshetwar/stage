import type { MockupDefinition } from '@/types/mockup'

export const MOCKUP_DEFINITIONS: MockupDefinition[] = [
  {
    id: 'mac-1',
    name: 'MacBook',
    type: 'macbook',
    src: '/mockups/mac/macbook.png',
    screenArea: {
      x: 0.095,
      y: 0.04,
      width: 0.81,
      height: 0.665,
    },
  },
  {
    id: 'imac-1',
    name: 'iMac',
    type: 'imac',
    src: '/mockups/mac/imac.png',
    screenArea: {
      x: 0.05,
      y: 0.08,
      width: 0.9,
      height: 0.75,
      borderRadius: 8,
    },
  },
  {
    id: 'iwatch-1',
    name: 'Apple Watch',
    type: 'iwatch',
    src: '/mockups/mac/iwatch.png',
    screenArea: {
      x: 0.15,
      y: 0.15,
      width: 0.7,
      height: 0.7,
      borderRadius: 1000,
    },
  },
  {
    id: 'iphone-1',
    name: 'iPhone',
    type: 'iphone',
    src: '/mockups/iphone/iphone.png',
    screenArea: {
      x: 0.048,
      y: 0.02,
      width: 0.904,
      height: 0.96,
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

