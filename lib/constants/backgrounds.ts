import { gradientColors, GradientKey } from './gradient-colors';
import { SolidColorKey, solidColors } from './solid-colors';
import { getCldImageUrl } from '@/lib/cloudinary';
import { cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds';

export type BackgroundType = 'gradient' | 'solid' | 'image';

export interface BackgroundConfig {
  type: BackgroundType;
  value: GradientKey | SolidColorKey | string;
  opacity?: number;
}

export const getBackgroundStyle = (config: BackgroundConfig): string => {
  const { type, value, opacity = 1 } = config;

  switch (type) {
    case 'gradient':
      // Check if it's a predefined gradient key
      if (gradientColors[value as GradientKey]) {
        return gradientColors[value as GradientKey];
      }
      // Otherwise, treat it as a custom gradient string
      return value as string;

    case 'solid':
      const color = solidColors[value as SolidColorKey];
      return color;

    case 'image':
      return `url(${value})`;

    default:
      return gradientColors.primary_gradient;
  }
};

export const getBackgroundCSS = (
  config: BackgroundConfig
): React.CSSProperties => {
  const { type, value, opacity = 1 } = config;

  switch (type) {
    case 'gradient':
      // Check if it's a predefined gradient key
      let gradient: string;
      if (gradientColors[value as GradientKey]) {
        gradient = gradientColors[value as GradientKey];
      } else if (typeof value === 'string' && (value.startsWith('linear-gradient') || value.startsWith('radial-gradient'))) {
        // Custom gradient string
        gradient = value;
      } else {
        gradient = gradientColors.primary_gradient;
      }
      return {
        background: gradient,
        opacity,
      };

    case 'solid':
      const color = solidColors[value as SolidColorKey] || '#ffffff';
      return {
        backgroundColor: color,
        opacity,
      };

    case 'image':
      // Check if it's a Cloudinary public ID
      const isCloudinaryPublicId = typeof value === 'string' && 
        !value.startsWith('blob:') && 
        !value.startsWith('http') && 
        !value.startsWith('data:') &&
        cloudinaryPublicIds.includes(value);
      
      let imageUrl = value as string;
      
      // If it's a Cloudinary public ID, get the optimized URL
      if (isCloudinaryPublicId) {
        imageUrl = getCldImageUrl({
          src: value as string,
          width: 1920,
          height: 1080,
          quality: 'auto',
          format: 'auto',
          crop: 'fill',
          gravity: 'auto',
        });
      }
      
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity,
      };

    default:
      return {
        background: gradientColors.primary_gradient,
        opacity,
      };
  }
};
