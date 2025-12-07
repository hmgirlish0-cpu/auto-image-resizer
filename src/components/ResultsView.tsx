import { Download, ArrowLeft, CheckCircle2, Sparkles, Package } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useStore } from '../store';

export function ResultsView() {
  const { isProcessing, progress, processedFiles, setCurrentView, clearResults, clearFiles } = useStore();

  const handleDownloadSingle = (file: typeof processedFiles[0]) => {
    const extension = file.processedBlob.type.split('/')[1];
    const filename = file.originalFile.name.replace(/\.[^/.]+$/, '') + '.' + extension;
    saveAs(file.processedBlob, filename);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    
    processedFiles.forEach((file) => {
      if (file.success) {
        const extension = file.processedBlob.type.split('/')[1];
        const filename = file.originalFile.name.replace(/\.[^/.]+$/, '') + '.' + extension;
        zip.file(filename, file.processedBlob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'processed-images.zip');
  };

  const handleStartOver = () => {
    clearResults();
    clearFiles();
    setCurrentView('upload');
  };

  const successCount = processedFiles.filter((f) => f.success).length;
  const failCount = processedFiles.filter((f) => !f.success).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle2 className="w-10 h-10 text-yellow-300" />
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Processing Results
          </h1>
        </div>
        <p className="text-xl text-white/90 font-medium">
          Your images have been transformed!
        </p>
      </div>

      {isProcessing && progress && (
        <div className="mb-8 animate-slide-up">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-800">Processing Your Images...</h2>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-gray-700">
                  {progress.current} of {progress.total} files
                </span>
                <span className="text-purple-600 text-lg">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${progress.percentage}%` }}
                >
                  {progress.percentage > 10 && (
                    <span className="text-white text-xs font-bold">{progress.percentage}%</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">
              📸 Current: <span className="text-purple-600 font-semibold">{progress.currentFileName}</span>
            </p>
          </div>
        </div>
      )}

      {!isProcessing && processedFiles.length > 0 && (
        <>
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl shadow-2xl p-8 mb-8 animate-slide-up">
            <div className="flex items-center gap-4 mb-3">
              <CheckCircle2 className="w-12 h-12" />
              <h2 className="text-3xl font-bold">Processing Complete!</h2>
            </div>
            <p className="text-xl font-medium text-white/95">
              ✨ Successfully processed <span className="font-bold">{successCount}</span> of <span className="font-bold">{processedFiles.length}</span> images
              {failCount > 0 && <span className="text-red-100"> ({failCount} failed)</span>}
            </p>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={handleDownloadAll}
              disabled={successCount === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              <Package className="w-6 h-6" />
              Download All as ZIP
            </button>
            <button
              onClick={handleStartOver}
              className="px-8 py-4 bg-white/95 backdrop-blur-sm text-gray-700 font-bold rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Start Over
            </button>
          </div>

          <div className="space-y-6">
            {processedFiles.map((file, index) => (
              <div
                key={file.id}
                className={`rounded-2xl shadow-lg p-6 animate-slide-up ${
                  file.success ? 'bg-white/95 backdrop-blur-sm' : 'bg-red-50/95 backdrop-blur-sm border-2 border-red-300'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                      {file.success && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                      {file.originalFile.name}
                    </h3>
                    
                    {file.success ? (
                      <>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Before</p>
                            <div className="relative group overflow-hidden rounded-xl shadow-md">
                              <img
                                src={URL.createObjectURL(file.originalFile)}
                                alt="Before"
                                className="w-full h-64 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <p className="text-white font-bold text-lg">
                                  {file.originalSizeKB.toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">After</p>
                            <div className="relative group overflow-hidden rounded-xl shadow-md ring-2 ring-green-400">
                              <img
                                src={file.preview}
                                alt="After"
                                className="w-full h-64 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/90 to-transparent p-3">
                                <p className="text-white font-bold text-lg">
                                  {file.finalSizeKB.toFixed(1)} KB
                                </p>
                                <p className="text-green-100 text-sm font-semibold">
                                  ↓ {(
                                    ((file.originalSizeKB - file.finalSizeKB) /
                                      file.originalSizeKB) *
                                    100
                                  ).toFixed(1)}% smaller
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadSingle(file)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download This Image
                        </button>
                      </>
                    ) : (
                      <div className="text-red-700 bg-red-100 rounded-xl p-4">
                        <p className="font-bold text-lg mb-2">❌ Processing Failed</p>
                        <p className="text-sm">{file.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
