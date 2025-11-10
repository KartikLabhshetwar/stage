"use client";

import { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Group,
  Circle,
  Text,
  Path,
} from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/lib/store";
import { useImageStore } from "@/lib/store";
import { generatePattern } from "@/lib/patterns";
import { useResponsiveCanvasDimensions } from "@/hooks/useAspectRatioDimensions";
import { getBackgroundCSS } from "@/lib/constants/backgrounds";
import { getFontCSS } from "@/lib/constants/fonts";
import { generateNoiseTexture } from "@/lib/export/export-utils";
import { getCldImageUrl } from "@/lib/cloudinary";
import { OVERLAY_PUBLIC_IDS } from "@/lib/cloudinary-overlays";
import { MockupRenderer } from "@/components/mockups/MockupRenderer";

// Global ref to store the Konva stage for export
let globalKonvaStage: any = null;

/**
 * Parse CSS linear gradient string to Konva gradient properties
 * Example: "linear-gradient(to right, #FF6B6B, #FFE66D)"
 */
function parseLinearGradient(
  gradientString: string,
  width: number,
  height: number,
) {
  // Extract direction and colors from CSS gradient string
  const match = gradientString.match(/linear-gradient\((.+)\)/);
  if (!match) return null;

  const parts = match[1].split(",").map((p) => p.trim());
  const direction = parts[0];
  const colors = parts.slice(1);

  // Determine gradient direction
  let startPoint = { x: 0, y: 0 };
  let endPoint = { x: width, y: 0 }; // Default to horizontal (to right)

  if (direction.includes("right")) {
    startPoint = { x: 0, y: 0 };
    endPoint = { x: width, y: 0 };
  } else if (direction.includes("left")) {
    startPoint = { x: width, y: 0 };
    endPoint = { x: 0, y: 0 };
  } else if (direction.includes("bottom")) {
    startPoint = { x: 0, y: 0 };
    endPoint = { x: 0, y: height };
  } else if (direction.includes("top")) {
    startPoint = { x: 0, y: height };
    endPoint = { x: 0, y: 0 };
  }

  // Build color stops array [position, color, position, color, ...]
  const colorStops: (number | string)[] = [];
  colors.forEach((color, index) => {
    const position = index / (colors.length - 1);
    colorStops.push(position, color.trim());
  });

  return {
    startPoint,
    endPoint,
    colorStops,
  };
}

