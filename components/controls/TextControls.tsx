"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useCanvas } from "@/hooks/useCanvas";
import { DEFAULT_TEXT_FONT_SIZE, DEFAULT_TEXT_COLOR } from "@/lib/constants";
import { TextT } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface TextControlsProps {
  className?: string;
}

export function TextControls({ className }: TextControlsProps) {
  const { operations, selectedObject, canvas } = useCanvas();
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(DEFAULT_TEXT_FONT_SIZE);
  const [color, setColor] = useState(DEFAULT_TEXT_COLOR);
  const [isEditing, setIsEditing] = useState(false);

  // Check if selected object is text
  const isTextSelected = selectedObject && selectedObject.type === "text";

  useEffect(() => {
    if (isTextSelected && selectedObject) {
      setText(selectedObject.text || "");
      setFontSize(selectedObject.fontSize || DEFAULT_TEXT_FONT_SIZE);
      setColor(selectedObject.fill || DEFAULT_TEXT_COLOR);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isTextSelected, selectedObject]);

  const handleAddText = useCallback(async () => {
    if (!text.trim() || !canvas) return;

    try {
      const width = typeof canvas.width === 'function' ? canvas.width() : canvas.width || 1920;
      const height = typeof canvas.height === 'function' ? canvas.height() : canvas.height || 1080;
      
      await operations.addText(text, {
        fontSize,
        color,
        x: width / 2,
        y: height / 2,
      });
      // Reset form
      setText("");
      setIsEditing(true);
    } catch (err) {
      console.error("Failed to add text:", err);
    }
  }, [text, fontSize, color, operations, canvas]);

  const updateSelectedText = useCallback(
    (property: string, value: string | number) => {
      if (!isTextSelected || !selectedObject) return;

      operations.transformObject(undefined, {
        [property]: value,
      });

      if (property === "fontSize") {
        setFontSize(value as number);
      } else if (property === "fill") {
        setColor(value as string);
      }
    },
    [isTextSelected, selectedObject, operations]
  );

  const updateTextContent = useCallback(
    (newText: string) => {
      if (!isTextSelected || !selectedObject) return;
      setText(newText);
      // Update text directly through transformObject with text property
      operations.transformObject(undefined, { text: newText } as any);
    },
    [isTextSelected, selectedObject, operations]
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TextT size={16} weight="regular" />
          Text Overlay
        </CardTitle>
        <CardDescription>
          {isEditing ? "Edit selected text" : "Add text to your showcase"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Text</label>
          <Input
            type="text"
            placeholder="Enter text..."
            value={text}
            onChange={(e) => {
              const newText = e.target.value;
              setText(newText);
              if (isTextSelected) {
                updateTextContent(newText);
              }
            }}
          />
        </div>

        {/* Font Size */}
        {isEditing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Font Size</label>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => updateSelectedText("fontSize", Number(e.target.value))}
                className="w-20 h-8"
                min={12}
                max={200}
              />
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => updateSelectedText("fontSize", value)}
              min={12}
              max={200}
              step={1}
            />
          </div>
        )}

        {/* Color */}
        {isEditing && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={color}
                onChange={(e) => updateSelectedText("fill", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => updateSelectedText("fill", e.target.value)}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>
        )}

        {/* Add Button (only show when not editing) */}
        {!isEditing && (
          <Button onClick={handleAddText} className="w-full" disabled={!text.trim()}>
            Add Text
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
