export interface AspectRatio {
  id: string
  name: string
  ratio: number
  width: number
  height: number
  category: string
  description: string
  useCase?: string
}

export const aspectRatios: AspectRatio[] = [
  // Instagram Formats
  {
    id: '1_1',
    name: 'Square',
    ratio: 1,
    width: 1,
    height: 1,
    category: 'Instagram',
    description: 'Perfect for Instagram feed posts',
    useCase: 'Instagram Posts',
  },
  {
    id: '4_5',
    name: 'Portrait',
    ratio: 4 / 5,
    width: 4,
    height: 5,
    category: 'Instagram',
    description: 'Portrait format for Instagram feed',
    useCase: 'Instagram Posts',
  },
  {
    id: '9_16',
    name: 'Story/Reel',
    ratio: 9 / 16,
    width: 9,
    height: 16,
    category: 'Instagram',
    description: 'Full-screen vertical stories and reels',
    useCase: 'Instagram Stories, Reels, TikTok',
  },

  // Social Media
  {
    id: '16_9',
    name: 'Landscape',
    ratio: 16 / 9,
    width: 16,
    height: 9,
    category: 'Social Media',
    description: 'Widescreen format for videos and posts',
    useCase: 'YouTube, Twitter/X, Facebook Posts',
  },
  {
    id: '3_4',
    name: 'Portrait',
    ratio: 3 / 4,
    width: 3,
    height: 4,
    category: 'Social Media',
    description: 'Vertical format for Pinterest and social posts',
    useCase: 'Pinterest Pins, Social Posts',
  },
  {
    id: '2_3',
    name: 'Portrait',
    ratio: 2 / 3,
    width: 2,
    height: 3,
    category: 'Social Media',
    description: 'Tall vertical format',
    useCase: 'Social Media Posts',
  },
  {
    id: 'og_image',
    name: 'Open Graph',
    ratio: 1200 / 630,
    width: 40,
    height: 21,
    category: 'Social Media',
    description: 'Standard Open Graph image format (1200×630px)',
    useCase: 'Open Graph Images, Facebook, LinkedIn, Twitter/X Cards',
  },
  {
    id: 'twitter_banner',
    name: 'Twitter Banner',
    ratio: 3 / 1,
    width: 3,
    height: 1,
    category: 'Social Media',
    description: 'Twitter/X profile banner format',
    useCase: 'Twitter/X Profile Banners',
  },
  {
    id: 'instagram_banner',
    name: 'Instagram Banner',
    ratio: 1,
    width: 1,
    height: 1,
    category: 'Instagram',
    description: 'Instagram highlight cover format (1080×1080px)',
    useCase: 'Instagram Highlight Covers',
  },
  {
    id: 'youtube_banner',
    name: 'YouTube Banner',
    ratio: 16 / 9,
    width: 16,
    height: 9,
    category: 'Social Media',
    description: 'YouTube channel banner format (2560×1440px)',
    useCase: 'YouTube Channel Banners',
  },
  {
    id: 'linkedin_banner',
    name: 'LinkedIn Banner',
    ratio: 4 / 1,
    width: 4,
    height: 1,
    category: 'Social Media',
    description: 'LinkedIn profile/company banner format (1584×396px)',
    useCase: 'LinkedIn Profile & Company Banners',
  },

  // Standard Formats
  {
    id: '3_2',
    name: 'Photo',
    ratio: 3 / 2,
    width: 3,
    height: 2,
    category: 'Standard',
    description: 'Standard photo format',
    useCase: 'Photography',
  },
  {
    id: '4_3',
    name: 'Traditional',
    ratio: 4 / 3,
    width: 4,
    height: 3,
    category: 'Standard',
    description: 'Traditional display format',
    useCase: 'Traditional Displays',
  },
  {
    id: '5_4',
    name: 'Photo',
    ratio: 5 / 4,
    width: 5,
    height: 4,
    category: 'Standard',
    description: 'Classic photo format',
    useCase: 'Photography',
  },
  {
    id: '16_10',
    name: 'Widescreen',
    ratio: 16 / 10,
    width: 16,
    height: 10,
    category: 'Standard',
    description: 'Widescreen desktop format',
    useCase: 'Desktop Displays',
  },
]

export type AspectRatioKey = (typeof aspectRatios)[number]['id']
