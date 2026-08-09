import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast.tsx';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  RotateCw, 
  Smartphone, 
  Cpu, 
  Activity, 
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  FileText,
  QrCode,
  Camera,
  Radio
} from 'lucide-react';
import QRScannerModal from './QRScannerModal.tsx';
import NFCScannerModal from './NFCScannerModal.tsx';
import WarrantyTrackerCard from './WarrantyTrackerCard.tsx';
import RepairTimeEstimator from './RepairTimeEstimator.tsx';

interface TelemetrySummary {
  batteryHealthPercentage: number;
  batteryTempCelsius: number;
  ammeterDrawAmps: number;
  isShortToGround: boolean;
}

interface NfcScanLog {
  id: string;
  ticketNumber: string;
  timestamp: string;
  tagSource: string;
  binId?: string;
}

interface RepairTicket {
  ticketNumber: string;
  customerName: string;
  deviceModel: string;
  serviceTier: string;
  currentStage: number; // 1 to 5
  estimatedCompletionDate: string;
  technicianNotes: string;
  telemetrySummary: TelemetrySummary;
  lastUpdated: string;
}

const STAGES = [
  { id: 1, title: 'Intake & Logging', desc: 'Device received & serial verified at Spokane HQ' },
  { id: 2, title: 'Telemetry Triage', desc: 'DC rail analysis & thermal sensor readings' },
  { id: 3, title: 'Active Restoration', desc: 'Precision micro-soldering & component replacement' },
  { id: 4, title: 'Quality Assurance', desc: '45°C thermal lockout & touch grid stress test' },
  { id: 5, title: 'Ready for Dispatch', desc: 'Final QA sign-off & customer pick-up notification' },
];

