"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/lib/store";
import { useImageStore } from "@/lib/store";
import { generatePattern } from "@/lib/patterns";
import { useResponsiveCanvasDimensions } from "@/hooks/useAspectRatioDimensions";
import { getBackgroundCSS } from "@/lib/constants/backgrounds";
import { generateNoiseTexture } from "@/lib/export/export-utils";
import { MockupRenderer } from "@/components/mockups/MockupRenderer";
import { calculateCanvasDimensions } from "./utils/canvas-dimensions";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { PatternLayer } from "./layers/PatternLayer";
import { NoiseLayer } from "./layers/NoiseLayer";
import { MainImageLayer } from "./layers/MainImageLayer";
import { TextOverlayLayer } from "./layers/TextOverlayLayer";
import { ImageOverlayLayer } from "./layers/ImageOverlayLayer";
import { Perspective3DOverlay } from "./overlays/Perspective3DOverlay";
import { useBackgroundImage, useOverlayImages } from "./hooks/useImageLoading";

let globalKonvaStage: Konva.Stage | null = null;

function CanvasRenderer({ image }: { image: HTMLImageElement }) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    screenshot,
    setScreenshot,
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
    removeImageOverlay,
  } = useImageStore();

  const hasMockups = mockups.length > 0 && mockups.some((m) => m.isVisible);
  const responsiveDimensions = useResponsiveCanvasDimensions();
  const backgroundStyle = getBackgroundCSS(backgroundConfig);

  const [viewportSize, setViewportSize] = useState({
    width: 1920,
    height: 1080,
  });

  const [patternImage, setPatternImage] = useState<HTMLCanvasElement | null>(
    null
  );
  const [noiseImage, setNoiseImage] = useState<HTMLImageElement | null>(null);
  const [noiseTexture, setNoiseTexture] = useState<HTMLCanvasElement | null>(
    null
  );

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );
  const [isMainImageSelected, setIsMainImageSelected] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const containerWidth = responsiveDimensions.width;
  const containerHeight = responsiveDimensions.height;

  const bgImage = useBackgroundImage(
    backgroundConfig,
    containerWidth,
    containerHeight
  );
  const loadedOverlayImages = useOverlayImages(imageOverlays);

  useEffect(() => {                                           // deleting overlays when backspace or delete is pressed
    const handleKeyDown = (e: KeyboardEvent) => {            
      if (e.key == 'Delete' || e.key == 'Backspace'){ 
        if (selectedOverlayId){
          e.preventDefault()
          removeImageOverlay(selectedOverlayId);
          setSelectedOverlayId(null);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  },[selectedOverlayId, removeImageOverlay])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      if (e.key === 'Delete' || e.key === 'Backspace') { // Delete logic
        const store = useImageStore.getState();
        if (selectedOverlayId) {
          e.preventDefault();
          store.removeImageOverlay(selectedOverlayId);
          setSelectedOverlayId(null);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { // Undo logic
        e.preventDefault();
        const { undo, redo } = useImageStore.temporal.getState();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOverlayId]);

  useEffect(() => {
    // deleting overlays when backspace or delete is pressed
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == "Delete" || e.key == "Backspace") {
        if (selectedOverlayId) {
          e.preventDefault();
          removeImageOverlay(selectedOverlayId);
          setSelectedOverlayId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOverlayId, removeImageOverlay]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Delete logic
        const store = useImageStore.getState();
        if (selectedOverlayId) {
          e.preventDefault();
          store.removeImageOverlay(selectedOverlayId);
          setSelectedOverlayId(null);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        // Undo logic
        e.preventDefault();
        const { undo, redo } = useImageStore.temporal.getState();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOverlayId]);

  useEffect(() => {
    const updateStage = () => {
      if (stageRef.current) {
        globalKonvaStage = stageRef.current;
      }
    };

    updateStage();
    const timeout = setTimeout(updateStage, 100);

    return () => {
      clearTimeout(timeout);
      globalKonvaStage = null;
    };
  });

  useEffect(() => {
    if (backgroundNoise > 0) {
      const intensity = backgroundNoise / 100;
      const noiseCanvas = generateNoiseTexture(200, 200, intensity);
      setNoiseTexture(noiseCanvas);
    } else {
      setNoiseTexture(null);
    }
  }, [backgroundNoise]);

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
      patternStyle.blur
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

  const dimensions = calculateCanvasDimensions(
    image,
    containerWidth,
    containerHeight,
    viewportSize,
    canvas,
    screenshot,
    frame
  );

  const {
    canvasW,
    canvasH,
    imageScaledW,
    imageScaledH,
    framedW,
    framedH,
    frameOffset,
    windowPadding,
    windowHeader,
    eclipseBorder,
    groupCenterX,
    groupCenterY,
  } = dimensions;

  const showFrame = frame.enabled && frame.type !== "none";

  const has3DTransform =
    perspective3D.rotateX !== 0 ||
    perspective3D.rotateY !== 0 ||
    perspective3D.rotateZ !== 0 ||
    perspective3D.translateX !== 0 ||
    perspective3D.translateY !== 0 ||
    perspective3D.scale !== 1;

  return (
    <div
      ref={containerRef}
      id="image-render-card"
      className="flex items-center justify-center"
      style={{
        width: `${containerWidth}px`,
        maxWidth: `${containerWidth}px`,
        aspectRatio: responsiveDimensions.aspectRatio,
        maxHeight: "calc(100vh - 200px)",
        backgroundColor: "transparent",
        padding: "0px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${canvasW}px`,
          height: `${canvasH}px`,
          minWidth: `${canvasW}px`,
          minHeight: `${canvasH}px`,
          overflow: "hidden",
          isolation: "isolate",
        }}
      >
        <Perspective3DOverlay
          has3DTransform={has3DTransform}
          perspective3D={perspective3D}
          screenshot={screenshot}
          shadow={shadow}
          frame={frame}
          showFrame={showFrame}
          framedW={framedW}
          framedH={framedH}
          frameOffset={frameOffset}
          windowPadding={windowPadding}
          windowHeader={windowHeader}
          eclipseBorder={eclipseBorder}
          imageScaledW={imageScaledW}
          imageScaledH={imageScaledH}
          groupCenterX={groupCenterX}
          groupCenterY={groupCenterY}
          canvasW={canvasW}
          canvasH={canvasH}
          image={image}
          imageOpacity={imageOpacity}
        />

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
            contain: "layout style paint",
          }}
          onMouseDown={(e) => {
            const clickedOnTransformer =
              e.target.getParent()?.className === "Transformer";
            if (clickedOnTransformer) {
              return;
            }

            const clickedOnOverlay =
              e.target.attrs.image &&
              Object.keys(loadedOverlayImages).some(
                (key) => e.target.attrs.id === key
              );

            const clickedOnText = e.target.attrs.text !== undefined;

            if (!clickedOnOverlay && !clickedOnText) {
              setSelectedOverlayId(null);
              setIsMainImageSelected(false);
              setSelectedTextId(null);
            }
          }}
        >
          <BackgroundLayer
            backgroundConfig={backgroundConfig}
            backgroundStyle={backgroundStyle}
            backgroundBlur={backgroundBlur}
            backgroundBorderRadius={backgroundBorderRadius}
            canvasW={canvasW}
            canvasH={canvasH}
            bgImage={bgImage}
            noiseTexture={noiseTexture}
            backgroundNoise={backgroundNoise}
          />

          <PatternLayer
            patternImage={patternImage}
            canvasW={canvasW}
            canvasH={canvasH}
            patternOpacity={patternStyle.opacity}
          />

          <NoiseLayer
            noiseImage={noiseImage}
            canvasW={canvasW}
            canvasH={canvasH}
            noiseOpacity={noise.opacity}
          />

          {!hasMockups && (
            <MainImageLayer
              image={image}
              canvasW={canvasW}
              canvasH={canvasH}
              framedW={framedW}
              framedH={framedH}
              frameOffset={frameOffset}
              windowPadding={windowPadding}
              windowHeader={windowHeader}
              eclipseBorder={eclipseBorder}
              imageScaledW={imageScaledW}
              imageScaledH={imageScaledH}
              screenshot={screenshot}
              frame={frame}
              shadow={shadow}
              showFrame={showFrame}
              has3DTransform={has3DTransform}
              imageOpacity={imageOpacity}
              isMainImageSelected={isMainImageSelected}
              setIsMainImageSelected={setIsMainImageSelected}
              setSelectedOverlayId={setSelectedOverlayId}
              setSelectedTextId={setSelectedTextId}
              setScreenshot={setScreenshot}
            />
          )}

          <TextOverlayLayer
            textOverlays={textOverlays}
            canvasW={canvasW}
            canvasH={canvasH}
            selectedTextId={selectedTextId}
            setSelectedTextId={setSelectedTextId}
            setSelectedOverlayId={setSelectedOverlayId}
            setIsMainImageSelected={setIsMainImageSelected}
            updateTextOverlay={updateTextOverlay}
          />

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

          <ImageOverlayLayer
            imageOverlays={imageOverlays}
            loadedOverlayImages={loadedOverlayImages}
            selectedOverlayId={selectedOverlayId}
            setSelectedOverlayId={setSelectedOverlayId}
            setIsMainImageSelected={setIsMainImageSelected}
            setSelectedTextId={setSelectedTextId}
            updateImageOverlay={updateImageOverlay}
          />
        </Stage>
      </div>
    </div>
  );
}

export function getKonvaStage(): Konva.Stage | null {
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
