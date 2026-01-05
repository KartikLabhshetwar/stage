'use client';

export interface FrameConfig {
  enabled: boolean;
  type: 'none' | 'arc-light' | 'arc-dark' | 'macos-light' | 'macos-dark' | 'windows-light' | 'windows-dark' | 'photograph';
  width: number;
  color: string;
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
  screenshotRadius,
}: Frame3DOverlayProps) {
  if (!showFrame || frame.type === 'none') {
    return null;
  }

  const isDark = frame.type.includes('dark');

  switch (frame.type) {
    case 'arc-light':
    case 'arc-dark':
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.25)',
            borderRadius: `${screenshotRadius + 12}px`,
            boxSizing: 'border-box',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
      );

    case 'macos-light':
    case 'macos-dark':
      return (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40px',
              backgroundColor: isDark ? '#3d3d3d' : '#e8e8e8',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '16px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#febc2e' }} />
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#28c840' }} />
            </div>
            {frame.title && (
              <div style={{ color: isDark ? '#ffffff' : '#4d4d4d', fontSize: '14px', fontWeight: '500' }}>
                {frame.title}
              </div>
            )}
          </div>
        </>
      );

    case 'windows-light':
    case 'windows-dark':
      return (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '28px',
              backgroundColor: isDark ? '#2d2d2d' : '#f3f3f3',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px 0 16px',
            }}
          >
            <div style={{ color: isDark ? '#ffffff' : '#1a1a1a', fontSize: '13px' }}>
              {frame.title || ''}
            </div>
            <div style={{ display: 'flex', gap: '0' }}>
              <div style={{ width: '46px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '12px', height: '1px', backgroundColor: isDark ? '#ffffff' : '#1a1a1a' }} />
              </div>
              <div style={{ width: '46px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '12px', height: '12px', border: `1px solid ${isDark ? '#ffffff' : '#1a1a1a'}`, boxSizing: 'border-box' }} />
              </div>
              <div style={{ width: '46px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '12px', height: '12px' }}>
                  <div style={{ position: 'absolute', width: '16px', height: '1px', backgroundColor: isDark ? '#ffffff' : '#1a1a1a', transform: 'rotate(45deg)', top: '5px', left: '-2px' }} />
                  <div style={{ position: 'absolute', width: '16px', height: '1px', backgroundColor: isDark ? '#ffffff' : '#1a1a1a', transform: 'rotate(-45deg)', top: '5px', left: '-2px' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      );

    case 'photograph':
      return (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#fffef9',
              borderRadius: '3px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.08)',
              boxSizing: 'border-box',
            }}
          />
          {frame.title && (
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '20px',
                right: '20px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2c2c2c',
                fontSize: '18px',
                fontFamily: "var(--font-caveat), Caveat, cursive",
              }}
            >
              {frame.title}
            </div>
          )}
        </>
      );

    default:
      return null;
  }
}