export default function RepairStatusTracker() {
  const { showToast } = useToast();
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<RepairTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentRepairs, setRecentRepairs] = useState<any[]>([]);
  const [nfcScanHistory, setNfcScanHistory] = useState<NfcScanLog[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNfcOpen, setIsNfcOpen] = useState(false);

  useEffect(() => {
    // Load local history if available
    const saved = localStorage.getItem('dcp_repairs');
    if (saved) {
      try {
        setRecentRepairs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local repairs:', e);
      }
    }

    // Load persisted Web NFC scan history
    const savedNfc = localStorage.getItem('dcp_nfc_scan_history');
    if (savedNfc) {
      try {
        setNfcScanHistory(JSON.parse(savedNfc));
      } catch (e) {
        console.error('Failed to parse NFC scan history:', e);
      }
    } else {
      // Seed default sample NFC bin scans if empty
      const initialNfc: NfcScanLog[] = [
        { id: 'nfc_1', ticketNumber: 'DCP-8842', timestamp: '10:42 AM', tagSource: 'Spokane Bench Bin 104', binId: 'BIN-104' },
        { id: 'nfc_2', ticketNumber: 'DCP-1904', timestamp: '09:15 AM', tagSource: 'Spokane Bench Bin 208', binId: 'BIN-208' },
      ];
      setNfcScanHistory(initialNfc);
      localStorage.setItem('dcp_nfc_scan_history', JSON.stringify(initialNfc));
    }

    // Auto load first sample or default ticket
    fetchTicketStatus('DCP-8842');
  }, []);

  const recordNfcScan = (ticketNum: string, meta?: { tagSource: string; binId?: string }) => {
    const newScan: NfcScanLog = {
      id: `nfc_${Date.now()}`,
      ticketNumber: ticketNum,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tagSource: meta?.tagSource || 'Web NFC Hardware Tap',
      binId: meta?.binId
    };

    setNfcScanHistory((prev) => {
      // Remove duplicate if already recorded recently, then prepend
      const filtered = prev.filter(item => item.ticketNumber !== ticketNum);
      const updated = [newScan, ...filtered].slice(0, 10);
      localStorage.setItem('dcp_nfc_scan_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearNfcHistory = () => {
    setNfcScanHistory([]);
    localStorage.removeItem('dcp_nfc_scan_history');
    showToast('NFC scan history cleared from local storage.', 'info');
  };

  const fetchTicketStatus = async (ticketNum: string) => {
    if (!ticketNum.trim()) {
      setError('Please enter a valid Repair Ticket Number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/repair-status/${encodeURIComponent(ticketNum.trim())}`);
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicketData(data.ticket);
        setTicketInput(data.ticket.ticketNumber);
      } else {
        setError(data.error || 'Ticket not found in D&CP Spokane database.');
        setTicketData(null);
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Failed to connect to Laboratory Server. Please try again.');
      setTicketData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTicketStatus(ticketInput);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Activity className="w-3.5 h-3.5" />
          Live Telemetry Audit
        </div>
        <h2 className="text-4xl md:text-5xl font-playfair font-black text-slate-900 tracking-tight">
          Repair Status Tracker
        </h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Monitor your device's restoration lifecycle in real-time with direct feeds from D&CP Spokane Laboratory hardware sensors.
        </p>
      </div>

      {/* Ticket Lookup Controls */}
      <div className="max-w-2xl mx-auto space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-lg shadow-slate-200/50 rounded-2xl bg-white border-2 border-slate-100 p-2 focus-within:border-slate-900 transition-all gap-2">
          <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder="Enter Ticket ID (e.g., DCP-8842 or Draft Order ID)"
            className="w-full px-2 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none bg-transparent uppercase"
          />
          <button
            type="button"
            onClick={() => setIsNfcOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border border-indigo-200/60"
            title="Tap Web NFC Repair Bin Tag"
          >
            <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">NFC Bin Tag</span>
          </button>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border border-blue-200/60"
            title="Scan Repair Slip QR Code with Camera"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Scan QR Slip</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              'Query Ticket'
            )}
          </button>
        </form>

        {/* Quick Sample Tickets */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sample Tickets:</span>
          <div className="flex flex-wrap items-center gap-2">
            {['DCP-8842', 'DCP-9012', 'DCP-3109'].map((sample) => (
              <button
                key={sample}
                onClick={() => fetchTicketStatus(sample)}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-mono font-bold transition-all text-xs"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Persisted Web NFC Scan History List */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                    Web NFC Scan History
                  </h4>
                  <span className="px-2 py-0.5 bg-indigo-200/80 text-indigo-800 text-[10px] font-mono font-bold rounded-full">
                    {nfcScanHistory.length} Saved
                  </span>
                </div>
                <p className="text-[11px] text-indigo-600/80 font-medium">
                  Persisted NFC bin tag reads & hardware tap history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNfcOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Scan NFC Tag</span>
              </button>
              {nfcScanHistory.length > 0 && (
                <button
                  onClick={clearNfcHistory}
                  className="px-2.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-[11px] font-bold transition-all"
                  title="Clear NFC history log"
                >
                  Clear Log
                </button>
              )}
            </div>
          </div>

          {nfcScanHistory.length === 0 ? (
            <div className="text-center py-4 text-xs font-medium text-indigo-400">
              No recent Web NFC tags scanned. Tap 'Scan NFC Tag' to log bench bin tags.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {nfcScanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-white border border-indigo-100 hover:border-indigo-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs transition-all"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-indigo-950 truncate">
                        {scan.ticketNumber}
                      </span>
                      {scan.binId && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold border border-indigo-200/50 shrink-0">
                          {scan.binId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium truncate">
                      <span className="truncate">{scan.tagSource}</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-mono shrink-0">{scan.timestamp}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchTicketStatus(scan.ticketNumber)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-lg transition-all whitespace-nowrap shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent History from localStorage */}
        {recentRepairs.length > 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Your Recent Intakes ({recentRepairs.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {recentRepairs.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => fetchTicketStatus(item.draftOrderId || `DCP-${8800 + idx}`)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-900 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 transition-all"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{item.deviceModel || 'Submitted Intake'}</span>
                  <span className="text-[10px] text-slate-400">({item.draftOrderId ? item.draftOrderId.substring(0, 10) + '...' : `DCP-${8800 + idx}`})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Standalone AI Repair Time Estimator for Intake Calculation */}
      {!ticketData && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RepairTimeEstimator />
        </motion.div>
      )}

      {/* Ticket Details & Timeline */}
      {ticketData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Ticket Overview Banner */}
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {ticketData.serviceTier}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Updated {ticketData.lastUpdated}</span>
                </div>
                <h3 className="text-3xl font-playfair font-black text-white">
                  Ticket #{ticketData.ticketNumber}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchTicketStatus(ticketData.ticketNumber)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                  title="Refresh Status"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Device Unit</span>
                  <span className="font-bold text-white">{ticketData.deviceModel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                <User className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Client</span>
                  <span className="font-bold text-white">{ticketData.customerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                <Calendar className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estimated Completion</span>
                  <span className="font-bold text-white">{ticketData.estimatedCompletionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Stages */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Restoration Lifecycle Progress
              </h4>
              <motion.span 
                key={ticketData.currentStage}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase"
              >
                Stage {ticketData.currentStage} of 5
              </motion.span>
            </div>

            <div className="relative">
              {/* Connecting Bar with framer-motion transition */}
              <div className="hidden lg:block absolute top-6 left-12 right-12 h-1.5 bg-slate-100 rounded-full overflow-hidden -z-0">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((ticketData.currentStage - 1) / (STAGES.length - 1)) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
                {STAGES.map((s) => {
                  const isCompleted = s.id < ticketData.currentStage;
                  const isCurrent = s.id === ticketData.currentStage;
                  return (
                    <motion.div 
                      key={`${ticketData.ticketNumber}-${s.id}`}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: isCurrent ? 1.03 : 1
                      }}
                      transition={{ 
                        duration: 0.4, 
                        delay: s.id * 0.08,
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                      }}
                      className={`p-5 rounded-2xl border-2 transition-colors space-y-3 ${
                        isCurrent 
                          ? 'bg-blue-50/70 border-blue-600 shadow-lg shadow-blue-500/10 ring-2 ring-blue-600/20' 
                          : isCompleted 
                            ? 'bg-white border-slate-200 text-slate-800' 
                            : 'bg-slate-50 border-transparent text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <motion.div 
                          layout
                          animate={{
                            scale: isCurrent ? [1, 1.15, 1] : 1,
                            backgroundColor: isCurrent ? '#2563eb' : isCompleted ? '#10b981' : '#e2e8f0'
                          }}
                          transition={{ duration: 0.4 }}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                            !isCurrent && !isCompleted ? 'text-slate-500' : ''
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {isCompleted ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </motion.div>
                            ) : (
                              <motion.span
                                key="num"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                {s.id}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        {isCurrent && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="relative flex h-3 w-3"
                          >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                          </motion.span>
                        )}
                      </div>

                      <div>
                        <h5 className={`font-bold text-sm ${isCurrent ? 'text-blue-950' : 'text-slate-900'}`}>
                          {s.title}
                        </h5>
                        <p className="text-xs font-medium text-slate-500 mt-1 leading-snug">
                          {s.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Telemetry & Technician Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Telemetry Card */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Hardware Telemetry</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spokane Bench Readings</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Battery Health</span>
                  <span className="text-2xl font-black text-slate-900">
                    {ticketData.telemetrySummary.batteryHealthPercentage}%
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thermal Core</span>
                  <span className="text-2xl font-black text-slate-900">
                    {ticketData.telemetrySummary.batteryTempCelsius}°C
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DC Current Draw</span>
                  <span className="text-2xl font-black text-slate-900">
                    {ticketData.telemetrySummary.ammeterDrawAmps}A
                  </span>
                </div>

                <div className={`p-4 rounded-2xl space-y-1 ${
                  ticketData.telemetrySummary.isShortToGround 
                    ? 'bg-amber-50 text-amber-900 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Primary Rail Status</span>
                  <span className="text-sm font-black flex items-center gap-1 mt-1">
                    {ticketData.telemetrySummary.isShortToGround ? 'VDD Short Active' : 'Nominal Impedance'}
                  </span>
                </div>
              </div>
            </div>

            {/* Technician Notes Card */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Technician Log</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bench Lead Work Notes</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-5 rounded-2xl leading-relaxed italic border-l-4 border-slate-900">
                  "{ticketData.technicianNotes}"
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">WA RCW 19.415 Compliant Laboratory</span>
                <button className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                  Contact Lab Direct <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Repair Time Estimator Module */}
          <RepairTimeEstimator
            onApplyEstimate={(windowStr) => {
              if (ticketData) {
                setTicketData({
                  ...ticketData,
                  estimatedCompletionDate: windowStr
                });
              }
            }}
          />

          {/* Warranty Tracking Module */}
          <WarrantyTrackerCard
            ticketNumber={ticketData.ticketNumber}
            customerName={ticketData.customerName}
            deviceModel={ticketData.deviceModel}
            serviceTier={ticketData.serviceTier}
          />
        </motion.div>
      )}

      {/* Camera QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedText) => {
          showToast(`Repair Ticket Identified: ${scannedText}`, 'success');
          fetchTicketStatus(scannedText);
        }}
      />

      {/* Web NFC Bin Tag Scanner Modal */}
      <NFCScannerModal
        isOpen={isNfcOpen}
        onClose={() => setIsNfcOpen(false)}
        onScanSuccess={(nfcTicket, meta) => {
          showToast(`NFC Bin Tag Read: ${nfcTicket}`, 'success');
          recordNfcScan(nfcTicket, meta);
          fetchTicketStatus(nfcTicket);
        }}
      />
    </div>
  );
}
