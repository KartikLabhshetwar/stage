'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseWebcamReturn {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  devices: MediaDeviceInfo[];
  currentDeviceId: string | null;
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
  capturePhoto: () => Promise<string | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useWebcam(): UseWebcamReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getVideoDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter((device) => device.kind === 'videoinput');
      setDevices(videoDevices);
      return videoDevices;
    } catch (err) {
      return [];
    }
  }, []);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      try {
        setError(null);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: deviceId ? undefined : 'user',
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          await new Promise<void>((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(() => {});
                resolve();
              };
            } else {
              resolve();
            }
          });
        }

        setStream(mediaStream);
        setIsActive(true);
        setCurrentDeviceId(deviceId || null);

        await getVideoDevices();
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError('Camera access denied. Please allow camera permissions.');
          } else if (err.name === 'NotFoundError') {
            setError('No camera found. Please connect a camera.');
          } else {
            setError('Failed to access camera. Please try again.');
          }
        }
        setIsActive(false);
      }
    },
    [stream, getVideoDevices]
  );

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsActive(false);
      setCurrentDeviceId(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const switchCamera = useCallback(
    async (deviceId: string) => {
      await startCamera(deviceId);
    },
    [startCamera]
  );

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !isActive) {
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              resolve(null);
            }
          },
          'image/png',
          1.0
        );
      });
    } catch (err) {
      return null;
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    getVideoDevices();
  }, [getVideoDevices]);

  return {
    stream,
    isActive,
    error,
    devices,
    currentDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    videoRef,
  };
}
