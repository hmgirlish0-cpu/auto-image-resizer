import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useStore } from '../store';

export function UploadView() {
  const { uploadedFiles, addFiles, removeFile, setCurrentView } = useStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-yellow-300" />
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Auto Image Resizer
          </h1>
          <Sparkles className="w-10 h-10 text-yellow-300" />
        </div>
        <p className="text-xl text-white/90 font-medium">
          Transform your images with powerful batch processing
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-4 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-purple-500 bg-purple-50 scale-105'
              : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-purple-400 hover:bg-purple-50/50'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="relative inline-block mb-6">
              <Upload className={`w-20 h-20 mx-auto ${isDragging ? 'text-purple-500 animate-bounce' : 'text-purple-400'}`} />
              <ImageIcon className="w-8 h-8 absolute -bottom-2 -right-2 text-pink-400" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-3">
              {isDragging ? 'Drop your images here!' : 'Drag and drop images here'}
            </p>
            <p className="text-gray-500 text-lg mb-4">or click to browse your files</p>
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
              Choose Files
            </div>
          </label>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-purple-500" />
              Uploaded Files
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm">
                {uploadedFiles.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {uploadedFiles.map((file, index) => (
              <div
                key={file.id}
                className="relative group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm mt-2 truncate font-medium text-gray-700">{file.file.name}</p>
                <p className="text-xs text-gray-500 font-semibold">
                  {(file.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentView('config')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Configure Processing
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
