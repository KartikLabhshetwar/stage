"use client";

import * as React from "react";
import { useImageStore } from "@/lib/store";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    name: "Default",
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
    name: "3D Tilt",
    values: {
      perspective: 200,
      rotateX: 11,
      rotateY: -20,
      rotateZ: 7,
      translateX: -2,
      translateY: -2,
      scale: 0.9,
    },
  },
  {
    name: "Deep Perspective",
    values: {
      perspective: 500,
      rotateX: 15,
      rotateY: -25,
      rotateZ: 5,
      translateX: 0,
      translateY: 0,
      scale: 0.85,
    },
  },
  {
    name: "Subtle Angle",
    values: {
      perspective: 300,
      rotateX: 5,
      rotateY: -10,
      rotateZ: 2,
      translateX: 0,
      translateY: 0,
      scale: 0.95,
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
          <Label className="text-sm font-semibold text-foreground">
            3D Perspective
          </Label>
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
      <div className="grid grid-cols-2 gap-2">
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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-foreground">
              Perspective
            </Label>
            <span className="text-xs text-muted-foreground font-medium">
              {perspective3D.perspective}px
            </span>
          </div>
          <Slider
            value={[perspective3D.perspective]}
            onValueChange={(value) =>
              setPerspective3D({ perspective: value[0] })
            }
            min={50}
            max={1000}
            step={10}
          />
        </div>

        {/* Rotate X */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-foreground">
              Rotate X
            </Label>
            <span className="text-xs text-muted-foreground font-medium">
              {perspective3D.rotateX}°
            </span>
          </div>
          <Slider
            value={[perspective3D.rotateX]}
            onValueChange={(value) => setPerspective3D({ rotateX: value[0] })}
            min={-45}
            max={45}
            step={1}
          />
        </div>

        {/* Rotate Y */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-foreground">
              Rotate Y
            </Label>
            <span className="text-xs text-muted-foreground font-medium">
              {perspective3D.rotateY}°
            </span>
          </div>
          <Slider
            value={[perspective3D.rotateY]}
            onValueChange={(value) => setPerspective3D({ rotateY: value[0] })}
            min={-45}
            max={45}
            step={1}
          />
        </div>

        {/* Rotate Z */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-foreground">
              Rotate Z
            </Label>
            <span className="text-xs text-muted-foreground font-medium">
              {perspective3D.rotateZ}°
            </span>
          </div>
          <Slider
            value={[perspective3D.rotateZ]}
            onValueChange={(value) => setPerspective3D({ rotateZ: value[0] })}
            min={-45}
            max={45}
            step={1}
          />
        </div>

        {/* Translate X */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-foreground">
              Translate X
            </Label>
            <span className="text-xs text-muted-foreground font-medium">
              {perspective3D.translateX}%
            </span>
          </div>
          <Slider
            value={[perspective3D.translateX]}
            onValueChange={(value) =>
              setPerspective3D({ translateX: value[0] })
            }
            min={-10}
            max={10}
            step={0.5}
          />
        </div>

        {/* Translate Y */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-foreground">
              Translate Y
            </Label>
            <span className="text-xs text-muted-foreground font-medium">
              {perspective3D.translateY}%
            </span>
          </div>
          <Slider
            value={[perspective3D.translateY]}
            onValueChange={(value) =>
              setPerspective3D({ translateY: value[0] })
            }
            min={-10}
            max={10}
            step={0.5}
          />
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-foreground">Scale</Label>
            <span className="text-xs text-muted-foreground font-medium">
              {perspective3D.scale.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[perspective3D.scale]}
            onValueChange={(value) => setPerspective3D({ scale: value[0] })}
            min={0.5}
            max={1.5}
            step={0.01}
          />
        </div>
      </div>
    </div>
  );
}
