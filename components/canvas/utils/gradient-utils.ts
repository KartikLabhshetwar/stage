export function parseLinearGradient(
  gradientString: string,
  width: number,
  height: number
) {
  const match = gradientString.match(/linear-gradient\((.+)\)/);
  if (!match) return null;

  const parts = match[1].split(',').map((p) => p.trim());
  const direction = parts[0];
  const colors = parts.slice(1);

  let startPoint = { x: 0, y: 0 };
  let endPoint = { x: width, y: 0 };

  if (direction.includes('right')) {
    startPoint = { x: 0, y: 0 };
    endPoint = { x: width, y: 0 };
  } else if (direction.includes('left')) {
    startPoint = { x: width, y: 0 };
    endPoint = { x: 0, y: 0 };
  } else if (direction.includes('bottom')) {
    startPoint = { x: 0, y: 0 };
    endPoint = { x: 0, y: height };
  } else if (direction.includes('top')) {
    startPoint = { x: 0, y: height };
    endPoint = { x: 0, y: 0 };
  }

  const colorStops: (number | string)[] = [];
  colors.forEach((color, index) => {
    const position = index / (colors.length - 1);
    colorStops.push(position, color.trim());
  });

  return {
    startPoint,
    endPoint,
    colorStops,
  };
}

