import { useStore } from '../store';
import { PRESETS } from '../presets';
import { ResizeMode, WatermarkType, Position, CropMode } from '../types';
import { processImage } from '../utils/imageProcessor';
import { Settings, ArrowLeft, Sparkles, Maximize2, Droplet, Type, Crop, FileImage } from 'lucide-react';

export function ConfigView() {
  const { config, updateConfig, loadPreset, uploadedFiles, setCurrentView, setProcessing, setProgress, setProcessedFiles } = useStore();

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = PRESETS.find((p) => p.name === e.target.value);
    if (preset) {
      loadPreset(preset.config);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    setCurrentView('results');
    
    const results = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      setProgress({
        current: i + 1,
        total: uploadedFiles.length,
        currentFileName: file.file.name,
        percentage: Math.round(((i + 1) / uploadedFiles.length) * 100),
      });

      try {
        const { blob, originalSizeKB, finalSizeKB } = await processImage(file.file, config);
        results.push({
          id: file.id,
          originalFile: file.file,
          processedBlob: blob,
          preview: URL.createObjectURL(blob),
          originalSizeKB,
          finalSizeKB,
          success: true,
        });
      } catch (error) {
        results.push({
          id: file.id,
          originalFile: file.file,
          processedBlob: new Blob(),
          preview: '',
          originalSizeKB: file.file.size / 1024,
          finalSizeKB: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    setProcessedFiles(results);
    setProcessing(false);
    setProgress(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Settings className="w-10 h-10 text-yellow-300" />
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Configure Processing
          </h1>
        </div>
        <p className="text-xl text-white/90 font-medium">
          Customize your image transformation settings
        </p>
      </div>

      {/* Preset Selector Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6 animate-slide-up">
        <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Quick Presets
        </label>
        <select
          onChange={handlePresetChange}
          className="w-full p-4 border-2 border-purple-200 rounded-xl text-gray-700 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          defaultValue=""
        >
          <option value="">✨ Custom Configuration</option>
          {PRESETS.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name} - {preset.description}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {/* Resize */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <label className="flex items-center mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.resize.enabled}
              onChange={(e) =>
                updateConfig({
                  resize: { ...config.resize, enabled: e.target.checked },
                })
              }
              className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <Maximize2 className="w-6 h-6 text-purple-500 mr-2" />
            <span className="font-bold text-xl text-gray-800 group-hover:text-purple-600 transition-colors">Resize</span>
          </label>

          {config.resize.enabled && (
            <div className="space-y-4 ml-8 mt-4 p-4 bg-purple-50/50 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={config.resize.width}
                    onChange={(e) =>
                      updateConfig({
                        resize: { ...config.resize, width: parseInt(e.target.value) },
                      })
                    }
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={config.resize.height}
                    onChange={(e) =>
                      updateConfig({
                        resize: { ...config.resize, height: parseInt(e.target.value) },
                      })
                    }
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resize Mode</label>
                <select
                  value={config.resize.mode}
                  onChange={(e) =>
                    updateConfig({
                      resize: { ...config.resize, mode: e.target.value as ResizeMode },
                    })
                  }
                  className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                >
                  <option value={ResizeMode.MAINTAIN_ASPECT}>📐 Maintain Aspect Ratio</option>
                  <option value={ResizeMode.STRETCH}>↔️ Stretch to Fit</option>
                  <option value={ResizeMode.PAD}>🎨 Pad with Color</option>
                </select>
              </div>

              {config.resize.mode === ResizeMode.PAD && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pad Color</label>
                  <input
                    type="color"
                    value={config.resize.padColor}
                    onChange={(e) =>
                      updateConfig({
                        resize: { ...config.resize, padColor: e.target.value },
                      })
                    }
                    className="w-full h-12 border-2 border-purple-200 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compression */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <label className="flex items-center mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.compression.enabled}
              onChange={(e) =>
                updateConfig({
                  compression: { ...config.compression, enabled: e.target.checked },
                })
              }
              className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <Droplet className="w-6 h-6 text-blue-500 mr-2" />
            <span className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors">Compression</span>
          </label>

          {config.compression.enabled && (
            <div className="space-y-4 ml-8 mt-4 p-4 bg-blue-50/50 rounded-xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Size (KB)</label>
                <input
                  type="number"
                  value={config.compression.targetSizeKB || ''}
                  onChange={(e) =>
                    updateConfig({
                      compression: {
                        ...config.compression,
                        targetSizeKB: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="Leave empty for quality-based"
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quality (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.compression.quality || 85}
                  onChange={(e) =>
                    updateConfig({
                      compression: {
                        ...config.compression,
                        quality: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Watermark */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <label className="flex items-center mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.watermark.enabled}
              onChange={(e) =>
                updateConfig({
                  watermark: { ...config.watermark, enabled: e.target.checked },
                })
              }
              className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <Type className="w-6 h-6 text-pink-500 mr-2" />
            <span className="font-bold text-xl text-gray-800 group-hover:text-pink-600 transition-colors">Watermark</span>
          </label>

          {config.watermark.enabled && (
            <div className="space-y-4 ml-8 mt-4 p-4 bg-pink-50/50 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={config.watermark.type}
                    onChange={(e) =>
                      updateConfig({
                        watermark: {
                          ...config.watermark,
                          type: e.target.value as WatermarkType,
                        },
                      })
                    }
                    className="w-full p-3 border-2 border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  >
                    <option value={WatermarkType.TEXT}>💬 Text</option>
                    <option value={WatermarkType.REPEATING}>🔄 Repeating Text</option>
                  </select>
                </div>

                {config.watermark.type !== WatermarkType.REPEATING && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                    <select
                      value={config.watermark.position}
                      onChange={(e) =>
                        updateConfig({
                          watermark: {
                            ...config.watermark,
                            position: e.target.value as Position,
                          },
                        })
                      }
                      className="w-full p-3 border-2 border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                    >
                      <option value={Position.CENTER}>⊙ Center</option>
                      <option value={Position.TOP_LEFT}>↖ Top Left</option>
                      <option value={Position.TOP_RIGHT}>↗ Top Right</option>
                      <option value={Position.BOTTOM_LEFT}>↙ Bottom Left</option>
                      <option value={Position.BOTTOM_RIGHT}>↘ Bottom Right</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Watermark Text</label>
                <input
                  type="text"
                  value={config.watermark.text}
                  onChange={(e) =>
                    updateConfig({
                      watermark: { ...config.watermark, text: e.target.value },
                    })
                  }
                  className="w-full p-3 border-2 border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  placeholder="© Your Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transparency: <span className="text-pink-600 font-bold">{config.watermark.transparency}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.watermark.transparency}
                  onChange={(e) =>
                    updateConfig({
                      watermark: {
                        ...config.watermark,
                        transparency: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full h-3 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Size: <span className="text-pink-600 font-bold">{config.watermark.sizePercent}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.watermark.sizePercent}
                  onChange={(e) =>
                    updateConfig({
                      watermark: {
                        ...config.watermark,
                        sizePercent: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full h-3 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Crop */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <label className="flex items-center mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.crop.enabled}
              onChange={(e) =>
                updateConfig({
                  crop: { ...config.crop, enabled: e.target.checked },
                })
              }
              className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <Crop className="w-6 h-6 text-green-500 mr-2" />
            <span className="font-bold text-xl text-gray-800 group-hover:text-green-600 transition-colors">Crop</span>
          </label>

          {config.crop.enabled && (
            <div className="space-y-3 ml-6">
              <div>
                <label className="block text-sm mb-1">Mode</label>
                <select
                  value={config.crop.mode}
                  onChange={(e) =>
                    updateConfig({
                      crop: { ...config.crop, mode: e.target.value as CropMode },
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value={CropMode.CENTER}>Center Crop</option>
                  <option value={CropMode.ASPECT_RATIO}>Aspect Ratio</option>
                </select>
              </div>

              {config.crop.mode === CropMode.ASPECT_RATIO && (
                <div>
                  <label className="block text-sm mb-1">Aspect Ratio</label>
                  <select
                    value={config.crop.aspectRatio || '1:1'}
                    onChange={(e) =>
                      updateConfig({
                        crop: { ...config.crop, aspectRatio: e.target.value },
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:3">4:3</option>
                    <option value="16:9">16:9</option>
                    <option value="4:5">4:5 (Instagram Portrait)</option>
                  </select>
                </div>
              )}

              {config.crop.mode === CropMode.CENTER && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Width</label>
                    <input
                      type="number"
                      value={config.crop.width || ''}
                      onChange={(e) =>
                        updateConfig({
                          crop: { ...config.crop, width: parseInt(e.target.value) },
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Height</label>
                    <input
                      type="number"
                      value={config.crop.height || ''}
                      onChange={(e) =>
                        updateConfig({
                          crop: { ...config.crop, height: parseInt(e.target.value) },
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Format Conversion */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <label className="flex items-center mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.conversion.enabled}
              onChange={(e) =>
                updateConfig({
                  conversion: { ...config.conversion, enabled: e.target.checked },
                })
              }
              className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <FileImage className="w-6 h-6 text-orange-500 mr-2" />
            <span className="font-bold text-xl text-gray-800 group-hover:text-orange-600 transition-colors">Format Conversion</span>
          </label>

          {config.conversion.enabled && (
            <div className="space-y-3 ml-6">
              <div>
                <label className="block text-sm mb-1">Format</label>
                <select
                  value={config.conversion.format}
                  onChange={(e) =>
                    updateConfig({
                      conversion: {
                        ...config.conversion,
                        format: e.target.value as 'jpeg' | 'png' | 'webp',
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WEBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Quality (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.conversion.quality}
                  onChange={(e) =>
                    updateConfig({
                      conversion: {
                        ...config.conversion,
                        quality: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setCurrentView('upload')}
          className="px-8 py-4 bg-white/95 backdrop-blur-sm text-gray-700 font-bold rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleProcess}
          disabled={uploadedFiles.length === 0}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Process {uploadedFiles.length} Image{uploadedFiles.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
