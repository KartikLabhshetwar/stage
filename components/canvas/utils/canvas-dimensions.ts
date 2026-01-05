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
  const isMobileViewport = viewportSize.width < 768;

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

  // Maintain a minimum preview size on larger screens but keep true ratio on mobile.
  const minContentSize = isMobileViewport ? 0 : 300;
  if (minContentSize > 0) {
    const minDimension = Math.min(canvasW, canvasH);
    if (minDimension < minContentSize && minDimension > 0) {
      const scaleFactor = minContentSize / minDimension;
      canvasW *= scaleFactor;
      canvasH *= scaleFactor;
    }
  }

  // Adapt padding so small canvases don't end up with huge borders.
  const maxPaddingRatio = isMobileViewport ? 0.05 : 0.08;
  const paddingLimit = Math.min(
    canvas.padding,
    Math.min(canvasW, canvasH) * maxPaddingRatio
  );
  const appliedPadding = Math.max(0, paddingLimit);

  const contentW = Math.max(0, canvasW - appliedPadding * 2);
  const contentH = Math.max(0, canvasH - appliedPadding * 2);

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

  const isWindowFrame = ['macos-light', 'macos-dark', 'windows-light', 'windows-dark'].includes(frame.type);
  const isMacosFrame = frame.type === 'macos-light' || frame.type === 'macos-dark';
  const isWindowsFrame = frame.type === 'windows-light' || frame.type === 'windows-dark';
  const isPhotograph = frame.type === 'photograph';

  const frameOffset =
    showFrame && (frame.type === 'arc-light' || frame.type === 'arc-dark')
      ? Math.max(0, frame.width || 8)
      : 0;
  const polaroidPadding = 8;
  const polaroidBottom = 60;
  const windowPadding = showFrame && isWindowFrame ? 0 : (showFrame && isPhotograph ? polaroidPadding : 0);
  const windowHeader = showFrame && isMacosFrame ? 40 : (showFrame && isWindowsFrame ? 28 : (showFrame && isPhotograph ? polaroidBottom - polaroidPadding : 0));
  const eclipseBorder = 0;

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

