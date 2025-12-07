export enum ResizeMode {
  MAINTAIN_ASPECT = 'maintain_aspect',
  STRETCH = 'stretch',
  PAD = 'pad',
}

export enum WatermarkType {
  TEXT = 'text',
  IMAGE = 'image',
  REPEATING = 'repeating',
}

export enum CropMode {
  CENTER = 'center',
  ASPECT_RATIO = 'aspect_ratio',
  SMART = 'smart',
}

export enum Position {
  CENTER = 'center',
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
}

export interface ResizeConfig {
  enabled: boolean;
  width: number;
  height: number;
  mode: ResizeMode;
  padColor: string;
}

export interface CompressionConfig {
  enabled: boolean;
  targetSizeKB?: number;
  quality?: number;
}

export interface WatermarkConfig {
  enabled: boolean;
  type: WatermarkType;
  text: string;
  imageFile?: File;
  position: Position;
  transparency: number;
  sizePercent: number;
}

export interface CropConfig {
  enabled: boolean;
  mode: CropMode;
  aspectRatio?: string;
  width?: number;
  height?: number;
}

export interface ConversionConfig {
  enabled: boolean;
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
}

export interface ProcessingConfig {
  resize: ResizeConfig;
  compression: CompressionConfig;
  watermark: WatermarkConfig;
  crop: CropConfig;
  conversion: ConversionConfig;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

export interface ProcessedFile {
  id: string;
  originalFile: File;
  processedBlob: Blob;
  preview: string;
  originalSizeKB: number;
  finalSizeKB: number;
  success: boolean;
  error?: string;
}

export interface Preset {
  name: string;
  description: string;
  config: ProcessingConfig;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  currentFileName: string;
  percentage: number;
}
