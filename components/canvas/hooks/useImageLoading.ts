import { useState, useEffect } from 'react';
import { getCldImageUrl } from '@/lib/cloudinary';
import { OVERLAY_PUBLIC_IDS } from '@/lib/cloudinary-overlays';
import { cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds';
import type { BackgroundConfig } from '@/lib/constants/backgrounds';
import type { ImageOverlay } from '@/lib/store';

export function useBackgroundImage(
  backgroundConfig: BackgroundConfig,
  containerWidth: number,
  containerHeight: number
) {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (backgroundConfig.type === 'image' && backgroundConfig.value) {
      const imageValue = backgroundConfig.value as string;

      const isValidImageValue =
        imageValue.startsWith('http') ||
        imageValue.startsWith('blob:') ||
        imageValue.startsWith('data:') ||
        (typeof imageValue === 'string' && !imageValue.includes('_gradient'));

      if (!isValidImageValue) {
        setBgImage(null);
        return;
      }

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setBgImage(img);
      img.onerror = () => {
        console.error(
          'Failed to load background image:',
          backgroundConfig.value
        );
        setBgImage(null);
      };

      let imageUrl = imageValue;
      if (
        typeof imageUrl === 'string' &&
        !imageUrl.startsWith('http') &&
        !imageUrl.startsWith('blob:') &&
        !imageUrl.startsWith('data:')
      ) {
        if (cloudinaryPublicIds.includes(imageUrl)) {
          imageUrl = getCldImageUrl({
            src: imageUrl,
            width: Math.max(containerWidth, 1920),
            height: Math.max(containerHeight, 1080),
            quality: 'auto',
            format: 'auto',
            crop: 'fill',
            gravity: 'auto',
          });
        } else {
          setBgImage(null);
          return;
        }
      }

      img.src = imageUrl;
    } else {
      setBgImage(null);
    }
  }, [backgroundConfig, containerWidth, containerHeight]);

  return bgImage;
}

export function useOverlayImages(imageOverlays: ImageOverlay[]) {
  const [loadedOverlayImages, setLoadedOverlayImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  useEffect(() => {
    const loadOverlays = async () => {
      const loadedImages: Record<string, HTMLImageElement> = {};

      for (const overlay of imageOverlays) {
        if (!overlay.isVisible) continue;

        try {
          const isCloudinaryId =
            (typeof overlay.src === 'string' && OVERLAY_PUBLIC_IDS.includes(overlay.src as typeof OVERLAY_PUBLIC_IDS[number])) ||
            (typeof overlay.src === 'string' &&
              overlay.src.startsWith('overlays/'));

          const imageUrl =
            isCloudinaryId && !overlay.isCustom
              ? getCldImageUrl({
                  src: overlay.src,
                  width: overlay.size * 2,
                  height: overlay.size * 2,
                  quality: 'auto',
                  format: 'auto',
                  crop: 'fit',
                })
              : overlay.src;

          const img = new window.Image();
          img.crossOrigin = 'anonymous';

          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              loadedImages[overlay.id] = img;
              resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load overlay: ${overlay.id}`));
            img.src = imageUrl;
          });
        } catch (error) {
          console.error(
            `Failed to load overlay image for ${overlay.id}:`,
            error
          );
        }
      }

      setLoadedOverlayImages(loadedImages);
    };

    loadOverlays();
  }, [imageOverlays]);

  return loadedOverlayImages;
}

