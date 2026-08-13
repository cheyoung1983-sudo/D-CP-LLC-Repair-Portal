import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Gamepad2, 
  Sparkles, 
  FileText, 
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export type VerificationStatus = 'unchecked' | 'pass' | 'fail';

export interface CommonChecklistItem {
  id: string;
  title: string;
  instruction: string;
  status: VerificationStatus;
  note?: string;
}

export type DeviceCategory = 'mobile' | 'laptop' | 'tablet' | 'console';

interface CommonRepairChecklistProps {
  manufacturer?: string;
  model?: string;
  onApplyChecklistToNotes?: (notes: string) => void;
}

const CATEGORY_ITEMS: Record<DeviceCategory, Omit<CommonChecklistItem, 'status' | 'note'>[]> = {
  mobile: [
    { id: 'm1', title: 'Display & Touch Digitizer', instruction: 'Drag an app icon across all screen edges and corners to verify full touch grid response.' },
    { id: 'm2', title: 'Charging Port & Cable Fit', instruction: 'Plug in charging cable; check for loose wiggle, debris in port, or intermittent charging.' },
    { id: 'm3', title: 'Biometrics & Face ID / Touch ID', instruction: 'Confirm front sensors or fingerprint scanner react and unlock or register.' },
    { id: 'm4', title: 'Cameras & Flash LED', instruction: 'Open camera app; verify front/rear optical focus, 0.5x ultra-wide lens, and flash.' },
    { id: 'm5', title: 'Audio Speaker & Microphone', instruction: 'Record a quick voice memo or test speakerphone audio for crackling or low volume.' },
    { id: 'm6', title: 'Liquid Damage Indicator (LDI)', instruction: 'Inspect SIM tray slot or port for red/pink water contact indicator.' }
  ],
  laptop: [
    { id: 'l1', title: 'Display & Hinge Flex Test', instruction: 'Open/close display to various angles (30° - 150°); check for screen flickering or line distortion.' },
    { id: 'l2', title: 'Power Delivery / USB-C Charging', instruction: 'Plug charger into each port; verify charging indicator LED and battery charging status.' },
    { id: 'l3', title: 'Keyboard & Trackpad Responsiveness', instruction: 'Test spacebar, modifier keys, and trackpad click/haptic drag across entire surface.' },
    { id: 'l4', title: 'Thermal Fan & Noise Behavior', instruction: 'Listen for unusual fan grinding, immediate high-rpm fan maxing, or excessive heat.' },
    { id: 'l5', title: 'Wi-Fi & Peripheral Connections', instruction: 'Ensure wireless networks scan properly and USB/audio ports recognize external devices.' }
  ],
  tablet: [
    { id: 't1', title: 'Glass Corner & Frame Inspection', instruction: 'Inspect outer metal bezel for dented corners or frame bending that creates glass pressure.' },
    { id: 't2', title: 'Active Stylus / Pencil Touch Test', instruction: 'Draw continuous diagonal strokes across full screen with finger and stylus if available.' },
    { id: 't3', title: 'Battery Charge Rate & Heat', instruction: 'Connect charger and check if unit gets excessively warm around PMIC or battery.' },
    { id: 't4', title: 'Multi-Speaker Audio Array', instruction: 'Play audio sample; confirm sound outputs evenly from all speaker grilles.' }
  ],
  console: [
    { id: 'c1', title: 'HDMI Port & Pin Alignment', instruction: 'Inspect HDMI port pins for bent leads or loose internal jack connection.' },
    { id: 'c2', title: 'Power-On Rail & LED Behavior', instruction: 'Press power button; note LED color codes (e.g. blue light of death, red ring, instant off).' },
    { id: 'c3', title: 'Disc Drive / External Storage', instruction: 'Test disc insertion/eject mechanism or USB external storage recognition.' },
    { id: 'c4', title: 'Cooling & Fan Thermal Vents', instruction: 'Check intake vents for dust blockage and test thermal fan acoustics after 2 minutes.' }
  ]
};

