'use client'

import * as React from 'react'

import { useImageStore } from '@/lib/store'

import { Slider } from '@/components/ui/slider'

import { Input } from '@/components/ui/input'

import { useState, useEffect } from 'react'

const isValidHex = (color: string) => /^#[0-9A-F]{6}$/i.test(color)

function ColorInput({
  value,

  onChange,

  className = '',
}: {
  value: string

  onChange: (value: string) => void

  className?: string
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleBlur = () => {
    if (isValidHex(localValue)) {
      onChange(localValue)
    } else {
      setLocalValue(value)
    }
  }

  return (
    <Input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className={className}
    />
  )
}

const frameOptions = [
  { value: 'none', label: 'None' },

  { value: 'solid', label: 'Solid' },

  { value: 'glassy', label: 'Glassy' },

  { value: 'infinite-mirror', label: 'Mirror' },

  { value: 'window-light', label: 'Window' },

  { value: 'window-dark', label: 'Dark Window' },

  { value: 'stack-light', label: 'Stack' },

  { value: 'stack-dark', label: 'Dark Stack' },

  { value: 'ruler', label: 'Ruler' },

  { value: 'eclipse', label: 'Neo' },

  { value: 'dotted', label: 'Dotted' },

  { value: 'focus', label: 'Focus' },
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
        onClick={onSelect}
        aria-selected={selected}
        className="flex h-14 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-border/50 bg-secondary transition-colors duration-200 aria-selected:border-primary hover:bg-secondary/80 hover:border-border"
        title={type}
      >
        <div className="relative h-8 w-10">{children}</div>
      </button>

      <div className="text-xs text-muted-foreground">
        {frameOptions.find((f) => f.value === type)?.label}
      </div>
    </div>
  )
}

const framePreviews: Record<FrameType, React.ReactNode> = {
  none: <div className="size-full rounded-md border-2 border-dashed border-muted-foreground/50" />,

  solid: <div className="size-full rounded-md border-4 border-primary/80" />,

  glassy: (
    <div className="size-full rounded-md border-2 border-foreground/20 bg-background/10 backdrop-blur-sm" />
  ),

  'window-light': (
    <div className="flex size-full flex-col rounded-md border-2 border-border bg-white">
      <div className="flex h-2 items-center gap-0.5 rounded-t-sm bg-muted px-1">
        <div className="size-1 rounded-full bg-red-400" />

        <div className="size-1 rounded-full bg-yellow-400" />

        <div className="size-1 rounded-full bg-green-400" />
      </div>
    </div>
  ),

  'window-dark': (
    <div className="flex size-full flex-col rounded-md border-2 border-neutral-700 bg-black/80">
      <div className="flex h-2 items-center gap-0.5 rounded-t-sm bg-neutral-800 px-1">
        <div className="size-1 rounded-full bg-red-500" />

        <div className="size-1 rounded-full bg-yellow-500" />

        <div className="size-1 rounded-full bg-green-500" />
      </div>
    </div>
  ),

  'infinite-mirror': (
    <div className="size-full rounded-md border-2 border-primary/80 p-1">
      <div className="size-full rounded-[3px] border-2 border-primary/60 p-0.5">
        <div className="size-full rounded-[2px] border-2 border-primary/40" />
      </div>
    </div>
  ),

  ruler: (
    <div className="relative size-full overflow-hidden rounded-sm bg-amber-400/80">
      <div className="absolute left-0 top-0 h-full w-px bg-black/70" />

      <div className="absolute left-0 top-0 h-px w-full bg-black/70" />

      <div className="absolute left-2 top-0 h-1 w-px bg-black/70" />

      <div className="absolute left-4 top-0 h-1.5 w-px bg-black/70" />

      <div className="absolute left-6 top-0 h-1 w-px bg-black/70" />

      <div className="absolute left-8 top-0 h-2 w-px bg-black/70" />

      <div className="absolute top-2 left-0 w-1 h-px bg-black/70" />

      <div className="absolute top-4 left-0 w-1.5 h-px bg-black/70" />

      <div className="absolute top-6 left-0 w-1 h-px bg-black/70" />
    </div>
  ),

  eclipse: <div className="size-full rounded-full bg-black" />,

  'stack-light': (
    <div className="relative size-full">
      <div className="absolute left-0 top-0 h-5/6 w-5/6 rounded-md border-2 border-border bg-white" />

      <div className="absolute bottom-0 right-0 h-5/6 w-5/6 rounded-md border-2 border-border/80 bg-white/80" />
    </div>
  ),

  'stack-dark': (
    <div className="relative size-full">
      <div className="absolute left-0 top-0 h-5/6 w-5/6 rounded-md border-2 border-neutral-700 bg-black/80" />

      <div className="absolute bottom-0 right-0 h-5/6 w-5/6 rounded-md border-2 border-neutral-600/80 bg-black/60" />
    </div>
  ),

  dotted: <div className="size-full rounded-md border-2 border-dashed border-primary/80" />,

  focus: (
    <div className="relative size-full">
      <div className="absolute -top-0.5 -left-0.5 h-3 w-3 rounded-tl-md border-t-2 border-l-2 border-primary/80" />

      <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-tr-md border-t-2 border-r-2 border-primary/80" />

      <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-bl-md border-b-2 border-l-2 border-primary/80" />

      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-br-md border-b-2 border-r-2 border-primary/80" />
    </div>
  ),
}

