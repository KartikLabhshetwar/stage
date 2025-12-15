'use client';

import { Rect, Group, Circle, Text, Line } from 'react-konva';
import { ShadowProps } from '../utils/shadow-utils';

export interface FrameConfig {
  enabled: boolean;
  type: 'none' | 'arc-light' | 'arc-dark' | 'macos-light' | 'macos-dark' | 'windows-light' | 'windows-dark' | 'photograph';
  width: number;
  color: string;
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
  screenshotRadius,
  shadowProps,
  has3DTransform,
}: FrameRendererProps) {
  if (!showFrame || frame.type === 'none' || has3DTransform) {
    return null;
  }

  const isDark = frame.type.includes('dark');

  switch (frame.type) {
    case 'arc-light':
    case 'arc-dark':
      return (
        <Group>
          <Rect
            width={framedW}
            height={framedH}
            fill={isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.25)'}
            cornerRadius={screenshotRadius}
            {...shadowProps}
          />
        </Group>
      );

    case 'macos-light':
    case 'macos-dark':
      return (
        <Group>
          <Rect
            width={framedW}
            height={40}
            fill={isDark ? '#3d3d3d' : '#e8e8e8'}
            cornerRadius={[12, 12, 0, 0]}
            {...shadowProps}
          />
          <Circle x={24} y={26} radius={7} fill="#ff5f57" />
          <Circle x={48} y={26} radius={7} fill="#febc2e" />
          <Circle x={72} y={26} radius={7} fill="#28c840" />
          <Text
            text={frame.title || ''}
            x={0}
            y={0}
            width={framedW}
            height={40}
            align="center"
            verticalAlign="middle"
            fill={isDark ? '#ffffff' : '#4d4d4d'}
            fontSize={14}
            fontFamily="system-ui, -apple-system, sans-serif"
          />
        </Group>
      );

    case 'windows-light':
    case 'windows-dark':
      return (
        <Group>
          <Rect
            width={framedW}
            height={28}
            fill={isDark ? '#2d2d2d' : '#f3f3f3'}
            cornerRadius={[8, 8, 0, 0]}
            {...shadowProps}
          />
          <Text
            text={frame.title || ''}
            x={16}
            y={0}
            width={framedW - 150}
            height={28}
            align="left"
            verticalAlign="middle"
            fill={isDark ? '#ffffff' : '#1a1a1a'}
            fontSize={13}
            fontFamily="Segoe UI, system-ui, sans-serif"
          />
          {/* Minimize */}
          <Line
            points={[framedW - 100, 14, framedW - 88, 14]}
            stroke={isDark ? '#ffffff' : '#1a1a1a'}
            strokeWidth={1}
          />
          {/* Maximize */}
          <Rect
            x={framedW - 70}
            y={10}
            width={12}
            height={12}
            stroke={isDark ? '#ffffff' : '#1a1a1a'}
            strokeWidth={1}
          />
          {/* Close */}
          <Group>
            <Line
              points={[framedW - 40, 10, framedW - 28, 22]}
              stroke={isDark ? '#ffffff' : '#1a1a1a'}
              strokeWidth={1}
            />
            <Line
              points={[framedW - 28, 10, framedW - 40, 22]}
              stroke={isDark ? '#ffffff' : '#1a1a1a'}
              strokeWidth={1}
            />
          </Group>
        </Group>
      );

    case 'photograph': {
      const padding = 20;
      const topArea = 60;
      return (
        <Group>
          <Rect
            width={framedW}
            height={framedH}
            fill="#fffef9"
            cornerRadius={3}
            shadowColor="rgba(0,0,0,0.15)"
            shadowBlur={12}
            shadowOffsetY={4}
            {...shadowProps}
          />
          {frame.title && (
            <Text
              text={frame.title}
              x={padding}
              y={8}
              width={framedW - padding * 2}
              height={topArea - padding}
              align="center"
              verticalAlign="middle"
              fill="#2c2c2c"
              fontSize={18}
              fontFamily="Caveat, cursive"
            />
          )}
        </Group>
      );
    }

    default:
      return null;
  }
}
