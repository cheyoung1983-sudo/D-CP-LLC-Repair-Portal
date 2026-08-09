import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  ShoppingCart, 
  Tag, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Smartphone, 
  Wrench, 
  Box, 
  Trash2, 
  Edit, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export interface RepairPartAsset {
  id: string;
  sku: string;
  name: string;
  category: 'Screens' | 'Batteries' | 'Charging Ports' | 'Chips & ICs' | 'Soldering & Flux' | 'Glass & Frames';
  compatibility: string;
  stockLevel: number;
  minThreshold: number;
  unitCost: number;
  binLocation: string;
  lastRestocked: string;
}

const INITIAL_PARTS: RepairPartAsset[] = [
  {
    id: 'part_1',
    sku: 'SKU-SCR-IP15P',
    name: 'iPhone 15 Pro Super Retina OLED Display Assembly',
    category: 'Screens',
    compatibility: 'iPhone 15 Pro (A2848)',
    stockLevel: 2, // LOW STOCK
    minThreshold: 5,
    unitCost: 185.00,
    binLocation: 'Vault Rack A-02',
    lastRestocked: '2026-08-01'
  },
  {
    id: 'part_2',
    sku: 'SKU-BAT-MAC16',
    name: 'MacBook Pro 16" M2/M3 High-Cap Battery Pack',
    category: 'Batteries',
    compatibility: 'MacBook Pro 16" (A2780 / A2992)',
    stockLevel: 4,
    minThreshold: 3,
    unitCost: 120.00,
    binLocation: 'Vault Rack B-05',
    lastRestocked: '2026-08-03'
  },
  {
    id: 'part_3',
    sku: 'SKU-PRT-USBC-IP15',
    name: 'iPhone 15 Series USB-C Flex Port Assembly',
    category: 'Charging Ports',
    compatibility: 'iPhone 15 / 15 Plus / 15 Pro',
    stockLevel: 1, // LOW STOCK
    minThreshold: 8,
    unitCost: 18.50,
    binLocation: 'Bin C-12',
    lastRestocked: '2026-07-28'
  },
  {
    id: 'part_4',
    sku: 'SKU-IC-ISL6259',
    name: 'ISL6259AHRTZ Charging PMIC IC Chip',
    category: 'Chips & ICs',
    compatibility: 'MacBook Logic Boards (PPBUS_G3H Rail)',
    stockLevel: 14,
    minThreshold: 10,
    unitCost: 6.20,
    binLocation: 'SMD Drawer D-01',
    lastRestocked: '2026-08-05'
  },
  {
    id: 'part_5',
    sku: 'SKU-SCR-S24U',
    name: 'Samsung Galaxy S24 Ultra Dynamic AMOLED 2X Frame',
    category: 'Screens',
    compatibility: 'Galaxy S24 Ultra (SM-S928U)',
    stockLevel: 1, // LOW STOCK
    minThreshold: 4,
    unitCost: 210.00,
    binLocation: 'Vault Rack A-06',
    lastRestocked: '2026-07-20'
  },
  {
    id: 'part_6',
    sku: 'SKU-BAT-IP14P',
    name: 'iPhone 14 Pro Original Capacity Battery',
    category: 'Batteries',
    compatibility: 'iPhone 14 Pro (A2659)',
    stockLevel: 12,
    minThreshold: 6,
    unitCost: 28.00,
    binLocation: 'Bin B-02',
    lastRestocked: '2026-08-04'
  },
  {
    id: 'part_7',
    sku: 'SKU-FLX-NC559',
    name: 'AMTECH NC-559-V2-TF No-Clean Solder Flux Paste (30cc)',
    category: 'Soldering & Flux',
    compatibility: 'Universal Micro-soldering Bench',
    stockLevel: 3, // LOW STOCK
    minThreshold: 6,
    unitCost: 22.00,
    binLocation: 'Bench Supply Shelf 1',
    lastRestocked: '2026-07-15'
  },
  {
    id: 'part_8',
    sku: 'SKU-GLS-IP15PM',
    name: 'iPhone 15 Pro Max Titanium Rear Glass Panel with MagSafe',
    category: 'Glass & Frames',
    compatibility: 'iPhone 15 Pro Max (A2849)',
    stockLevel: 7,
    minThreshold: 5,
    unitCost: 45.00,
    binLocation: 'Bin Rack G-08',
    lastRestocked: '2026-08-02'
  }
];

