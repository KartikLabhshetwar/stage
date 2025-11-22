export interface CanvasDimensions {
  canvasW: number;
  canvasH: number;
  contentW: number;
  contentH: number;
  imageScaledW: number;
  imageScaledH: number;
  framedW: number;
  framedH: number;
  frameOffset: number;
  windowPadding: number;
  windowHeader: number;
  eclipseBorder: number;
  groupCenterX: number;
  groupCenterY: number;
  imageX: number;
  imageY: number;
}

export function calculateCanvasDimensions(
  image: HTMLImageElement,
  containerWidth: number,
  containerHeight: number,
  viewportSize: { width: number; height: number },
  canvas: { padding: number },
  screenshot: {
    scale: number;
    offsetX: number;
    offsetY: number;
    radius: number;
  },
  frame: {
    enabled: boolean;
    type: string;
    width: number;
    padding?: number;
  }
): CanvasDimensions {
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const canvasAspect = containerWidth / containerHeight;

  const availableWidth = Math.min(viewportSize.width * 1.1, containerWidth);
  const availableHeight = Math.min(viewportSize.height * 1.1, containerHeight);

  let canvasW: number, canvasH: number;
  if (availableWidth / availableHeight > canvasAspect) {
    canvasH = availableHeight - canvas.padding * 2;
    canvasW = canvasH * canvasAspect;
  } else {
    canvasW = availableWidth - canvas.padding * 2;
    canvasH = canvasW / canvasAspect;
  }

  const minContentSize = 300;
  canvasW = Math.max(canvasW, minContentSize);
  canvasH = Math.max(canvasH, minContentSize);

  const contentW = canvasW - canvas.padding * 2;
  const contentH = canvasH - canvas.padding * 2;

  let imageScaledW: number, imageScaledH: number;
  if (contentW / contentH > imageAspect) {
    imageScaledH = contentH * screenshot.scale;
    imageScaledW = imageScaledH * imageAspect;
  } else {
    imageScaledW = contentW * screenshot.scale;
    imageScaledH = imageScaledW / imageAspect;
  }

  const showFrame = frame.enabled && frame.type !== 'none';
  
  if (showFrame) {
    imageScaledW *= 0.88;
    imageScaledH *= 0.88;
  }
  const frameOffset =
    showFrame && frame.type === 'solid'
      ? frame.width
      : showFrame && frame.type === 'ruler'
      ? frame.width + 2
      : 0;
  const windowPadding =
    showFrame && frame.type === 'window' ? frame.padding || 20 : 0;
  const windowHeader = showFrame && frame.type === 'window' ? 40 : 0;
  const eclipseBorder =
    showFrame && frame.type === 'eclipse' ? frame.width + 2 : 0;

  const framedW =
    imageScaledW + frameOffset * 2 + windowPadding * 2 + eclipseBorder;
  const framedH =
    imageScaledH +
    frameOffset * 2 +
    windowPadding * 2 +
    windowHeader +
    eclipseBorder;

  const groupCenterX = canvasW / 2 + screenshot.offsetX;
  const groupCenterY = canvasH / 2 + screenshot.offsetY;
  const imageX = groupCenterX + frameOffset + windowPadding - imageScaledW / 2;
  const imageY =
    groupCenterY +
    frameOffset +
    windowPadding +
    windowHeader -
    imageScaledH / 2;

  return {
    canvasW,
    canvasH,
    contentW,
    contentH,
    imageScaledW,
    imageScaledH,
    framedW,
    framedH,
    frameOffset,
    windowPadding,
    windowHeader,
    eclipseBorder,
    groupCenterX,
    groupCenterY,
    imageX,
    imageY,
  };
}

