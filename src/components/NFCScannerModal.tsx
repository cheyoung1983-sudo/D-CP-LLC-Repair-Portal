import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  RefreshCw, 
  HelpCircle,
  Sparkles,
  Tag,
  Zap,
  Box
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface NFCScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (ticketNumber: string, meta?: { tagSource: string; binId?: string }) => void;
}

const PRESET_NFC_BINS = [
  { binId: 'BIN-104', label: 'Spokane Bench Bin 104', ticketNumber: 'DCP-8842', device: 'iPhone 15 Pro - Tier 3 Micro-soldering' },
  { binId: 'BIN-208', label: 'Spokane Bench Bin 208', ticketNumber: 'DCP-1904', device: 'MacBook Air M2 - Tier 2 Display' },
  { binId: 'BIN-312', label: 'Spokane Bench Bin 312', ticketNumber: 'DCP-7021', device: 'iPad Pro 11 - Tier 1 Port Refresh' },
];

export default function NFCScannerModal({ isOpen, onClose, onScanSuccess }: NFCScannerModalProps) {
  const { showToast } = useToast();
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');

  const ndefRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && nfcSupported) {
      startNfcScan();
    }
    return () => {
      stopNfcScan();
    };
  }, [isOpen, nfcSupported]);

  const startNfcScan = async () => {
    setNfcError(null);
    setIsScanning(true);
    try {
      const NDEFReaderClass = (window as any).NDEFReader;
      if (!NDEFReaderClass) return;

      const ndef = new NDEFReaderClass();
      ndefRef.current = ndef;
      await ndef.scan();

      ndef.addEventListener('readingerror', () => {
        setNfcError('Cannot read NFC tag data. Please tap bin tag again.');
        showToast('NFC tag read error.', 'error');
      });

      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        let textFound = '';
        if (message && message.records) {
          for (const record of message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              textFound = textDecoder.decode(record.data);
            } else if (record.data) {
              const textDecoder = new TextDecoder();
              textFound = textDecoder.decode(record.data);
            }
          }
        }

        // Clean up text
        const cleaned = (textFound || serialNumber || '').trim().toUpperCase();
        // Match ticket number like DCP-XXXX or plain string
        let ticketMatch = cleaned;
        const match = cleaned.match(/DCP-\d+/i);
        if (match) {
          ticketMatch = match[0].toUpperCase();
        }

        setScannedData(`Serial: ${serialNumber || 'NFC-TAG'} | Data: ${cleaned}`);
        showToast(`NFC Bin Tag Read: ${ticketMatch}`, 'success');
        onScanSuccess(ticketMatch, { tagSource: 'Web NFC Hardware Tap', binId: serialNumber ? `TAG-${serialNumber}` : 'NFC-TAG' });
        onClose();
      });
    } catch (err: any) {
      console.warn('NFC scanning error or permission denied:', err);
      if (err.name === 'NotAllowedError') {
        setNfcError('NFC permission was denied by browser.');
      } else {
        setNfcError('NFC scan hardware unavailable or blocked on this device.');
      }
      setIsScanning(false);
    }
  };

  const stopNfcScan = () => {
    setIsScanning(false);
    ndefRef.current = null;
  };

  const handleSimulateBinScan = (bin: typeof PRESET_NFC_BINS[0]) => {
    setScannedData(`Bin Tag ${bin.binId} -> ${bin.ticketNumber}`);
    showToast(`Simulated NFC Bin Tap: ${bin.binId} (${bin.ticketNumber})`, 'success');
    onScanSuccess(bin.ticketNumber, { tagSource: bin.label, binId: bin.binId });
    onClose();
  };

  const handleCustomTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    const ticket = customTagInput.trim().toUpperCase();
    onScanSuccess(ticket, { tagSource: 'Manual NFC Tag Payload', binId: 'CUSTOM-NFC' });
    showToast(`NFC Custom Tag Loaded: ${ticket}`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Web NFC Bench Scanner
              </span>
              <span className={`text-[10px] font-mono ${nfcSupported ? 'text-emerald-400' : 'text-amber-400'}`}>
                {nfcSupported ? 'Web NFC Ready' : 'Simulated Terminal'}
              </span>
            </div>
            <h3 className="text-xl font-playfair font-black text-white mt-0.5">
              Repair Bin NFC Reader
            </h3>
          </div>
        </div>

        {/* Main NFC Scanner Animation / Status */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-indigo-500/30 text-center space-y-4 relative">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Animated Pulsing Rings */}
            <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-75" />
            <span className="absolute inset-2 rounded-full bg-indigo-500/30 animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center relative z-10 shadow-lg shadow-indigo-600/50">
              <Radio className="w-8 h-8" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">
              {isScanning ? 'Hold NFC Bin Tag Against Reader' : 'NFC Bin Reader Active'}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              {nfcSupported 
                ? 'Touch an NFC sticker or repair bin badge to your mobile device or WebNFC terminal for instant ticket lookup.' 
                : 'Web NFC API is inactive or unsupported on this browser. Select a simulated bin badge below to trigger instant ticket retrieval.'}
            </p>
          </div>

          {nfcError && (
            <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{nfcError}</span>
            </div>
          )}
        </div>

        {/* Simulated Bin Tag Quick Taps */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-indigo-400" /> Spokane Bench NFC Bin Badges (Quick Test)
          </span>

          <div className="space-y-2">
            {PRESET_NFC_BINS.map((bin) => (
              <button
                key={bin.binId}
                onClick={() => handleSimulateBinScan(bin)}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/80 rounded-2xl text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{bin.binId}</span>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded font-bold">
                        {bin.ticketNumber}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                      {bin.device}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  Tap Bin →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Input Fallback */}
        <form onSubmit={handleCustomTagSubmit} className="pt-2 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            placeholder="Or type NFC tag payload (e.g. DCP-8842)"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-md"
          >
            Load Tag
          </button>
        </form>
      </motion.div>
    </div>
  );
}
