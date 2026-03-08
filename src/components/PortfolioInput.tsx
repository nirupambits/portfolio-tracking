import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Type, Search } from 'lucide-react';

interface PortfolioInputProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function PortfolioInput({ onImageSelected, onTextSubmit, isLoading }: PortfolioInputProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('manual');
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      
      // Extract base64 data and mime type
      const match = result.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        onImageSelected(match[2], match[1]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (activeTab === 'upload' && e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      handleFile(e.clipboardData.files[0]);
    }
  }, [activeTab]);

  React.useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const clearImage = () => {
    setPreview(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      onTextSubmit(manualText);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex space-x-1 bg-zinc-900/50 p-1 rounded-xl mb-4 border border-zinc-800">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'manual'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Type className="w-4 h-4" />
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'upload'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      {activeTab === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="relative">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="E.g., Google, Microsoft, Apple, 10 shares of TSLA..."
            className="w-full h-40 bg-zinc-900/20 border-2 border-zinc-800 rounded-2xl p-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all"
            disabled={isLoading}
          />
          <div className="absolute bottom-4 right-4">
            <button
              type="submit"
              disabled={isLoading || !manualText.trim()}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Extract Tickers
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        preview ? (
          <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 p-2">
            <img src={preview} alt="Screenshot preview" className="w-full h-auto max-h-[400px] object-contain rounded-lg" />
            <button
              onClick={clearImage}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            {isLoading && (
              <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-emerald-400 font-medium animate-pulse">Extracting data...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`w-full relative rounded-2xl border-2 border-dashed transition-all duration-200 ease-in-out ${
              dragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">Upload or paste screenshot</h3>
              <p className="text-zinc-500 text-sm max-w-sm">
                Drag and drop your portfolio screenshot here, click to browse, or paste from your clipboard (Ctrl+V / Cmd+V).
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
