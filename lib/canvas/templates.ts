import type { Template } from '@/types/canvas'
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from '@/lib/constants'

export const templates: Template[] = [
  // Solid color templates
  {
    id: 'solid-white',
    name: 'White',
    description: 'Clean white background',
    background: {
      type: 'solid',
      color: '#ffffff',
    },
    dimensions: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
    },
  },
  {
    id: 'solid-black',
    name: 'Black',
    description: 'Dark black background',
    background: {
      type: 'solid',
      color: '#000000',
    },
    dimensions: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
    },
  },
  {
    id: 'solid-gray',
    name: 'Gray',
    description: 'Neutral gray background',
    background: {
      type: 'solid',
      color: '#f5f5f5',
    },
    dimensions: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
    },
  },
  // Gradient templates
  {
    id: 'gradient-blue',
    name: 'Ocean Breeze',
    description: 'Smooth blue gradient',
    background: {
      type: 'gradient',
      gradient: {
        type: 'linear',
        colors: ['#4facfe', '#00f2fe'],
        angle: 135,
      },
    },
    dimensions: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
    },
  },
  {
    id: 'gradient-purple',
    name: 'Royal Purple',
    description: 'Vibrant purple gradient',
    background: {
      type: 'gradient',
      gradient: {
        type: 'linear',
        colors: ['#667eea', '#764ba2'],
        angle: 45,
      },
    },
    dimensions: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
    },
  },
  {
    id: 'gradient-orange',
    name: 'Sunset Glow',
    description: 'Warm orange gradient',
    background: {
      type: 'gradient',
      gradient: {
        type: 'linear',
        colors: ['#fa709a', '#fee140'],
        angle: 90,
      },
    },
    dimensions: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
    },
  },
  // Abstract shapes templates
  {
    id: 'shapes-circles',
    name: 'Circles',
    description: 'Abstract circular shapes',
    background: {
      type: 'shapes',
      color: '#ffffff',
      shapes: [
        {
          type: 'circle',
          x: 200,
          y: 200,
          width: 300,
          height: 300,
          color: '#e0e0e0',
          opacity: 0.5,
        },
        {
          type: 'circle',
          x: 1500,
          y: 800,
          width: 400,
          height: 400,
          color: '#d0d0d0',
          opacity: 0.3,
        },
      ],
    },
    dimensions: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
    },
  },
  {
    id: 'shapes-squares',
    name: 'Squares',
    description: 'Geometric square patterns',
    background: {
      type: 'shapes',
      color: '#f8f9fa',
      shapes: [
        {
          type: 'rect',
          x: 100,
          y: 100,
          width: 250,
          height: 250,
          color: '#e9ecef',
          opacity: 0.6,
        },
        {
          type: 'rect',
          x: 1600,
          y: 700,
          width: 300,
          height: 300,
          color: '#dee2e6',
          opacity: 0.4,
        },
      ],
    },
    dimensions: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
    },
  },
]

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id)
}
