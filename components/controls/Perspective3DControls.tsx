'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShadowControls } from '@/components/controls/ShadowControls';

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
    name: 'Subtle Left',
    values: {
      perspective: 1000,
      rotateX: 3,
      rotateY: -5,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Subtle Right',
    values: {
      perspective: 1000,
      rotateX: -3,
      rotateY: 5,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Dramatic Left',
    values: {
      perspective: 800,
      rotateX: 10,
      rotateY: -25,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Dramatic Right',
    values: {
      perspective: 800,
      rotateX: -10,
      rotateY: 25,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Top Left',
    values: {
      perspective: 1200,
      rotateX: 45,
      rotateY: 0,
      rotateZ: -45,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Top Right',
    values: {
      perspective: 1200,
      rotateX: 45,
      rotateY: 0,
      rotateZ: 45,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Front Depth',
    values: {
      perspective: 1000,
      rotateX: 10,
      rotateY: 0,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Side Depth',
    values: {
      perspective: 1000,
      rotateX: 0,
      rotateY: -15,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Complex Tilt',
    values: {
      perspective: 900,
      rotateX: 10,
      rotateY: -15,
      rotateZ: 5,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Complex Tilt Reverse',
    values: {
      perspective: 900,
      rotateX: -10,
      rotateY: 15,
      rotateZ: -5,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Skew Left',
    values: {
      perspective: 800,
      rotateX: 3,
      rotateY: 10,
      rotateZ: -5,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Skew Right',
    values: {
      perspective: 800,
      rotateX: -3,
      rotateY: -10,
      rotateZ: 5,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Scale Down',
    values: {
      perspective: 900,
      rotateX: 5,
      rotateY: -5,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Scale Up',
    values: {
      perspective: 900,
      rotateX: -5,
      rotateY: 5,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Extreme Angle',
    values: {
      perspective: 1000,
      rotateX: 10,
      rotateY: 20,
      rotateZ: -15,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
  {
    name: 'Extreme Reverse',
    values: {
      perspective: 1000,
      rotateX: -10,
      rotateY: -20,
      rotateZ: 15,
      translateX: 0,
      translateY: 0,
      scale: 1,
    },
  },
];

export function Perspective3DControls() {
  const { perspective3D, setPerspective3D, imageShadow, setImageShadow } = useImageStore();
  const [selectedPresetIndex, setSelectedPresetIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const currentIndex = PRESETS.findIndex((preset) => {
      const values = preset.values;
      return (
        Math.abs(values.perspective - perspective3D.perspective) < 10 &&
        Math.abs(values.rotateX - perspective3D.rotateX) < 2 &&
        Math.abs(values.rotateY - perspective3D.rotateY) < 2 &&
        Math.abs(values.rotateZ - perspective3D.rotateZ) < 2 &&
        Math.abs(values.translateX - perspective3D.translateX) < 1 &&
        Math.abs(values.translateY - perspective3D.translateY) < 1 &&
        Math.abs(values.scale - perspective3D.scale) < 0.05
      );
    });
    setSelectedPresetIndex(currentIndex >= 0 ? currentIndex : null);
  }, [perspective3D]);

  const applyPreset = (preset: TransformPreset, index: number) => {
    setPerspective3D(preset.values);
    setSelectedPresetIndex(index);
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
    setSelectedPresetIndex(0);
  };

  const getTransformStyle = (preset: TransformPreset) => {
    const { rotateX, rotateY, rotateZ, translateX, translateY, scale } = preset.values;
    return {
      transform: `translate(${translateX}%, ${translateY}%) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
    };
  };

  const getPerspectiveStyle = (preset: TransformPreset) => {
    return {
      perspective: `${preset.values.perspective}px`,
    };
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

      <div className="flex overflow-x-auto scroll-m-0 space-x-3 p-1.5 -mx-1.5">
        {PRESETS.map((preset, index) => {
          const isSelected = selectedPresetIndex === index;
          return (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset, index)}
              className={cn(
                'flex items-center justify-center bg-[rgb(192,192,192)] shrink-0 w-16 h-16 rounded-sm overflow-hidden transition-all cursor-pointer',
                'hover:opacity-80 active:scale-95',
                isSelected && 'border-2 border-gray-800 dark:border-gray-300'
              )}
              style={getPerspectiveStyle(preset)}
            >
              <div
                className="w-10 h-10 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                style={getTransformStyle(preset)}
              />
            </button>
          );
        })}
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
      </div>

      <ShadowControls shadow={imageShadow} onShadowChange={setImageShadow} />
    </div>
  );
}

