import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Smartphone, 
  Zap, 
  Cpu, 
  Layers, 
  Info,
  ArrowRight,
  ShieldCheck,
  Receipt,
  AlertCircle,
  Clock,
  Database,
  Sparkles,
  Check
} from 'lucide-react';
import { ServiceTier, Manufacturer } from '../types';
import { calculateQuote, PricingBreakdown, PRICING_TIERS } from '../lib/pricing';

const ISSUES = [
  { 
    id: 'charging', 
    tier: ServiceTier.TIER_1_POWER,
    icon: Zap,
  },
  { 
    id: 'display', 
    tier: ServiceTier.TIER_2_DISPLAY,
    icon: Layers,
  },
  { 
    id: 'board', 
    tier: ServiceTier.TIER_3_BOARD,
    icon: Cpu,
  }
];

const MODELS: Record<Manufacturer, string[]> = {
  [Manufacturer.APPLE]: ['iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 13', 'iPad Pro M2'],
  [Manufacturer.SAMSUNG]: ['Galaxy S24 Ultra', 'Galaxy S23', 'Galaxy Z Fold 5', 'Galaxy Tab S9'],
  [Manufacturer.OTHER]: ['Google Pixel 8 Pro', 'OnePlus 12', 'Other Device']
};

export default function RepairEstimateCalculator() {
  const [manufacturer, setManufacturer] = useState<Manufacturer>(Manufacturer.APPLE);
  const [model, setModel] = useState(MODELS[Manufacturer.APPLE][0]);
  const [selectedIssue, setSelectedIssue] = useState(ISSUES[0]);
  const [zip, setZip] = useState('99201'); // Default to Spokane Lab zip

  // Additional Service Toggles
  const [rushPriority, setRushPriority] = useState(false);
  const [dataRecovery, setDataRecovery] = useState(false);

  const quote: PricingBreakdown = useMemo(() => {
    return calculateQuote(selectedIssue.tier, zip, {
      model,
      isRush: rushPriority,
      isDataRecovery: dataRecovery
    });
  }, [selectedIssue, zip, model, rushPriority, dataRecovery]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <Calculator className="w-3.5 h-3.5" />
          Precision Pricing Logic
        </div>
        <h2 className="text-4xl md:text-5xl font-playfair font-black text-slate-900 tracking-tight">
          Repair Estimate Calculator
        </h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Generate an immediate engineering estimate for your device restoration. Adjust hardware models, issue complexity, and expedited laboratory options in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Device Selection */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Device Configuration</h3>
                <p className="text-xs font-medium text-slate-400">Select the hardware unit for triage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Manufacturer</label>
                <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                  {(Object.keys(MODELS) as Manufacturer[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setManufacturer(m);
                        setModel(MODELS[m][0]);
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        manufacturer === m 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Model Selection</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 outline-none font-bold text-sm transition-all appearance-none"
                >
                  {MODELS[manufacturer].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Issue Diagnosis */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Issue Diagnosis</h3>
                <p className="text-xs font-medium text-slate-400">Identify the primary failure state</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ISSUES.map((issue) => {
                const tierData = PRICING_TIERS[issue.tier];
                const Icon = issue.icon;
                const isActive = selectedIssue.id === issue.id;
                return (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all space-y-4 ${
                      isActive 
                        ? 'bg-blue-50/50 border-blue-600 shadow-lg shadow-blue-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-blue-600/10 text-blue-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {tierData.complexity}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-blue-600">{tierData.category}</p>
                      <h4 className={`font-bold text-sm ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                        {tierData.label}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-500 leading-tight">
                        {tierData.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Additional Service Toggles: Rush Priority & Data Recovery */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Optional Laboratory Add-ons</h3>
                <p className="text-xs font-medium text-slate-400">Expedite turnaround or safeguard user data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rush Priority Toggle */}
              <div 
                onClick={() => setRushPriority(!rushPriority)}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                  rushPriority 
                    ? 'bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-600/20' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      rushPriority ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100/50 px-2.5 py-0.5 rounded-full">
                      Same-Day Queue
                    </span>
                  </div>

                  {/* Toggle Switch Graphic */}
                  <div className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    rushPriority ? 'bg-blue-600' : 'bg-slate-200'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                      rushPriority ? 'translate-x-6' : 'translate-x-0'
                    }`}>
                      {rushPriority && <Check className="w-3 h-3 text-blue-600" />}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Rush Priority Queue</h4>
                    <span className="text-xs font-black text-blue-600">+$49.00</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Bypasses standard bench wait times. Expedited component staging for under 4-hour lab turnaround.
                  </p>
                </div>
              </div>

              {/* Data Recovery Toggle */}
              <div 
                onClick={() => setDataRecovery(!dataRecovery)}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                  dataRecovery 
                    ? 'bg-indigo-50/70 border-indigo-600 shadow-md ring-2 ring-indigo-600/20' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      dataRecovery ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100/50 px-2.5 py-0.5 rounded-full">
                      Forensic Backup
                    </span>
                  </div>

                  {/* Toggle Switch Graphic */}
                  <div className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    dataRecovery ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                      dataRecovery ? 'translate-x-6' : 'translate-x-0'
                    }`}>
                      {dataRecovery && <Check className="w-3 h-3 text-indigo-600" />}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Data Recovery & Backup</h4>
                    <span className="text-xs font-black text-indigo-600">+$75.00</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    NAND forensic extraction & encrypted cloud archive prior to board teardown or chip replacement.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Spokane Area Zip (Optional for Tax Calibration)</label>
              <div className="flex gap-2">
                {['99201', '99206', '99212'].map((z) => (
                  <button
                    key={z}
                    onClick={() => setZip(z)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      zip === z 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {z}
                  </button>
                ))}
                <input 
                  type="text" 
                  maxLength={5}
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border-2 border-transparent focus:border-slate-900 outline-none text-xs font-bold"
                  placeholder="Custom Zip"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Quote Result Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck className="w-32 h-32" />
              </div>

              <div className="space-y-2 relative z-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Restoration Estimate</h4>
                <div className="flex items-baseline gap-2">
                  <motion.span 
                    key={quote.total}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-black"
                  >
                    ${quote.total.toFixed(2)}
                  </motion.span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">USD</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                    {selectedIssue.tier.replace('_', ' ')}
                  </div>
                  {quote.modelAdjustment > 0 && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold border border-amber-500/30">
                      Flagship Tier
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-slate-800 relative z-10">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Parts & Component Cost</span>
                  <span>${quote.partsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Engineering Labor</span>
                  <span>${quote.laborCost.toFixed(2)}</span>
                </div>

                {rushPriority && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex justify-between text-xs font-bold text-blue-400"
                  >
                    <span className="uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Rush Expedite Fee
                    </span>
                    <span>+$49.00</span>
                  </motion.div>
                )}

                {dataRecovery && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex justify-between text-xs font-bold text-indigo-400"
                  >
                    <span className="uppercase tracking-widest flex items-center gap-1">
                      <Database className="w-3 h-3" /> Forensic Data Backup
                    </span>
                    <span>+$75.00</span>
                  </motion.div>
                )}

                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Laboratory Overhead</span>
                  <span>${quote.overhead.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-3 border-t border-slate-800">
                  <span className="text-slate-400 uppercase tracking-widest">Subtotal</span>
                  <span>${quote.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-400">
                  <span className="uppercase tracking-widest">Sales Tax (Spokane)</span>
                  <span>${quote.tax.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group relative z-10">
                Proceed to Triage
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 space-y-4">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-slate-400" />
                <h5 className="font-bold text-slate-900 text-sm">Transparency Protocol</h5>
              </div>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Estimates provided are base-tier calculations. Final billing may fluctuate based on parts provenance and real-time telemetry findings during Phase 2 (Diagnostic Triage). 
                <br /><br />
                <span className="font-bold text-slate-900">WA RCW 19.415 Compliant Laboratory Pricing.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

