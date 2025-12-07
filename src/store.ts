import { create } from 'zustand';
import {
  UploadedFile,
  ProcessedFile,
  ProcessingConfig,
  ProcessingProgress,
  ResizeMode,
  WatermarkType,
  Position,
  CropMode,
} from './types';

interface AppState {
  // Uploaded files
  uploadedFiles: UploadedFile[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  // Processing config
  config: ProcessingConfig;
  updateConfig: (config: Partial<ProcessingConfig>) => void;
  loadPreset: (config: ProcessingConfig) => void;

  // Processing state
  isProcessing: boolean;
  progress: ProcessingProgress | null;
  processedFiles: ProcessedFile[];
  setProcessing: (isProcessing: boolean) => void;
  setProgress: (progress: ProcessingProgress | null) => void;
  setProcessedFiles: (files: ProcessedFile[]) => void;
  clearResults: () => void;

  // View state
  currentView: 'upload' | 'config' | 'results';
  setCurrentView: (view: 'upload' | 'config' | 'results') => void;
}

const defaultConfig: ProcessingConfig = {
  resize: {
    enabled: false,
    width: 1920,
    height: 1080,
    mode: ResizeMode.MAINTAIN_ASPECT,
    padColor: '#ffffff',
  },
  compression: {
    enabled: false,
    quality: 85,
  },
  watermark: {
    enabled: false,
    type: WatermarkType.TEXT,
    text: '© Your Name',
    position: Position.BOTTOM_RIGHT,
    transparency: 50,
    sizePercent: 5,
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
};

export const useStore = create<AppState>((set) => ({
  // Uploaded files
  uploadedFiles: [],
  addFiles: (files: File[]) =>
    set((state) => ({
      uploadedFiles: [
        ...state.uploadedFiles,
        ...files.map((file) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
        })),
      ],
    })),
  removeFile: (id: string) =>
    set((state) => {
      const file = state.uploadedFiles.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return {
        uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id),
      };
    }),
  clearFiles: () =>
    set((state) => {
      state.uploadedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      return { uploadedFiles: [] };
    }),

  // Processing config
  config: defaultConfig,
  updateConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
  loadPreset: (config) => set({ config }),

  // Processing state
  isProcessing: false,
  progress: null,
  processedFiles: [],
  setProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ progress }),
  setProcessedFiles: (files) => set({ processedFiles: files }),
  clearResults: () =>
    set((state) => {
      state.processedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      return { processedFiles: [], progress: null };
    }),

  // View state
  currentView: 'upload',
  setCurrentView: (view) => set({ currentView: view }),
}));
