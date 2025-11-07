'use client'

import * as React from 'react'
import { useImageStore } from '@/lib/store'
import { AspectRatioDropdown } from '@/components/aspect-ratio/aspect-ratio-dropdown'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { aspectRatios } from '@/lib/constants/aspect-ratios'
import { BackgroundEffects } from '@/components/controls/BackgroundEffects'

// Import new panel components
import { BackgroundTypePanel, BackgroundImagePanel, BorderRadiusPanel, OpacityPanel } from './panels'

export function EditorRightPanel() {
  const {
    selectedAspectRatio,
    backgroundConfig,
    backgroundBorderRadius,
    setBackgroundType,
    setBackgroundValue,
    setBackgroundOpacity,
    setBackgroundBorderRadius,
  } = useImageStore()

  const [expanded, setExpanded] = React.useState(true)
  const selectedRatio = aspectRatios.find((ar) => ar.id === selectedAspectRatio)

  return (
    <div className="w-full h-full bg-muted flex flex-col overflow-hidden md:w-80 border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Canvas Settings</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg hover:bg-accent transition-colors border border-border/50 hover:border-border"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {expanded && (
          <>
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-xs font-medium text-muted-foreground">Aspect Ratio</span>
              </div>
              {selectedRatio && (
                <div className="text-xs text-muted-foreground">
                  {selectedRatio.width}:{selectedRatio.height} • {selectedRatio.width}x{selectedRatio.height}
                </div>
              )}
              <AspectRatioDropdown />
            </div>
          </>
        )}
      </div>

      {expanded && (
        <>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Background Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Background</h4>

              {/* Background Type Panel */}
              <BackgroundTypePanel
                backgroundConfig={backgroundConfig}
                setBackgroundType={setBackgroundType}
                setBackgroundValue={setBackgroundValue}
              />

              {/* Background Image Panel */}
              <BackgroundImagePanel
                backgroundConfig={backgroundConfig}
                setBackgroundType={setBackgroundType}
                setBackgroundValue={setBackgroundValue}
              />

              {/* Border Radius Panel */}
              <BorderRadiusPanel borderRadius={backgroundBorderRadius} setBorderRadius={setBackgroundBorderRadius} />

              {/* Opacity Panel */}
              <OpacityPanel opacity={backgroundConfig.opacity || 1} setOpacity={setBackgroundOpacity} />

              {/* Background Effects */}
              <BackgroundEffects />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
