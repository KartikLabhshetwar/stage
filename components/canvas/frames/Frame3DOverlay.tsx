'use client';

export interface FrameConfig {
  enabled: boolean;
  type: 'none' | 'solid' | 'glassy' | 'infinite-mirror' | 'window' | 'stack' | 'ruler' | 'eclipse' | 'dotted' | 'focus';
  width: number;
  color: string;
  theme?: 'light' | 'dark';
  padding?: number;
  title?: string;
}

interface Frame3DOverlayProps {
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
}

export function Frame3DOverlay({
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
}: Frame3DOverlayProps) {
  if (!showFrame || frame.type === 'none') {
    return null;
  }

  switch (frame.type) {
    case 'solid':
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: frame.color,
            borderRadius: `${screenshotRadius}px`,
          }}
        />
      );

    case 'glassy':
      return (
        <div
          style={{
            position: 'absolute',
            left: `${frameOffset + windowPadding}px`,
            top: `${frameOffset + windowPadding + windowHeader}px`,
            width: `${imageScaledW}px`,
            height: `${imageScaledH}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: `${frame.width * 4 + 6}px solid rgba(255, 255, 255, 0.3)`,
            borderRadius: `${screenshotRadius}px`,
          }}
        />
      );

    case 'ruler':
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: `${screenshotRadius}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: `${screenshotRadius}px`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '10px',
              }}
            >
              {Array.from({ length: Math.floor(framedW / 10) - 1 }).map(
                (_, i) => (
                  <div
                    key={`t-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${i * 10}px`,
                      top: '1px',
                      width: '2px',
                      height: (i + 1) % 5 === 0 ? '10px' : '5px',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    }}
                  />
                )
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '10px',
              }}
            >
              {Array.from({ length: Math.floor(framedH / 10) - 1 }).map(
                (_, i) => (
                  <div
                    key={`l-${i}`}
                    style={{
                      position: 'absolute',
                      left: '1px',
                      top: `${i * 10}px`,
                      width: (i + 1) % 5 === 0 ? '10px' : '5px',
                      height: '2px',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      );

    case 'infinite-mirror':
      return (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${-i * 7.5}px`,
                top: `${-i * 7.5}px`,
                width: `${framedW + i * 15}px`,
                height: `${framedH + i * 15}px`,
                border: `4px solid ${frame.color}`,
                borderRadius: `${screenshotRadius + i * 5}px`,
                opacity: 0.3 - i * 0.07,
                boxSizing: 'border-box',
              }}
            />
          ))}
        </>
      );

    case 'eclipse':
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: `${screenshotRadius + eclipseBorder}px`,
            backgroundColor: frame.color,
            border: `${eclipseBorder}px solid ${frame.color}`,
            boxSizing: 'border-box',
          }}
        />
      );

    case 'stack':
      return (
        <>
          <div
            style={{
              position: 'absolute',
              left: `${(framedW - framedW / 1.2) / 2}px`,
              top: '-40px',
              width: `${framedW / 1.2}px`,
              height: `${framedH / 5}px`,
              backgroundColor: frame.theme === 'dark' ? '#444444' : '#f5f5f5',
              borderRadius: `${screenshotRadius}px`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${(framedW - framedW / 1.1) / 2}px`,
              top: '-20px',
              width: `${framedW / 1.1}px`,
              height: `${framedH / 5}px`,
              backgroundColor: frame.theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
              borderRadius: `${screenshotRadius}px`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: frame.theme === 'dark' ? '#555555' : '#e8e8e8',
              borderRadius: `${screenshotRadius}px`,
            }}
          />
        </>
      );

    case 'window':
      return (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: frame.theme === 'dark' ? '#2f2f2f' : '#fefefe',
              borderRadius: `${screenshotRadius}px`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${windowHeader}px`,
              backgroundColor: frame.theme === 'dark' ? '#4a4a4a' : '#e2e2e2',
              borderRadius: `${screenshotRadius}px ${screenshotRadius}px 0 0`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '15px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#ff5f57',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#febc2e',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#28c840',
                }}
              />
            </div>
            {frame.title && (
              <div
                style={{
                  color: frame.theme === 'dark' ? '#f0f0f0' : '#4f4f4f',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {frame.title}
              </div>
            )}
          </div>
        </>
      );

    case 'dotted':
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: `${frame.width}px dashed ${frame.color}`,
            borderRadius: `${screenshotRadius}px`,
            boxSizing: 'border-box',
          }}
        />
      );

    case 'focus':
      return (
        <>
          <div
            style={{
              position: 'absolute',
              left: `${frameOffset}px`,
              top: `${frameOffset}px`,
              width: `${frame.width * 3}px`,
              height: `${frame.width}px`,
              backgroundColor: frame.color,
              borderRadius: `${frame.width / 2}px 0 0 0`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${frameOffset}px`,
              top: `${frameOffset}px`,
              width: `${frame.width}px`,
              height: `${frame.width * 3}px`,
              backgroundColor: frame.color,
              borderRadius: `${frame.width / 2}px 0 0 0`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: `${frameOffset}px`,
              top: `${frameOffset}px`,
              width: `${frame.width * 3}px`,
              height: `${frame.width}px`,
              backgroundColor: frame.color,
              borderRadius: `0 ${frame.width / 2}px 0 0`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: `${frameOffset}px`,
              top: `${frameOffset}px`,
              width: `${frame.width}px`,
              height: `${frame.width * 3}px`,
              backgroundColor: frame.color,
              borderRadius: `0 ${frame.width / 2}px 0 0`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${frameOffset}px`,
              bottom: `${frameOffset}px`,
              width: `${frame.width * 3}px`,
              height: `${frame.width}px`,
              backgroundColor: frame.color,
              borderRadius: `0 0 0 ${frame.width / 2}px`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${frameOffset}px`,
              bottom: `${frameOffset}px`,
              width: `${frame.width}px`,
              height: `${frame.width * 3}px`,
              backgroundColor: frame.color,
              borderRadius: `0 0 0 ${frame.width / 2}px`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: `${frameOffset}px`,
              bottom: `${frameOffset}px`,
              width: `${frame.width * 3}px`,
              height: `${frame.width}px`,
              backgroundColor: frame.color,
              borderRadius: `0 0 ${frame.width / 2}px 0`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: `${frameOffset}px`,
              bottom: `${frameOffset}px`,
              width: `${frame.width}px`,
              height: `${frame.width * 3}px`,
              backgroundColor: frame.color,
              borderRadius: `0 0 ${frame.width / 2}px 0`,
            }}
          />
        </>
      );

    default:
      return null;
  }
}

