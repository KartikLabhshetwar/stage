import { useImageStore } from '@/lib/store';

interface ImageRenderComponentProps {
  imageUrl: string;
}

export const ImageRenderComponent = ({
  imageUrl,
}: ImageRenderComponentProps) => {
  const { borderRadius, imageOpacity, imageBorder, imageShadow, imageScale } = useImageStore();

  // Build shadow style
  const shadowStyle = imageShadow.enabled
    ? `${imageShadow.offsetX}px ${imageShadow.offsetY}px ${imageShadow.blur}px ${imageShadow.spread}px ${imageShadow.color}`
    : 'none';

  // Default shadow for styles that need it
  const defaultShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

  // Build border styles based on border type
  const getBorderStyles = () => {
    const baseStyles: React.CSSProperties = {
      borderRadius: `${borderRadius}px`,
      opacity: imageOpacity,
      transform: `scale(${imageScale / 100})`,
      transformOrigin: 'center',
      boxShadow: shadowStyle !== 'none' ? shadowStyle : undefined,
    };

    if (!imageBorder.enabled) {
      return baseStyles;
    }

    // Build individual border styles
    const buildIndividualBorders = () => {
      const borders: React.CSSProperties = {};
      
      // If inset is enabled, use box-shadow inset effect instead of borders
      if (imageBorder.inset) {
        // Build inset shadow for each enabled side
        const insetShadows: string[] = [];
        if (imageBorder.top) insetShadows.push(`inset 0 ${imageBorder.width || 2}px 0 0 ${imageBorder.color || '#000000'}`);
        if (imageBorder.right) insetShadows.push(`inset -${imageBorder.width || 2}px 0 0 0 ${imageBorder.color || '#000000'}`);
        if (imageBorder.bottom) insetShadows.push(`inset 0 -${imageBorder.width || 2}px 0 0 ${imageBorder.color || '#000000'}`);
        if (imageBorder.left) insetShadows.push(`inset ${imageBorder.width || 2}px 0 0 0 ${imageBorder.color || '#000000'}`);
        
        if (insetShadows.length > 0) {
          // Combine with existing shadow if any
          const existingShadow = baseStyles.boxShadow ? `${baseStyles.boxShadow}, ` : '';
          borders.boxShadow = `${existingShadow}${insetShadows.join(', ')}`;
        } else if (shadowStyle !== 'none') {
          borders.boxShadow = shadowStyle;
        }
      } else {
        // Regular borders - only apply if at least one side is enabled
        if (imageBorder.top || imageBorder.right || imageBorder.bottom || imageBorder.left) {
          const borderColor = imageBorder.color || '#000000';
          const borderStyleType = imageBorder.style === 'default' ? 'solid' : imageBorder.style;
          const borderValue = `${imageBorder.width || 2}px ${borderStyleType} ${borderColor}`;
          
          if (imageBorder.top) borders.borderTop = borderValue;
          if (imageBorder.right) borders.borderRight = borderValue;
          if (imageBorder.bottom) borders.borderBottom = borderValue;
          if (imageBorder.left) borders.borderLeft = borderValue;
        }
      }

      return borders;
    };

    // Apply border radius to border itself if specified, otherwise use image borderRadius
    const borderRadiusStyle = imageBorder.borderRadius > 0 
      ? { borderRadius: `${imageBorder.borderRadius}px` }
      : { borderRadius: `${borderRadius}px` };

    switch (imageBorder.style) {
      case 'default':
        // Default style means no border - just return base styles
        return {
          ...baseStyles,
          ...borderRadiusStyle,
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      case 'outline':
        const outlineBorders = buildIndividualBorders();
        return {
          ...baseStyles,
          ...outlineBorders,
          ...borderRadiusStyle,
          boxShadow: outlineBorders.boxShadow || (shadowStyle !== 'none' ? shadowStyle : defaultShadow),
        };

      case 'border':
        const borderBorders = buildIndividualBorders();
        return {
          ...baseStyles,
          ...borderBorders,
          ...borderRadiusStyle,
          boxShadow: borderBorders.boxShadow || (shadowStyle !== 'none' ? shadowStyle : defaultShadow),
        };

      case 'solid':
      case 'dashed':
      case 'dotted':
      case 'double':
        const styleBorders = buildIndividualBorders();
        return {
          ...baseStyles,
          ...styleBorders,
          ...borderRadiusStyle,
          boxShadow: styleBorders.boxShadow || (shadowStyle !== 'none' ? shadowStyle : defaultShadow),
        };

      default:
        return baseStyles;
    }
  };

  const borderStyles = getBorderStyles();

  return (
    <img
      src={imageUrl}
      alt="Uploaded image"
      className="max-w-full max-h-full w-auto h-auto object-contain"
      style={{
        ...borderStyles,
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
      }}
    />
  );
};

