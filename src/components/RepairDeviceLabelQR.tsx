import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  Building2,
  Box,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Maximize2,
  ShieldCheck,
  Check,
  Smartphone,
  Tag,
  Share2,
  Camera,
  FileText
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface RepairDeviceLabelQRProps {
  ticketNumber: string;
  customerName?: string;
  deviceModel?: string;
  serviceTier?: string;
  assignedBin?: string;
  createdDate?: string;
  onKioskCheckInSuccess?: (checkInTimestamp: string, assignedBin: string) => void;
}

export default function RepairDeviceLabelQR({
  ticketNumber,
  customerName = 'Valued Client',
  deviceModel = 'iPhone 15 Pro Max',
  serviceTier = 'Tier 3 (Board Rework)',
  assignedBin = 'ESD-VAULT-B14',
  createdDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  onKioskCheckInSuccess
}: RepairDeviceLabelQRProps) {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isCheckInDone, setIsCheckInDone] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [activeBin, setActiveBin] = useState<string>(assignedBin);
  const [isKioskModalOpen, setIsKioskModalOpen] = useState<boolean>(false);
  const [kioskSimulating, setKioskSimulating] = useState<boolean>(false);

  // Check-in payload string
  const checkInPayload = JSON.stringify({
    ticket: ticketNumber,
    lab: 'Spokane Bench HQ',
    device: deviceModel,
    client: customerName,
    bin: activeBin,
    timestamp: new Date().toISOString()
  });

  const checkInUrl = `${window.location.origin}/status?ticket=${ticketNumber}&checkin=true`;

  useEffect(() => {
    generateQRCode();
  }, [ticketNumber, activeBin]);

  const generateQRCode = async () => {
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, checkInUrl, {
          width: 220,
          margin: 1,
          color: {
            dark: '#0f172a', // slate-900
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        });
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setQrDataUrl(dataUrl);
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    showToast('Lab Check-In link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `SpokaneLab-QR-${ticketNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded QR label for #${ticketNumber}`, 'success');
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups to print the label.', 'error');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spokane Lab Device Label - #${ticketNumber}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20px;
              color: #0f172a;
              background: #fff;
            }
            .label-card {
              width: 380px;
              border: 2px solid #0f172a;
              border-radius: 12px;
              padding: 16px;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .logo { font-weight: 900; font-size: 14px; letter-spacing: 1px; }
            .ticket { font-weight: 900; font-size: 18px; color: #2563eb; }
            .content { display: flex; gap: 12px; align-items: center; }
            .qr-img { width: 110px; height: 110px; }
            .details { font-size: 11px; line-height: 1.5; }
            .details font-bold { font-weight: 700; }
            .bin-pill {
              background: #0f172a;
              color: #fff;
              padding: 3px 8px;
              border-radius: 6px;
              font-size: 10px;
              font-family: monospace;
              display: inline-block;
              margin-top: 4px;
            }
            .footer {
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1px dashed #cbd5e1;
              font-size: 9px;
              text-align: center;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">
              <div class="logo">D&CP SPOKANE LAB</div>
              <div class="ticket">#${ticketNumber}</div>
            </div>
            <div class="content">
              <img src="${qrDataUrl}" class="qr-img" />
              <div class="details">
                <div><strong>Client:</strong> ${customerName}</div>
                <div><strong>Device:</strong> ${deviceModel}</div>
                <div><strong>Tier:</strong> ${serviceTier}</div>
                <div><strong>Date:</strong> ${createdDate}</div>
                <div class="bin-pill">STORAGE BIN: ${activeBin}</div>
              </div>
            </div>
            <div class="footer">
              SCAN AT SPOKANE PHYSICAL LAB KIOSK FOR EXPRESS CHECK-IN
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSimulateLabKioskCheckIn = () => {
    setKioskSimulating(true);
    setTimeout(() => {
      const nowFormatted = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCheckInTime(nowFormatted);
      setIsCheckInDone(true);
      setKioskSimulating(false);
      setIsKioskModalOpen(false);

      if (onKioskCheckInSuccess) {
        onKioskCheckInSuccess(nowFormatted, activeBin);
      }

      showToast(`Device #${ticketNumber} checked in at Spokane Lab Kiosk! Assigned to ${activeBin}.`, 'success');
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded-full uppercase font-mono">
                LAB PASS & DEVICE TAG
              </span>
              <span className="text-xs text-slate-400 font-mono">Unique Lab Check-In ID</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Self Check-In QR Code & Physical Bench Label
            </h3>
          </div>
        </div>

        {/* Check-In Status Indicator Badge */}
        {isCheckInDone ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl shrink-0 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider block leading-none">
                LAB KIOSK CHECKED IN
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-800">
                At {checkInTime} ({activeBin})
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsKioskModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Building2 className="w-4 h-4" />
            <span>Kiosk Self Check-In</span>
          </button>
        )}
      </div>

      {/* Main Physical Label Box */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-5 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* QR Canvas Box */}
          <div className="bg-white p-3 rounded-2xl shadow-2xl border-2 border-slate-200 shrink-0 flex flex-col items-center">
            <canvas ref={canvasRef} className="rounded-lg w-44 h-44" />
            <span className="text-[10px] font-mono font-bold text-slate-500 mt-1">
              SCAN AT SPOKANE BENCH
            </span>
          </div>

          {/* Ticket Information Breakdown */}
          <div className="space-y-3.5 flex-1 w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
                  Repair Ticket Number
                </span>
                <h4 className="text-2xl font-black font-mono text-white tracking-tight">
                  #{ticketNumber}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Assigned Vault Storage Bin
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-mono font-bold text-xs rounded-lg border border-blue-500/30 inline-block mt-0.5">
                  {activeBin}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Client Name
                </span>
                <span className="font-bold text-white text-sm">{customerName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Device Hardware
                </span>
                <span className="font-bold text-white text-sm">{deviceModel}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Service Tier
                </span>
                <span className="font-bold text-slate-200">{serviceTier}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Location Kiosk
                </span>
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  Spokane Lab HQ
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Present this digital pass or printed tag at the 24/7 Spokane Physical Lab drop-off kiosk to unlock secure storage bin <strong className="text-white font-mono">{activeBin}</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintLabel}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print Bench Label</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQR}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PNG</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? 'Link Copied!' : 'Copy Check-In Link'}</span>
          </button>
        </div>
      </div>

      {/* Lab Kiosk Simulation Modal */}
      <AnimatePresence>
        {isKioskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 text-slate-900"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded-full uppercase">
                    <Building2 className="w-3 h-3" />
                    SPOKANE PHYSICAL LAB KIOSK
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Scan & Check-In Device</h3>
                </div>
                <button
                  onClick={() => setIsKioskModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  &times;
                </button>
              </div>

              {/* Kiosk Scan Visual Box */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-4 border border-slate-800 relative overflow-hidden">
                <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                  <Camera className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Scanner Active</h4>
                  <p className="text-xs text-slate-400">
                    Align your digital ticket QR code or printed bench tag under the kiosk scanner.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-1">
                  <div className="text-slate-400 text-[10px]">TARGET TICKET PAYLOAD:</div>
                  <div className="text-blue-300 font-bold">#{ticketNumber}</div>
                  <div className="text-slate-300 text-[11px]">{deviceModel} ({customerName})</div>
                  <div className="text-emerald-400 text-[11px]">DESTINATION: {activeBin}</div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={kioskSimulating}
                  onClick={handleSimulateLabKioskCheckIn}
                  className="w-full py-3.5 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {kioskSimulating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying QR & Unlocking {activeBin}...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Simulate Kiosk QR Scan & Check-In</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsKioskModalOpen(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
