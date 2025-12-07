import { Preset, ResizeMode, Position, WatermarkType, CropMode } from './types';

export const PRESETS: Preset[] = [
  {
    name: 'Instagram Post',
    description: '1080x1080, optimized for Instagram feed',
    config: {
      resize: {
        enabled: true,
        width: 1080,
        height: 1080,
        mode: ResizeMode.PAD,
        padColor: '#ffffff',
      },
      compression: {
        enabled: true,
        targetSizeKB: 500,
      },
      watermark: {
        enabled: false,
        type: WatermarkType.TEXT,
        text: '',
        position: Position.CENTER,
        transparency: 50,
        sizePercent: 10,
      },
      crop: {
        enabled: false,
        mode: CropMode.CENTER,
      },
      conversion: {
        enabled: true,
        format: 'jpeg',
        quality: 90,
      },
    },
  },
  {
    name: 'Website Banner',
    description: '1920x1080, WEBP format for fast loading',
    config: {
      resize: {
        enabled: true,
        width: 1920,
        height: 1080,
        mode: ResizeMode.MAINTAIN_ASPECT,
        padColor: '#ffffff',
      },
      compression: {
        enabled: false,
      },
      watermark: {
        enabled: false,
        type: WatermarkType.TEXT,
        text: '',
        position: Position.CENTER,
        transparency: 50,
        sizePercent: 10,
      },
      crop: {
        enabled: false,
        mode: CropMode.CENTER,
      },
      conversion: {
        enabled: true,
        format: 'webp',
        quality: 85,
      },
    },
  },
  {
    name: 'Profile Picture',
    description: '512x512, square crop for avatars',
    config: {
      resize: {
        enabled: true,
        width: 512,
        height: 512,
        mode: ResizeMode.PAD,
        padColor: '#ffffff',
      },
      compression: {
        enabled: true,
        quality: 90,
      },
      watermark: {
        enabled: false,
        type: WatermarkType.TEXT,
        text: '',
        position: Position.CENTER,
        transparency: 50,
        sizePercent: 10,
      },
      crop: {
        enabled: true,
        mode: CropMode.CENTER,
        width: 512,
        height: 512,
      },
      conversion: {
        enabled: true,
        format: 'jpeg',
        quality: 90,
      },
    },
  },
  {
    name: 'E-commerce Product',
    description: '1000x1000, white background',
    config: {
      resize: {
        enabled: true,
        width: 1000,
        height: 1000,
        mode: ResizeMode.PAD,
        padColor: '#ffffff',
      },
      compression: {
        enabled: true,
        quality: 95,
      },
      watermark: {
        enabled: false,
        type: WatermarkType.TEXT,
        text: '',
        position: Position.CENTER,
        transparency: 50,
        sizePercent: 10,
      },
      crop: {
        enabled: false,
        mode: CropMode.CENTER,
      },
      conversion: {
        enabled: true,
        format: 'jpeg',
        quality: 95,
      },
    },
  },
];
