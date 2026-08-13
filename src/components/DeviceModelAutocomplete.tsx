import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Smartphone, 
  Laptop, 
  Gamepad2, 
  Tablet, 
  Check, 
  Sparkles, 
  X,
  Database,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SUPPORTED_DEVICES_DATABASE, 
  SupportedDeviceModel 
} from '../data/supportedDevicesData.ts';
import { Manufacturer } from '../types.ts';

interface DeviceModelAutocompleteProps {
  value: string;
  onChange: (modelName: string, matchedDevice?: SupportedDeviceModel) => void;
  selectedManufacturer?: Manufacturer;
  onSelectManufacturer?: (manufacturer: Manufacturer) => void;
  error?: string;
  disabled?: boolean;
}

export default function DeviceModelAutocomplete({
  value,
  onChange,
  selectedManufacturer,
  onSelectManufacturer,
  error,
  disabled = false
}: DeviceModelAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find exact or partial match in database for the active value
  const activeMatchedDevice = useMemo(() => {
    if (!value || value.trim().length < 2) return null;
    const cleanVal = value.trim().toLowerCase();
    return SUPPORTED_DEVICES_DATABASE.find(d => 
      d.modelName.toLowerCase() === cleanVal ||
      d.modelNumbers.some(mn => mn.toLowerCase() === cleanVal) ||
      d.boardId.toLowerCase() === cleanVal
    ) || SUPPORTED_DEVICES_DATABASE.find(d => 
      d.modelName.toLowerCase().includes(cleanVal)
    );
  }, [value]);

  // Filter dataset as user types
  const filteredSuggestions = useMemo(() => {
    if (!value || value.trim().length === 0) {
      // If empty, return featured or top models
      return SUPPORTED_DEVICES_DATABASE.slice(0, 8);
    }

    const query = value.toLowerCase().trim();
    return SUPPORTED_DEVICES_DATABASE.filter(device => {
      const nameMatch = device.modelName.toLowerCase().includes(query);
      const modelNumMatch = device.modelNumbers.some(num => num.toLowerCase().includes(query));
      const boardMatch = device.boardId.toLowerCase().includes(query);
      const mfrMatch = device.manufacturer.toLowerCase().includes(query);
      const categoryMatch = device.category.toLowerCase().includes(query);
      const chipsetMatch = device.chipset.toLowerCase().includes(query);

      return nameMatch || modelNumMatch || boardMatch || mfrMatch || categoryMatch || chipsetMatch;
    }).slice(0, 8); // Top 8 matches
  }, [value]);

  // Featured models for quick chips
  const featuredQuickChips = useMemo(() => {
    return SUPPORTED_DEVICES_DATABASE.filter(d => d.featured).slice(0, 5);
  }, []);

  const handleSelectDevice = (device: SupportedDeviceModel) => {
    onChange(device.modelName, device);

    // Auto-update manufacturer if callback provided
    if (onSelectManufacturer) {
      const mfrLower = device.manufacturer.toLowerCase();
      if (mfrLower === 'apple') {
        onSelectManufacturer(Manufacturer.APPLE);
      } else if (mfrLower === 'samsung') {
        onSelectManufacturer(Manufacturer.SAMSUNG);
      } else {
        onSelectManufacturer(Manufacturer.OTHER);
      }
    }

    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        handleSelectDevice(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Smartphone': return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
      case 'Laptop': return <Laptop className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Tablet': return <Tablet className="w-3.5 h-3.5 text-purple-500" />;
      case 'Gaming Handheld':
      case 'Console': return <Gamepad2 className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>Model Variant & Board Lookup</span>
          <span className="text-[10px] font-mono text-blue-600 font-normal bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Auto-Complete
          </span>
        </label>

        {activeMatchedDevice && (
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified Board Support
          </span>
        )}
      </div>

      {/* Input Field with Search Icon */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center gap-1">
          <Search className="w-4 h-4 text-slate-400" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="e.g. iPhone 15 Pro Max, A2849, 820-02685..."
          className={`w-full h-12 pl-10 pr-10 rounded-xl border-2 bg-slate-50 focus:bg-white outline-none transition-all font-medium text-slate-900 ${
            error 
              ? 'border-red-400 focus:border-red-500' 
              : activeMatchedDevice 
              ? 'border-emerald-400 focus:border-emerald-500' 
              : 'border-slate-100 focus:border-slate-900'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(true);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Validation error message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Autocomplete Dropdown Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 max-h-96 overflow-y-auto"
          >
            {/* Header bar in popup */}
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
              <span className="font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Spokane Board Repair Database
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {filteredSuggestions.length} match{filteredSuggestions.length !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Quick Chips if Query is Empty or Short */}
            {(!value || value.trim().length === 0) && (
              <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Popular Supported Models:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {featuredQuickChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleSelectDevice(chip)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{chip.modelName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results List */}
            {filteredSuggestions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredSuggestions.map((device, index) => {
                  const isHighlighted = index === highlightedIndex;
                  const isCurrentValue = value.toLowerCase().trim() === device.modelName.toLowerCase().trim();

                  return (
                    <div
                      key={device.id}
                      onClick={() => handleSelectDevice(device)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`p-3.5 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        isHighlighted 
                          ? 'bg-blue-50/90 text-blue-950' 
                          : isCurrentValue 
                          ? 'bg-emerald-50/60' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 truncate">
                            {device.modelName}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-full border border-slate-200 flex items-center gap-1 shrink-0">
                            {getCategoryIcon(device.category)}
                            {device.manufacturer}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 flex-wrap">
                          <span>Board ID: <strong className="text-slate-800">{device.boardId}</strong></span>
                          <span>Models: <strong className="text-slate-700">{device.modelNumbers.join(', ')}</strong></span>
                          <span className="text-slate-400">• {device.chipset}</span>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {device.supportTier}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {device.donorBoardStock}
                          </span>
                        </div>
                      </div>

                      {isCurrentValue && (
                        <div className="p-1.5 bg-emerald-500 text-white rounded-full shrink-0 mt-1">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">
                  No exact database match for "{value}"
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  You can still submit this custom model! Spokane engineers perform custom schematic assessments for unlisted models.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verified Board Match Info Box */}
      {activeMatchedDevice && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs shadow-lg mt-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-white">
                {activeMatchedDevice.modelName} (Verified)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              PCB: {activeMatchedDevice.boardId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">Schematics Status:</span>
              <span className="font-semibold">{activeMatchedDevice.schematicsStatus}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Donor Staging:</span>
              <span className="font-semibold text-emerald-400">{activeMatchedDevice.donorBoardStock}</span>
            </div>
          </div>

          {activeMatchedDevice.commonSymptoms && activeMatchedDevice.commonSymptoms.length > 0 && (
            <div className="pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Common Board Symptoms for {activeMatchedDevice.modelName}:
              </span>
              <div className="flex flex-wrap gap-1">
                {activeMatchedDevice.commonSymptoms.slice(0, 3).map((sym, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    • {sym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
