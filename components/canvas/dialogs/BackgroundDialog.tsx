"use client";

import { useState } from "react";
import { ImageSquare as ImageIcon, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { useCanvasContext } from "../CanvasContext";
import Konva from "konva";

interface BackgroundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackgroundDialog({ open, onOpenChange }: BackgroundDialogProps) {
  const { stage, layer } = useCanvasContext();
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundType, setBackgroundType] = useState<"solid" | "gradient" | "image">("solid");
  const [gradientColors, setGradientColors] = useState(["#ffffff", "#3b82f6"]);
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);

  const staticBackgrounds: string[] = [
    "/backgrounds/mac-asset-1.jpeg",
    "/backgrounds/mac-assest-2.jpg",
    "/backgrounds/mac-asset-3.jpg",
    "/backgrounds/mac-asset-4.jpg",
    "/backgrounds/mac-asset-5.jpg",
    "/backgrounds/mac-asset-6.jpeg",
    "/backgrounds/mac-asset-7.png",
    "/backgrounds/mac-asset-8.jpg",
    "/backgrounds/mac-asset-9.jpg",
    "/backgrounds/mac-asset-10.jpg",
  ];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(", ")}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const updateCanvasBackground = (color: string) => {
    if (layer) {
      const bgRect = layer.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
      if (bgRect && bgRect instanceof Konva.Rect) {
        bgRect.fillPatternImage(null);
        bgRect.fillLinearGradientColorStops([]);
        bgRect.fillRadialGradientColorStops([]);
        bgRect.fill(color);
        layer.batchDraw();
      }
    }
  };

  const updateCanvasGradient = (colors: string[], type: "linear" | "radial") => {
    if (layer && stage) {
      const bgRect = layer.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
      if (bgRect && bgRect instanceof Konva.Rect) {
        bgRect.fillPatternImage(null);
        
        const colorStopsArray: (number | string)[] = [];
        colors.forEach((color, index) => {
          const offset = colors.length === 1 ? 0 : index / Math.max(1, colors.length - 1);
          colorStopsArray.push(offset);
          colorStopsArray.push(color);
        });
        
        if (type === "linear") {
          bgRect.fillLinearGradientColorStops(colorStopsArray);
          bgRect.fillLinearGradientStartPoint({ x: 0, y: 0 });
          bgRect.fillLinearGradientEndPoint({ x: stage.width(), y: stage.height() });
          bgRect.fillRadialGradientColorStops([]);
        } else {
          const centerX = stage.width() / 2;
          const centerY = stage.height() / 2;
          const radius = Math.max(stage.width(), stage.height()) / 2;
          bgRect.fillRadialGradientColorStops(colorStopsArray);
          bgRect.fillRadialGradientStartPoint({ x: centerX, y: centerY });
          bgRect.fillRadialGradientStartRadius(0);
          bgRect.fillRadialGradientEndPoint({ x: centerX, y: centerY });
          bgRect.fillRadialGradientEndRadius(radius);
          bgRect.fillLinearGradientColorStops([]);
        }
        
        layer.batchDraw();
      }
    }
  };

  const updateCanvasBackgroundImage = async (imageUrl: string) => {
    if (layer && stage) {
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = "anonymous";
          
          const timeout = setTimeout(() => {
            reject(new Error("Image load timeout"));
          }, 10000);
          
          image.onload = () => {
            clearTimeout(timeout);
            resolve(image);
          };
          image.onerror = (err) => {
            clearTimeout(timeout);
            reject(err);
          };
          
          image.src = imageUrl;
        });

        const bgRect = layer.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
        if (bgRect && bgRect instanceof Konva.Rect) {
          bgRect.fill(null);
          bgRect.fillLinearGradientColorStops([]);
          bgRect.fillRadialGradientColorStops([]);
          
          bgRect.fillPatternImage(img);
          bgRect.fillPatternRepeat("no-repeat");
          
          const scaleX = stage.width() / img.width;
          const scaleY = stage.height() / img.height;
          bgRect.fillPatternScale({ x: scaleX, y: scaleY });
          bgRect.fillPatternOffset({ x: 0, y: 0 });
          
          layer.batchDraw();
          setBackgroundImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("Failed to load background image:", error);
        setBgUploadError("Failed to load background image. Please try again.");
      }
    }
  };

  const handleBackgroundImageUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setBgUploadError(validationError);
      return;
    }

    setBgUploadError(null);
    const url = URL.createObjectURL(file);
    await updateCanvasBackgroundImage(url);
    setBackgroundType("image");
  };

  const { getRootProps: getBgRootProps, getInputProps: getBgInputProps, isDragActive: isBgDragActive } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await handleBackgroundImageUpload(acceptedFiles[0]);
      }
    },
    accept: {
      "image/*": ALLOWED_IMAGE_TYPES.map((type) => type.split("/")[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Background Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Background Type Tabs */}
          <div className="flex gap-1.5 p-1 bg-gray-50 rounded-lg border border-gray-200">
            <button
              onClick={() => setBackgroundType("solid")}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                backgroundType === "solid"
                  ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => setBackgroundType("gradient")}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                backgroundType === "gradient"
                  ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              Gradient
            </button>
            <button
              onClick={() => setBackgroundType("image")}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                backgroundType === "image"
                  ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              Image
            </button>
          </div>

          {/* Solid Color */}
          {backgroundType === "solid" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Color</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setBackgroundColor(color);
                      updateCanvasBackground(color);
                    }}
                    className="w-20 h-20 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    placeholder="#ffffff"
                    className="flex-1 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400 font-mono"
                    onChange={(e) => {
                      const color = e.target.value;
                      setBackgroundColor(color);
                      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
                        updateCanvasBackground(color);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Preset Colors */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Preset Colors</label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "#ffffff", "#000000", "#f3f4f6", "#ef4444",
                    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
                    "#ec4899", "#06b6d4", "#84cc16", "#f97316",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setBackgroundColor(color);
                        updateCanvasBackground(color);
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gradient */}
          {backgroundType === "gradient" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Gradient Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={gradientType === "linear" ? "default" : "outline"}
                    onClick={() => {
                      setGradientType("linear");
                      updateCanvasGradient(gradientColors, "linear");
                    }}
                    className={`flex-1 ${gradientType === "linear" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  >
                    Linear
                  </Button>
                  <Button
                    variant={gradientType === "radial" ? "default" : "outline"}
                    onClick={() => {
                      setGradientType("radial");
                      updateCanvasGradient(gradientColors, "radial");
                    }}
                    className={`flex-1 ${gradientType === "radial" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  >
                    Radial
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Colors</label>
                {gradientColors.map((color, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...gradientColors];
                        newColors[index] = e.target.value;
                        setGradientColors(newColors);
                        updateCanvasGradient(newColors, gradientType);
                      }}
                      className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...gradientColors];
                        newColors[index] = e.target.value;
                        setGradientColors(newColors);
                        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)) {
                          updateCanvasGradient(newColors, gradientType);
                        }
                      }}
                      className="flex-1 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400 font-mono"
                      placeholder="#ffffff"
                    />
                    {gradientColors.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          const newColors = gradientColors.filter((_, i) => i !== index);
                          setGradientColors(newColors);
                          updateCanvasGradient(newColors, gradientType);
                        }}
                      >
                        <X size={18} weight="regular" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    const newColors = [...gradientColors, "#000000"];
                    setGradientColors(newColors);
                  }}
                >
                  + Add Color
                </Button>
              </div>

              {/* Preset Gradients */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Preset Gradients</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { colors: ["#667eea", "#764ba2"], type: "linear" as const },
                    { colors: ["#f093fb", "#f5576c"], type: "linear" as const },
                    { colors: ["#4facfe", "#00f2fe"], type: "linear" as const },
                    { colors: ["#43e97b", "#38f9d7"], type: "linear" as const },
                    { colors: ["#fa709a", "#fee140"], type: "linear" as const },
                    { colors: ["#30cfd0", "#330867"], type: "linear" as const },
                    { colors: ["#a8edea", "#fed6e3"], type: "linear" as const },
                    { colors: ["#ff9a9e", "#fecfef"], type: "linear" as const },
                    { colors: ["#ffecd2", "#fcb69f"], type: "linear" as const },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      className="h-14 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:scale-105 transition-all duration-200 relative overflow-hidden shadow-sm hover:shadow-md"
                      style={{
                        background: `linear-gradient(to right, ${preset.colors.join(", ")})`,
                      }}
                      onClick={() => {
                        setGradientColors(preset.colors);
                        setGradientType(preset.type);
                        updateCanvasGradient(preset.colors, preset.type);
                      }}
                      title={preset.colors.join(" → ")}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Background Image */}
          {backgroundType === "image" && (
            <div className="space-y-4">
              {staticBackgrounds.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Preset Backgrounds</label>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                    {staticBackgrounds.map((bgPath, idx) => (
                      <button
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 hover:border-2 transition-all group"
                        onClick={() => updateCanvasBackgroundImage(bgPath)}
                        title={`Use background ${idx + 1}`}
                      >
                        <img
                          src={bgPath}
                          alt={`Background ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Upload Background Image</label>
                <div
                  {...getBgRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isBgDragActive
                      ? "border-blue-500 bg-blue-50/50 scale-[1.02]"
                      : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/50"
                  }`}
                >
                  <input {...getBgInputProps()} />
                  <div className={`mx-auto mb-3 transition-colors ${isBgDragActive ? "text-blue-500" : "text-gray-400"}`}>
                    <ImageIcon size={44} weight="duotone" />
                  </div>
                  {isBgDragActive ? (
                    <p className="text-sm font-medium text-blue-600">Drop the image here...</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Drag & drop an image here
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse • PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
                      </p>
                    </div>
                  )}
                </div>
                {bgUploadError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {bgUploadError}
                  </div>
                )}
              </div>

              {backgroundImageUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Background</label>
                  <div className="relative rounded-lg overflow-hidden border">
                    <img
                      src={backgroundImageUrl}
                      alt="Background preview"
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        const bgRect = layer?.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
                        if (bgRect && bgRect instanceof Konva.Rect) {
                          bgRect.fillPatternImage(null);
                          bgRect.fill(backgroundColor);
                          layer?.batchDraw();
                          setBackgroundImageUrl(null);
                          setBackgroundType("solid");
                        }
                      }}
                    >
                      <X size={16} weight="regular" className="mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

