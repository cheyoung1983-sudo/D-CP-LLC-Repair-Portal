import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  FileText,
  ShieldCheck,
  Calculator,
  TrendingUp,
  Award,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  MapPin,
  Sparkles,
  DollarSign,
  Scale,
  Users,
  FileSpreadsheet,
  Check,
  HelpCircle,
  FileCheck2,
  Lock,
  Layers,
  Zap
} from 'lucide-react';

export default function CompanyBlueprintGovernance() {
  const [activeTab, setActiveTab] = useState<'identity' | 'tax' | 'capex' | 'contracts' | 'workforce' | 'compliance'>('identity');

  // Form 941 Payroll Tax Calculator State
  const [grossWages, setGrossWages] = useState<number>(125000);
  const [highEarnerWagesOver200k, setHighEarnerWagesOver200k] = useState<number>(25000);

  const socSecTax = grossWages * 0.124;
  const medicareTax = grossWages * 0.029;
  const addMedicareTax = highEarnerWagesOver200k * 0.009;
  const totalForm941Liability = socSecTax + medicareTax + addMedicareTax;

  // Capex Bonus Depreciation Calculator State
  const [equipmentCost, setEquipmentCost] = useState<number>(45000);
  const [placedInServicePeriod, setPlacedInServicePeriod] = useState<'2024' | 'early2025' | 'postJan20_2025'>('postJan20_2025');

  const bonusDepreciationRate = placedInServicePeriod === '2024' ? 0.60 : placedInServicePeriod === 'early2025' ? 0.40 : 1.00;
  const immediateWriteOff = equipmentCost * bonusDepreciationRate;
  const taxSavingsEst = immediateWriteOff * 0.21; // 21% corp rate approx

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-bold text-xs rounded-full border border-blue-500/30 uppercase tracking-widest font-mono">
              MASTER OPERATIONAL BLUEPRINT
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30 uppercase tracking-widest font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              SAM.GOV UEI ACTIVE
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Display & Cell Pros LLC
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
            Federal compliance, corporate governance, technical payload specs, state DES procurement alignment, and regional workforce integration framework.
          </p>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Legal Entity:</span>
              <strong className="text-white">Display & Cell Pros LLC</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Trade Name (DBA):</span>
              <strong className="text-blue-300">Display & Cell Pros (D&CP)</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">State Registration:</span>
              <strong className="text-emerald-300">Washington UBI Active</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Primary Lab HQ:</span>
              <strong className="text-slate-200">Spokane, WA 99201</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {[
          { id: 'identity', label: 'Corporate Identity', icon: Building2 },
          { id: 'tax', label: 'Form 941 & Tax Standard', icon: Calculator },
          { id: 'capex', label: 'OBBBA / Sec 179 Capex', icon: TrendingUp },
          { id: 'contracts', label: 'DES Master Contracts', icon: FileCheck2 },
          { id: 'workforce', label: 'Regional Workforce', icon: Users },
          { id: 'compliance', label: 'Merit Review & Risk', icon: Scale }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Corporate Identity */}
      {activeTab === 'identity' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">1. Core Organizational Identifiers</h3>
                <p className="text-xs text-slate-500">
                  Federal awards and procurement identifier framework (SAM.gov & State Registrations).
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono rounded-full uppercase">
                Active Compliance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Legal Corporate Name</span>
                <p className="font-extrabold text-slate-900 text-sm">Display & Cell Pros LLC</p>
                <p className="text-slate-500 text-[11px]">Official name registered with the IRS (as appearing on Form 941 payroll returns).</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Trade Name (DBA)</span>
                <p className="font-extrabold text-slate-900 text-sm">Display & Cell Pros (D&CP)</p>
                <p className="text-slate-500 text-[11px]">Registered operational trade name for commercial and lab interactions.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Unique Entity Identifier (UEI)</span>
                <p className="font-extrabold text-blue-700 text-sm font-mono">12-Alphanumeric SAM ID</p>
                <p className="text-slate-500 text-[11px]">Authoritative identifier via SAM.gov replacing the legacy DUNS number.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Washington State UBI</span>
                <p className="font-extrabold text-slate-900 text-sm font-mono">Unified Business Identifier</p>
                <p className="text-slate-500 text-[11px]">State-level registration identifier for Washington Department of Revenue & DES.</p>
              </div>
            </div>

            {/* SAM.gov Maintenance Checklist */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-sm text-white">SAM.gov Maintenance & Grant Readiness Protocol</h4>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
                  Annual Renewal Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">1. UEI Assignment</strong>
                    <span className="text-slate-400 text-[11px]">Registered directly at SAM.gov to maintain award eligibility.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">2. SAM Activation</strong>
                    <span className="text-slate-400 text-[11px]">All financial data submitted. 7-10 business day verification buffer.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">3. Grants.gov Profile</strong>
                    <span className="text-slate-400 text-[11px]">Active account profile configured for federal grant interactions.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">4. E-Biz POC & AOR</strong>
                    <span className="text-slate-400 text-[11px]">Authorized Organization Representative assigned for official submissions.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Form 941 & Tax Standard */}
      {activeTab === 'tax' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">2. Legal Structure & IRS Form 941 Compliance</h3>
              <p className="text-xs text-slate-500">
                LLC tax classification, quarterly Form 941 wage multipliers, and signature designee protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form 941 Calculator */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    Form 941 Quarterly Tax Multiplier Simulator
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-slate-500">IRS Topic 407</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">
                      Quarterly Taxable Social Security / Medicare Wages ($):
                    </label>
                    <input
                      type="number"
                      value={grossWages}
                      onChange={(e) => setGrossWages(Math.max(0, Number(e.target.value)))}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl bg-white font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-bold block mb-1">
                      Wages Exceeding $200,000 Threshold (Additional Medicare):
                    </label>
                    <input
                      type="number"
                      value={highEarnerWagesOver200k}
                      onChange={(e) => setHighEarnerWagesOver200k(Math.max(0, Number(e.target.value)))}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl bg-white font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Social Security (x0.124):</span>
                      <span className="font-bold text-slate-900">${socSecTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Medicare (x0.029):</span>
                      <span className="font-bold text-slate-900">${medicareTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Additional Medicare (x0.009):</span>
                      <span className="font-bold text-slate-900">${addMedicareTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-sans">
                      <strong className="text-slate-900">Total Form 941 Liability:</strong>
                      <strong className="text-blue-600 text-sm font-mono">${totalForm941Liability.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatory Protocols */}
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <strong className="text-white text-sm">Part 5: Signature Authority</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Must be signed directly by the Corporate Officer or LLC Managing Member declaring examined accuracy under penalties of perjury.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-blue-600" />
                    <strong className="text-slate-900 text-sm">Part 4: Third-Party Designee</strong>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Authorizes designated tax preparer or representative to communicate with IRS regarding return processing. Requires designated 5-digit PIN.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: OBBBA & Section 179 */}
      {activeTab === 'capex' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">3. Strategic Financial & Asset Management (OBBBA / Sec 179)</h3>
              <p className="text-xs text-slate-500">
                100% permanent bonus depreciation under the One Big Beautiful Bill Act (OBBBA) for technical equipment placed in service post-Jan 20, 2025.
              </p>
            </div>

            {/* OBBBA Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  OBBBA Bonus Depreciation Estimator
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">
                      Technical Equipment / Asset Cost ($):
                    </label>
                    <input
                      type="number"
                      value={equipmentCost}
                      onChange={(e) => setEquipmentCost(Math.max(0, Number(e.target.value)))}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl bg-white font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-bold block mb-1">
                      Placed in Service Period:
                    </label>
                    <select
                      value={placedInServicePeriod}
                      onChange={(e) => setPlacedInServicePeriod(e.target.value as any)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                    >
                      <option value="2024">2024 Full Year (60% Bonus)</option>
                      <option value="early2025">Jan 1, 2025 - Jan 19, 2025 (40% Bonus)</option>
                      <option value="postJan20_2025">Jan 20, 2025 and Beyond (100% Permanent Bonus)</option>
                    </select>
                  </div>

                  <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bonus Depreciation %:</span>
                      <span className="font-bold text-amber-400">{bonusDepreciationRate * 100}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Immediate Year 1 Expense:</span>
                      <span className="font-bold text-emerald-400">${immediateWriteOff.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Income Tax Savings (21%):</span>
                      <span className="font-bold text-blue-300">${taxSavingsEst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 179 Building Systems */}
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  Section 179: Nonresidential Building Systems
                </div>
                <p className="text-blue-900 leading-relaxed">
                  Assets like HVAC, roofs, and security hardware for nonresidential lab structures qualify for immediate expensing under Section 179 provided the property was previously placed in service.
                </p>
                <div className="pt-2 border-t border-blue-200 text-[11px] font-mono text-blue-800 space-y-1">
                  <div>• MACRS Property (Recovery period &le; 20 years)</div>
                  <div>• Specialized Diagnostic & Micro-Soldering Software</div>
                  <div>• Qualified Improvement Property (QIP)</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 4: DES Master Contracts */}
      {activeTab === 'contracts' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">4. Washington DES Master Contracts & Scientific Rigor</h3>
              <p className="text-xs text-slate-500">
                Department of Enterprise Services procurement protocols & California Coastal Commission scientific standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-600">Washington Procurement Connect</span>
                <p className="font-bold text-slate-900 text-sm">DES Master Contract Scope</p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Active engagement for technical supplies, ESD laboratory consumables, maintenance contracts, and specialized electronic repair services.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-600">Scientific Compliance Standard</span>
                <p className="font-bold text-slate-900 text-sm">Rigorous Use of Science</p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Vetted against environmental sustainability benchmarks, documenting non-hazardous lead-free solder rework and ESD safety.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 5: Regional Workforce */}
      {activeTab === 'workforce' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">5. Regional Workforce & State Funding Alignment</h3>
              <p className="text-xs text-slate-500">
                Cross-regional eligibility matrix for Indiana, Michigan, and Washington grant frameworks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Indiana */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full inline-block font-mono">
                  INDIANA
                </div>
                <h4 className="font-bold text-slate-900 text-sm">NextLevel Jobs & Advanced Manufacturing</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Focuses on high-demand career sectors including Robotics Technicians, Quality Control Managers, Machinists, and Welders.
                </p>
              </div>

              {/* Michigan */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full inline-block font-mono">
                  MICHIGAN
                </div>
                <h4 className="font-bold text-slate-900 text-sm">MI Digital Equity & Talent Attraction</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Goal 1 Broadband adoption support alongside Goal 2 technical talent attraction via LEO (Department of Labor and Economic Opportunity).
                </p>
              </div>

              {/* Washington */}
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="px-2.5 py-1 bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded-full inline-block font-mono">
                  WASHINGTON
                </div>
                <h4 className="font-bold text-emerald-950 text-sm">Small Business Investment Grant</h4>
                <div className="space-y-1 text-emerald-900 text-[11px]">
                  <div><strong>Award Ceiling:</strong> $15,000</div>
                  <div><strong>Focus:</strong> Capacity building & social/environmental sustainability</div>
                  <div className="text-red-700 font-bold text-[10px] pt-1 border-t border-emerald-200">
                    RESTRICTION: Cannot be used for working capital or existing debt.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 6: Merit Review & Risk */}
      {activeTab === 'compliance' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">6. Grant Merit Review & Administrative Risk Mitigation</h3>
              <p className="text-xs text-slate-500">
                BroadbandUSA merit review compliance and statutory protest timeline rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Grant Merit Review Rules
                </div>
                <div className="space-y-2 text-[11px] text-slate-300">
                  <div><strong>1. Timely Upload:</strong> Submitted prior to stated portal deadline with mandatory 24-48h buffer.</div>
                  <div><strong>2. Completeness:</strong> W-9, Washington state business license, and technical narratives verified.</div>
                </div>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-amber-950">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Contract Protest Window (Strict 7-Day Limit)
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  Administrative challenges follow a strict 7-day window after the "Notification of Intent to Award". E.g., Notification issued Sept 30 requires protest filing by October 7.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