export default function CommonRepairChecklist({
  manufacturer = '',
  model = '',
  onApplyChecklistToNotes
}: CommonRepairChecklistProps) {
  const { showToast } = useToast();
  const [category, setCategory] = useState<DeviceCategory>('mobile');
  const [items, setItems] = useState<CommonChecklistItem[]>([]);

  // Infer device category based on manufacturer and model string
  useEffect(() => {
    const text = `${manufacturer} ${model}`.toLowerCase();
    if (text.includes('macbook') || text.includes('laptop') || text.includes('thinkpad') || text.includes('dell') || text.includes('surface pro') || text.includes('hp')) {
      setCategory('laptop');
    } else if (text.includes('ipad') || text.includes('tablet') || text.includes('galaxy tab')) {
      setCategory('tablet');
    } else if (text.includes('playstation') || text.includes('xbox') || text.includes('switch') || text.includes('console') || text.includes('ps5')) {
      setCategory('console');
    } else {
      setCategory('mobile');
    }
  }, [manufacturer, model]);

  // Load items when category changes
  useEffect(() => {
    const raw = CATEGORY_ITEMS[category] || CATEGORY_ITEMS.mobile;
    setItems(raw.map(item => ({ ...item, status: 'unchecked', note: '' })));
  }, [category]);

  const setItemStatus = (id: string, status: VerificationStatus) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const updateItemNote = (id: string, note: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, note } : item));
  };

  const handleReset = () => {
    const raw = CATEGORY_ITEMS[category];
    setItems(raw.map(item => ({ ...item, status: 'unchecked', note: '' })));
    showToast('Checklist reset to default state.', 'info');
  };

  const passCount = items.filter(i => i.status === 'pass').length;
  const failCount = items.filter(i => i.status === 'fail').length;
  const totalCount = items.length;
  const checkedCount = passCount + failCount;
  const completionPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const generateSummaryText = (): string => {
    const categoryLabels: Record<DeviceCategory, string> = {
      mobile: 'Smartphone',
      laptop: 'Laptop / PC',
      tablet: 'Tablet',
      console: 'Gaming Console'
    };

    const header = `[Pre-Check Diagnostic Checklist (${categoryLabels[category]} - ${model || 'Generic'})]`;
    const passed = items.filter(i => i.status === 'pass').map(i => `• PASS: ${i.title}`);
    const failed = items.filter(i => i.status === 'fail').map(i => `• FAULT DETECTED: ${i.title}${i.note ? ` (${i.note})` : ''}`);
    const pending = items.filter(i => i.status === 'unchecked').map(i => `• UNTESTED: ${i.title}`);

    const parts = [header];
    if (failed.length > 0) {
      parts.push('FAULTS FOUND:');
      parts.push(...failed);
    }
    if (passed.length > 0) {
      parts.push('VERIFIED WORKING:');
      parts.push(...passed);
    }
    if (pending.length > 0) {
      parts.push('UNTESTED / PENDING:');
      parts.push(...pending);
    }

    return parts.join('\n');
  };

  const handleApplyToNotes = () => {
    if (checkedCount === 0) {
      showToast('Please check at least one diagnostic step before applying to issue notes.', 'error');
      return;
    }
    const summary = generateSummaryText();
    if (onApplyChecklistToNotes) {
      onApplyChecklistToNotes(summary);
      showToast('Common repair checklist notes merged into issue description!', 'success');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-mono text-[10px] font-black uppercase border border-blue-500/30">
              Guided Intake Assistant
            </span>
            <span className="text-xs font-bold text-slate-400">
              {checkedCount} of {totalCount} Items Checked ({completionPercent}%)
            </span>
          </div>
          <h4 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            Common Repair Pre-Check Checklist
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step physical and operational verification for {model ? model : 'selected device category'}.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'mobile', label: 'Smartphone', icon: Smartphone },
          { id: 'laptop', label: 'Laptop / PC', icon: Laptop },
          { id: 'tablet', label: 'Tablet / iPad', icon: Tablet },
          { id: 'console', label: 'Console / Board', icon: Gamepad2 }
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id as DeviceCategory)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Initial Data Verification</span>
          <span className={failCount > 0 ? 'text-amber-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
            {passCount} Pass • {failCount} Fault • {totalCount - checkedCount} Pending
          </span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-400"
            initial={{ width: '0%' }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {items.map(item => {
          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                item.status === 'pass'
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-slate-200'
                  : item.status === 'fail'
                  ? 'bg-rose-950/30 border-rose-800/60 text-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{item.title}</span>
                    {item.status === 'pass' && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        PASS
                      </span>
                    )}
                    {item.status === 'fail' && (
                      <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-md border border-rose-500/30">
                        FAULT DETECTED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.instruction}
                  </p>
                </div>

                {/* Verification Control Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setItemStatus(item.id, item.status === 'pass' ? 'unchecked' : 'pass')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      item.status === 'pass'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemStatus(item.id, item.status === 'fail' ? 'unchecked' : 'fail')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      item.status === 'fail'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Fault</span>
                  </button>
                </div>
              </div>

              {/* Note input if Fault or manually added */}
              {item.status === 'fail' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2 border-t border-slate-800/80"
                >
                  <input
                    type="text"
                    value={item.note || ''}
                    onChange={(e) => updateItemNote(item.id, e.target.value)}
                    placeholder="Note specific observation (e.g. cracked top left, no audio on right speaker)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
                  />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Sync Action */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Syncing these checks provides clearer data for repair technicians.</span>
        </div>

        <button
          type="button"
          onClick={handleApplyToNotes}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 self-stretch sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Apply Pre-Checks to Issue Notes</span>
        </button>
      </div>
    </div>
  );
}
