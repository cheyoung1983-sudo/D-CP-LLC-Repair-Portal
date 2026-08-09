import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  RotateCw, 
  Image as ImageIcon, 
  Trash2, 
  Tag, 
  Maximize2,
  Sparkles
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  category: string;
  notes: string;
  timestamp: string;
}

interface DeviceCameraCaptureProps {
  photos: CapturedPhoto[];
  onChange: (photos: CapturedPhoto[]) => void;
}

const CATEGORIES = [
  'Front Glass / Screen',
  'Back Cover / Housing',
  'Charge Port / Bezels',
  'Display / Artifact Defect',
  'IMEI / Serial Label'
];

export default function DeviceCameraCapture({ photos, onChange }: DeviceCameraCaptureProps) {
  const { showToast } = useToast();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [photoNote, setPhotoNote] = useState('');
  const [activePhotoPreview, setActivePhotoPreview] = useState<CapturedPhoto | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      showToast('Camera active. Position damaged device in frame.', 'info');
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable or blocked. You can upload photos using the file browser below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}`,
      dataUrl,
      category: selectedCategory,
      notes: photoNote.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onChange([...photos, newPhoto]);
    setPhotoNote('');
    showToast(`Captured photo under "${selectedCategory}"`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: CapturedPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            dataUrl: event.target.result as string,
            category: selectedCategory,
            notes: photoNote.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          onChange([...photos, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
    setPhotoNote('');
    showToast(`${files.length} device photo(s) added.`, 'success');
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
    showToast('Photo removed from intake record.', 'info');
  };

  return (
    <div className="space-y-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-mono text-[10px] font-black uppercase">
              Condition Documentation
            </span>
            <span className="text-xs text-slate-500 font-medium">{photos.length} Photo(s) Attached</span>
          </div>
          <h4 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Device Photo Intake Capture
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {!isCameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Lab Camera</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Category & Notes Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" /> Photo Category Tag
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Condition Note (Optional)
          </label>
          <input
            type="text"
            value={photoNote}
            onChange={(e) => setPhotoNote(e.target.value)}
            placeholder="e.g., Deep gouge on top right corner, missing SIM tray"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Camera Live Viewfinder or Upload Area */}
      {isCameraActive ? (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-xl max-w-2xl mx-auto aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Overlay Frame */}
          <div className="absolute inset-6 border-2 border-dashed border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
            <span className="bg-slate-900/80 text-white text-[10px] font-mono px-3 py-1 rounded-full border border-white/20">
              Align device inside frame ({selectedCategory})
            </span>
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-slate-900/80 px-2.5 py-1 rounded-full">
              LIVE STREAM ACTIVE
            </span>
            <button
              type="button"
              onClick={capturePhoto}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all ring-4 ring-blue-500/30"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Photo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-white space-y-3 hover:border-blue-400 transition-all">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Upload photos or drag & drop files here
            </p>
            <p className="text-[11px] text-slate-500">
              PNG, JPG, HEIC up to 10MB each
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Select Image Files</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {cameraError && (
        <p className="text-xs font-medium text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
          {cameraError}
        </p>
      )}

      {/* Captured Photos Gallery */}
      {photos.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Attached Device Condition Photos ({photos.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-white border border-slate-200 rounded-2xl p-2 space-y-2 shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={photo.dataUrl}
                    alt={photo.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePhotoPreview(photo)}
                      className="p-2 bg-white/90 rounded-xl text-slate-900 hover:bg-white transition-all"
                      title="Enlarge photo"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block truncate">
                    {photo.category}
                  </span>
                  {photo.notes ? (
                    <p className="text-[11px] text-slate-600 truncate font-medium" title={photo.notes}>
                      "{photo.notes}"
                    </p>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic block">No notes added</span>
                  )}
                  <span className="text-[9px] text-slate-400 block font-mono">{photo.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {activePhotoPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 relative shadow-2xl">
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-black uppercase rounded-full">
                {activePhotoPreview.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">{activePhotoPreview.timestamp}</span>
            </div>
            <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center">
              <img
                src={activePhotoPreview.dataUrl}
                alt="Enlarged intake condition"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>
            {activePhotoPreview.notes && (
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 italic font-medium">
                Note: "{activePhotoPreview.notes}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
