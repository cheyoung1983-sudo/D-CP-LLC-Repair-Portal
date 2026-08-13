import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Calendar, 
  Layers, 
  Users, 
  Package, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  BarChart2, 
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { calculateDynamicCompletionDate, LabWorkloadParameters } from '../utils/completionCalculator.ts';
import { useToast } from './Toast.tsx';

interface DynamicCompletionCardProps {
  ticketNumber?: string;
  deviceModel?: string;
  serviceTier?: string;
  currentStage?: number;
  initialQueuePosition?: number;
  initialTotalQueue?: number;
  initialActiveTechs?: number;
  initialPartsInStock?: boolean;
  onUpdateTicketDate?: (formattedCompletionWindow: string) => void;
  compactMode?: boolean;
}

export default function DynamicCompletionCard({
  ticketNumber = 'DCP-8842',
  deviceModel = 'iPhone 15 Pro Max',
  serviceTier = 'Tier 3 (Board Rework)',
  currentStage = 2,
  initialQueuePosition = 3,
  initialTotalQueue = 12,
  initialActiveTechs = 3,
  initialPartsInStock = true,
  onUpdateTicketDate,
  compactMode = false
}: DynamicCompletionCardProps) {
  const { showToast } = useToast();

  // Interactive local modifiers
  const [priorityTier, setPriorityTier] = useState<'standard' | 'express' | 'emergency'>('standard');
  const [queuePosition, setQueuePosition] = useState<number>(initialQueuePosition);
  const [totalQueue, setTotalQueue] = useState<number>(initialTotalQueue);
  const [activeTechs, setActiveTechs] = useState<number>(initialActiveTechs);
  const [partsInStock, setPartsInStock] = useState<boolean>(initialPartsInStock);
  const [showParametersToggle, setShowParametersToggle] = useState<boolean>(false);

  // Calculate dynamic completion date in real-time
  const calculationParams: LabWorkloadParameters = useMemo(() => ({
    deviceModel,
    serviceTier,
    currentStage,
    queuePosition,
    totalQueueJobs: totalQueue,
    activeTechnicians: activeTechs,
    partsInStock,
    priorityExpress: priorityTier,
  }), [deviceModel, serviceTier, currentStage, queuePosition, totalQueue, activeTechs, partsInStock, priorityTier]);

  const calcResult = useMemo(() => {
    return calculateDynamicCompletionDate(calculationParams);
  }, [calculationParams]);

  const handleApplyEstimate = () => {
    const formattedWindow = `${calcResult.formattedDate} at ${calcResult.formattedTime} (${calcResult.humanizedCountdown})`;
    if (onUpdateTicketDate) {
      onUpdateTicketDate(formattedWindow);
    }
    showToast(`Completion Date updated: ${formattedWindow}`, 'success');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-7 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full -mr-24 -mt-24 pointer-events-none" />

      {/* Main Header Display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner mt-0.5">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                Dynamic Workload Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">Spokane Lab Real-Time Telemetry</span>
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-white mt-1">
              Estimated Completion Date & Lab Turnaround
            </h3>
          </div>
        </div>

        {/* Confidence Score Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-none">
              Model Accuracy
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {calcResult.confidenceScorePercentage}% Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Target Date Highlight Box */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/50 border-2 border-blue-500/30 p-5 md:p-6 rounded-2xl space-y-4 shadow-xl relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic Target Completion Window
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {calcResult.formattedDate}
              </h4>
              <span className="text-lg md:text-xl font-bold text-blue-400">
                at {calcResult.formattedTime}
              </span>
            </div>
          </div>

          <div className="sm:text-right bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-2xl self-start sm:self-auto">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
              Estimated Time Remaining
            </span>
            <span className="text-base font-mono font-black text-white flex items-center gap-1.5 sm:justify-end">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              {calcResult.humanizedCountdown}
            </span>
          </div>
        </div>

        {/* Priority Speed Selector Buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Speed Priority Tier:
          </span>
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setPriorityTier('standard')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                priorityTier === 'standard'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setPriorityTier('express')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                priorityTier === 'express'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Express (-50%)
            </button>
            <button
              type="button"
              onClick={() => setPriorityTier('emergency')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                priorityTier === 'emergency'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Rush Priority
            </button>
          </div>
        </div>
      </div>

      {/* Lab Workload Factors Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
        {/* Workload Load Factor */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-black uppercase tracking-wider">Bench Queue Load</span>
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-white block">
            {calcResult.workloadTrafficLevel}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            {totalQueue} jobs in Spokane queue
          </span>
        </div>

        {/* Ticket Queue Position */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-black uppercase tracking-wider">Queue Position</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-bold text-white block">
            Ticket #{queuePosition} in line
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            {queuePosition === 1 ? 'Next on active bench' : `${queuePosition - 1} jobs ahead`}
          </span>
        </div>

        {/* Active Tech Count */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-black uppercase tracking-wider">Active Staff</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xs font-bold text-white block">
            {activeTechs} Senior Techs
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            IPC-A-610 Bench Duty
          </span>
        </div>

        {/* Inventory Parts Stock */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-black uppercase tracking-wider">Parts Availability</span>
            <Package className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className={`text-xs font-bold block ${partsInStock ? 'text-emerald-400' : 'text-amber-400'}`}>
            {partsInStock ? 'In Spokane Vault' : 'Special Order (+24h)'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            {partsInStock ? 'Zero logistics delay' : 'Distributor freight route'}
          </span>
        </div>
      </div>

      {/* Time Breakdown Stacked Progress Bar */}
      <div className="space-y-2 relative z-10 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            Turnaround Hours Breakdown ({calcResult.totalCalculatedHours}h Total)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {calcResult.complexityCategory}
          </span>
        </div>

        {/* Visual Stacked Bar */}
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
          {calcResult.breakdown.triageHours > 0 && (
            <div 
              style={{ width: `${Math.max(5, (calcResult.breakdown.triageHours / calcResult.totalCalculatedHours) * 100)}%` }}
              className="h-full bg-blue-500 rounded-l-full"
              title={`Triage: ${calcResult.breakdown.triageHours}h`}
            />
          )}
          {calcResult.breakdown.queueWaitHours > 0 && (
            <div 
              style={{ width: `${Math.max(5, (calcResult.breakdown.queueWaitHours / calcResult.totalCalculatedHours) * 100)}%` }}
              className="h-full bg-indigo-500"
              title={`Queue Wait: ${calcResult.breakdown.queueWaitHours}h`}
            />
          )}
          {calcResult.breakdown.activeBenchHours > 0 && (
            <div 
              style={{ width: `${Math.max(10, (calcResult.breakdown.activeBenchHours / calcResult.totalCalculatedHours) * 100)}%` }}
              className="h-full bg-emerald-500"
              title={`Active Bench: ${calcResult.breakdown.activeBenchHours}h`}
            />
          )}
          {calcResult.breakdown.partsDelayHours > 0 && (
            <div 
              style={{ width: `${Math.max(10, (calcResult.breakdown.partsDelayHours / calcResult.totalCalculatedHours) * 100)}%` }}
              className="h-full bg-amber-500"
              title={`Parts Order Lag: ${calcResult.breakdown.partsDelayHours}h`}
            />
          )}
          {calcResult.breakdown.qaStressTestHours > 0 && (
            <div 
              style={{ width: `${Math.max(5, (calcResult.breakdown.qaStressTestHours / calcResult.totalCalculatedHours) * 100)}%` }}
              className="h-full bg-purple-500 rounded-r-full"
              title={`QA Stress Test: ${calcResult.breakdown.qaStressTestHours}h`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span>Queue Wait ({calcResult.breakdown.queueWaitHours}h)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Bench Rework ({calcResult.breakdown.activeBenchHours}h)</span>
          </div>
          {calcResult.breakdown.partsDelayHours > 0 ? (
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Parts Lag ({calcResult.breakdown.partsDelayHours}h)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              <span>Intake/Triage ({calcResult.breakdown.triageHours}h)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            <span>QA Thermal Lock ({calcResult.breakdown.qaStressTestHours}h)</span>
          </div>
        </div>
      </div>

      {/* Expandable Lab Workload Simulation Controls */}
      <div className="relative z-10">
        <button
          type="button"
          onClick={() => setShowParametersToggle(!showParametersToggle)}
          className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showParametersToggle ? 'Hide Lab Workload Modifiers' : 'Simulate Lab Queue & Parts Conditions'}</span>
        </button>

        <AnimatePresence>
          {showParametersToggle && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-3"
            >
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
                  Live Spokane Bench Conditions Simulator
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">
                      Queue Position (#{queuePosition})
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={queuePosition}
                      onChange={(e) => setQueuePosition(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">
                      Active Techs ({activeTechs})
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="6" 
                      value={activeTechs}
                      onChange={(e) => setActiveTechs(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">
                      Parts Stock Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setPartsInStock(!partsInStock)}
                      className={`w-full py-1 px-2 rounded-lg font-bold text-[11px] border transition-all ${
                        partsInStock
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      {partsInStock ? 'In Stock (Spokane Vault)' : 'Out of Stock (+24h Lag)'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Button to apply to ticket */}
      {onUpdateTicketDate && (
        <button
          type="button"
          onClick={handleApplyEstimate}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-98 relative z-10"
        >
          <Zap className="w-4 h-4" />
          <span>Apply Dynamic Estimate to Active Repair Ticket</span>
        </button>
      )}
    </div>
  );
}