export default function AssetManager() {
  const { showToast } = useToast();

  const [parts, setParts] = useState<RepairPartAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // New Part Form state
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<RepairPartAsset['category']>('Screens');
  const [newCompatibility, setNewCompatibility] = useState('');
  const [newStock, setNewStock] = useState(5);
  const [newMinThreshold, setNewMinThreshold] = useState(3);
  const [newUnitCost, setNewUnitCost] = useState(25.00);
  const [newBinLocation, setNewBinLocation] = useState('Vault Rack A-01');

  // Load from LocalStorage or initialize
  useEffect(() => {
    const saved = localStorage.getItem('dcp_spokane_inventory');
    if (saved) {
      try {
        setParts(JSON.parse(saved));
      } catch (e) {
        setParts(INITIAL_PARTS);
      }
    } else {
      setParts(INITIAL_PARTS);
      localStorage.setItem('dcp_spokane_inventory', JSON.stringify(INITIAL_PARTS));
    }
  }, []);

  const saveInventory = (updatedParts: RepairPartAsset[]) => {
    setParts(updatedParts);
    localStorage.setItem('dcp_spokane_inventory', JSON.stringify(updatedParts));
  };

  // Adjust Stock (+ or -)
  const handleStockChange = (id: string, delta: number) => {
    const updated = parts.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stockLevel + delta);
        return {
          ...p,
          stockLevel: newStock,
          lastRestocked: delta > 0 ? new Date().toISOString().split('T')[0] : p.lastRestocked
        };
      }
      return p;
    });

    saveInventory(updated);
    const targetPart = updated.find(p => p.id === id);
    if (targetPart) {
      if (targetPart.stockLevel <= targetPart.minThreshold) {
        showToast(`⚠️ Alert: ${targetPart.name} is now LOW STOCK (${targetPart.stockLevel} remaining)!`, 'info');
      } else {
        showToast(`Updated stock for ${targetPart.name}: ${targetPart.stockLevel} units.`, 'success');
      }
    }
  };

  // Add new part
  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Please enter a valid part name.', 'info');
      return;
    }

    const newPart: RepairPartAsset = {
      id: `part_${Date.now()}`,
      sku: newSku.trim() || `SKU-NEW-${Math.floor(Math.random() * 8999 + 1000)}`,
      name: newName.trim(),
      category: newCategory,
      compatibility: newCompatibility.trim() || 'Universal Hardware',
      stockLevel: Number(newStock) || 1,
      minThreshold: Number(newMinThreshold) || 3,
      unitCost: Number(newUnitCost) || 10.00,
      binLocation: newBinLocation.trim() || 'Bin A-01',
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    const updated = [newPart, ...parts];
    saveInventory(updated);

    // Reset Form
    setNewSku('');
    setNewName('');
    setNewCompatibility('');
    setNewStock(5);
    setNewMinThreshold(3);
    setNewUnitCost(25.0);
    setIsAddingPart(false);

    showToast(`Added ${newPart.name} to Spokane Laboratory Vault!`, 'success');
  };

  // Delete Part
  const handleDeletePart = (id: string, name: string) => {
    const updated = parts.filter(p => p.id !== id);
    saveInventory(updated);
    showToast(`Removed ${name} from inventory catalog.`, 'info');
  };

  // Low Stock Items
  const lowStockParts = parts.filter(p => p.stockLevel <= p.minThreshold);

  // Filtered Parts
  const filteredParts = parts.filter(part => {
    const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          part.compatibility.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !showLowStockOnly || (part.stockLevel <= part.minThreshold);
    return matchesCategory && matchesSearch && matchesLowStock;
  });

  // Calculate Metrics
  const totalSkuCount = parts.length;
  const totalLowStockCount = lowStockParts.length;
  const totalValuation = parts.reduce((acc, p) => acc + (p.stockLevel * p.unitCost), 0);

  // Export Purchase Order CSV
  const exportPurchaseOrderCSV = () => {
    const csvRows = [
      ['SKU', 'Part Name', 'Category', 'Current Stock', 'Min Threshold', 'Unit Cost ($)', 'Bin Location', 'Suggested Reorder Qty'],
      ...lowStockParts.map(p => [
        p.sku,
        `"${p.name}"`,
        p.category,
        p.stockLevel,
        p.minThreshold,
        p.unitCost.toFixed(2),
        p.binLocation,
        p.minThreshold * 2 - p.stockLevel
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Spokane_Parts_Reorder_PO_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported Supplier Purchase Order CSV for ${lowStockParts.length} low-stock parts.`, 'success');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full -mr-24 -mt-24 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Spokane Vault Stock Control
              </span>
              <span className="text-xs text-slate-400 font-mono">Real-time Part Telemetry</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Asset Manager & Inventory Tracker
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingPart(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU Part</span>
          </button>
        </div>
      </div>

      {/* Urgent Low-Stock Notification Banner */}
      {totalLowStockCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border-2 border-amber-500/40 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <span>Low-Stock Threshold Alert Triggered!</span>
                <span className="text-xs font-mono font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {totalLowStockCount} SKUs Critical
                </span>
              </h4>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                The following components are below minimum threshold: {' '}
                <span className="text-amber-300 font-bold">
                  {lowStockParts.map(p => p.sku).join(', ')}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={exportPurchaseOrderCSV}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Supplier PO (.CSV)</span>
          </button>
        </motion.div>
      )}

      {/* Inventory Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Cataloged SKUs</span>
          <span className="text-2xl font-black text-white">{totalSkuCount} Parts</span>
          <span className="text-[10px] text-slate-500 block">Screens, Batteries, Ports & PMICs</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Low-Stock Alert Triggered</span>
          <span className={`text-2xl font-black ${totalLowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {totalLowStockCount} SKUs
          </span>
          <span className="text-[10px] text-slate-500 block">Below required bench minimum threshold</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Vault Valuation</span>
          <span className="text-2xl font-black text-emerald-400">${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="text-[10px] text-slate-500 block">Spokane Laboratory Bench inventory</span>
        </div>
      </div>

      {/* Controls Bar: Search + Category Filters */}
      <div className="space-y-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, Part Name, or Model (e.g., iPhone 15, ISL6259)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
              showLowStockOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Show Low-Stock Only ({totalLowStockCount})</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Screens', 'Batteries', 'Charging Ports', 'Chips & ICs', 'Soldering & Flux', 'Glass & Frames'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Part Modal / Card */}
      <AnimatePresence>
        {isAddingPart && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddPartSubmit}
            className="bg-slate-950 border-2 border-amber-500/40 p-5 rounded-2xl space-y-4 relative z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Add New Inventory SKU Item
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingPart(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SKU Code</label>
                <input
                  type="text"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="e.g. SKU-SCR-IP15P"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Part Description</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Display Assembly"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Part Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="Screens">Screens</option>
                  <option value="Batteries">Batteries</option>
                  <option value="Charging Ports">Charging Ports</option>
                  <option value="Chips & ICs">Chips & ICs</option>
                  <option value="Soldering & Flux">Soldering & Flux</option>
                  <option value="Glass & Frames">Glass & Frames</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compatibility</label>
                <input
                  type="text"
                  value={newCompatibility}
                  onChange={(e) => setNewCompatibility(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro A2848"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vault Location Bin</label>
                <input
                  type="text"
                  value={newBinLocation}
                  onChange={(e) => setNewBinLocation(e.target.value)}
                  placeholder="e.g. Bin A-02"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Initial Stock</label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Alert Threshold</label>
                <input
                  type="number"
                  value={newMinThreshold}
                  onChange={(e) => setNewMinThreshold(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newUnitCost}
                  onChange={(e) => setNewUnitCost(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingPart(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md"
              >
                Save Component SKU
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Parts Inventory List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {filteredParts.map((part) => {
          const isLowStock = part.stockLevel <= part.minThreshold;

          return (
            <div
              key={part.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                isLowStock
                  ? 'bg-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950 border-slate-800/90'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                      {part.sku}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {part.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {part.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {part.compatibility}
                  </p>
                </div>

                <button
                  onClick={() => handleDeletePart(part.id, part.name)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all"
                  title="Delete SKU"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Stock Level</span>
                  <span className={`font-mono font-black text-sm block mt-0.5 ${isLowStock ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                    {part.stockLevel} units
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Min Threshold</span>
                  <span className="font-mono font-bold text-slate-300 block mt-0.5">
                    {part.minThreshold} min
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Vault Location</span>
                  <span className="font-mono font-bold text-slate-300 block truncate mt-0.5">
                    {part.binLocation}
                  </span>
                </div>
              </div>

              {/* Adjust Stock Level Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Quick Restock / Use:</span>
                  <button
                    onClick={() => handleStockChange(part.id, -1)}
                    disabled={part.stockLevel === 0}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 disabled:opacity-30 transition-all"
                    title="Use 1 unit"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStockChange(part.id, 1)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg border border-slate-800 transition-all"
                    title="Add 1 unit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStockChange(part.id, 5)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-mono text-[10px] font-bold rounded-lg border border-slate-800 transition-all"
                    title="Restock +5 units"
                  >
                    +5
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">
                    ${part.unitCost.toFixed(2)} / unit
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredParts.length === 0 && (
        <div className="bg-slate-950 border border-slate-800 border-dashed rounded-2xl p-8 text-center text-slate-500 space-y-2">
          <Package className="w-10 h-10 text-slate-700 mx-auto" />
          <h5 className="text-sm font-bold text-slate-400">No Parts Matching Filter</h5>
          <p className="text-xs">Try clearing your search query or category selection.</p>
        </div>
      )}
    </div>
  );
}
