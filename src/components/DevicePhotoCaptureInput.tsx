import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Trash2,
  Maximize2,
  Tag,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CapturedPhoto } from '../types.ts';
import { useToast } from './Toast.tsx';

interface DevicePhotoCaptureInputProps {
  photos: CapturedPhoto[];
  onChange: (photos: CapturedPhoto[]) => void;
  label?: string;
  description?: string;
}

const PHOTO_CATEGORIES = [
  'Front Screen / Display',
  'Back Glass & Housing',
  'Camera & Lens Assembly',
  'Charging Port / Pins',
  'Serial Number / IMEI Label',
  'Liquid Damage Indicator',
];

export default function DevicePhotoCaptureInput({
  photos,
  onChange,
  label = 'Attach Device Damage & Condition Photos',
  description = 'Snap a live photo using your phone/laptop camera or upload images for visual damage verification.',
}: DevicePhotoCaptureInputProps) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>(PHOTO_CATEGORIES[0]);
  const [photoNote, setPhotoNote] = useState<string>('');
  const [activePreview, setActivePreview] = useState<CapturedPhoto | null>(null);
  
  // Camera live stream modal state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger HTML5 Native Camera via capture="environment"
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
    e.target.value = '';
  };

  // Trigger Standard File Browser Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
    e.target.value = '';
  };

  // Helper to convert files into CapturedPhoto objects
  const processFiles = (fileList: File[]) => {
    const newPhotos: CapturedPhoto[] = [];
    let processedCount = 0;

    fileList.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast(`Skipped "${file.name}" because it is not an image file.`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const photoObj: CapturedPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            dataUrl,
            category: selectedCategory,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            notes: photoNote.trim() || undefined,
          };
          newPhotos.push(photoObj);
        }

        processedCount++;
        if (processedCount === fileList.length && newPhotos.length > 0) {
          onChange([...photos, ...newPhotos]);
          setPhotoNote('');
          showToast(`Attached ${newPhotos.length} photo(s) under "${selectedCategory}".`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Start WebRTC Camera for live streaming viewfinder
  const startLiveCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.warn('WebRTC Camera error, falling back to native input:', err);
      setCameraError('Direct stream blocked. Opening native camera file selector...');
      // Fallback: trigger native camera input
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const snapLivePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}`,
      dataUrl,
      category: selectedCategory,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: photoNote.trim() || undefined,
    };

    onChange([...photos, newPhoto]);
    setPhotoNote('');
    stopLiveCamera();
    showToast(`Snapped and attached photo under "${selectedCategory}".`, 'success');
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
    showToast('Photo removed from intake form.', 'info');
  };

  return (
    <div className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Hidden File Inputs */}
      {/* 1. Native Camera Capture Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeCameraCapture}
        className="hidden"
      />
      {/* 2. File Browser Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Camera className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {label}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        {photos.length > 0 && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {photos.length} Photo(s) Attached
          </span>
        )}
      </div>

      {/* Category Tagging & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-blue-600" /> Tag Photo Area
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-900"
          >
            {PHOTO_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Optional Damage Note
          </label>
          <input
            type="text"
            value={photoNote}
            onChange={(e) => setPhotoNote(e.target.value)}
            placeholder="e.g. Deep crack on top right edge"
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* Primary Action Buttons (File-input style trigger & Camera Snap) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Direct Camera Button */}
        <button
          type="button"
          onClick={() => {
            if ('mediaDevices' in navigator) {
              startLiveCamera();
            } else {
              cameraInputRef.current?.click();
            }
          }}
          className="flex items-center justify-center gap-2.5 p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Snap Photo with Camera</span>
        </button>

        {/* Upload File Input Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2.5 p-3.5 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
        >
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Browse & Attach Photo Files</span>
        </button>
      </div>

      {/* Live Stream Camera Viewfinder Modal / Inline */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-xl aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Target Alignment Overlay */}
          <div className="absolute inset-4 border-2 border-dashed border-amber-400/60 rounded-xl pointer-events-none flex items-center justify-center">
            <span className="bg-slate-900/80 text-amber-300 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-amber-400/30">
              Center damage area: {selectedCategory}
            </span>
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
            <button
              type="button"
              onClick={stopLiveCamera}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={snapLivePhoto}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full font-black text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all ring-4 ring-amber-400/20"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Photo</span>
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Attached Photo Thumbnails */}
      {photos.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Attached Condition Photos ({photos.length})
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm hover:border-blue-400 transition-all flex flex-col"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                  <img
                    src={photo.dataUrl}
                    alt={`Attached device photo - ${photo.category}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%3C%231e293b'/%3E%3Ctext x='75' y='75' fill='%3C%2394a3b8' text-anchor='middle' font-family='sans-serif' font-size='10'%3EPhoto%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActivePreview(photo)}
                      className="p-1.5 bg-white text-slate-800 rounded-full hover:scale-110 transition-transform shadow-md"
                      title="Enlarge Photo"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="p-1.5 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-md"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="px-1 min-w-0">
                  <span className="font-bold text-[10px] text-slate-800 truncate block">
                    {photo.category}
                  </span>
                  {photo.notes && (
                    <span className="text-[9px] text-slate-500 truncate block" title={photo.notes}>
                      "{photo.notes}"
                    </span>
                  )}
                  <span className="text-[8px] font-mono text-slate-400 block">{photo.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enlarge Preview Modal */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{activePreview.category}</h4>
                  <span className="text-xs font-mono text-slate-400">Captured {activePreview.timestamp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePreview(null)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden bg-slate-950 max-h-[60vh] flex items-center justify-center">
                <img
                  src={activePreview.dataUrl}
                  alt={activePreview.category}
                  className="max-h-[60vh] w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {activePreview.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <span className="font-bold">Technician Note:</span> "{activePreview.notes}"
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
