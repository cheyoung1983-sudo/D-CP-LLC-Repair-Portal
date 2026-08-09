import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  FileCheck, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Send,
  FileText
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface WarrantyTrackerCardProps {
  ticketNumber: string;
  customerName: string;
  deviceModel: string;
  serviceTier: string;
  completionDateStr?: string;
}

export default function WarrantyTrackerCard({
  ticketNumber,
  customerName,
  deviceModel,
  serviceTier,
  completionDateStr = '2026-06-15'
}: WarrantyTrackerCardProps) {
  const { showToast } = useToast();
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimReason, setClaimReason] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Compute dates and remaining days
  const startDate = new Date(completionDateStr);
  const isValidDate = !isNaN(startDate.getTime());
  const effectiveStartDate = isValidDate ? startDate : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Warranty period is 365 days (1 Year) for OEM repairs, 180 days for Tier 1
  const warrantyDays = serviceTier.includes('Tier 1') ? 180 : 365;
  const expiryDate = new Date(effectiveStartDate.getTime() + warrantyDays * 24 * 60 * 60 * 1000);
  
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.min(warrantyDays, warrantyDays - daysRemaining);
  const percentRemaining = Math.round((daysRemaining / warrantyDays) * 100);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimReason.trim()) {
      showToast('Please specify the warranty issue experienced.', 'error');
      return;
    }
    const claimId = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    setClaimSubmitted(claimId);
    showToast(`Warranty claim #${claimId} submitted to Spokane Lab Review!`, 'success');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 border border-slate-700/60 relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Active Spokane Warranty
              </span>
              <span className="text-xs text-slate-400 font-mono">RCW 19.415 Protected</span>
            </div>
            <h3 className="text-2xl font-playfair font-black text-white mt-0.5">
              Warranty Protection Lifecycle
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCertificate(!showCertificate)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>{showCertificate ? 'Hide Certificate' : 'Warranty Certificate'}</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Completion Date</span>
          <span className="text-base font-black text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            {effectiveStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Expiration Date</span>
          <span className="text-base font-black text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Coverage Period</span>
          <span className="text-base font-black text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            {warrantyDays} Days Lifetime
          </span>
        </div>

        <div className="bg-emerald-950/50 border border-emerald-500/30 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">Remaining Status</span>
          <span className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {daysRemaining} Days Left ({percentRemaining}%)
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2 relative z-10 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between text-xs font-bold text-slate-300">
          <span>Warranty Start ({daysElapsed} days elapsed)</span>
          <span className="text-emerald-400">{daysRemaining} Days Guarantee Remaining</span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentRemaining}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          />
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          Covers OEM-grade component failure, micro-soldering connection integrity, and touch/display assembly defects. Accidental liquid or drop damage is excluded under Spokane Lab Terms.
        </p>
      </div>

      {/* Certificate Modal View */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white text-slate-900 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl relative z-10 border-2 border-slate-200"
          >
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md font-mono text-[10px] font-black uppercase">
                    Official Spokane Certificate
                  </span>
                  <span className="text-xs font-mono text-slate-500">Ref: {ticketNumber}</span>
                </div>
                <h4 className="text-2xl font-playfair font-black text-slate-900 mt-1">
                  Certificate of Hardware Guarantee
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">D&CP Lab Seal</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-4 h-4" /> VERIFIED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Name</span>
                <span className="text-slate-900 font-bold">{customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Device Unit</span>
                <span className="text-slate-900 font-bold">{deviceModel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Tier</span>
                <span className="text-slate-900 font-bold">{serviceTier}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lab Inspector</span>
                <span className="text-slate-900 font-bold">Bench Lead (Spokane HQ)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed font-mono">
              D&CP LLC warrants that all hardware components replaced under ticket #{ticketNumber} meet or exceed OEM specifications. In accordance with Washington State Right-to-Repair laws (RCW 19.415), this repair carries a {warrantyDays}-day non-prorated replacement guarantee against manufacturing or workmanship defects.
            </div>

            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-slate-400 italic">Issued by D&CP Spokane Engineering Lab, 115 S Adams St, WA</span>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim Submission Section */}
      <div className="pt-2 border-t border-slate-800 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {claimSubmitted ? (
          <div className="w-full bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p>Warranty Claim Received (#{claimSubmitted})</p>
              <p className="text-[11px] font-normal text-emerald-200/80">Spokane Lab lead technicians will review your request and contact you within 2 hours.</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              Experiencing hardware abnormalities? Submit an instant bench review under your active warranty.
            </p>
            <button
              onClick={() => setShowClaimForm(!showClaimForm)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-emerald-500/20"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{showClaimForm ? 'Cancel Claim' : 'File Warranty Claim'}</span>
            </button>
          </>
        )}
      </div>

      {/* Expandable Claim Form */}
      <AnimatePresence>
        {showClaimForm && !claimSubmitted && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleClaimSubmit}
            className="space-y-4 pt-4 relative z-10 bg-slate-800/80 p-5 rounded-2xl border border-slate-700"
          >
            <span className="text-xs font-bold text-white block uppercase tracking-wider">
              File Warranty Claim Form
            </span>
            <textarea
              rows={3}
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              placeholder="Describe the issue observed (e.g. Touch response glitch on lower right display quadrant, charge port intermittent)"
              className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClaimForm(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Claim</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
