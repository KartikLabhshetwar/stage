'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TransformPreset {
  name: string;
  values: {
    perspective: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    translateX: number;
    translateY: number;
    scale: number;
  };
}

const PRESETS: TransformPreset[] = [
  {
    name: 'Default',
    values: {
      perspective: 200,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Front View',
    values: {
      perspective: 250,
      rotateX: 6,
      rotateY: 0,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 0.95,
    },
  },
  {
    name: 'Top Right',
    values: {
      perspective: 400,
      rotateX: 18,
      rotateY: -24,
      rotateZ: 2,
      translateX: 0,
      translateY: 0,
      scale: 0.82,
    },
  },
  {
    name: 'Dramatic Angle',
    values: {
      perspective: 450,
      rotateX: 16,
      rotateY: -28,
      rotateZ: 3,
      translateX: 0,
      translateY: 0,
      scale: 0.8,
    },
  },
  {
    name: 'Tablet View 1',
    values: {
      perspective: 350,
      rotateX: 10,
      rotateY: -16,
      rotateZ: 1,
      translateX: 0,
      translateY: 0,
      scale: 0.88,
    },
  },
  {
    name: 'Tablet View 2',
    values: {
      perspective: 380,
      rotateX: 12,
      rotateY: -20,
      rotateZ: 1,
      translateX: 0,
      translateY: 0,
      scale: 0.85,
    },
  },
  {
    name: 'Tablet View 3',
    values: {
      perspective: 320,
      rotateX: 8,
      rotateY: -14,
      rotateZ: 1,
      translateX: 0,
      translateY: 0,
      scale: 0.9,
    },
  },
  {
    name: '3D Tilt',
    values: {
      perspective: 200,
      rotateX: 10,
      rotateY: -18,
      rotateZ: 5,
      translateX: 0,
      translateY: 0,
      scale: 0.88,
    },
  },
  {
    name: 'Deep Perspective',
    values: {
      perspective: 500,
      rotateX: 14,
      rotateY: -22,
      rotateZ: 4,
      translateX: 0,
      translateY: 0,
      scale: 0.82,
    },
  },
  {
    name: 'Subtle Angle',
    values: {
      perspective: 300,
      rotateX: 5,
      rotateY: -10,
      rotateZ: 1,
      translateX: 0,
      translateY: 0,
      scale: 0.92,
    },
  },
];

export function Perspective3DControls() {
  const { perspective3D, setPerspective3D } = useImageStore();

  const applyPreset = (preset: TransformPreset) => {
    setPerspective3D(preset.values);
  };

  const reset = () => {
    setPerspective3D({
      perspective: 200,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold text-foreground">3D Perspective</Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="h-7 px-2 text-xs border border-border/50 hover:border-border"
        >
          Reset
        </Button>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(preset)}
            className="h-8 text-xs font-medium border border-border/50 hover:border-border"
          >
            {preset.name}
          </Button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {/* Perspective */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <Slider
            value={[perspective3D.perspective]}
            onValueChange={(value) => setPerspective3D({ perspective: value[0] })}
            min={50}
            max={1000}
            step={10}
            label="Perspective"
            valueDisplay={`${perspective3D.perspective}px`}
          />
        </div>

        {/* Rotate X */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <Slider
            value={[perspective3D.rotateX]}
            onValueChange={(value) => setPerspective3D({ rotateX: value[0] })}
            min={-45}
            max={45}
            step={1}
            label="Rotate X"
            valueDisplay={`${perspective3D.rotateX}°`}
          />
        </div>

        {/* Rotate Y */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <Slider
            value={[perspective3D.rotateY]}
            onValueChange={(value) => setPerspective3D({ rotateY: value[0] })}
            min={-45}
            max={45}
            step={1}
            label="Rotate Y"
            valueDisplay={`${perspective3D.rotateY}°`}
          />
        </div>

        {/* Rotate Z */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <Slider
            value={[perspective3D.rotateZ]}
            onValueChange={(value) => setPerspective3D({ rotateZ: value[0] })}
            min={-45}
            max={45}
            step={1}
            label="Rotate Z"
            valueDisplay={`${perspective3D.rotateZ}°`}
          />
        </div>

        {/* Translate X */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <Slider
            value={[perspective3D.translateX]}
            onValueChange={(value) => setPerspective3D({ translateX: value[0] })}
            min={-10}
            max={10}
            step={0.5}
            label="Translate X"
            valueDisplay={`${perspective3D.translateX}%`}
          />
        </div>

        {/* Translate Y */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <Slider
            value={[perspective3D.translateY]}
            onValueChange={(value) => setPerspective3D({ translateY: value[0] })}
            min={-10}
            max={10}
            step={0.5}
            label="Translate Y"
            valueDisplay={`${perspective3D.translateY}%`}
          />
        </div>

        {/* Scale */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <Slider
            value={[perspective3D.scale]}
            onValueChange={(value) => setPerspective3D({ scale: value[0] })}
            min={0.5}
            max={1.5}
            step={0.01}
            label="Scale"
            valueDisplay={perspective3D.scale.toFixed(2)}
          />
        </div>
      </div>
    </div>
  );
}

