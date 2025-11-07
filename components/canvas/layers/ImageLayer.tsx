'use client'

import React from 'react'
import { Layer, Group, Rect, Image as KonvaImage, Circle, Text, Path } from 'react-konva'

interface FrameConfig {
  enabled: boolean
  type: 'none' | 'solid' | 'glassy' | 'infinite-mirror' | 'window' | 'stack' | 'ruler' | 'eclipse' | 'dotted' | 'focus'
  width: number
  color: string
  theme?: 'light' | 'dark'
  padding?: number
  title?: string
}

interface ScreenshotConfig {
  offsetX: number
  offsetY: number
  rotation: number
  radius: number
  scale: number
}

interface ImageLayerProps {
  image: HTMLImageElement
  canvasW: number
  canvasH: number
  screenshot: ScreenshotConfig
  frame: FrameConfig
  imageScaledW: number
  imageScaledH: number
  shadowProps: any
  imageOpacity: number
  has3DTransform: boolean
}

/**
 * ImageLayer - Renders the main image with all frame types in Konva
 * This component handles all the complex frame rendering logic
 */
export function ImageLayer({
  image,
  canvasW,
  canvasH,
  screenshot,
  frame,
  imageScaledW,
  imageScaledH,
  shadowProps,
  imageOpacity,
  has3DTransform,
}: ImageLayerProps) {
  // Calculate frame dimensions
  const showFrame = frame.enabled && frame.type !== 'none'
  const frameOffset =
    showFrame && frame.type === 'solid'
      ? frame.width
      : showFrame && frame.type === 'ruler'
      ? frame.width + 2
      : 0
  const windowPadding = showFrame && frame.type === 'window' ? (frame.padding || 20) : 0
  const windowHeader = showFrame && frame.type === 'window' ? 40 : 0
  const eclipseBorder = showFrame && frame.type === 'eclipse' ? frame.width + 2 : 0
  const framedW = imageScaledW + frameOffset * 2 + windowPadding * 2 + eclipseBorder
  const framedH = imageScaledH + frameOffset * 2 + windowPadding * 2 + windowHeader + eclipseBorder

  return (
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
        {showFrame && frame.type === 'solid' && (
          <Rect
            width={framedW}
            height={framedH}
            fill={frame.color}
            cornerRadius={screenshot.radius}
            {...shadowProps}
          />
        )}

        {/* Glassy Frame */}
        {showFrame && frame.type === 'glassy' && (
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
        {showFrame && frame.type === 'ruler' && (
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
                {Array.from({ length: Math.floor(framedW / 10) - 1 }).map((_, i) => (
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
                {Array.from({ length: Math.floor(framedH / 10) - 1 }).map((_, i) => (
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
                {Array.from({ length: Math.floor(framedH / 10) - 1 }).map((_, i) => (
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
                {Array.from({ length: Math.floor(framedW / 10) - 1 }).map((_, i) => (
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
        {showFrame && frame.type === 'infinite-mirror' && (
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
                {...(i === 0 ? { ...shadowProps, shadowForStrokeEnabled: true } : {})}
              />
            ))}
          </>
        )}

        {/* Eclipse Frame */}
        {showFrame && frame.type === 'eclipse' && (
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
        {showFrame && frame.type === 'stack' && (
          <>
            {/* Bottom layer - darkest */}
            <Rect
              width={framedW / 1.2}
              height={framedH / 5}
              x={(framedW - framedW / 1.2) / 2}
              y={-40}
              fill={frame.theme === 'dark' ? '#444444' : '#f5f5f5'}
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
              fill={frame.theme === 'dark' ? '#2a2a2a' : '#f0f0f0'}
              cornerRadius={screenshot.radius}
              opacity={1}
            />
            {/* Top layer - lightest, will have image on top */}
            <Rect
              width={framedW}
              height={framedH}
              fill={frame.theme === 'dark' ? '#555555' : '#e8e8e8'}
              cornerRadius={screenshot.radius}
              {...shadowProps}
            />
          </>
        )}

        {/* Window Frame */}
        {showFrame && frame.type === 'window' && (
          <>
            <Rect // main window
              width={framedW}
              height={framedH}
              fill={frame.theme === 'dark' ? '#2f2f2f' : '#fefefe'}
              cornerRadius={[screenshot.radius / 2, screenshot.radius / 2, screenshot.radius, screenshot.radius]}
              {...shadowProps}
            />
            <Rect // header
              width={framedW}
              height={windowHeader}
              fill={frame.theme === 'dark' ? '#4a4a4a' : '#e2e2e2'}
              cornerRadius={[screenshot.radius, screenshot.radius, 0, 0]}
            />
            {/* Window control buttons (red, yellow, green) */}
            <Circle x={25} y={20} radius={10} fill="#ff5f57" />
            <Circle x={50} y={20} radius={10} fill="#febc2e" />
            <Circle x={75} y={20} radius={10} fill="#28c840" />
            <Text
              text={frame.title || ''}
              x={0}
              y={0}
              width={framedW}
              height={windowHeader}
              align="center"
              verticalAlign="middle"
              fill={frame.theme === 'dark' ? '#f0f0f0' : '#4f4f4f'}
              fontSize={16}
            />
          </>
        )}

        {/* Dotted Frame */}
        {showFrame && frame.type === 'dotted' && (
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
        {showFrame && frame.type === 'focus' && (
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

        {/* Main Image */}
        <KonvaImage
          image={image}
          x={frameOffset + windowPadding}
          y={frameOffset + windowPadding + windowHeader}
          width={imageScaledW}
          height={imageScaledH}
          opacity={has3DTransform ? 0 : imageOpacity}
          cornerRadius={
            showFrame && frame.type === 'window'
              ? [0, 0, screenshot.radius, screenshot.radius]
              : showFrame && frame.type === 'ruler'
              ? screenshot.radius * 0.8
              : screenshot.radius
          }
          imageSmoothingEnabled={false}
          {...(!showFrame || frame.type === 'none' || frame.type === 'dotted' ? shadowProps : {})}
        />
      </Group>
    </Layer>
  )
}
