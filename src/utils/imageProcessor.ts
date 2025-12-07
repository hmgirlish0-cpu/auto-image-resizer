import Pica from 'pica';
import imageCompression from 'browser-image-compression';
import {
  ProcessingConfig,
  ResizeMode,
  WatermarkType,
  Position,
  CropMode,
} from '../types';

const pica = Pica();

export async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function resizeImage(
  img: HTMLImageElement,
  config: ProcessingConfig['resize']
): Promise<HTMLCanvasElement> {
  if (!config.enabled) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  const { width, height, mode, padColor } = config;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  if (mode === ResizeMode.STRETCH) {
    canvas.width = width;
    canvas.height = height;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(img, 0, 0);
    await pica.resize(tempCanvas, canvas);
  } else if (mode === ResizeMode.MAINTAIN_ASPECT) {
    const aspectRatio = img.width / img.height;
    const targetAspect = width / height;

    let newWidth, newHeight;
    if (aspectRatio > targetAspect) {
      newWidth = width;
      newHeight = width / aspectRatio;
    } else {
      newHeight = height;
      newWidth = height * aspectRatio;
    }

    canvas.width = Math.round(newWidth);
    canvas.height = Math.round(newHeight);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(img, 0, 0);
    await pica.resize(tempCanvas, canvas);
  } else if (mode === ResizeMode.PAD) {
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = padColor;
    ctx.fillRect(0, 0, width, height);

    const aspectRatio = img.width / img.height;
    const targetAspect = width / height;

    let newWidth, newHeight;
    if (aspectRatio > targetAspect) {
      newWidth = width;
      newHeight = width / aspectRatio;
    } else {
      newHeight = height;
      newWidth = height * aspectRatio;
    }

    const x = (width - newWidth) / 2;
    const y = (height - newHeight) / 2;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = Math.round(newWidth);
    tempCanvas.height = Math.round(newHeight);
    
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = img.width;
    sourceCanvas.height = img.height;
    const sourceCtx = sourceCanvas.getContext('2d')!;
    sourceCtx.drawImage(img, 0, 0);
    
    await pica.resize(sourceCanvas, tempCanvas);
    ctx.drawImage(tempCanvas, x, y);
  }

  return canvas;
}

export async function compressImage(
  canvas: HTMLCanvasElement,
  config: ProcessingConfig['compression']
): Promise<Blob> {
  if (!config.enabled) {
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95));
  }

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 1.0)
  );

  const options: any = {
    maxSizeMB: config.targetSizeKB ? config.targetSizeKB / 1024 : 1,
    maxWidthOrHeight: Math.max(canvas.width, canvas.height),
    useWebWorker: true,
  };

  if (config.quality) {
    options.initialQuality = config.quality / 100;
  }

  try {
    const file = new File([blob], 'temp.jpg', { type: 'image/jpeg' });
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (error) {
    return blob;
  }
}

export async function addWatermark(
  canvas: HTMLCanvasElement,
  config: ProcessingConfig['watermark']
): Promise<HTMLCanvasElement> {
  if (!config.enabled) return canvas;

  const ctx = canvas.getContext('2d')!;
  const { type, text, position, transparency, sizePercent } = config;

  ctx.globalAlpha = transparency / 100;

  if (type === WatermarkType.TEXT) {
    const fontSize = Math.floor((canvas.width * sizePercent) / 100);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    let x, y;
    switch (position) {
      case Position.CENTER:
        x = (canvas.width - textWidth) / 2;
        y = canvas.height / 2;
        break;
      case Position.TOP_LEFT:
        x = 20;
        y = textHeight + 20;
        break;
      case Position.TOP_RIGHT:
        x = canvas.width - textWidth - 20;
        y = textHeight + 20;
        break;
      case Position.BOTTOM_LEFT:
        x = 20;
        y = canvas.height - 20;
        break;
      case Position.BOTTOM_RIGHT:
        x = canvas.width - textWidth - 20;
        y = canvas.height - 20;
        break;
      default:
        x = (canvas.width - textWidth) / 2;
        y = canvas.height / 2;
    }

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  } else if (type === WatermarkType.REPEATING) {
    const fontSize = Math.floor((canvas.width * sizePercent) / 100);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 4);

    const spacing = fontSize * 3;
    for (let y = -canvas.height; y < canvas.height; y += spacing) {
      for (let x = -canvas.width; x < canvas.width; x += spacing * 2) {
        ctx.fillText(text, x, y);
      }
    }

    ctx.restore();
  }

  ctx.globalAlpha = 1.0;
  return canvas;
}

export async function cropImage(
  canvas: HTMLCanvasElement,
  config: ProcessingConfig['crop']
): Promise<HTMLCanvasElement> {
  if (!config.enabled) return canvas;

  const { mode, aspectRatio, width, height } = config;
  const croppedCanvas = document.createElement('canvas');
  const ctx = croppedCanvas.getContext('2d')!;

  if (mode === CropMode.CENTER && width && height) {
    croppedCanvas.width = width;
    croppedCanvas.height = height;

    const sx = (canvas.width - width) / 2;
    const sy = (canvas.height - height) / 2;

    ctx.drawImage(canvas, sx, sy, width, height, 0, 0, width, height);
  } else if (mode === CropMode.ASPECT_RATIO && aspectRatio) {
    const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
    const targetRatio = ratioW / ratioH;
    const currentRatio = canvas.width / canvas.height;

    let cropWidth, cropHeight;
    if (currentRatio > targetRatio) {
      cropHeight = canvas.height;
      cropWidth = cropHeight * targetRatio;
    } else {
      cropWidth = canvas.width;
      cropHeight = cropWidth / targetRatio;
    }

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const sx = (canvas.width - cropWidth) / 2;
    const sy = (canvas.height - cropHeight) / 2;

    ctx.drawImage(canvas, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  } else {
    return canvas;
  }

  return croppedCanvas;
}

export async function convertFormat(
  canvas: HTMLCanvasElement,
  config: ProcessingConfig['conversion']
): Promise<Blob> {
  if (!config.enabled) {
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95));
  }

  const { format, quality } = config;
  const mimeType = `image/${format}`;
  const qualityValue = quality / 100;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), mimeType, qualityValue);
  });
}

export async function processImage(
  file: File,
  config: ProcessingConfig
): Promise<{ blob: Blob; originalSizeKB: number; finalSizeKB: number }> {
  const img = await loadImage(file);
  let canvas = await resizeImage(img, config.resize);
  canvas = await cropImage(canvas, config.crop);
  canvas = await addWatermark(canvas, config.watermark);

  let blob: Blob;
  if (config.compression.enabled) {
    blob = await compressImage(canvas, config.compression);
  } else {
    blob = await convertFormat(canvas, config.conversion);
  }

  const originalSizeKB = file.size / 1024;
  const finalSizeKB = blob.size / 1024;

  URL.revokeObjectURL(img.src);

  return { blob, originalSizeKB, finalSizeKB };
}
