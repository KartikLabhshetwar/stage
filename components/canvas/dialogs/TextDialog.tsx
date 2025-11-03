"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_TEXT_FONT_SIZE, DEFAULT_TEXT_COLOR } from "@/lib/constants";
import { useCanvasContext } from "../CanvasContext";

interface TextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddText: (text: string, options: { fontSize: number; color: string; x: number; y: number }) => Promise<void>;
}

export function TextDialog({ open, onOpenChange, onAddText }: TextDialogProps) {
  const { objects, operations, canvasDimensions } = useCanvasContext();
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(DEFAULT_TEXT_FONT_SIZE);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);

  const handleAddText = async () => {
    if (!text.trim()) return;

    try {
      await onAddText(text, {
        fontSize,
        color: textColor,
        x: canvasDimensions.width / 2,
        y: canvasDimensions.height / 2,
      });
      onOpenChange(false);
      setText("");
    } catch (err) {
      console.error("Failed to add text:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add Text</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Text</label>
            <Input
              type="text"
              placeholder="Enter your text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && text.trim()) {
                  handleAddText();
                }
              }}
              className="h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Font Size</label>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-24 h-9 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                min={12}
                max={200}
              />
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={12}
              max={200}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Color</label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
              />
              <Input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400 font-mono"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Existing Text Objects */}
          {objects.filter((obj) => obj.type === "text").length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-sm font-semibold text-gray-700">Existing Text</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {objects
                  .filter((obj) => obj.type === "text")
                  .map((textObj) => (
                    <div
                      key={textObj.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: textObj.fill || "#000000" }}>
                          {textObj.text || "Empty text"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {textObj.fontSize || 48}px
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 shrink-0 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          operations.deleteObject(textObj.id);
                        }}
                        title="Remove text"
                      >
                        <X size={16} weight="regular" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleAddText} 
            className="w-full h-11 font-semibold bg-blue-600 hover:bg-blue-700" 
            disabled={!text.trim()}
          >
            Add Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

