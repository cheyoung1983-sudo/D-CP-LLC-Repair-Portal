import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Square, 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Cpu, 
  RotateCcw, 
  Award, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  notes?: string;
}

interface TechnicianChecklistProps {
  deviceCategory?: string;
  onChecklistComplete?: (isComplete: boolean, summary: string) => void;
}

const CHECKLIST_TEMPLATES: Record<string, ChecklistItem[]> = {
  mobile: [
    { id: 'm1', title: 'Frame & Housing Alignment', description: 'Inspect chassis for corner impact dents or warped mid-frame geometry.', checked: false },
    { id: 'm2', title: 'DC Ammeter Power Rail Draw', description: 'Connect bench supply: Verify 5V/9V USB-PD negotiation & 0.0A quiescent sleep draw.', checked: false },
    { id: 'm3', title: 'Display & Touch Grid Test', description: 'Drag active icon across full digitizer grid; check for OLED burn-in or backlight bloom.', checked: false },
    { id: 'm4', title: 'TrueDepth / Rear Camera OIS', description: 'Test 0.5x, 1x, 3x optical zoom focus and front FaceID sensor array.', checked: false },
    { id: 'm5', title: 'FPC & Battery Internal Resistance', description: 'Inspect FPC latches under bench microscope & log battery health cycle count.', checked: false },
    { id: 'm6', title: 'Audio Speaker & Mic Loopback', description: 'Record 5-second voice memo; verify upper receiver & bottom microphone clarity.', checked: false },
    { id: 'm7', title: '45°C Thermal Soak QC Test', description: 'Run high-load benchmark for 10 minutes; verify thermal cutoff remains inactive.', checked: false }
  ],
  laptop: [
    { id: 'l1', title: 'Logic Board Visual Inspection', description: 'Inspect VDD_MAIN and PMIC area for corrosion, solder tinning, or burnt inductors.', checked: false },
    { id: 'l2', title: 'USB-C / Thunderbolt Rail Negotiation', description: 'Verify 20V @ 3A+ charging profile across all Type-C interface ports.', checked: false },
    { id: 'l3', title: 'Display Backlight / Flexgate Check', description: 'Adjust screen angle through 180° motion; ensure backlight EDP cable signal is stable.', checked: false },
    { id: 'l4', title: 'Trackpad & Scissor Keyboard Haptics', description: 'Verify all physical key switches and Force Touch haptic actuator feedback.', checked: false },
    { id: 'l5', title: 'Thermal Fan Ramp & Compound Application', description: 'Inspect thermal paste viscosity; confirm cooling fans ramp smoothly under load.', checked: false },
    { id: 'l6', title: 'Wi-Fi / Bluetooth Antenna Diagnostics', description: 'Connect to 5GHz lab network; verify packet loss is < 0.1%.', checked: false }
  ],
  tablet: [
    { id: 't1', title: 'Digitizer Glass Adhesion & Bezel Seal', description: 'Verify perimeter adhesive bonding and corner glass flush alignment.', checked: false },
    { id: 't2', title: 'Apple Pencil / Active Stylus Grid', description: 'Draw continuous diagonal lines across entire screen surface with pressure stylus.', checked: false },
    { id: 't3', title: 'Charge IC & Battery Health Telemetry', description: 'Check charge controller IC temperature and log battery degradation %.', checked: false },
    { id: 't4', title: 'Multi-Speaker Spatial Audio Test', description: 'Verify 4-speaker array balance and frequency response.', checked: false },
    { id: 't5', title: 'Camera & Ambient Light Sensor', description: 'Test auto-brightness adjustments and front/rear photo capture.', checked: false }
  ],
  console: [
    { id: 'c1', title: 'HDMI / Port Pin Alignment', description: 'Inspect HDMI connector pins under magnification for bridged pads or bent leads.', checked: false },
    { id: 'c2', title: 'Power Supply Unit Voltage Rails', description: 'Measure 12V and 5V standby rails with multimeter under load.', checked: false },
    { id: 'c3', title: 'APU Liquid Metal / Thermal Re-paste', description: 'Inspect APU substrate for oxidation; apply fresh high-conductivity thermal paste.', checked: false },
    { id: 'c4', title: 'BGA Reball / Solder Joint Integrity', description: 'Verify zero short-circuits to ground on secondary power inductors.', checked: false }
  ]
};

