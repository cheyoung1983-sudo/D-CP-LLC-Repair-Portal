import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitCommit, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Thermometer, 
  Activity, 
  Cpu, 
  Flame, 
  Sparkles,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function ChainOfVerificationVisualizer() {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [vMeas, setVMeas] = useState<number>(0.428);
  const [vRef, setVRef] = useState<number>(0.435);
  const [activeReflowZone, setActiveReflowZone] = useState<'preheat' | 'soak' | 'reflow' | 'peak' | 'cooling'>('peak');

  // Relative Error Delta calculation
  const isShortToGround = vMeas <= 0.005;
  const deltaVRel = isShortToGround ? 1.0 : vRef > 0 ? Math.abs(vMeas - vRef) / vRef : 0;
  
  let diodeGrade = 'Normal (Green)';
  let diodeBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (isShortToGround || deltaVRel > 0.15) {
    diodeGrade = 'Short / Major Failure (Red)';
    diodeBadgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (deltaVRel > 0.05) {
    diodeGrade = 'Degraded / Drift (Amber)';
    diodeBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const coveStages = [
    {
      stage: 1,
      title: 'Stage 1: Primary Diagnostic Draft',
      desc: 'Generates initial repair hypothesis based on incoming WebUSB ammeter telemetry and customer symptom reports.',
      badge: 'LLM Synthesis',
      example: 'Hypothesis: Replace U7100 PMIC due to shorted ISL6259 pin 27 on PPBUS_G3H rail.'
    },
    {
      stage: 2,
      title: 'Stage 2: Verification Query Formulation',
      desc: 'Parses diagnostic draft into structured Zod claim schemas (voltages, pinouts, component IDs) for independent verification.',
      badge: 'Zod Validation',
      example: 'Claim 1: Pin 27 of U7100 connects to CSOP. Claim 2: Nominal CSOP voltage is 12.6V.'
    },
    {
      stage: 3,
      title: 'Stage 3: Isolated Grounding Retrieval',
      desc: 'Queries Vercel Postgres (pgvector) and BM25 sparse text index to extract exact CAD schematics and boardview netlists.',
      badge: 'pgvector + BM25',
      example: 'Retrieved 820-00165-A Netlist Block: U7100 Pin 27 ISL6259_CSOP = 12.55V nominal.'
    },
    {
      stage: 4,
      title: 'Stage 4: Verified Synthesis & Strict Filtering',
      desc: 'Compares initial draft against canonical netlists. Strips unverified claims and enforces strict refusal if confidence < 82%.',
      badge: 'CoVe Final Output',
      example: 'Verified: U7100 Pin 27 ISL6259_CSOP verified at 12.55V. Proceed with rosin cloud thermal sweep.'
    }
  ];

  const reflowProfileData = {
    preheat: {
      name: '1. Preheat Zone',
      tempRange: '25°C ➔ 150°C',
      duration: '60s – 90s',
      rampRate: '1.5°C/s – 2.5°C/s',
      purpose: 'Gradually evaporates volatile flux solvents without thermal shock.'
    },
    soak: {
      name: '2. Soak Zone',
      tempRange: '150°C ➔ 180°C',
      duration: '60s – 120s',
      rampRate: 'Equilibrium Plateau',
      purpose: 'Equalizes thermal mass across multi-layer copper ground planes.'
    },
    reflow: {
      name: '3. Reflow Zone (Above Liquidus)',
      tempRange: '> 217°C Liquidus',
      duration: '45s – 75s',
      rampRate: '+2.0°C/s',
      purpose: 'SAC305 alloy liquifies (Sn96.5 / Ag3.0 / Cu0.5) to form intermetallic bonds.'
    },
    peak: {
      name: '4. Peak Reflow Temperature',
      tempRange: '235°C ➔ 245°C Max',
      duration: '10s – 20s Max',
      rampRate: 'Thermal Peak',
      purpose: 'Optimal wetting without interposer substrate degradation.'
    },
    cooling: {
      name: '5. Controlled Cooling Zone',
      tempRange: '245°C ➔ 50°C',
      duration: '90s',
      rampRate: '-2.0°C/s to -4.0°C/s',
      purpose: 'Promotes fine-grain solder joint structure and maximum tensile strength.'
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 text-white rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Triage AI Rev 4 Core
              </span>
              <span className="text-xs text-slate-400 font-mono">Chain-of-Verification (CoVe)</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-0.5">
              4-Stage Verification & Thermal Reflow Engine
            </h3>
          </div>
        </div>
      </div>

      {/* 4-Stage CoVe Execution Pipeline Visualizer */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-indigo-400" />
          Zero-Hallucination Chain-of-Verification Pipeline
        </h4>

        {/* Stage Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {coveStages.map((s) => (
            <button
              key={s.stage}
              onClick={() => setActiveStage(s.stage)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                activeStage === s.stage
                  ? 'bg-indigo-950/90 border-indigo-500 text-white shadow-lg'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                  Stage 0{s.stage}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {s.badge}
                </span>
              </div>
              <h5 className="text-xs font-extrabold text-white line-clamp-1">{s.title.replace(`Stage ${s.stage}: `, '')}</h5>
            </button>
          ))}
        </div>

        {/* Active Stage Details Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {coveStages[activeStage - 1].title}
            </h5>
            <span className="text-xs font-mono text-slate-400">Phase {activeStage} of 4</span>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {coveStages[activeStage - 1].desc}
          </p>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono text-xs text-indigo-300/90 leading-relaxed">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Execution Example Payload</span>
            {coveStages[activeStage - 1].example}
          </div>
        </div>
      </div>

      {/* Grid: Diode Mode Delta Calculator + SAC305 Reflow Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diode Mode Relative Error Calculator */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Diode Mode Tolerance Delta
            </h4>
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${diodeBadgeColor}`}>
              {diodeGrade}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Formula: <span className="font-mono text-emerald-400">ΔV_rel = |V_meas - V_ref| / V_ref</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Measured (V_meas)</label>
              <input
                type="number"
                step="0.001"
                value={vMeas}
                onChange={(e) => setVMeas(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reference (V_ref)</label>
              <input
                type="number"
                step="0.001"
                value={vRef}
                onChange={(e) => setVRef(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Relative Error Delta (ΔV_rel):</span>
              <span className={`font-mono font-bold ${
                deltaVRel <= 0.05 ? 'text-emerald-400' : deltaVRel <= 0.15 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {(deltaVRel * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  deltaVRel <= 0.05 ? 'bg-emerald-500' : deltaVRel <= 0.15 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, deltaVRel * 300)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Green: Δ ≤ 5% • Amber: 5% &lt; Δ ≤ 15% • Red: Δ &gt; 15% or Short (≤ 0.005V)
            </p>
          </div>
        </div>

        {/* SAC305 Lead-Free Reflow Profile */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              SAC305 Lead-Free Micro-soldering Thermal Profile
            </h4>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Liquidus: 217°C
            </span>
          </div>

          {/* Reflow Zone Selector Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {(['preheat', 'soak', 'reflow', 'peak', 'cooling'] as const).map((zone) => (
              <button
                key={zone}
                onClick={() => setActiveReflowZone(zone)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeReflowZone === zone
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>

          {/* Active Reflow Specs Panel */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-amber-300">
                {reflowProfileData[activeReflowZone].name}
              </h5>
              <span className="text-xs font-mono font-bold text-white bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {reflowProfileData[activeReflowZone].tempRange}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              {reflowProfileData[activeReflowZone].purpose}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1 text-[10px] font-mono text-slate-400">
              <div>
                <span className="text-slate-500 block">DWELL TIME:</span>
                <span className="text-slate-200 font-bold">{reflowProfileData[activeReflowZone].duration}</span>
              </div>
              <div>
                <span className="text-slate-500 block">RAMP RATE:</span>
                <span className="text-slate-200 font-bold">{reflowProfileData[activeReflowZone].rampRate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
