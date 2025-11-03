"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useCanvas } from "@/hooks/useCanvas";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransformControlsProps {
  className?: string;
}

export function TransformControls({ className }: TransformControlsProps) {
  const { selectedObject, operations, canvas } = useCanvas();
  const [transformValues, setTransformValues] = useState({
    left: 0,
    top: 0,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
  });
  const [hasSelectedObject, setHasSelectedObject] = useState(false);

  useEffect(() => {
    if (selectedObject && canvas) {
      const obj = selectedObject;
      setTransformValues({
        left: Math.round(obj.left || 0),
        top: Math.round(obj.top || 0),
        scaleX: Math.round((obj.scaleX || 1) * 100) / 100,
        scaleY: Math.round((obj.scaleY || 1) * 100) / 100,
        angle: Math.round(obj.angle || 0),
      });
      setHasSelectedObject(true);
    } else {
      setHasSelectedObject(false);
    }
  }, [selectedObject, canvas]);

  const updateTransform = useCallback(
    (property: string, value: number) => {
      if (!selectedObject) return;

      const updates: any = { [property]: value };
      operations.transformObject(undefined, updates);

      // Update local state
      setTransformValues((prev) => ({
        ...prev,
        [property]: value,
      }));
    },
    [selectedObject, operations]
  );

  const handleDelete = useCallback(() => {
    if (!selectedObject) return;
    operations.deleteObject(undefined);
    setHasSelectedObject(false);
  }, [selectedObject, operations]);

  if (!hasSelectedObject) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Transform</CardTitle>
          <CardDescription>Select an object to transform</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const canvasWidth = canvas?.getWidth() || 1920;
  const canvasHeight = canvas?.getHeight() || 1080;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Transform</CardTitle>
        <CardDescription>Adjust position, scale, and rotation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Position X</label>
            <Input
              type="number"
              value={transformValues.left}
              onChange={(e) => updateTransform("left", Number(e.target.value))}
              className="w-20 h-8"
            />
          </div>
          <Slider
            value={[transformValues.left]}
            onValueChange={([value]) => updateTransform("left", value)}
            min={0}
            max={canvasWidth}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Position Y</label>
            <Input
              type="number"
              value={transformValues.top}
              onChange={(e) => updateTransform("top", Number(e.target.value))}
              className="w-20 h-8"
            />
          </div>
          <Slider
            value={[transformValues.top]}
            onValueChange={([value]) => updateTransform("top", value)}
            min={0}
            max={canvasHeight}
            step={1}
          />
        </div>

        {/* Scale */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Scale</label>
            <Input
              type="number"
              value={Math.round(transformValues.scaleX * 100)}
              onChange={(e) => {
                const scale = Number(e.target.value) / 100;
                updateTransform("scaleX", scale);
                updateTransform("scaleY", scale);
              }}
              className="w-20 h-8"
            />
          </div>
          <Slider
            value={[transformValues.scaleX * 100]}
            onValueChange={([value]) => {
              const scale = value / 100;
              updateTransform("scaleX", scale);
              updateTransform("scaleY", scale);
            }}
            min={10}
            max={300}
            step={1}
          />
        </div>

        {/* Rotation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rotation</label>
            <Input
              type="number"
              value={transformValues.angle}
              onChange={(e) => updateTransform("angle", Number(e.target.value))}
              className="w-20 h-8"
            />
          </div>
          <Slider
            value={[transformValues.angle]}
            onValueChange={([value]) => updateTransform("angle", value)}
            min={-180}
            max={180}
            step={1}
          />
        </div>

        {/* Delete Button */}
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Object
        </Button>
      </CardContent>
    </Card>
  );
}
