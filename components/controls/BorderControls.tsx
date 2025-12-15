'use client'

import * as React from 'react'
import { useImageStore, type ImageBorder } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

const frameOptions = [
  { value: 'none', label: 'None' },
  { value: 'arc-light', label: 'Arc Light' },
  { value: 'arc-dark', label: 'Arc Dark' },
  { value: 'macos-light', label: 'macOS Light' },
  { value: 'macos-dark', label: 'macOS Dark' },
  { value: 'windows-light', label: 'Windows Light' },
  { value: 'windows-dark', label: 'Windows Dark' },
  { value: 'photograph', label: 'Photograph' },
] as const

type FrameType = (typeof frameOptions)[number]['value']

function FramePreview({
  type,
  selected,
  onSelect,
  children,
}: {
  type: FrameType
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onSelect}
        aria-selected={selected}
        className="flex h-14 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-border/50 bg-secondary transition-colors duration-200 aria-selected:border-primary hover:bg-secondary/80 hover:border-border"
        title={type}
      >
        <div className="relative h-8 w-10">{children}</div>
      </button>
      <div className="text-xs text-muted-foreground">{frameOptions.find((f) => f.value === type)?.label}</div>
    </div>
  )
}

const framePreviews: Record<FrameType, React.ReactNode> = {
  none: <div className="size-full rounded-md border-2 border-dashed border-muted-foreground/50" />,
  'arc-light': (
    <div className="size-full rounded-lg bg-white border border-neutral-200 p-0.5" />
  ),
  'arc-dark': (
    <div className="size-full rounded-lg bg-neutral-900 border border-neutral-700 p-0.5" />
  ),
  'macos-light': (
    <div className="flex size-full flex-col">
      <div className="flex h-2.5 items-center gap-0.5 rounded-t-md bg-neutral-200 px-1">
        <div className="size-1 rounded-full bg-red-400" />
        <div className="size-1 rounded-full bg-yellow-400" />
        <div className="size-1 rounded-full bg-green-400" />
      </div>
    </div>
  ),
  'macos-dark': (
    <div className="flex size-full flex-col">
      <div className="flex h-2.5 items-center gap-0.5 rounded-t-md bg-neutral-700 px-1">
        <div className="size-1 rounded-full bg-red-500" />
        <div className="size-1 rounded-full bg-yellow-500" />
        <div className="size-1 rounded-full bg-green-500" />
      </div>
    </div>
  ),
  'windows-light': (
    <div className="flex size-full flex-col">
      <div className="flex h-2 items-center justify-end gap-1 bg-neutral-100 px-1 rounded-t-sm">
        <div className="w-1 h-px bg-neutral-600" />
        <div className="size-1 border border-neutral-600" />
        <div className="size-1 relative">
          <div className="absolute inset-0 rotate-45 bg-neutral-600" style={{ width: '1px', height: '6px', top: '-1px', left: '2px' }} />
        </div>
      </div>
    </div>
  ),
  'windows-dark': (
    <div className="flex size-full flex-col">
      <div className="flex h-2 items-center justify-end gap-1 bg-neutral-800 px-1 rounded-t-sm">
        <div className="w-1 h-px bg-neutral-400" />
        <div className="size-1 border border-neutral-400" />
        <div className="size-1 relative">
          <div className="absolute inset-0 rotate-45 bg-neutral-400" style={{ width: '1px', height: '6px', top: '-1px', left: '2px' }} />
        </div>
      </div>
    </div>
  ),
  photograph: (
    <div className="size-full bg-white rounded-sm p-0.5 pb-2">
      <div className="size-full bg-neutral-300 rounded-[1px]" />
    </div>
  ),
}

export function BorderControls() {
  const { imageBorder, setImageBorder } = useImageStore()

  const handleSelect = (value: FrameType) => {
    const next: Partial<ImageBorder> = {
      type: value,
      enabled: value !== 'none',
    }

    const isArcType = value === 'arc-light' || value === 'arc-dark'
    const wasArcType = imageBorder.type === 'arc-light' || imageBorder.type === 'arc-dark'

    if (isArcType && !wasArcType) {
      next.width = 8
    }

    setImageBorder(next)
  }

  const isSelected = (value: FrameType) => {
    return imageBorder.type === value
  }

  const showTitleInput = ['macos-light', 'macos-dark', 'windows-light', 'windows-dark', 'photograph'].includes(imageBorder.type)
  const showThicknessControl = ['arc-light', 'arc-dark'].includes(imageBorder.type)
  const isPhotograph = imageBorder.type === 'photograph'

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-foreground">Frame</div>
      <div className="space-y-4 pt-2">
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">Style</label>
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {frameOptions.map(({ value }) => (
              <FramePreview
                key={value}
                type={value}
                selected={isSelected(value)}
                onSelect={() => handleSelect(value)}
              >
                {framePreviews[value]}
              </FramePreview>
            ))}
          </div>
        </div>

        {showThicknessControl && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground mb-2 block">Frame Size</label>
            <Slider
              value={[imageBorder.width]}
              onValueChange={(value) => setImageBorder({ width: value[0], enabled: true })}
              min={4}
              max={40}
              step={1}
              label="Frame Size"
              valueDisplay={`${imageBorder.width}px`}
            />
          </div>
        )}

        {showTitleInput && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {isPhotograph ? 'Caption' : 'Title'}
            </label>
            <Input
              type="text"
              value={imageBorder.title || ''}
              onChange={(e) => setImageBorder({ title: e.target.value, enabled: true })}
              placeholder={isPhotograph ? 'Write something...' : 'Window title'}
            />
          </div>
        )}
      </div>
    </div>
  )
}
