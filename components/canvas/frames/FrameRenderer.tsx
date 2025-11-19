'use client';

import { Rect, Group, Circle, Text, Path } from 'react-konva';
import { ShadowProps } from '../utils/shadow-utils';

export interface FrameConfig {
  enabled: boolean;
  type: 'none' | 'solid' | 'glassy' | 'infinite-mirror' | 'window' | 'stack' | 'ruler' | 'eclipse' | 'dotted' | 'focus';
  width: number;
  color: string;
  theme?: 'light' | 'dark';
  padding?: number;
  title?: string;
}

interface FrameRendererProps {
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
  screenshotRadius: number;
  shadowProps: ShadowProps | Record<string, never>;
  has3DTransform: boolean;
}

export function FrameRenderer({
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
  screenshotRadius,
  shadowProps,
  has3DTransform,
}: FrameRendererProps) {
  if (!showFrame || frame.type === 'none' || has3DTransform) {
    return null;
  }

  switch (frame.type) {
    case 'solid':
      return (
        <Rect
          width={framedW}
          height={framedH}
          fill={frame.color}
          cornerRadius={screenshotRadius}
          {...shadowProps}
        />
      );

    case 'glassy':
      return (
        <Rect
          x={frameOffset + windowPadding}
          y={frameOffset + windowPadding + windowHeader}
          width={imageScaledW}
          height={imageScaledH}
          fill="rgba(255, 255, 255, 0.15)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={frame.width * 4 + 6}
          cornerRadius={screenshotRadius}
          shadowForStrokeEnabled
          {...shadowProps}
        />
      );

    case 'ruler':
      return (
        <Group>
          <Rect
            width={framedW}
            height={framedH}
            cornerRadius={screenshotRadius}
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
            cornerRadius={Math.max(0, screenshotRadius - 2)}
          />
          <Group>
            <Rect
              width={framedW}
              height={framedH}
              fill="rgba(255, 255, 255, 0.2)"
              cornerRadius={screenshotRadius}
            />
            <Group globalCompositeOperation="source-atop">
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
            cornerRadius={screenshotRadius}
          />
        </Group>
      );

    case 'infinite-mirror':
      return (
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
              cornerRadius={screenshotRadius + i * 5}
              opacity={0.3 - i * 0.07}
              {...(i === 0
                ? { ...shadowProps, shadowForStrokeEnabled: true }
                : {})}
            />
          ))}
        </>
      );

    case 'eclipse':
      return (
        <Group>
          <Rect
            width={framedW}
            height={framedH}
            fill={frame.color}
            cornerRadius={screenshotRadius + eclipseBorder}
            {...shadowProps}
          />
          <Rect
            globalCompositeOperation="destination-out"
            x={eclipseBorder}
            y={eclipseBorder}
            width={framedW - eclipseBorder * 2}
            height={framedH - eclipseBorder * 2}
            fill="black"
            cornerRadius={screenshotRadius}
          />
        </Group>
      );

    case 'stack':
      return (
        <>
          <Rect
            width={framedW / 1.2}
            height={framedH / 5}
            x={(framedW - framedW / 1.2) / 2}
            y={-40}
            fill={frame.theme === 'dark' ? '#444444' : '#f5f5f5'}
            cornerRadius={screenshotRadius}
            opacity={1}
            {...shadowProps}
          />
          <Rect
            width={framedW / 1.1}
            height={framedH / 5}
            x={(framedW - framedW / 1.1) / 2}
            y={-20}
            fill={frame.theme === 'dark' ? '#2a2a2a' : '#f0f0f0'}
            cornerRadius={screenshotRadius}
            opacity={1}
          />
          <Rect
            width={framedW}
            height={framedH}
            fill={frame.theme === 'dark' ? '#555555' : '#e8e8e8'}
            cornerRadius={screenshotRadius}
            {...shadowProps}
          />
        </>
      );

    case 'window':
      return (
        <>
          <Rect
            width={framedW}
            height={framedH}
            fill={frame.theme === 'dark' ? '#2f2f2f' : '#fefefe'}
            cornerRadius={[
              screenshotRadius / 2,
              screenshotRadius / 2,
              screenshotRadius,
              screenshotRadius,
            ]}
            {...shadowProps}
          />
          <Rect
            width={framedW}
            height={windowHeader}
            fill={frame.theme === 'dark' ? '#4a4a4a' : '#e2e2e2'}
            cornerRadius={[
              screenshotRadius,
              screenshotRadius,
              0,
              0,
            ]}
          />
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
      );

    case 'dotted':
      return (
        <Rect
          width={framedW}
          height={framedH}
          stroke={frame.color}
          strokeWidth={frame.width}
          dash={[frame.width * 2, frame.width * 1.2]}
          cornerRadius={screenshotRadius}
        />
      );

    case 'focus':
      return (
        <Group>
          <Path
            data={`M ${frameOffset}, ${
              frameOffset + frame.width * 1.5
            } Q ${frameOffset}, ${frameOffset} ${
              frameOffset + frame.width * 1.5
            }, ${frameOffset}`}
            stroke={frame.color}
            strokeWidth={frame.width}
            lineCap="round"
            {...shadowProps}
          />
          <Path
            data={`M ${frameOffset + imageScaledW}, ${
              frameOffset + imageScaledH - frame.width * 1.5
            } Q ${frameOffset + imageScaledW}, ${
              frameOffset + imageScaledH
            } ${frameOffset + imageScaledW - frame.width * 1.5}, ${
              frameOffset + imageScaledH
            }`}
            stroke={frame.color}
            strokeWidth={frame.width}
            lineCap="round"
            {...shadowProps}
          />
          <Path
            data={`M ${
              frameOffset + imageScaledW - frame.width * 1.5
            }, ${frameOffset} Q ${
              frameOffset + imageScaledW
            }, ${frameOffset} ${frameOffset + imageScaledW}, ${
              frameOffset + frame.width * 1.5
            }`}
            stroke={frame.color}
            strokeWidth={frame.width}
            lineCap="round"
            {...shadowProps}
          />
          <Path
            data={`M ${frameOffset + frame.width * 1.5}, ${
              frameOffset + imageScaledH
            } Q ${frameOffset}, ${
              frameOffset + imageScaledH
            } ${frameOffset}, ${
              frameOffset + imageScaledH - frame.width * 1.5
            }`}
            stroke={frame.color}
            strokeWidth={frame.width}
            lineCap="round"
            {...shadowProps}
          />
        </Group>
      );

    default:
      return null;
  }
}

