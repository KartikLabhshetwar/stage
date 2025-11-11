// Default canvas dimensions
export const DEFAULT_CANVAS_WIDTH = 1920
export const DEFAULT_CANVAS_HEIGHT = 1080

// Image upload limits
export const MAX_IMAGE_SIZE = 100 * 1024 * 1024 // 100MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Text defaults
export const DEFAULT_TEXT_FONT_SIZE = 48
export const DEFAULT_TEXT_COLOR = '#000000'
export const DEFAULT_FONT_FAMILY = 'Arial'

// Canvas defaults
export const CANVAS_BACKGROUND_COLOR = '#ffffff'

// Aspect Ratio Presets
export interface AspectRatioPreset {
  id: string
  name: string
  category: string
  width: number
  height: number
  ratio: string // e.g., "1:1", "4:5", "9:16"
  description?: string
}

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  // Instagram Formats
  {
    id: 'instagram-square',
    name: 'Instagram Square',
    category: 'Instagram',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    description: 'Perfect for Instagram feed posts',
  },
  {
    id: 'instagram-portrait',
    name: 'Instagram Portrait',
    category: 'Instagram',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    description: 'Portrait format for Instagram feed',
  },
  {
    id: 'instagram-landscape',
    name: 'Instagram Landscape',
    category: 'Instagram',
    width: 1080,
    height: 566,
    ratio: '1.91:1',
    description: 'Landscape format for Instagram feed',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    category: 'Instagram',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    description: 'Full-screen vertical stories and reels',
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    category: 'Instagram',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    description: 'Vertical video format for reels',
  },

  // Common Social Media
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    category: 'Facebook',
    width: 1200,
    height: 630,
    ratio: '1.91:1',
    description: 'Standard Facebook post size',
  },
  {
    id: 'twitter-post',
    name: 'Twitter/X Post',
    category: 'Twitter',
    width: 1200,
    height: 675,
    ratio: '16:9',
    description: 'Standard Twitter post size',
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'YouTube',
    width: 1280,
    height: 720,
    ratio: '16:9',
    description: 'YouTube video thumbnail size',
  },

  // Standard Formats
  {
    id: 'custom',
    name: 'Custom',
    category: 'Custom',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    description: 'Custom dimensions',
  },
  {
    id: 'square',
    name: 'Square',
    category: 'Standard',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    description: 'Square format',
  },
  {
    id: 'portrait-4-3',
    name: 'Portrait 4:3',
    category: 'Standard',
    width: 1200,
    height: 1600,
    ratio: '3:4',
    description: 'Portrait format 3:4',
  },
  {
    id: 'landscape-16-9',
    name: 'Landscape 16:9',
    category: 'Standard',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    description: 'Widescreen landscape format',
  },
  {
    id: 'landscape-21-9',
    name: 'Ultrawide 21:9',
    category: 'Standard',
    width: 2560,
    height: 1080,
    ratio: '21:9',
    description: 'Ultrawide format',
  },
]

export const DEFAULT_ASPECT_RATIO =
  ASPECT_RATIO_PRESETS.find((p) => p.id === 'custom') || ASPECT_RATIO_PRESETS[0]
