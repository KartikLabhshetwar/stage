'use client'

import * as React from 'react'
import { useImageStore } from '@/lib/store'

const borderOptions = [
  { value: 'none', label: 'None', image: '/border/none.webp' },
  { value: 'arc-light', label: 'Arc Light', image: '/border/arc-light.webp' },
  { value: 'arc-dark', label: 'Arc Dark', image: '/border/arc-dark.webp' },
  { value: 'macos-dark', label: 'macOS Dark', image: '/border/macos-black.webp' },
  { value: 'macos-light', label: 'macOS Light', image: '/border/macos-black.webp' },
  { value: 'windows-dark', label: 'Windows Dark', image: '/border/macos-black.webp' },
  { value: 'windows-light', label: 'Windows Light', image: '/border/macos-black.webp' },
  { value: 'photograph', label: 'Photograph', image: '/border/photograph.webp' },
] as const

type BorderType = (typeof borderOptions)[number]['value']

export function BorderControls() {
  const { imageBorder, setImageBorder } = useImageStore()

  const handleSelect = (value: BorderType) => {
    setImageBorder({ type: value, enabled: value !== 'none' })
  }

  const isSelected = (value: BorderType) => {
    return imageBorder.type === value
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-foreground">Frame</div>
      <div className="space-y-4 pt-2">
        <div className="flex overflow-x-scroll space-x-4 select-none pb-2 -mx-1 px-1">
          {borderOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`shrink-0 flex flex-col items-center transition-all ${
                isSelected(option.value)
                  ? 'opacity-100 scale-105'
                  : 'opacity-60 hover:opacity-80'
              }`}
            >
              <div className="w-[80px] p-1 h-full flex flex-col items-center">
                <img
                  loading="lazy"
                  src={option.image}
                  alt={option.label}
                  className="h-auto object-contain mb-2 w-full"
                />
                <p
                  className={`text-center text-xs ${
                    option.value === 'photograph'
                      ? 'text-gray-950 dark:text-gray-50'
                      : 'text-gray-400'
                  }`}
                >
                  {option.label}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
