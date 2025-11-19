'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BorderControls } from '@/components/controls/BorderControls';
import { ShadowControls } from '@/components/controls/ShadowControls';
import { Perspective3DControls } from '@/components/controls/Perspective3DControls';

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
  } = useImageStore();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="style" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-transparent p-0 gap-1 h-auto">
          <TabsTrigger value="style" className="border-0 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-none h-9">
            Style
          </TabsTrigger>
          <TabsTrigger value="3d" className="relative border-0 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-none h-9">
            3D
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
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <Slider
              value={[borderRadius]}
              onValueChange={(value) => setBorderRadius(value[0])}
              min={0}
              max={100}
              step={1}
              label="Radius"
              valueDisplay={`${borderRadius}px`}
            />
          </div>
        </div>

        <BorderControls />

        <ShadowControls shadow={imageShadow} onShadowChange={setImageShadow} />

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <Slider
              value={[imageScale]}
              onValueChange={(value) => setImageScale(value[0])}
              min={10}
              max={200}
              step={1}
              label="Image Size"
              valueDisplay={`${imageScale}%`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Adjust the size of the image (10% - 200%)
          </p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <Slider
            value={[imageOpacity]}
            onValueChange={(value) => setImageOpacity(value[0])}
            min={0}
            max={1}
            step={0.01}
            label="Image Opacity"
            valueDisplay={`${Math.round(imageOpacity * 100)}%`}
          />
        </div>
        </TabsContent>

        <TabsContent value="3d" className="mt-4">
          <Perspective3DControls />
        </TabsContent>
      </Tabs>
    </div>
  );
}