export function BorderControls() {
  const { imageBorder, setImageBorder } = useImageStore()

  const handleSelect = (value: FrameType) => {
    if (value.startsWith('window-') || value.startsWith('stack-')) {
      const [type, theme] = value.split('-')

      setImageBorder({
        type: type as 'window' | 'stack',
        theme: theme as 'light' | 'dark',
        enabled: true,
      })
    } else {
      setImageBorder({
        type: value as Exclude<FrameType, `${'window' | 'stack'}-${'light' | 'dark'}`>,
        enabled: true,
      })
    }
  }

  const isSelected = (value: FrameType) => {
    if (value.startsWith('window-') || value.startsWith('stack-')) {
      const [type, theme] = value.split('-')

      return imageBorder.type === type && imageBorder.theme === theme
    }

    return imageBorder.type === value
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground">Frame</div>

      <div className="space-y-4 border-t border-border pt-4">
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">Style</label>

          <div className="grid grid-cols-3 gap-x-2 gap-y-4">
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

        {['solid', 'dotted', 'infinite-mirror', 'eclipse', 'focus', 'ruler'].includes(
          imageBorder.type
        ) && (
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Color</label>

            <div className="flex items-center gap-2">
              <div
                className="relative size-9 shrink-0 overflow-hidden rounded-lg"
                style={{ backgroundColor: imageBorder.color }}
              >
                <input
                  type="color"
                  value={imageBorder.color}
                  onChange={(e) => setImageBorder({ color: e.target.value, enabled: true })}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </div>

              <ColorInput
                value={imageBorder.color}
                onChange={(color) => setImageBorder({ color, enabled: true })}
              />
            </div>
          </div>
        )}

        {['solid', 'glassy', 'dotted', 'eclipse', 'ruler', 'focus'].includes(imageBorder.type) && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">Width</label>
            <div className="flex-1 flex items-center gap-3">
              <Slider
                value={[imageBorder.width]}
                onValueChange={([value]) => setImageBorder({ width: value })}
                min={1}
                max={50}
                step={0.5}
              />
              <span className="text-sm text-foreground font-medium whitespace-nowrap">
                {imageBorder.width}px
              </span>
            </div>
          </div>
        )}

        {imageBorder.type === 'window' && (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Title</label>

              <Input
                type="text"
                value={imageBorder.title || ''}
                onChange={(e) => setImageBorder({ title: e.target.value, enabled: true })}
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">
                Padding
              </label>
              <div className="flex-1 flex items-center gap-3">
                <Slider
                  value={[imageBorder.padding || 20]}
                  onValueChange={([value]) => setImageBorder({ padding: value })}
                  min={0}
                  max={100}
                  step={1}
                />
                <span className="text-sm text-foreground font-medium whitespace-nowrap">
                  {imageBorder.padding || 20}px
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
