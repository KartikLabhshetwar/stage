'use client';

import { Frame3DOverlay, type FrameConfig } from '../frames/Frame3DOverlay';
import { type ShadowConfig } from '../utils/shadow-utils';

export interface Perspective3DConfig {
  perspective: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  translateX: number;
  translateY: number;
  scale: number;
}

interface Perspective3DOverlayProps {
  has3DTransform: boolean;
  perspective3D: Perspective3DConfig;
  screenshot: {
    rotation: number;
    radius: number;
  };
  shadow: ShadowConfig;
  frame: FrameConfig;
  showFrame: boolean;
  framedW: number;
  framedH: number;
  frameOffset: number;
  windowPadding: number;
  windowHeader: number;
  eclipseBorder: number;
  imageScaledW: number;
  imageScaledH: number;
  groupCenterX: number;
  groupCenterY: number;
  canvasW: number;
  canvasH: number;
  image: HTMLImageElement;
  imageOpacity: number;
}

export function Perspective3DOverlay({
  has3DTransform,
  perspective3D,
  screenshot,
  shadow,
  frame,
  showFrame,
  framedW,
  framedH,
  frameOffset,
  windowPadding,
  windowHeader,
  eclipseBorder,
  imageScaledW,
  imageScaledH,
  groupCenterX,
  groupCenterY,
  canvasW,
  canvasH,
  image,
  imageOpacity,
}: Perspective3DOverlayProps) {
  if (!has3DTransform) return null;

  const perspective3DTransform = `
    translate(${perspective3D.translateX}%, ${perspective3D.translateY}%)
    scale(${perspective3D.scale})
    rotateX(${perspective3D.rotateX}deg)
    rotateY(${perspective3D.rotateY}deg)
    rotateZ(${perspective3D.rotateZ + screenshot.rotation}deg)
  `
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <div
      data-3d-overlay="true"
      data-untransformed-x={groupCenterX - framedW / 2}
      data-untransformed-y={groupCenterY - framedH / 2}
      data-untransformed-width={framedW}
      data-untransformed-height={framedH}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${canvasW}px`,
        height: `${canvasH}px`,
        perspective: `${perspective3D.perspective}px`,
        transformStyle: 'preserve-3d',
        zIndex: 15,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${groupCenterX - framedW / 2}px`,
          top: `${groupCenterY - framedH / 2}px`,
          width: `${framedW}px`,
          height: `${framedH}px`,
          transform: perspective3DTransform,
          transformOrigin: 'center center',
          willChange: 'transform',
          transition: 'transform 0.125s linear',
          ...(shadow.enabled && {
            filter: `drop-shadow(${
              shadow.side === 'bottom'
                ? `0px ${shadow.elevation}px`
                : shadow.side === 'right'
                ? `${shadow.elevation}px 0px`
                : shadow.side === 'bottom-right'
                ? `${shadow.elevation * 0.707}px ${shadow.elevation * 0.707}px`
                : '0px 0px'
            } ${shadow.softness}px ${shadow.color})`,
            opacity: shadow.intensity,
          }),
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          <Frame3DOverlay
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
            screenshotRadius={screenshot.radius}
          />

          <img
            src={image.src}
            alt="3D transformed"
            style={{
              position: 'absolute',
              left: `${frameOffset + windowPadding}px`,
              top: `${frameOffset + windowPadding + windowHeader}px`,
              width: `${imageScaledW}px`,
              height: `${imageScaledH}px`,
              objectFit: 'cover',
              opacity: imageOpacity,
              borderRadius:
                showFrame && frame.type === 'window'
                  ? `0 0 ${screenshot.radius}px ${screenshot.radius}px`
                  : showFrame && frame.type === 'ruler'
                  ? `${screenshot.radius * 0.8}px`
                  : `${screenshot.radius}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

