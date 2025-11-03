"use client";

import { useState } from "react";
import { CloudArrowUp, TextT, PaintBrush, Download, ImageSquare as ImageIcon, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCanvas } from "@/hooks/useCanvas";
import { useCanvasContext } from "./CanvasContext";
import Konva from "konva";
import { useDropzone } from "react-dropzone";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, DEFAULT_TEXT_FONT_SIZE, DEFAULT_TEXT_COLOR } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export function CanvasToolbar() {
  const { operations, canvas } = useCanvas();
  const { stage, layer, objects } = useCanvasContext();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundType, setBackgroundType] = useState<"solid" | "gradient" | "image">("solid");
  const [gradientColors, setGradientColors] = useState(["#ffffff", "#3b82f6"]);
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);

  // Upload states
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Text states
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(DEFAULT_TEXT_FONT_SIZE);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);

  // Export states
  const [exportFormat, setExportFormat] = useState<"png" | "jpg">("png");
  const [exportQuality, setExportQuality] = useState(0.92);
  const [isExporting, setIsExporting] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(", ")}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      setUploadError(null);
      const url = URL.createObjectURL(file);

      try {
        await operations.addImage(url);
        setUploadDialogOpen(false);
      } catch (err) {
        setUploadError("Failed to load image. Please try again.");
        console.error(err);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": ALLOWED_IMAGE_TYPES.map((type) => type.split("/")[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  const handleAddText = async () => {
    if (!text.trim() || !canvas) return;

    try {
      const width = typeof canvas.width === 'function' ? canvas.width() : canvas.width || 1920;
      const height = typeof canvas.height === 'function' ? canvas.height() : canvas.height || 1080;

      await operations.addText(text, {
        fontSize,
        color: textColor,
        x: width / 2,
        y: height / 2,
      });
      setTextDialogOpen(false);
      setText("");
    } catch (err) {
      console.error("Failed to add text:", err);
    }
  };

  const updateCanvasBackground = (color: string) => {
    if (layer) {
      const bgRect = layer.findOne((node: any) => node.id() === "canvas-background") as Konva.Rect;
      if (bgRect && bgRect instanceof Konva.Rect) {
        // Clear any gradient or pattern
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
        // Clear any existing pattern first (gradient will override fill)
        bgRect.fillPatternImage(null);
        
        // Build color stops array: [offset1, color1, offset2, color2, ...]
        // Konva accepts hex color strings directly in the array
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
          // Clear radial gradient if it was set before
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
          // Clear linear gradient if it was set before
          bgRect.fillLinearGradientColorStops([]);
        }
        
        // Force redraw
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
          
          // Add timeout to avoid hanging
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
          // Clear any gradient or solid fill
          bgRect.fill(null);
          bgRect.fillLinearGradientColorStops([]);
          bgRect.fillRadialGradientColorStops([]);
          
          // Use fillPatternImage for background
          bgRect.fillPatternImage(img);
          bgRect.fillPatternRepeat("no-repeat");
          
          // Scale image to fit canvas
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
        alert("Failed to load background image. Please try again.");
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

  // Static background images from public/backgrounds directory
  // These images appear as preset options in the Background Image tab
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dataURL = await operations.exportCanvas(exportFormat, exportQuality);

      const link = document.createElement("a");
      link.download = `stage-${Date.now()}.${exportFormat}`;
      link.href = dataURL;
      
      // Append to body, click to download, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportDialogOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="w-full flex justify-center z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setUploadDialogOpen(true)}
          className="h-10 w-10"
          title="Upload Image"
        >
          <CloudArrowUp size={20} weight="regular" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTextDialogOpen(true)}
          className="h-10 w-10"
          title="Add Text"
        >
          <TextT size={20} weight="regular" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setColorDialogOpen(true)}
          className="h-10 w-10"
          title="Change Background Color"
        >
          <PaintBrush size={20} weight="regular" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExportDialogOpen(true)}
          className="h-10 w-10"
          title="Export Canvas"
        >
          <Download size={20} weight="regular" />
        </Button>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <ImageIcon className="mx-auto mb-4 text-gray-400" size={48} weight="regular" />
              {isDragActive ? (
                <p className="text-sm">Drop the image here...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drag & drop an image here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
                  </p>
                </div>
              )}
            </div>
            {uploadError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {uploadError}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Text Dialog */}
      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Text</label>
              <Input
                type="text"
                placeholder="Enter text..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && text.trim()) {
                    handleAddText();
                  }
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Font Size</label>
                <Input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-20 h-8"
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
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Existing Text Objects */}
            {objects.filter((obj) => obj.type === "text").length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Existing Text Objects</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {objects
                    .filter((obj) => obj.type === "text")
                    .map((textObj) => (
                      <div
                        key={textObj.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: textObj.fill || "#000000" }}>
                            {textObj.text || "Empty text"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Size: {textObj.fontSize || 48}px
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="ml-2 shrink-0"
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

            <Button onClick={handleAddText} className="w-full" disabled={!text.trim()}>
              Add Text
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Color Dialog */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Background Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Background Type Tabs */}
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => setBackgroundType("solid")}
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  backgroundType === "solid"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => setBackgroundType("gradient")}
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  backgroundType === "gradient"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Gradient
              </button>
              <button
                onClick={() => setBackgroundType("image")}
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  backgroundType === "image"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Image
              </button>
            </div>

            {/* Solid Color */}
            {backgroundType === "solid" && (
            <div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Color</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setBackgroundColor(color);
                      updateCanvasBackground(color);
                    }}
                    className="w-20 h-20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    placeholder="#ffffff"
                    className="flex-1"
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
                <label className="text-sm font-medium">Preset Colors</label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "#ffffff", "#000000", "#f3f4f6", "#ef4444",
                    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
                    "#ec4899", "#06b6d4", "#84cc16", "#f97316",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gradient Type</label>
                  <div className="flex gap-2">
                    <Button
                      variant={gradientType === "linear" ? "default" : "outline"}
                      onClick={() => {
                        setGradientType("linear");
                        updateCanvasGradient(gradientColors, "linear");
                      }}
                      className="flex-1"
                    >
                      Linear
                    </Button>
                    <Button
                      variant={gradientType === "radial" ? "default" : "outline"}
                      onClick={() => {
                        setGradientType("radial");
                        updateCanvasGradient(gradientColors, "radial");
                      }}
                      className="flex-1"
                    >
                      Radial
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Colors</label>
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
                        className="w-16 h-10 cursor-pointer"
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
                        className="flex-1"
                        placeholder="#ffffff"
                      />
                      {gradientColors.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newColors = gradientColors.filter((_, i) => i !== index);
                            setGradientColors(newColors);
                            updateCanvasGradient(newColors, gradientType);
                          }}
                        >
                          <X size={16} weight="regular" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newColors = [...gradientColors, "#000000"];
                      setGradientColors(newColors);
                    }}
                  >
                    Add Color
                  </Button>
                </div>

                {/* Preset Gradients */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preset Gradients</label>
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
                        className="h-12 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors relative overflow-hidden"
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
                    <label className="text-sm font-medium">Preset Backgrounds</label>
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
                  <label className="text-sm font-medium">Upload Background Image</label>
                  <div
                    {...getBgRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isBgDragActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input {...getBgInputProps()} />
                    <ImageIcon className="mx-auto mb-3 text-gray-400" size={40} weight="regular" />
                    {isBgDragActive ? (
                      <p className="text-sm">Drop the image here...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Drag & drop an image here, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
                        </p>
                      </div>
                    )}
                  </div>
                  {bgUploadError && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
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

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Canvas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <div className="flex gap-2">
                <Button
                  variant={exportFormat === "png" ? "default" : "outline"}
                  onClick={() => setExportFormat("png")}
                  className="flex-1"
                >
                  PNG
                </Button>
                <Button
                  variant={exportFormat === "jpg" ? "default" : "outline"}
                  onClick={() => setExportFormat("jpg")}
                  className="flex-1"
                >
                  JPG
                </Button>
              </div>
            </div>

            {exportFormat === "jpg" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(exportQuality * 100)}%
                  </span>
                </div>
                <Slider
                  value={[exportQuality]}
                  onValueChange={([value]) => setExportQuality(value)}
                  min={0.1}
                  max={1}
                  step={0.01}
                />
              </div>
            )}

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
              size="lg"
            >
              {isExporting ? "Exporting..." : `Export as ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
