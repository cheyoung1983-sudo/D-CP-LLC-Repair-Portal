import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Sparkles, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Calendar, 
  TrendingUp, 
  Sliders, 
  Smartphone, 
  HardDrive, 
  Zap, 
  Package, 
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface HistoricalBenchmark {
  deviceType: string;
  repairCategory: string;
  baseHours: number;
  historicalJobs: number;
  confidenceScore: number;
  partsInStock: boolean;
  stockCount: number;
  stageBreakdown: {
    triageMins: number;
    benchMins: number;
    stressTestMins: number;
  };
}

const HISTORICAL_BENCHMARKS: Record<string, HistoricalBenchmark> = {
  'iphone_screen': {
    deviceType: 'iPhone 15 Pro / Pro Max',
    repairCategory: 'Super Retina XDR OLED Display Replacement',
    baseHours: 1.5,
    historicalJobs: 214,
    confidenceScore: 98.2,
    partsInStock: true,
    stockCount: 18,
    stageBreakdown: { triageMins: 15, benchMins: 45, stressTestMins: 30 }
  },
  'iphone_battery': {
    deviceType: 'iPhone 14 / 15 Series',
    repairCategory: 'OEM High-Capacity Battery Pack Swap',
    baseHours: 1.0,
    historicalJobs: 340,
    confidenceScore: 99.1,
    partsInStock: true,
    stockCount: 32,
    stageBreakdown: { triageMins: 10, benchMins: 30, stressTestMins: 20 }
  },
  'iphone_port': {
    deviceType: 'iPhone 15 Series USB-C',
    repairCategory: 'USB-C Flex Port & Charging Controller Repair',
    baseHours: 2.2,
    historicalJobs: 89,
    confidenceScore: 94.5,
    partsInStock: true,
    stockCount: 7,
    stageBreakdown: { triageMins: 20, benchMins: 75, stressTestMins: 37 }
  },
  'macbook_screen': {
    deviceType: 'MacBook Pro M2 / M3 (14" / 16")',
    repairCategory: 'Liquid Retina XDR Display Assembly Replacement',
    baseHours: 3.5,
    historicalJobs: 128,
    confidenceScore: 96.0,
    partsInStock: true,
    stockCount: 5,
    stageBreakdown: { triageMins: 30, benchMins: 120, stressTestMins: 60 }
  },
  'macbook_pmic': {
    deviceType: 'MacBook Pro M1/M2/M3 Logic Board',
    repairCategory: 'ISL/Intersil PMIC & PPBUS_G3H Short Micro-soldering',
    baseHours: 6.5,
    historicalJobs: 76,
    confidenceScore: 91.8,
    partsInStock: true,
    stockCount: 14,
    stageBreakdown: { triageMins: 60, benchMins: 240, stressTestMins: 90 }
  },
  'macbook_liquid': {
    deviceType: 'MacBook Air / Pro Liquid Damage',
    repairCategory: 'Ultrasonic Board Deoxidation & BGA Reballing',
    baseHours: 8.0,
    historicalJobs: 95,
    confidenceScore: 88.4,
    partsInStock: true,
    stockCount: 22,
    stageBreakdown: { triageMins: 90, benchMins: 300, stressTestMins: 90 }
  },
  'ipad_digitizer': {
    deviceType: 'iPad Pro 11" / 12.9"',
    repairCategory: 'Digitizer Glass & LCD Bonding Replacement',
    baseHours: 2.8,
    historicalJobs: 112,
    confidenceScore: 95.1,
    partsInStock: true,
    stockCount: 8,
    stageBreakdown: { triageMins: 20, benchMins: 100, stressTestMins: 48 }
  },
  'samsung_screen': {
    deviceType: 'Samsung Galaxy S24 Ultra / S23',
    repairCategory: 'Dynamic AMOLED 2X Frame & Glass Assembly',
    baseHours: 2.0,
    historicalJobs: 165,
    confidenceScore: 97.4,
    partsInStock: false,
    stockCount: 1, // Low stock
    stageBreakdown: { triageMins: 15, benchMins: 65, stressTestMins: 40 }
  }
};

interface RepairTimeEstimatorProps {
  onApplyEstimate?: (estimatedWindow: string) => void;
}

