import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Microscope,
  Wrench,
  Cpu,
  ShieldCheck,
  Zap,
  Filter,
  ChevronRight,
  Layers,
  Clock,
  Sparkles,
  Info,
  X,
  FileCheck,
  Box,
  HelpCircle,
  ArrowUpRight,
  Calculator,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Droplets,
  HardDrive
} from 'lucide-react';
import {
  SUPPORTED_DEVICES_DATABASE,
  SupportedDeviceModel,
  BoardRepairCapability
} from '../data/supportedDevicesData.ts';
import { useToast } from './Toast.tsx';

interface SupportedDevicesDatabaseProps {
  onSelectDeviceForIntake?: (manufacturer: string, model: string) => void;
  onOpenPriceCalculator?: (manufacturer: string, model: string) => void;
}

export default function SupportedDevicesDatabase({
  onSelectDeviceForIntake,
  onOpenPriceCalculator
}: SupportedDevicesDatabaseProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');
  const [selectedDeviceModal, setSelectedDeviceModal] = useState<SupportedDeviceModel | null>(null);
  
  // Model Number / Serial Instant Checker state
  const [checkModelInput, setCheckModelInput] = useState('');
  const [checkedDeviceResult, setCheckedDeviceResult] = useState<{
    found: boolean;
    device?: SupportedDeviceModel;
    query: string;
  } | null>(null);

  // Unlisted device assessment modal
  const [isUnlistedModalOpen, setIsUnlistedModalOpen] = useState(false);
  const [unlistedBrand, setUnlistedBrand] = useState('');
  const [unlistedModel, setUnlistedModel] = useState('');
  const [unlistedIssue, setUnlistedIssue] = useState('');
  const [unlistedSubmitted, setUnlistedSubmitted] = useState(false);

  // Filter logic
  const filteredDevices = useMemo(() => {
    return SUPPORTED_DEVICES_DATABASE.filter((device) => {
      // Free text match against model name, manufacturer, model numbers, board ID, chipset, symptoms
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        device.modelName.toLowerCase().includes(q) ||
        device.manufacturer.toLowerCase().includes(q) ||
        device.boardId.toLowerCase().includes(q) ||
        device.chipset.toLowerCase().includes(q) ||
        device.modelNumbers.some((num) => num.toLowerCase().includes(q)) ||
        device.commonSymptoms.some((symp) => symp.toLowerCase().includes(q));

      // Manufacturer match
      const matchesMfr =
        selectedManufacturer === 'ALL' ||
        device.manufacturer.toUpperCase() === selectedManufacturer.toUpperCase();

      // Category match
      const matchesCat =
        selectedCategory === 'ALL' ||
        device.category.toUpperCase() === selectedCategory.toUpperCase();

      // Repair Tier filter match
      const matchesTier =
        selectedTierFilter === 'ALL' ||
        device.supportedRepairs.some(
          (r) => r.tier.toLowerCase() === selectedTierFilter.toLowerCase()
        );

      return matchesSearch && matchesMfr && matchesCat && matchesTier;
    });
  }, [searchQuery, selectedManufacturer, selectedCategory, selectedTierFilter]);

  // Handle instant checker button
  const handleCheckModel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = checkModelInput.trim();
    if (!query) {
      setCheckedDeviceResult(null);
      return;
    }

    const q = query.toLowerCase();
    const match = SUPPORTED_DEVICES_DATABASE.find((device) => {
      return (
        device.modelName.toLowerCase().includes(q) ||
        device.modelNumbers.some((num) => num.toLowerCase() === q || num.toLowerCase().includes(q)) ||
        device.boardId.toLowerCase().includes(q)
      );
    });

    if (match) {
      setCheckedDeviceResult({ found: true, device: match, query });
      showToast(`Supported! ${match.manufacturer} ${match.modelName} is on file.`, 'success');
    } else {
      setCheckedDeviceResult({ found: false, query });
      showToast(`Model "${query}" not found in standard index. Submit for unlisted evaluation.`, 'info');
    }
  };

  const handleUnlistedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlistedBrand || !unlistedModel) {
      showToast('Please enter both manufacturer and model name.', 'error');
      return;
    }
    setUnlistedSubmitted(true);
    showToast('Unlisted device assessment submitted to Spokane Lab master technicians!', 'success');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedManufacturer('ALL');
    setSelectedCategory('ALL');
    setSelectedTierFilter('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-mono font-bold border border-blue-500/30">
            <Microscope className="w-3.5 h-3.5 text-blue-400" />
            SPOKANE LAB BOARD SUPPORT MATRIX
          </div>

          <h1 className="text-3xl sm:text-5xl font-playfair font-black tracking-tight text-white leading-tight">
            Advanced Board Repair <br />
            <span className="text-blue-400">Device Compatibility Database</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Query our live inventory of schematics, boardviews, donor board staging, and micro-soldering capabilities for smartphones, laptops, consoles, and tablets.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full IPC-A-610 Certified Lab</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <FileCheck className="w-4 h-4 text-blue-400" />
              <span>Full Schematics & Boardview Library</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Box className="w-4 h-4 text-amber-400" />
              <span>Spokane Local Staging Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Quick Checker Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Instant Model & Board ID Checker
            </h3>
            <p className="text-xs text-slate-500">
              Enter exact model number (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">A2849</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">SM-S928B</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">820-02685</code>) to verify lab readiness.
            </p>
          </div>

          <button
            onClick={() => setIsUnlistedModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 transition-all flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Device Not Listed? Request Assessment</span>
          </button>
        </div>

        <form onSubmit={handleCheckModel} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={checkModelInput}
              onChange={(e) => setCheckModelInput(e.target.value)}
              placeholder="Enter Model #, Board ID, or Device Name (e.g. A2849, SM-S928B, Steam Deck)..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {checkModelInput && (
              <button
                type="button"
                onClick={() => {
                  setCheckModelInput('');
                  setCheckedDeviceResult(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Check Support Status</span>
          </button>
        </form>

        {/* Checker Result Display Box */}
        {checkedDeviceResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${
              checkedDeviceResult.found
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            {checkedDeviceResult.found && checkedDeviceResult.device ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold rounded-full">
                      FULL TIER 3/4 LAB SUPPORTED
                    </span>
                    <span className="text-xs text-emerald-700 font-mono">
                      Board: {checkedDeviceResult.device.boardId}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {checkedDeviceResult.device.manufacturer} {checkedDeviceResult.device.modelName}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Model Numbers: {checkedDeviceResult.device.modelNumbers.join(', ')} • Chipset: {checkedDeviceResult.device.chipset}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDeviceModal(checkedDeviceResult.device!)}
                    className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    View Specs
                  </button>

                  {onSelectDeviceForIntake && (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectDeviceForIntake(
                          checkedDeviceResult.device!.manufacturer,
                          checkedDeviceResult.device!.modelName
                        )
                      }
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <span>Start Triage</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[10px] font-mono font-bold rounded-full">
                      UNINDEXED MODEL
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Model "{checkedDeviceResult.query}" not in standard database index
                  </h4>
                  <p className="text-xs text-amber-800">
                    We support over 300+ custom board layouts! Submit your exact device details for a fast 15-minute schematic assessment by Spokane Lab engineers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUnlistedModel(checkedDeviceResult.query);
                    setIsUnlistedModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                >
                  Request Assessment &rarr;
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Main Database Browsing & Filter Toolbar */}
      <div className="space-y-6">
        {/* Search Input & Filters Container */}
        <div className="bg-slate-100/70 p-4 sm:p-6 rounded-3xl space-y-4 border border-slate-200/80">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, model #, board ID, chip, or symptom..."
                className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results Counter & Reset */}
            <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-bold text-slate-500">
              <span className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-slate-700">
                Showing <strong className="text-slate-900">{filteredDevices.length}</strong> of{' '}
                {SUPPORTED_DEVICES_DATABASE.length} Models
              </span>

              {(searchQuery ||
                selectedManufacturer !== 'ALL' ||
                selectedCategory !== 'ALL' ||
                selectedTierFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips Toolbar */}
          <div className="space-y-3 pt-2 border-t border-slate-200/80">
            {/* Brands */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Brand:
              </span>
              {['ALL', 'Apple', 'Samsung', 'Google', 'Sony', 'Valve', 'Nintendo', 'Microsoft'].map((mfr) => {
                const isActive = selectedManufacturer.toUpperCase() === mfr.toUpperCase();
                return (
                  <button
                    key={mfr}
                    type="button"
                    onClick={() => setSelectedManufacturer(mfr)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {mfr === 'ALL' ? 'All Brands' : mfr}
                  </button>
                );
              })}
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Category:
              </span>
              {['ALL', 'Smartphone', 'Laptop', 'Tablet', 'Gaming Handheld', 'Console'].map((cat) => {
                const isActive = selectedCategory.toUpperCase() === cat.toUpperCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </button>
                );
              })}
            </div>

            {/* Repair Tiers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                Repair Capability:
              </span>
              {[
                { id: 'ALL', label: 'All Capabilities' },
                { id: 'Tier 3 Micro-Soldering', label: 'Tier 3 IC & PMIC' },
                { id: 'Tier 4 BGA Reballing', label: 'Tier 4 BGA / CPU' },
                { id: 'Forensic Data Recovery', label: 'NAND Data Recovery' },
                { id: 'Ultrasonic Water Recovery', label: 'Ultrasonic Decon' },
                { id: 'Port & FPC Rework', label: 'Port & FPC Rework' }
              ].map((tier) => {
                const isActive = selectedTierFilter.toLowerCase() === tier.id.toLowerCase();
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierFilter(tier.id)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-200/80'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Devices Cards Grid */}
        {filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device) => (
              <motion.div
                key={device.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group relative overflow-hidden"
              >
                {/* Top Header info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-lg">
                        {device.manufacturer}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                        {device.category}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {device.boardId}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {device.modelName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                      Models: {device.modelNumbers.join(', ')}
                    </p>
                  </div>

                  {/* Badges Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{device.chipset}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {device.donorBoardStock}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {device.releaseYear}
                      </span>
                    </div>
                  </div>

                  {/* Common Symptoms preview */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Common Supported Symptoms:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {device.commonSymptoms.slice(0, 3).map((symp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-medium rounded-md border border-slate-200 line-clamp-1"
                        >
                          {symp}
                        </span>
                      ))}
                      {device.commonSymptoms.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">
                          +{device.commonSymptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-700">
                      {device.supportedRepairs.length} Micro-Soldering Tiers
                    </span>
                    <span className="text-emerald-600 font-bold font-mono">
                      ~96% Lab Success
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDeviceModal(device)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all text-center"
                    >
                      Inspect Board
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectDeviceForIntake) {
                          onSelectDeviceForIntake(device.manufacturer, device.modelName);
                        } else {
                          setSelectedDeviceModal(device);
                        }
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Intake</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4 bg-white border border-slate-200 rounded-3xl">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900">No matching devices found</h3>
              <p className="text-xs text-slate-500">
                Try searching for broader keywords or clear your search filters. We also accept custom unlisted devices for board schematics evaluation.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsUnlistedModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                Submit Unlisted Device
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Device Detail Specs Modal */}
      <AnimatePresence>
        {selectedDeviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded uppercase">
                      {selectedDeviceModal.manufacturer}
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                      {selectedDeviceModal.category}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                      {selectedDeviceModal.supportTier}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {selectedDeviceModal.modelName}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Board Architecture: <strong className="text-slate-800">{selectedDeviceModal.boardId}</strong> • Chipset: <strong className="text-slate-800">{selectedDeviceModal.chipset}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDeviceModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Schematics Library
                  </span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                    {selectedDeviceModal.schematicsStatus}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Donor Board Staging
                  </span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-amber-500" />
                    {selectedDeviceModal.donorBoardStock}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Model Numbers
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 truncate block">
                    {selectedDeviceModal.modelNumbers.join(', ')}
                  </span>
                </div>
              </div>

              {/* Supported Micro-soldering Repairs list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Spokane Lab Micro-Soldering & Tier 3/4 Capabilities
                </h4>

                <div className="space-y-3">
                  {selectedDeviceModal.supportedRepairs.map((repair) => (
                    <div
                      key={repair.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">
                            {repair.tier}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900">{repair.name}</h5>
                        </div>

                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {repair.typicalSuccessRate}% Success
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {repair.description}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 pt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Average Bench Turnaround: {repair.averageTurnaroundDays}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supported Symptoms Tag Cloud */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Known Board Failure Symptoms Supported
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDeviceModal.commonSymptoms.map((symp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-xl border border-slate-200"
                    >
                      {symp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDeviceModal(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Close Specification
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onOpenPriceCalculator && (
                    <button
                      type="button"
                      onClick={() => {
                        const dev = selectedDeviceModal;
                        setSelectedDeviceModal(null);
                        onOpenPriceCalculator(dev.manufacturer, dev.modelName);
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calculator className="w-4 h-4 text-blue-600" />
                      <span>Price Guide</span>
                    </button>
                  )}

                  {onSelectDeviceForIntake && (
                    <button
                      type="button"
                      onClick={() => {
                        const dev = selectedDeviceModal;
                        setSelectedDeviceModal(null);
                        onSelectDeviceForIntake(dev.manufacturer, dev.modelName);
                      }}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Initiate Triage</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unlisted Device Assessment Modal */}
      <AnimatePresence>
        {isUnlistedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Unlisted Device Schematic Request</h3>
                  <p className="text-xs text-slate-500">
                    Spokane Lab engineers will evaluate board layout availability within 15 minutes.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsUnlistedModalOpen(false);
                    setUnlistedSubmitted(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {unlistedSubmitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">Assessment Request Received!</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Our bench engineers are reviewing board schematics for <strong>{unlistedBrand} {unlistedModel}</strong>. You can proceed with standard intake right away!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUnlistedModalOpen(false);
                      setUnlistedSubmitted(false);
                      if (onSelectDeviceForIntake) {
                        onSelectDeviceForIntake(unlistedBrand || 'Other', unlistedModel || 'Custom Board');
                      }
                    }}
                    className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Proceed to Device Intake &rarr;
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUnlistedSubmit} className="space-y-4 text-xs font-bold text-slate-700">
                  <div className="space-y-1">
                    <label className="block text-slate-800">Manufacturer / Brand *</label>
                    <input
                      type="text"
                      required
                      value={unlistedBrand}
                      onChange={(e) => setUnlistedBrand(e.target.value)}
                      placeholder="e.g. Apple, OnePlus, Asus, Motorola, Razer..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-800">Model Name & Model Number *</label>
                    <input
                      type="text"
                      required
                      value={unlistedModel}
                      onChange={(e) => setUnlistedModel(e.target.value)}
                      placeholder="e.g. ROG Phone 7 Ultimate, OnePlus 11 (CPH2449)..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-800">Primary Board Symptom / Issue</label>
                    <textarea
                      rows={3}
                      value={unlistedIssue}
                      onChange={(e) => setUnlistedIssue(e.target.value)}
                      placeholder="Describe what happened (e.g. Water damage, no power, dropped in ocean, charging port torn)..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUnlistedModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md"
                    >
                      Submit for Evaluation
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
