import React, { useState, useEffect, useRef } from 'react';
import { Image, Upload, Trash2, X, Plus, Sparkles, ZoomIn } from 'lucide-react';

interface PhotoItem {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = 'photo_album_items_v2';

export function App() {
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch {
      // ignore quota
    }
  }, [photos]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const newPhoto: PhotoItem = {
            id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url: result,
            name: file.name.replace(/\.[^/.]+$/, ''),
            createdAt: new Date().toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          };
          setPhotos((prev) => [newPhoto, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (activePhoto?.id === id) {
      setActivePhoto(null);
    }
  };

  const handleLoadSample = () => {
    const samples: PhotoItem[] = [
      {
        id: 'sample-1',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        name: 'Alpine Lake & Peaks',
        createdAt: 'Sep 11, 2026',
      },
      {
        id: 'sample-2',
        url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
        name: 'Rowboat on Lake',
        createdAt: 'Sep 10, 2026',
      },
      {
        id: 'sample-3',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        name: 'Spiral Staircase',
        createdAt: 'Sep 9, 2026',
      },
    ];
    setPhotos((prev) => [...samples, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">PhotoAlbum</h1>
              <p className="text-xs text-slate-400">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {photos.length === 0 && (
              <button
                id="btn-load-samples"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Samples</span>
              </button>
            )}

            <button
              id="btn-upload-photos"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Add Photos</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {photos.length === 0 ? (
          /* Empty / Upload Dropzone State */
          <div
            id="empty-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-8 border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-400 hover:bg-white/60 bg-white/40'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4 shadow-xs">
              <Upload className="w-7 h-7" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
              Your photo album is empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Drag and drop images here, or click to browse files from your device.
            </p>
            <div className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors">
              <Plus className="w-4 h-4" />
              <span>Select Images</span>
            </div>
          </div>
        ) : (
          /* Photo Grid */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  id={`photo-card-${photo.id}`}
                  onClick={() => setActivePhoto(photo)}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer aspect-4/3"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between" />

                  {/* Top actions */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`btn-delete-${photo.id}`}
                      onClick={(e) => handleDelete(photo.id, e)}
                      className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-600 text-white backdrop-blur transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom caption */}
                  <div className="absolute bottom-2.5 inset-x-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-end justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold truncate drop-shadow-sm">{photo.name}</p>
                      <p className="text-[11px] text-slate-300">{photo.createdAt}</p>
                    </div>
                    <span className="shrink-0 p-1 rounded-md bg-black/40 backdrop-blur text-slate-200">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          id="modal-lightbox-backdrop"
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[88vh] flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between text-white pb-3">
              <span className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
                {activePhoto.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="btn-delete-lightbox"
                  onClick={(e) => {
                    handleDelete(activePhoto.id, e);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  id="btn-close-lightbox"
                  onClick={() => setActivePhoto(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <img
              src={activePhoto.url}
              alt={activePhoto.name}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            <div className="mt-3 text-xs text-slate-400 text-center">
              Added on {activePhoto.createdAt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