export default function RepairTimeEstimator({ onApplyEstimate }: RepairTimeEstimatorProps) {
  const { showToast } = useToast();

  const [selectedBenchmarkKey, setSelectedBenchmarkKey] = useState<string>('iphone_screen');
  const [tierMultiplier, setTierMultiplier] = useState<number>(1.0); // 1.0 standard, 0.5 express, 0.35 emergency
  const [queueTraffic, setQueueTraffic] = useState<'low' | 'standard' | 'peak'>('standard');
  const [technicianExperience, setTechnicianExperience] = useState<'senior' | 'standard'>('senior');

  const currentBenchmark = HISTORICAL_BENCHMARKS[selectedBenchmarkKey] || HISTORICAL_BENCHMARKS['iphone_screen'];

  // Calculate AI prediction
  let trafficMultiplier = 1.0;
  if (queueTraffic === 'low') trafficMultiplier = 0.85;
  if (queueTraffic === 'peak') trafficMultiplier = 1.35;

  let techMultiplier = technicianExperience === 'senior' ? 0.9 : 1.0;
  let partsMultiplier = currentBenchmark.partsInStock ? 1.0 : 1.8; // Delay if parts need express routing

  const calculatedHours = Number((currentBenchmark.baseHours * tierMultiplier * trafficMultiplier * techMultiplier * partsMultiplier).toFixed(1));
  
  // Predict completion window timestamp
  const now = new Date();
  const completionTimeMs = now.getTime() + calculatedHours * 3600 * 1000;
  const completionDate = new Date(completionTimeMs);

  const formattedCompletionWindow = `${completionDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${completionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const handleApply = () => {
    if (onApplyEstimate) {
      onApplyEstimate(formattedCompletionWindow);
    }
    showToast(`AI Estimated completion window set: ${formattedCompletionWindow}`, 'success');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow Accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                AI Telemetry Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">Spokane Historical Model v4.2</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              AI Repair Time & Turnaround Estimator
            </h3>
          </div>
        </div>

        <div className="text-right sm:block hidden text-slate-400 text-xs">
          <span className="block font-mono font-bold text-slate-300">Spokane Lab Historical Dataset</span>
          <span>1,250+ Verified Repair Cycles Analyzed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Interactive Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            Intake & Hardware Parameters
          </h4>

          {/* Device & Repair Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Device Model & Fault Type
            </label>
            <select
              value={selectedBenchmarkKey}
              onChange={(e) => setSelectedBenchmarkKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none font-medium"
            >
              <option value="iphone_screen">iPhone 15 Pro — Super Retina OLED Display</option>
              <option value="iphone_battery">iPhone 14/15 — OEM High-Cap Battery Swap</option>
              <option value="iphone_port">iPhone 15 — USB-C Flex & Charge IC Repair</option>
              <option value="macbook_screen">MacBook Pro M2/M3 — Liquid Retina Display</option>
              <option value="macbook_pmic">MacBook Pro M1/M2/M3 — Logic Board PMIC Short</option>
              <option value="macbook_liquid">MacBook Air/Pro — Liquid Damage Deoxidation</option>
              <option value="ipad_digitizer">iPad Pro — Digitizer Glass & LCD Bonding</option>
              <option value="samsung_screen">Samsung S24 Ultra — Dynamic AMOLED 2X Frame</option>
            </select>
          </div>

          {/* Service Priority Tier */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Service Speed Priority Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTierMultiplier(1.0)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                  tierMultiplier === 1.0
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setTierMultiplier(0.5)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                  tierMultiplier === 0.5
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Express Pass
              </button>
              <button
                type="button"
                onClick={() => setTierMultiplier(0.35)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                  tierMultiplier === 0.35
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Emergency
              </button>
            </div>
          </div>

          {/* Bench Queue Load */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Laboratory Queue Load Factor
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQueueTraffic('low')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                  queueTraffic === 'low'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Low Traffic
              </button>
              <button
                type="button"
                onClick={() => setQueueTraffic('standard')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                  queueTraffic === 'standard'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setQueueTraffic('peak')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                  queueTraffic === 'peak'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Peak Queue
              </button>
            </div>
          </div>

          {/* Technician Assignment Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Specialist Seniority
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTechnicianExperience('senior')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                  technicianExperience === 'senior'
                    ? 'bg-slate-800 text-blue-400 border-blue-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Lead Micro-soldering Tech
              </button>
              <button
                type="button"
                onClick={() => setTechnicianExperience('standard')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                  technicianExperience === 'standard'
                    ? 'bg-slate-800 text-slate-200 border-slate-700'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Standard Bench Tech
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Prediction Card Display (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="bg-slate-950 border-2 border-blue-500/40 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
            {/* Upper Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 block">
                  AI Predicted Completion Window
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  {calculatedHours} Hours Total
                </h4>
              </div>
              <div className="text-right bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
                  Model Confidence
                </span>
                <span className="text-sm font-extrabold text-white font-mono">
                  {currentBenchmark.confidenceScore}%
                </span>
              </div>
            </div>

            {/* Estimated Time Window Callout */}
            <div className="bg-blue-950/60 border border-blue-500/30 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Estimated Ready-For-Pick-Up Target
              </span>
              <p className="text-base font-extrabold text-white">
                {formattedCompletionWindow}
              </p>
              <p className="text-[11px] text-slate-400">
                Includes intake scan, diagnostic triage, precision bench restoration, and 45°C thermal lockout QA testing.
              </p>
            </div>

            {/* Breakdown Stages */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Bench Execution Time Allocation Breakdown
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">1. Triage Scan</span>
                  <span className="text-xs font-mono font-bold text-slate-200 block mt-0.5">
                    {Math.round(currentBenchmark.stageBreakdown.triageMins * tierMultiplier)} mins
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">2. Active Bench</span>
                  <span className="text-xs font-mono font-bold text-blue-400 block mt-0.5">
                    {Math.round(currentBenchmark.stageBreakdown.benchMins * tierMultiplier)} mins
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">3. QA Stress Test</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
                    {Math.round(currentBenchmark.stageBreakdown.stressTestMins * tierMultiplier)} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Parts Stock Verification Status */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="font-bold text-slate-200 block">Spokane Vault Inventory Check</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentBenchmark.stockCount} OEM units available in stock
                  </span>
                </div>
              </div>

              {currentBenchmark.partsInStock ? (
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  In Stock
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg font-bold text-[10px] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Low / Expediting
                </span>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleApply}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-98"
            >
              <Zap className="w-4 h-4" />
              <span>Apply AI Completion Estimate to Ticket Intake</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
