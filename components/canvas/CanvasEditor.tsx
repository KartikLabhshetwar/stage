"use client";

import { useEffect, useRef } from "react";
import { useCanvasContext } from "./CanvasContext";
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "@/lib/constants";

interface CanvasEditorProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  className?: string;
}

export function CanvasEditor({
  width = DEFAULT_CANVAS_WIDTH,
  height = DEFAULT_CANVAS_HEIGHT,
  backgroundColor = "#ffffff",
  className = "",
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initializeCanvas, canvas } = useCanvasContext();

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      initializeCanvas(canvasRef.current);
    }
  }, [canvas, initializeCanvas]);

  useEffect(() => {
    if (canvas) {
      canvas.setWidth(width);
      canvas.setHeight(height);
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
    }
  }, [canvas, width, height, backgroundColor]);

  return (
    <div className={`relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 ${className}`}>
      <canvas ref={canvasRef} className="block max-w-full h-auto" />
    </div>
  );
}
