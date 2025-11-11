'use client'

import * as React from 'react'
import { useImageStore } from '@/lib/store'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BorderControls } from '@/components/controls/BorderControls'
import { ShadowControls } from '@/components/controls/ShadowControls'
import { Perspective3DControls } from '@/components/controls/Perspective3DControls'

export function StyleTabs() {
  const {
    borderRadius,
    imageOpacity,
    imageScale,
    imageShadow,
    setBorderRadius,
    setImageOpacity,
    setImageScale,
    setImageShadow,
  } = useImageStore()

  return (
    <div className="space-y-6">
      <h4 className="text-md font-semibold text-foreground">IMAGE</h4>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="3d" className="relative">
            3D
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold rounded bg-primary/20 text-primary border border-primary/30">
              BETA
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="mt-4 space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-foreground">Border Radius</Label>
            <div className="flex gap-2 mb-3">
              <Button
                variant={borderRadius === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBorderRadius(0)}
                className={`flex-1 text-sm font-medium transition-all rounded-lg h-9 border ${
                  borderRadius === 0
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-primary'
                    : 'border-border/50 hover:border-border hover:bg-accent text-foreground bg-background'
                }`}
              >
                Sharp Edge
              </Button>
              <Button
                variant={borderRadius > 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBorderRadius(24)}
                className={`flex-1 text-sm font-medium transition-all rounded-lg h-9 border ${
                  borderRadius > 0
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-primary'
                    : 'border-border/50 hover:border-border hover:bg-accent text-foreground bg-background'
                }`}
              >
                Rounded
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-foreground">Border Radius</Label>
              <span className="text-sm text-muted-foreground font-medium">{borderRadius}px</span>
            </div>
            <Slider
              value={[borderRadius]}
              onValueChange={(value) => setBorderRadius(value[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <BorderControls />

          <ShadowControls shadow={imageShadow} onShadowChange={setImageShadow} />

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <Label className="text-sm font-medium text-foreground whitespace-nowrap">
                Image Size
              </Label>
              <div className="flex-1 flex items-center gap-3">
                <Slider
                  value={[imageScale]}
                  onValueChange={(value) => setImageScale(value[0])}
                  min={10}
                  max={200}
                  step={1}
                />
                <span className="text-sm text-foreground font-medium whitespace-nowrap">
                  {imageScale}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Adjust the size of the image (10% - 200%)
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <Label className="text-sm font-medium text-foreground whitespace-nowrap">
              Image Opacity
            </Label>
            <div className="flex-1 flex items-center gap-3">
              <Slider
                value={[imageOpacity]}
                onValueChange={(value) => setImageOpacity(value[0])}
                min={0}
                max={1}
                step={0.01}
              />
              <span className="text-sm text-foreground font-medium whitespace-nowrap">
                {Math.round(imageOpacity * 100)}%
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="3d" className="mt-4">
          <Perspective3DControls />
        </TabsContent>
      </Tabs>
    </div>
  )
}
