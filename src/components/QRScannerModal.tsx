import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertTriangle, FileImage, QrCode, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScannedResult(null);
      setScannerError(null);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setScannerError(null);
      setIsScanning(true);

      try {
        const html5Qrcode = new Html5Qrcode('qr-reader-element');
        scannerRef.current = html5Qrcode;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        };

        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            setScannedResult(decodedText);
            // Play a subtle success vibration if supported
            if (navigator.vibrate) navigator.vibrate(100);
            
            // Extract ticket ID if the QR text is a URL or JSON or plain text
            let ticketId = decodedText.trim();
            if (ticketId.includes('ticket=')) {
              const urlParams = new URLSearchParams(ticketId.split('?')[1]);
              ticketId = urlParams.get('ticket') || ticketId;
            } else if (ticketId.startsWith('{')) {
              try {
                const parsed = JSON.parse(ticketId);
                ticketId = parsed.ticketNumber || parsed.id || ticketId;
              } catch (e) {
                // fall back to raw string
              }
            }

            setTimeout(() => {
              stopScanner();
              onScanSuccess(ticketId);
              onClose();
            }, 800);
          },
          (_errorMessage) => {
            // Transient frame decode failure, ignore
          }
        );
      } catch (err: any) {
        console.warn('Camera scan initialization error:', err);
        if (isMounted) {
          setIsScanning(false);
          if (err?.name === 'NotAllowedError' || String(err).includes('Permission')) {
            setScannerError('Camera access was denied. Please allow camera permissions in your browser or try selecting a sample slip.');
          } else {
            setScannerError('Unable to access camera or camera feed unavailable in preview frame. You can use sample test codes or upload a ticket QR image below.');
          }
        }
      }
    };

    // Small delay to ensure modal DOM element exists
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.log('Stop scanner info:', e));
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5Qrcode = new Html5Qrcode('qr-reader-element');
      const decodedText = await html5Qrcode.scanFile(file, true);
      
      let ticketId = decodedText.trim();
      if (ticketId.includes('ticket=')) {
        const urlParams = new URLSearchParams(ticketId.split('?')[1]);
        ticketId = urlParams.get('ticket') || ticketId;
      }

      setScannedResult(ticketId);
      setTimeout(() => {
        onScanSuccess(ticketId);
        onClose();
      }, 600);
    } catch (err) {
      setScannerError('Could not read a valid QR code from the uploaded image.');
    }
  };

  const simulateScan = (sampleTicket: string) => {
    setScannedResult(sampleTicket);
    setTimeout(() => {
      onScanSuccess(sampleTicket);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-lg w-full p-6 md:p-8 space-y-6 overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-playfair font-black text-xl text-slate-900">Scan Repair Slip QR</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">D&CP Spokane Optical Scanner</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Box */}
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden min-h-[280px] flex items-center justify-center border-2 border-slate-800">
          <div id="qr-reader-element" className="w-full h-full [&_video]:object-cover [&_video]:rounded-2xl" />

          {/* Target Reticle Overlay */}
          {isScanning && !scannedResult && !scannerError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-blue-500 rounded-2xl relative animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1 rounded-br-lg" />
                
                {/* Laser scanning bar */}
                <div className="w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] absolute top-0 animate-[ping_2s_infinite]" />
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <h4 className="text-lg font-bold text-white">Ticket Identified!</h4>
              <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 font-mono font-bold rounded-xl border border-emerald-500/30 text-sm">
                {scannedResult}
              </span>
            </div>
          )}

          {/* Camera Error / Permission Fallback */}
          {scannerError && (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                {scannerError}
              </p>
            </div>
          )}
        </div>

        {/* Alternative Actions / Testing Slips */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Instant Test Slips (Click to Simulate)
            </span>
            <label className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
              <FileImage className="w-3.5 h-3.5" />
              Upload QR Image
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'DCP-8842', label: 'iPhone 15' },
              { id: 'DCP-9012', label: 'Galaxy S24' },
              { id: 'DCP-3109', label: 'iPad Pro' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => simulateScan(item.id)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-900 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600">{item.id}</span>
                  <QrCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900" />
                </div>
                <span className="text-[10px] font-medium text-slate-400 block mt-0.5">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium">
            Align your D&CP Spokane Intake Slip QR code within the frame for instant telemetry retrieval.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
