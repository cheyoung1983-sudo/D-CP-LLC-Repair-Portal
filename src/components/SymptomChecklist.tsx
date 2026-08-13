import React, { useState } from 'react';
import { 
  Droplets, 
  ZapOff, 
  Tv, 
  BatteryLow, 
  Plug, 
  Flame, 
  RefreshCw, 
  VolumeX, 
  Camera, 
  CheckCircle2, 
  X, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  Wrench,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceTier } from '../types.ts';

export interface SymptomItem {
  id: string;
  label: string;
  category: 'Display & Touch' | 'Power & Battery' | 'Board & Hardware' | 'Audio & Camera';
  recommendedTier: ServiceTier;
  tierLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const DIAGNOSTIC_SYMPTOMS: SymptomItem[] = [
  {
    id: 'screen_flickering',
    label: 'Screen Flickering',
    category: 'Display & Touch',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    tierLabel: 'Tier 2 (Display Renewal)',
    icon: Tv,
    description: 'Display lines, strobe flickering, or intermittent backlight failure.',
    severity: 'medium',
  },
  {
    id: 'liquid_damage',
    label: 'Liquid Damage',
    category: 'Board & Hardware',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    tierLabel: 'Tier 3 (Board Rework)',
    icon: Droplets,
    description: 'Exposed to water, beverage, or moisture; corrosion risk.',
    severity: 'critical',
  },
  {
    id: 'no_power',
    label: 'No Power / Dead Unit',
    category: 'Power & Battery',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    tierLabel: 'Tier 3 (Board Rework)',
    icon: ZapOff,
    description: 'Device completely unresponsive to charger, reset, or power button.',
    severity: 'high',
  },
  {
    id: 'touch_unresponsive',
    label: 'Touchscreen Unresponsive',
    category: 'Display & Touch',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    tierLabel: 'Tier 2 (Display Renewal)',
    icon: Tv,
    description: 'Ghost touches, dead screen zones, or digitizer non-responsive.',
    severity: 'medium',
  },
  {
    id: 'rapid_battery_drain',
    label: 'Rapid Battery Drain',
    category: 'Power & Battery',
    recommendedTier: ServiceTier.TIER_1_POWER,
    tierLabel: 'Tier 1 (Power & Port)',
    icon: BatteryLow,
    description: 'Battery percentage drops rapidly or device swells/heats up.',
    severity: 'low',
  },
  {
    id: 'charging_port_issue',
    label: 'Charging Port Loose',
    category: 'Power & Battery',
    recommendedTier: ServiceTier.TIER_1_POWER,
    tierLabel: 'Tier 1 (Power & Port)',
    icon: Plug,
    description: 'Cable must be wiggled to charge or port pins corroded/loose.',
    severity: 'low',
  },
  {
    id: 'overheating',
    label: 'Overheating / Thermal Lockout',
    category: 'Board & Hardware',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    tierLabel: 'Tier 3 (Board Rework)',
    icon: Flame,
    description: 'Device gets hot to touch and triggers thermal shutdown warnings.',
    severity: 'high',
  },
  {
    id: 'bootloop',
    label: 'Stuck on Logo / Bootloop',
    category: 'Board & Hardware',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    tierLabel: 'Tier 3 (Board Rework)',
    icon: RefreshCw,
    description: 'Device reboots continuously or hangs on initial manufacturer logo.',
    severity: 'high',
  },
  {
    id: 'audio_mic_failure',
    label: 'Audio / Mic Failure',
    category: 'Audio & Camera',
    recommendedTier: ServiceTier.TIER_1_POWER,
    tierLabel: 'Tier 1 (Power & Port)',
    icon: VolumeX,
    description: 'Distorted ear speaker, caller cannot hear voice, or silent media.',
    severity: 'low',
  },
  {
    id: 'camera_failure',
    label: 'Camera Failure / Shaky OIS',
    category: 'Audio & Camera',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    tierLabel: 'Tier 2 (Display Renewal)',
    icon: Camera,
    description: 'Black viewfinder, camera app crashes, or optical stabilization vibrating.',
    severity: 'medium',
  },
];

interface SymptomChecklistProps {
  selectedSymptomIds: string[];
  onToggleSymptom: (symptom: SymptomItem) => void;
  onClearAll: () => void;
  onApplyRecommendedTier?: (tier: ServiceTier) => void;
  currentServiceTier?: ServiceTier;
}

export default function SymptomChecklist({
  selectedSymptomIds,
  onToggleSymptom,
  onClearAll,
  onApplyRecommendedTier,
  currentServiceTier,
}: SymptomChecklistProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Display & Touch', 'Power & Battery', 'Board & Hardware', 'Audio & Camera'];

  const filteredSymptoms = DIAGNOSTIC_SYMPTOMS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate highest severity / recommended tier among selected symptoms
  const selectedItems = DIAGNOSTIC_SYMPTOMS.filter((s) => selectedSymptomIds.includes(s.id));
  
  const hasTier3 = selectedItems.some((s) => s.recommendedTier === ServiceTier.TIER_3_BOARD);
  const hasTier2 = selectedItems.some((s) => s.recommendedTier === ServiceTier.TIER_2_DISPLAY);
  const hasTier1 = selectedItems.some((s) => s.recommendedTier === ServiceTier.TIER_1_POWER);

  const highestRecommendedTier = hasTier3
    ? ServiceTier.TIER_3_BOARD
    : hasTier2
    ? ServiceTier.TIER_2_DISPLAY
    : hasTier1
    ? ServiceTier.TIER_1_POWER
    : null;

  const highestTierLabel =
    highestRecommendedTier === ServiceTier.TIER_3_BOARD
      ? 'Tier 3 (Board Rework)'
      : highestRecommendedTier === ServiceTier.TIER_2_DISPLAY
      ? 'Tier 2 (Display Renewal)'
      : highestRecommendedTier === ServiceTier.TIER_1_POWER
      ? 'Tier 1 (Power & Port)'
      : null;

  return (
    <div className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Wrench className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Diagnostic Symptom Pre-Selection
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click reported symptoms below to assist Spokane laboratory technicians with initial triage.
          </p>
        </div>

        {selectedSymptomIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {selectedSymptomIds.length} Selected
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-slate-500 hover:text-red-600 font-semibold underline transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* Symptom Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
        {filteredSymptoms.map((symptom) => {
          const Icon = symptom.icon;
          const isSelected = selectedSymptomIds.includes(symptom.id);

          const severityBadge =
            symptom.severity === 'critical'
              ? 'bg-red-50 text-red-700 border-red-200'
              : symptom.severity === 'high'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : symptom.severity === 'medium'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-100 text-slate-600 border-slate-200';

          return (
            <button
              key={symptom.id}
              type="button"
              onClick={() => onToggleSymptom(symptom)}
              className={`p-3 rounded-xl border-2 text-left transition-all relative flex items-start gap-3 focus:outline-none ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {symptom.label}
                  </span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${severityBadge}`}>
                    {symptom.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {symptom.description}
                </p>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  Recommend: {symptom.tierLabel}
                </span>
              </div>

              {/* Selection Checkmark Badge */}
              <div className="absolute top-2.5 right-2.5">
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-100" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredSymptoms.length === 0 && (
        <div className="text-center py-6 text-slate-400 text-xs">
          No matching diagnostic symptoms found. Try broadening your filter.
        </div>
      )}

      {/* Selected Symptoms & Recommended Tier Banner */}
      {selectedItems.length > 0 && highestRecommendedTier && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200">
                AI Triage Recommendation based on {selectedItems.length} symptom(s):
              </span>
              <span className="text-amber-400 font-black block sm:inline sm:ml-1">
                {highestTierLabel}
              </span>
            </div>
          </div>

          {onApplyRecommendedTier && currentServiceTier !== highestRecommendedTier && (
            <button
              type="button"
              onClick={() => onApplyRecommendedTier(highestRecommendedTier)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition-all shrink-0 shadow-sm"
            >
              Apply Recommended Tier
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