export default function TechnicianChecklist({
  deviceCategory = 'mobile',
  onChecklistComplete
}: TechnicianChecklistProps) {
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<'mobile' | 'laptop' | 'tablet' | 'console'>('mobile');
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLIST_TEMPLATES.mobile);
  const [techSignedOff, setTechSignedOff] = useState(false);
  const [signOffTime, setSignOffTime] = useState<string | null>(null);

  // Sync selectedType if deviceCategory prop changes
  useEffect(() => {
    const catLower = deviceCategory.toLowerCase();
    if (catLower.includes('macbook') || catLower.includes('laptop') || catLower.includes('pc')) {
      setSelectedType('laptop');
      setItems(CHECKLIST_TEMPLATES.laptop);
    } else if (catLower.includes('ipad') || catLower.includes('tablet')) {
      setSelectedType('tablet');
      setItems(CHECKLIST_TEMPLATES.tablet);
    } else if (catLower.includes('console') || catLower.includes('pcb')) {
      setSelectedType('console');
      setItems(CHECKLIST_TEMPLATES.console);
    } else {
      setSelectedType('mobile');
      setItems(CHECKLIST_TEMPLATES.mobile);
    }
  }, [deviceCategory]);

  const handleTypeChange = (type: 'mobile' | 'laptop' | 'tablet' | 'console') => {
    setSelectedType(type);
    setItems(CHECKLIST_TEMPLATES[type]);
    setTechSignedOff(false);
    setSignOffTime(null);
  };

  const toggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);

    const completedCount = updated.filter((i) => i.checked).length;
    const isAllComplete = completedCount === updated.length;
    if (onChecklistComplete) {
      onChecklistComplete(
        isAllComplete,
        `${completedCount}/${updated.length} QA Diagnostic Steps Passed`
      );
    }
  };

  const resetChecklist = () => {
    setItems(CHECKLIST_TEMPLATES[selectedType].map((i) => ({ ...i, checked: false })));
    setTechSignedOff(false);
    setSignOffTime(null);
    showToast('Checklist reset to baseline.', 'info');
  };

  const handleSignOff = () => {
    const completedCount = items.filter((i) => i.checked).length;
    if (completedCount < items.length) {
      showToast(`Please complete all ${items.length} diagnostic steps before QA sign-off (${completedCount}/${items.length} done).`, 'error');
      return;
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTechSignedOff(true);
    setSignOffTime(timeStr);
    showToast(`QA Quality Pass Signed Off by Spokane Bench Lead at ${timeStr}!`, 'success');
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono text-[10px] font-black uppercase">
              Quality Assurance Protocol
            </span>
            <span className="text-xs font-bold text-slate-500">
              {completedCount} of {items.length} Passed ({progressPercent}%)
            </span>
          </div>
          <h4 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            Repair Technician Quality Control Checklist
          </h4>
        </div>

        <button
          type="button"
          onClick={resetChecklist}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Steps</span>
        </button>
      </div>

      {/* Device Type Toggle Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl">
        {[
          { id: 'mobile', label: 'Mobile / iPhone', icon: Smartphone },
          { id: 'laptop', label: 'MacBook / PC', icon: Laptop },
          { id: 'tablet', label: 'iPad / Tablet', icon: Tablet },
          { id: 'console', label: 'Custom PCB', icon: Cpu },
        ].map((type) => {
          const Icon = type.icon;
          const isActive = selectedType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeChange(type.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Diagnostic Verification Progress</span>
          <span className={progressPercent === 100 ? 'text-emerald-600 font-extrabold' : 'text-blue-600'}>
            {progressPercent}% Certified
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
            className={`h-full rounded-full ${
              progressPercent === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              item.checked
                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {item.checked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className="space-y-0.5 flex-1">
              <h5 className={`text-xs font-bold ${item.checked ? 'text-emerald-900 line-through opacity-90' : 'text-slate-900'}`}>
                {item.title}
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Technician Quality Sign-Off Banner */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {techSignedOff ? (
          <div className="w-full bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold text-sm block">Quality Assurance Certified</span>
              <p className="text-emerald-800 font-medium">
                Signed off by Bench Lead Technician at {signOffTime}. All diagnostic gates passed compliance specifications.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500">
              Complete all {items.length} steps above to issue official Spokane Quality Pass stamp.
            </p>
            <button
              type="button"
              onClick={handleSignOff}
              disabled={completedCount < items.length}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign Off Quality Pass</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
