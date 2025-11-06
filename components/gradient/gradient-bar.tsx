'use client';

import * as React from 'react';
import { ColorStop } from './color-picker';
import { cn } from '@/lib/utils';

interface GradientBarProps {
  stops: ColorStop[];
  selectedStopId: string | null;
  onStopSelect: (stopId: string) => void;
  onStopMove: (stopId: string, position: number) => void;
  gradientType: 'linear' | 'radial';
  angle: number;
}

export function GradientBar({
  stops,
  selectedStopId,
  onStopSelect,
  onStopMove,
  gradientType,
  angle,
}: GradientBarProps) {
  const [isDragging, setIsDragging] = React.useState<string | null>(null);
  const barRef = React.useRef<HTMLDivElement>(null);

  // Sort stops by position
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  // Generate gradient string
  const gradientString = React.useMemo(() => {
    if (sortedStops.length === 0) return 'linear-gradient(90deg, #000000 0%, #ffffff 100%)';
    
    const stopStrings = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');
    
    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopStrings})`;
    } else {
      return `radial-gradient(circle at center, ${stopStrings})`;
    }
  }, [sortedStops, gradientType, angle]);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || isDragging) return;
    const rect = barRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    // Find nearest stop or create new one
    const nearestStop = sortedStops.reduce((prev, curr) =>
      Math.abs(curr.position - position) < Math.abs(prev.position - position) ? curr : prev
    );
    if (Math.abs(nearestStop.position - position) < 5) {
      onStopSelect(nearestStop.id);
    }
  };

  const handleStopMouseDown = (e: React.MouseEvent, stopId: string) => {
    e.stopPropagation();
    setIsDragging(stopId);
    onStopSelect(stopId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    onStopMove(isDragging, position);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(null));
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', () => setIsDragging(null));
      };
    }
  }, [isDragging]);

  return (
    <div className="space-y-2">
      <div
        ref={barRef}
        className="relative w-full h-12 rounded-lg overflow-hidden border border-border cursor-pointer"
        style={{ background: gradientString }}
        onClick={handleBarClick}
      >
        {sortedStops.map((stop) => (
          <div
            key={stop.id}
            className={cn(
              'absolute top-0 w-4 h-full cursor-move flex items-center justify-center',
              'before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2',
              'before:w-5 before:h-5 before:rounded-full before:border-2 before:bg-white',
              stop.id === selectedStopId
                ? 'before:border-primary before:shadow-lg before:ring-2 before:ring-primary/20'
                : 'before:border-gray-300 hover:before:border-gray-400'
            )}
            style={{ left: `${stop.position}%`, transform: 'translateX(-50%)' }}
            onMouseDown={(e) => handleStopMouseDown(e, stop.id)}
          >
            <div
              className="absolute top-0 w-0.5 h-full bg-white/50"
              style={{ left: '50%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

