export function parseLinearGradient(
  gradientString: string,
  width: number,
  height: number
) {
  const match = gradientString.match(/linear-gradient\((.+)\)/);
  if (!match) return null;

  const content = match[1];
  
  let startPoint = { x: 0, y: 0 };
  let endPoint = { x: width, y: 0 };
  let angle = 0;

  const degMatch = content.match(/(\d+)deg/);
  if (degMatch) {
    angle = parseInt(degMatch[1], 10);
    const rad = (angle * Math.PI) / 180;
    const length = Math.sqrt(width * width + height * height);
    const centerX = width / 2;
    const centerY = height / 2;
    
    startPoint = {
      x: centerX - (length / 2) * Math.cos(rad),
      y: centerY - (length / 2) * Math.sin(rad),
    };
    endPoint = {
      x: centerX + (length / 2) * Math.cos(rad),
      y: centerY + (length / 2) * Math.sin(rad),
    };
  } else if (content.includes('to right')) {
    startPoint = { x: 0, y: 0 };
    endPoint = { x: width, y: 0 };
  } else if (content.includes('to left')) {
    startPoint = { x: width, y: 0 };
    endPoint = { x: 0, y: 0 };
  } else if (content.includes('to bottom')) {
    startPoint = { x: 0, y: 0 };
    endPoint = { x: 0, y: height };
  } else if (content.includes('to top')) {
    startPoint = { x: 0, y: height };
    endPoint = { x: 0, y: 0 };
  }

  const colorStops: (number | string)[] = [];
  
  const colorStopRegex = /(rgb\([^)]+\)|rgba\([^)]+\)|#[0-9A-Fa-f]{3,8})(?:\s+(\d+(?:\.\d+)?%))?/g;
  let colorMatch;
  const colorMatches: Array<{ color: string; percentage?: string }> = [];
  
  while ((colorMatch = colorStopRegex.exec(content)) !== null) {
    colorMatches.push({
      color: colorMatch[1],
      percentage: colorMatch[2],
    });
  }
  
  if (colorMatches.length > 0) {
    colorMatches.forEach((match) => {
      if (match.percentage) {
        const position = parseFloat(match.percentage) / 100;
        colorStops.push(position, match.color);
      } else {
        const index = colorMatches.indexOf(match);
        const position = colorMatches.length > 1 ? index / (colorMatches.length - 1) : 0;
        colorStops.push(position, match.color);
      }
    });
  } else {
    const parts = content.split(',').map((p) => p.trim());
    const colors = parts.filter((part) => {
      const trimmed = part.trim();
      return trimmed.includes('rgb') || trimmed.includes('#') || trimmed.includes('rgba');
    });
    
    colors.forEach((color, index) => {
      const position = colors.length > 1 ? index / (colors.length - 1) : 0;
      colorStops.push(position, color.trim());
    });
  }

  if (colorStops.length === 0) return null;

  return {
    startPoint,
    endPoint,
    colorStops,
  };
}

