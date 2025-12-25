'use client';

import * as React from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { Button } from '@/components/ui/button';
import { Camera, X, SwitchCamera, Loader2 } from 'lucide-react';
import { useImageStore } from '@/lib/store';

interface WebcamCaptureProps {
  onClose?: () => void;
}

export function WebcamCapture({ onClose }: WebcamCaptureProps) {
  const {
    isActive,
    error,
    devices,
    currentDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    videoRef,
  } = useWebcam();

  const { setImage } = useImageStore();
  const [isCapturing, setIsCapturing] = React.useState(false);

  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    stopCamera();
    onClose?.();
  };

  const handleCapture = () => {
    if (!videoRef.current || !isActive) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();
    setIsCapturing(true);
    
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], 'webcam-capture.png', { type: 'image/png' });
          setImage(file);
          onClose?.();
        }
        setIsCapturing(false);
      },
      'image/png',
      1.0
    );
  };

  const handleSwitchCamera = async () => {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    await switchCamera(devices[nextIndex].deviceId);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!isActive && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
            <div className="text-center">
              <Camera className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-white text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full">
        <Button
          variant="outline"
          size="lg"
          onClick={handleCancel}
          className="flex-1"
        >
          <X className="h-5 w-5 mr-2" />
          Cancel
        </Button>

        {devices.length > 1 && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleSwitchCamera}
            disabled={!isActive}
          >
            <SwitchCamera className="h-5 w-5" />
          </Button>
        )}

        <Button
          size="lg"
          onClick={handleCapture}
          disabled={!isActive || isCapturing}
          className="flex-1"
        >
          {isCapturing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-2" />
              Capture Photo
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Position yourself in the camera view and click &quot;Capture Photo&quot; when ready
      </p>
    </div>
  );
}