function CanvasRenderer({ image }: { image: HTMLImageElement }) {
  const stageRef = useRef<any>(null);

  // Store stage globally for export
  useEffect(() => {
    const updateStage = () => {
      if (stageRef.current) {
        // react-konva Stage ref gives us the Stage instance directly
        globalKonvaStage = stageRef.current;
      }
    };

    updateStage();
    // Also check after a short delay to ensure ref is set
    const timeout = setTimeout(updateStage, 100);

    return () => {
      clearTimeout(timeout);
      globalKonvaStage = null;
    };
  });
  const patternRectRef = useRef<any>(null);
  const noiseRectRef = useRef<any>(null);
  const backgroundRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [patternImage, setPatternImage] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [noiseImage, setNoiseImage] = useState<HTMLImageElement | null>(null);

  const {
    screenshot,
    background,
    shadow,
    pattern: patternStyle,
    frame,
    canvas,
    noise,
  } = useEditorStore();

  const {
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    perspective3D,
    imageOpacity,
    textOverlays,
    imageOverlays,
    mockups,
    updateTextOverlay,
    updateImageOverlay,
    updateMockup,
  } = useImageStore();

  const hasMockups = mockups.length > 0 && mockups.some((m) => m.isVisible);

  const responsiveDimensions = useResponsiveCanvasDimensions();
  const backgroundStyle = getBackgroundCSS(backgroundConfig);

  // Track viewport size for responsive canvas sizing
  const [viewportSize, setViewportSize] = useState({
    width: 1920,
    height: 1080,
  });

  // Load background image if type is 'image'
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Generate noise texture for background noise effect
  const [noiseTexture, setNoiseTexture] = useState<HTMLCanvasElement | null>(
    null,
  );

  // Load overlay images
  const [loadedOverlayImages, setLoadedOverlayImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  useEffect(() => {
    if (backgroundNoise > 0) {
      // Generate noise texture using Gaussian distribution for realistic grain
      const intensity = backgroundNoise / 100; // Convert percentage to 0-1 range
      const noiseCanvas = generateNoiseTexture(200, 200, intensity);
      setNoiseTexture(noiseCanvas);
    } else {
      setNoiseTexture(null);
    }
  }, [backgroundNoise]);

  // Get container dimensions early for use in useEffect
  const containerWidth = responsiveDimensions.width;
  const containerHeight = responsiveDimensions.height;

  useEffect(() => {
    if (backgroundConfig.type === "image" && backgroundConfig.value) {
      const imageValue = backgroundConfig.value as string;

      // Check if it's a valid image URL/blob/data URI or Cloudinary public ID
      // Skip if it looks like a gradient key (e.g., "primary_gradient")
      const isValidImageValue =
        imageValue.startsWith("http") ||
        imageValue.startsWith("blob:") ||
        imageValue.startsWith("data:") ||
        // Check if it might be a Cloudinary public ID (not a gradient key)
        (typeof imageValue === "string" && !imageValue.includes("_gradient"));

      if (!isValidImageValue) {
        setBgImage(null);
        return;
      }

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setBgImage(img);
      img.onerror = () => {
        console.error(
          "Failed to load background image:",
          backgroundConfig.value,
        );
        setBgImage(null);
      };

      // Check if it's a Cloudinary public ID or URL
      let imageUrl = imageValue;
      if (
        typeof imageUrl === "string" &&
        !imageUrl.startsWith("http") &&
        !imageUrl.startsWith("blob:") &&
        !imageUrl.startsWith("data:")
      ) {
        // It might be a Cloudinary public ID, construct URL
        const { cloudinaryPublicIds } = require("@/lib/cloudinary-backgrounds");
        if (cloudinaryPublicIds.includes(imageUrl)) {
          // Use container dimensions for better quality
          imageUrl = getCldImageUrl({
            src: imageUrl,
            width: Math.max(containerWidth, 1920),
            height: Math.max(containerHeight, 1080),
            quality: "auto",
            format: "auto",
            crop: "fill",
            gravity: "auto",
          });
        } else {
          // Invalid image value, don't try to load
          setBgImage(null);
          return;
        }
      }

      img.src = imageUrl;
    } else {
      setBgImage(null);
    }
  }, [backgroundConfig, containerWidth, containerHeight]);

  // Load overlay images
  useEffect(() => {
    const loadOverlays = async () => {
      const loadedImages: Record<string, HTMLImageElement> = {};

      for (const overlay of imageOverlays) {
        if (!overlay.isVisible) continue;

        try {
          const isCloudinaryId =
            OVERLAY_PUBLIC_IDS.includes(overlay.src as any) ||
            (typeof overlay.src === "string" &&
              overlay.src.startsWith("overlays/"));

          const imageUrl =
            isCloudinaryId && !overlay.isCustom
              ? getCldImageUrl({
                  src: overlay.src,
                  width: overlay.size * 2,
                  height: overlay.size * 2,
                  quality: "auto",
                  format: "auto",
                  crop: "fit",
                })
              : overlay.src;

          const img = new window.Image();
          img.crossOrigin = "anonymous";

          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              loadedImages[overlay.id] = img;
              resolve();
            };
            img.onerror = reject;
            img.src = imageUrl;
          });
        } catch (error) {
          console.error(
            `Failed to load overlay image for ${overlay.id}:`,
            error,
          );
        }
      }

      setLoadedOverlayImages(loadedImages);
    };

    loadOverlays();
  }, [imageOverlays]);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  useEffect(() => {
    if (!patternStyle.enabled) {
      setPatternImage(null);
      return;
    }

    const newPattern = generatePattern(
      patternStyle.type,
      patternStyle.scale,
      patternStyle.spacing,
      patternStyle.color,
      patternStyle.rotation,
      patternStyle.blur,
    );
    setPatternImage(newPattern);
  }, [
    patternStyle.enabled,
    patternStyle.type,
    patternStyle.scale,
    patternStyle.spacing,
    patternStyle.color,
    patternStyle.rotation,
    patternStyle.blur,
  ]);

  useEffect(() => {
    if (!noise.enabled || noise.type === "none") {
      setNoiseImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setNoiseImage(img);
    img.onerror = () => setNoiseImage(null);
    img.src = `/${noise.type}.jpg`;
  }, [noise.enabled, noise.type]);

  /* ─────────────────── layout helpers ─────────────────── */
  const imageAspect = image.naturalWidth / image.naturalHeight;

  // Calculate canvas aspect ratio from selected aspect ratio using responsive dimensions
  const canvasAspect = containerWidth / containerHeight;

  // Calculate content area (image area without padding)
  // Use viewport-aware dimensions, respecting the selected aspect ratio
  const availableWidth = Math.min(viewportSize.width * 1.1, containerWidth);
  const availableHeight = Math.min(viewportSize.height * 1.1, containerHeight);

  // Calculate canvas dimensions that maintain the selected aspect ratio
  let canvasW, canvasH;
  if (availableWidth / availableHeight > canvasAspect) {
    // Height is the limiting factor
    canvasH = availableHeight - canvas.padding * 2;
    canvasW = canvasH * canvasAspect;
  } else {
    // Width is the limiting factor
    canvasW = availableWidth - canvas.padding * 2;
    canvasH = canvasW / canvasAspect;
  }

  // Ensure reasonable dimensions
  const minContentSize = 300;
  canvasW = Math.max(canvasW, minContentSize);
  canvasH = Math.max(canvasH, minContentSize);

  // Content dimensions (without padding)
  const contentW = canvasW - canvas.padding * 2;
  const contentH = canvasH - canvas.padding * 2;

  useEffect(() => {
    if (patternRectRef.current) {
      patternRectRef.current.cache();
    }
  }, [patternImage, canvasW, canvasH, patternStyle.opacity, patternStyle.blur]);

  // Cache background when blur is active
  useEffect(() => {
    if (backgroundRef.current && backgroundBlur > 0) {
      backgroundRef.current.cache();
      backgroundRef.current.getLayer()?.batchDraw();
    }
  }, [
    backgroundBlur,
    backgroundConfig,
    backgroundBorderRadius,
    canvasW,
    canvasH,
    bgImage,
  ]);

  let imageScaledW, imageScaledH;
  if (contentW / contentH > imageAspect) {
    imageScaledH = contentH * screenshot.scale;
    imageScaledW = imageScaledH * imageAspect;
  } else {
    imageScaledW = contentW * screenshot.scale;
    imageScaledH = imageScaledW / imageAspect;
  }

  /* ─────────────────── frame helpers ─────────────────── */
  const showFrame = frame.enabled && frame.type !== "none";
  const frameOffset =
    showFrame && frame.type === "solid"
      ? frame.width
      : showFrame && frame.type === "ruler"
        ? frame.width + 2
        : 0;
  const windowPadding =
    showFrame && frame.type === "window" ? frame.padding || 20 : 0;
  const windowHeader = showFrame && frame.type === "window" ? 40 : 0;
  const eclipseBorder =
    showFrame && frame.type === "eclipse" ? frame.width + 2 : 0;
  const framedW =
    imageScaledW + frameOffset * 2 + windowPadding * 2 + eclipseBorder;
  const framedH =
    imageScaledH +
    frameOffset * 2 +
    windowPadding * 2 +
    windowHeader +
    eclipseBorder;

  const shadowProps = shadow.enabled
    ? (() => {
        const { elevation, side, softness, color, intensity } = shadow;
        const diag = elevation * 0.707;
        const offset =
          side === "bottom"
            ? { x: 0, y: elevation }
            : side === "right"
              ? { x: elevation, y: 0 }
              : side === "bottom-right"
                ? { x: diag, y: diag }
                : { x: 0, y: 0 };

        return {
          shadowColor: color,
          shadowBlur: softness,
          shadowOffsetX: offset.x,
          shadowOffsetY: offset.y,
          shadowOpacity: intensity,
        };
      })()
    : {};

  // Build CSS 3D transform string for image only
  // Include screenshot.rotation to match Konva Group rotation
  const perspective3DTransform = `
    translate(${perspective3D.translateX}%, ${perspective3D.translateY}%)
    scale(${perspective3D.scale})
    rotateX(${perspective3D.rotateX}deg)
    rotateY(${perspective3D.rotateY}deg)
    rotateZ(${perspective3D.rotateZ + screenshot.rotation}deg)
  `
    .replace(/\s+/g, " ")
    .trim();

  // Check if 3D transforms are active (any non-default value)
  const has3DTransform =
    perspective3D.rotateX !== 0 ||
    perspective3D.rotateY !== 0 ||
    perspective3D.rotateZ !== 0 ||
    perspective3D.translateX !== 0 ||
    perspective3D.translateY !== 0 ||
    perspective3D.scale !== 1;

  // Calculate image position relative to canvas
  // Account for Group position and offset
  const groupCenterX = canvasW / 2 + screenshot.offsetX;
  const groupCenterY = canvasH / 2 + screenshot.offsetY;
  const imageX = groupCenterX + frameOffset + windowPadding - imageScaledW / 2;
  const imageY =
    groupCenterY +
    frameOffset +
    windowPadding +
    windowHeader -
    imageScaledH / 2;

  // Helper function to parse gradient from CSS string
  const parseGradient = (bgStyle: React.CSSProperties) => {
    if (backgroundConfig.type === "gradient" && bgStyle.background) {
      const gradientStr = bgStyle.background as string;
      return gradientStr;
    }
    return null;
  };

  /* ─────────────────── render ─────────────────── */
  return (
    <div
      ref={containerRef}
      id="image-render-card"
      className="flex items-center justify-center relative"
      style={{
        width: "100%",
        maxWidth: `${containerWidth}px`,
        aspectRatio: responsiveDimensions.aspectRatio,
        maxHeight: "calc(100vh - 200px)",
        backgroundColor: "transparent",
        padding: "24px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${canvasW}px`,
          height: `${canvasH}px`,
          minWidth: `${canvasW}px`,
          minHeight: `${canvasH}px`,
          overflow: "visible",
        }}
      >
        {/* 3D Transformed Image Overlay - Only when 3D transforms are active (HTML fallback for 3D) */}
        {has3DTransform && (
          <div
            data-3d-overlay="true"
            style={{
              position: "absolute",
              left: `${imageX}px`,
              top: `${imageY}px`,
              width: `${imageScaledW}px`,
              height: `${imageScaledH}px`,
              perspective: `${perspective3D.perspective}px`,
              transformStyle: "preserve-3d",
              zIndex: 15,
              pointerEvents: "none",
            }}
          >
            <img
              src={image.src}
              alt="3D transformed"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imageOpacity,
                borderRadius:
                  showFrame && frame.type === "window"
                    ? "0 0 12px 12px"
                    : showFrame && frame.type === "ruler"
                      ? `${screenshot.radius * 0.8}px`
                      : `${screenshot.radius}px`,
                transform: perspective3DTransform,
                transformOrigin: "center center",
                willChange: "transform",
                transition: "transform 0.125s linear",
              }}
            />
          </div>
        )}

        {/* Pure Canvas Rendering with Konva */}
        <Stage
          width={canvasW}
          height={canvasH}
          ref={stageRef}
          className="hires-stage"
          style={{
            display: "block",
            backgroundColor: "transparent",
            overflow: "hidden",
            position: "relative",
            borderRadius: `${backgroundBorderRadius}px`,
          }}
        >
          {/* Background Layer - Canvas based */}
          <Layer>
            {backgroundConfig.type === "image" && bgImage ? (
              <KonvaImage
                ref={backgroundRef}
                image={bgImage}
                width={canvasW}
                height={canvasH}
                opacity={backgroundConfig.opacity ?? 1}
                cornerRadius={backgroundBorderRadius}
                filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
                blurRadius={backgroundBlur}
              />
            ) : backgroundConfig.type === "gradient" &&
              backgroundStyle.background ? (
              (() => {
                const gradientProps = parseLinearGradient(
                  backgroundStyle.background as string,
                  canvasW,
                  canvasH,
                );
                return gradientProps ? (
                  <Rect
                    ref={backgroundRef}
                    width={canvasW}
                    height={canvasH}
                    fillLinearGradientStartPoint={gradientProps.startPoint}
                    fillLinearGradientEndPoint={gradientProps.endPoint}
                    fillLinearGradientColorStops={gradientProps.colorStops}
                    opacity={backgroundConfig.opacity ?? 1}
                    cornerRadius={backgroundBorderRadius}
                    filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
                    blurRadius={backgroundBlur}
                  />
                ) : (
                  <Rect
                    ref={backgroundRef}
                    width={canvasW}
                    height={canvasH}
                    fill="#ffffff"
                    opacity={backgroundConfig.opacity ?? 1}
                    cornerRadius={backgroundBorderRadius}
                  />
                );
              })()
            ) : (
              <Rect
                ref={backgroundRef}
                width={canvasW}
                height={canvasH}
                fill={
                  backgroundConfig.type === "solid"
                    ? (backgroundStyle.backgroundColor as string)
                    : "#ffffff"
                }
                opacity={backgroundConfig.opacity ?? 1}
                cornerRadius={backgroundBorderRadius}
                filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
                blurRadius={backgroundBlur}
              />
            )}

            {/* Noise overlay on background */}
            {noiseTexture && backgroundNoise > 0 && (
              <Rect
                width={canvasW}
                height={canvasH}
                fillPatternImage={noiseTexture as any}
                fillPatternRepeat="repeat"
                opacity={backgroundNoise / 100}
                globalCompositeOperation="overlay"
                cornerRadius={backgroundBorderRadius}
              />
            )}
          </Layer>

          {/* Pattern Layer */}
          <Layer>
            {patternImage && (
              <Rect
                ref={patternRectRef}
                width={canvasW}
                height={canvasH}
                fillPatternImage={patternImage as any}
                fillPatternRepeat="repeat"
                opacity={patternStyle.opacity}
                perfectDrawEnabled={false}
              />
            )}
          </Layer>

          {/* Noise Layer (texture noise, not background noise) */}
          <Layer>
            {noiseImage && (
              <Rect
                ref={noiseRectRef}
                width={canvasW}
                height={canvasH}
                fillPatternImage={noiseImage as any}
                fillPatternRepeat="repeat"
                opacity={noise.opacity}
                perfectDrawEnabled={false}
              />
            )}
          </Layer>

          {/* Main Image Layer - Hide when mockups are active */}
          {!hasMockups && (
            <Layer>
              <Group
                x={canvasW / 2 + screenshot.offsetX}
                y={canvasH / 2 + screenshot.offsetY}
                width={framedW}
                height={framedH}
                offsetX={framedW / 2}
                offsetY={framedH / 2}
                rotation={screenshot.rotation}
              >
                {/* Solid Frame */}
                {showFrame && frame.type === "solid" && (
                  <Rect
                    width={framedW}
                    height={framedH}
                    fill={frame.color}
                    cornerRadius={screenshot.radius}
                    {...shadowProps}
                  />
                )}

                {/* Glassy Frame */}
                {showFrame && frame.type === "glassy" && (
                  <Rect
                    x={frameOffset + windowPadding}
                    y={frameOffset + windowPadding + windowHeader}
                    width={imageScaledW}
                    height={imageScaledH}
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth={frame.width * 4 + 6}
                    cornerRadius={screenshot.radius}
                    shadowForStrokeEnabled
                    {...shadowProps}
                  />
                )}

                {/* Ruler Frame */}
                {showFrame && frame.type === "ruler" && (
                  <Group>
                    <Rect
                      width={framedW}
                      height={framedH}
                      cornerRadius={screenshot.radius}
                      fill="rgba(0,0,0,0.3)"
                      shadowForStrokeEnabled
                      {...shadowProps}
                    />

                    <Rect
                      width={framedW - 1}
                      height={framedH - 1}
                      x={1}
                      y={1}
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth={1}
                      cornerRadius={Math.max(0, screenshot.radius - 2)}
                    />

                    <Group>
                      <Rect
                        width={framedW}
                        height={framedH}
                        fill="rgba(255, 255, 255, 0.2)"
                        cornerRadius={screenshot.radius}
                      />
                      <Group globalCompositeOperation="source-atop">
                        {/* Top ruler marks */}
                        {Array.from({
                          length: Math.floor(framedW / 10) - 1,
                        }).map((_, i) => (
                          <Rect
                            key={`t-${i}`}
                            x={i * 10}
                            y={1}
                            width={2}
                            height={(i + 1) % 5 === 0 ? 10 : 5}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                        ))}
                        {/* Left ruler marks */}
                        {Array.from({
                          length: Math.floor(framedH / 10) - 1,
                        }).map((_, i) => (
                          <Rect
                            key={`l-${i}`}
                            x={1}
                            y={i * 10}
                            width={(i + 1) % 5 === 0 ? 10 : 5}
                            height={2}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                        ))}
                        {/* Right ruler marks */}
                        {Array.from({
                          length: Math.floor(framedH / 10) - 1,
                        }).map((_, i) => (
                          <Rect
                            key={`r-${i}`}
                            x={framedW - 1}
                            y={i * 10}
                            width={(i + 1) % 5 === 0 ? -10 : -5}
                            height={2}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                        ))}
                        {/* Bottom ruler marks */}
                        {Array.from({
                          length: Math.floor(framedW / 10) - 1,
                        }).map((_, i) => (
                          <Rect
                            key={`b-${i}`}
                            x={i * 10}
                            y={framedH - 1}
                            width={2}
                            height={(i + 1) % 5 === 0 ? -10 : -5}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                        ))}
                      </Group>
                    </Group>

                    <Rect
                      width={framedW}
                      height={framedH}
                      stroke="rgba(0, 0, 0, 0.15)"
                      strokeWidth={1}
                      cornerRadius={screenshot.radius}
                    />
                  </Group>
                )}

                {/* Infinite Mirror Frame */}
                {showFrame && frame.type === "infinite-mirror" && (
                  <>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Rect
                        key={i}
                        width={framedW + i * 15}
                        height={framedH + i * 15}
                        x={-i * 7.5}
                        y={-i * 7.5}
                        stroke={frame.color}
                        strokeWidth={4}
                        cornerRadius={screenshot.radius + i * 5}
                        opacity={0.3 - i * 0.07}
                        {...(i === 0
                          ? { ...shadowProps, shadowForStrokeEnabled: true }
                          : {})}
                      />
                    ))}
                  </>
                )}

                {/* Eclipse Frame */}
                {showFrame && frame.type === "eclipse" && (
                  <Group>
                    <Rect
                      width={framedW}
                      height={framedH}
                      fill={frame.color}
                      cornerRadius={screenshot.radius + eclipseBorder}
                      {...shadowProps}
                    />
                    <Rect
                      globalCompositeOperation="destination-out"
                      x={eclipseBorder}
                      y={eclipseBorder}
                      width={framedW - eclipseBorder * 2}
                      height={framedH - eclipseBorder * 2}
                      fill="black"
                      cornerRadius={screenshot.radius}
                    />
                  </Group>
                )}

                {/* Stack Frame */}
                {showFrame && frame.type === "stack" && (
                  <>
                    {/* Bottom layer - darkest */}
                    <Rect
                      width={framedW / 1.2}
                      height={framedH / 5}
                      x={(framedW - framedW / 1.2) / 2}
                      y={-40}
                      fill={frame.theme === "dark" ? "#444444" : "#f5f5f5"}
                      cornerRadius={screenshot.radius}
                      opacity={1}
                      {...shadowProps}
                    />
                    {/* Middle layer */}
                    <Rect
                      width={framedW / 1.1}
                      height={framedH / 5}
                      x={(framedW - framedW / 1.1) / 2}
                      y={-20}
                      fill={frame.theme === "dark" ? "#2a2a2a" : "#f0f0f0"}
                      cornerRadius={screenshot.radius}
                      opacity={1}
                    />
                    {/* Top layer - lightest, will have image on top */}
                    <Rect
                      width={framedW}
                      height={framedH}
                      fill={frame.theme === "dark" ? "#555555" : "#e8e8e8"}
                      cornerRadius={screenshot.radius}
                      {...shadowProps}
                    />
                  </>
                )}

                {/* Window Frame */}
                {showFrame && frame.type === "window" && (
                  <>
                    <Rect // main window
                      width={framedW}
                      height={framedH}
                      fill={frame.theme === "dark" ? "#2f2f2f" : "#fefefe"}
                      cornerRadius={[
                        screenshot.radius / 2,
                        screenshot.radius / 2,
                        screenshot.radius,
                        screenshot.radius,
                      ]}
                      {...shadowProps}
                    />
                    <Rect // header
                      width={framedW}
                      height={windowHeader}
                      fill={frame.theme === "dark" ? "#4a4a4a" : "#e2e2e2"}
                      cornerRadius={[
                        screenshot.radius,
                        screenshot.radius,
                        0,
                        0,
                      ]}
                    />
                    {/* Window control buttons (red, yellow, green) */}
                    <Circle x={25} y={20} radius={10} fill="#ff5f57" />
                    <Circle x={50} y={20} radius={10} fill="#febc2e" />
                    <Circle x={75} y={20} radius={10} fill="#28c840" />
                    <Text
                      text={frame.title || ""}
                      x={0}
                      y={0}
                      width={framedW}
                      height={windowHeader}
                      align="center"
                      verticalAlign="middle"
                      fill={frame.theme === "dark" ? "#f0f0f0" : "#4f4f4f"}
                      fontSize={16}
                    />
                  </>
                )}

                {/* Dotted Frame */}
                {showFrame && frame.type === "dotted" && (
                  <Rect
                    width={framedW}
                    height={framedH}
                    stroke={frame.color}
                    strokeWidth={frame.width}
                    dash={[frame.width * 2, frame.width * 1.2]}
                    cornerRadius={screenshot.radius}
                  />
                )}

                {/* Focus Frame */}
                {showFrame && frame.type === "focus" && (
                  <Group>
                    <Path
                      data={`M ${frameOffset}, ${frameOffset + frame.width * 1.5} Q ${frameOffset}, ${frameOffset} ${frameOffset + frame.width * 1.5}, ${frameOffset}`}
                      stroke={frame.color}
                      strokeWidth={frame.width}
                      lineCap="round"
                      {...shadowProps}
                    />
                    <Path
                      data={`M ${frameOffset + imageScaledW}, ${frameOffset + imageScaledH - frame.width * 1.5} Q ${frameOffset + imageScaledW}, ${frameOffset + imageScaledH} ${frameOffset + imageScaledW - frame.width * 1.5}, ${frameOffset + imageScaledH}`}
                      stroke={frame.color}
                      strokeWidth={frame.width}
                      lineCap="round"
                      {...shadowProps}
                    />
                    <Path
                      data={`M ${frameOffset + imageScaledW - frame.width * 1.5}, ${frameOffset} Q ${frameOffset + imageScaledW}, ${frameOffset} ${frameOffset + imageScaledW}, ${frameOffset + frame.width * 1.5}`}
                      stroke={frame.color}
                      strokeWidth={frame.width}
                      lineCap="round"
                      {...shadowProps}
                    />
                    <Path
                      data={`M ${frameOffset + frame.width * 1.5}, ${frameOffset + imageScaledH} Q ${frameOffset}, ${frameOffset + imageScaledH} ${frameOffset}, ${frameOffset + imageScaledH - frame.width * 1.5}`}
                      stroke={frame.color}
                      strokeWidth={frame.width}
                      lineCap="round"
                      {...shadowProps}
                    />
                  </Group>
                )}

                <KonvaImage
                  image={image}
                  x={frameOffset + windowPadding}
                  y={frameOffset + windowPadding + windowHeader}
                  width={imageScaledW}
                  height={imageScaledH}
                  opacity={has3DTransform ? 0 : imageOpacity}
                  cornerRadius={
                    showFrame && frame.type === "window"
                      ? [0, 0, screenshot.radius, screenshot.radius]
                      : showFrame && frame.type === "ruler"
                        ? screenshot.radius * 0.8
                        : screenshot.radius
                  }
                  imageSmoothingEnabled={false}
                  {...(!showFrame ||
                  frame.type === "none" ||
                  frame.type === "dotted"
                    ? shadowProps
                    : {})}
                />
              </Group>
            </Layer>
          )}

          {/* Text Overlays Layer - Canvas based */}
          <Layer>
            {textOverlays.map((overlay) => {
              if (!overlay.isVisible) return null;

              const textX = (overlay.position.x / 100) * canvasW;
              const textY = (overlay.position.y / 100) * canvasH;

              return (
                <Text
                  key={overlay.id}
                  x={textX}
                  y={textY}
                  text={overlay.text}
                  fontSize={overlay.fontSize}
                  fontFamily={getFontCSS(overlay.fontFamily)}
                  fill={overlay.color}
                  opacity={overlay.opacity}
                  offsetX={0}
                  offsetY={0}
                  align="center"
                  verticalAlign="middle"
                  shadowColor={
                    overlay.textShadow.enabled
                      ? overlay.textShadow.color
                      : undefined
                  }
                  shadowBlur={
                    overlay.textShadow.enabled ? overlay.textShadow.blur : 0
                  }
                  shadowOffsetX={
                    overlay.textShadow.enabled ? overlay.textShadow.offsetX : 0
                  }
                  shadowOffsetY={
                    overlay.textShadow.enabled ? overlay.textShadow.offsetY : 0
                  }
                  fontStyle={
                    String(overlay.fontWeight).includes("italic")
                      ? "italic"
                      : "normal"
                  }
                  fontVariant={String(overlay.fontWeight)}
                  draggable={true}
                  onDragEnd={(e) => {
                    const newX = (e.target.x() / canvasW) * 100;
                    const newY = (e.target.y() / canvasH) * 100;
                    updateTextOverlay(overlay.id, {
                      position: { x: newX, y: newY },
                    });
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = "move";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = "default";
                    }
                  }}
                />
              );
            })}
          </Layer>

          {/* Mockups Layer - Renders device frames with user image composited */}
          <Layer>
            {mockups.map((mockup) => (
              <MockupRenderer
                key={mockup.id}
                mockup={mockup}
                canvasWidth={canvasW}
                canvasHeight={canvasH}
              />
            ))}
          </Layer>

          {/* Image Overlays Layer - Canvas based */}
          <Layer>
            {imageOverlays.map((overlay) => {
              if (!overlay.isVisible) return null;

              const overlayImg = loadedOverlayImages[overlay.id];
              if (!overlayImg) return null;

              return (
                <KonvaImage
                  key={overlay.id}
                  image={overlayImg}
                  x={overlay.position.x}
                  y={overlay.position.y}
                  width={overlay.size}
                  height={overlay.size}
                  opacity={overlay.opacity}
                  rotation={overlay.rotation}
                  scaleX={overlay.flipX ? -1 : 1}
                  scaleY={overlay.flipY ? -1 : 1}
                  offsetX={overlay.size / 2}
                  offsetY={overlay.size / 2}
                  draggable={true}
                  onDragEnd={(e) => {
                    updateImageOverlay(overlay.id, {
                      position: { x: e.target.x(), y: e.target.y() },
                    });
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = "move";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = "default";
                    }
                  }}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

// Export function to get the Konva stage
export function getKonvaStage(): any {
  return globalKonvaStage;
}

export default function ClientCanvas() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { screenshot, setScreenshot } = useEditorStore();

  useEffect(() => {
    if (!screenshot.src) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = () => setScreenshot({ src: null });
    img.src = screenshot.src;
  }, [screenshot.src, setScreenshot]);

  if (!image) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <CanvasRenderer image={image} />;
}
