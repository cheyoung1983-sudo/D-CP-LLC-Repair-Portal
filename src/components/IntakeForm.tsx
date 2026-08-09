/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Smartphone, 
  Settings, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Zap,
  Activity,
  History,
  FileText,
  RotateCcw,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IntakeFormData, 
  IntakeFormSchema, 
  Manufacturer, 
  ServiceTier 
} from '../types.ts';
import { cn } from '../lib/utils.ts';
import { calculateQuote, PricingBreakdown } from '../lib/pricing.ts';
import AIDiagnostic from './AIDiagnostic.tsx';
import DeviceCameraCapture, { CapturedPhoto } from './DeviceCameraCapture.tsx';
import TechnicianChecklist from './TechnicianChecklist.tsx';
import SmartTriageChat from './SmartTriageChat.tsx';
import { useToast } from './Toast.tsx';

const STEPS = [
  { id: 1, name: 'Reconnaissance', icon: Smartphone },
  { id: 2, name: 'Triage & Telemetry', icon: Settings },
  { id: 3, name: 'Compliance', icon: ShieldCheck },
  { id: 4, name: 'Review & Sync', icon: CreditCard },
];

export default function IntakeForm() {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ draftOrderId: string; invoiceUrl: string } | null>(null);
  const [quote, setQuote] = useState<PricingBreakdown | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [devicePhotos, setDevicePhotos] = useState<CapturedPhoto[]>([]);
  const [triageSubTab, setTriageSubTab] = useState<'telemetry' | 'smart_triage' | 'camera' | 'checklist'>('telemetry');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(IntakeFormSchema),
    defaultValues: {
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: '',
      imei: '',
      customerReportedIssue: '',
      waR2rPrivacyAcknowledged: false,
      waR2rDataBackupAcknowledged: false,
      waR2rPartsProvenanceAcknowledged: false,
      customerEmail: '',
      customerName: '',
      customerPhone: '',
      destinationZipCode: '',
      telemetry: {
        batteryHealthPercentage: 85,
        batteryTempCelsius: 32,
        ammeterDrawAmps: 0.5,
        isShortToGround: false,
      },
    },
  });

  const formData = watch();
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // useEffect 1: Load saved draft data from localStorage into form fields when component mounts
  useEffect(() => {
    const savedRepairs = localStorage.getItem('dcp_repairs');
    if (savedRepairs) {
      try {
        setHistory(JSON.parse(savedRepairs));
      } catch (e) {
        console.error('Failed to parse repair history:', e);
      }
    }

    const savedDraft = localStorage.getItem('dcp_intake_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.formData) {
          reset(parsed.formData);
          if (parsed.step && parsed.step >= 1 && parsed.step <= 4) {
            setStep(parsed.step);
          }
          if (parsed.devicePhotos && Array.isArray(parsed.devicePhotos)) {
            setDevicePhotos(parsed.devicePhotos);
          }
          setDraftRestored(true);
          if (parsed.savedAt) {
            setLastSavedTime(new Date(parsed.savedAt).toLocaleTimeString());
          }
        }
      } catch (e) {
        console.error('Failed to restore draft intake form:', e);
      }
    }
    setIsDraftLoaded(true);
  }, [reset]);

  // useEffect 2: Listen for form input changes and save them into localStorage
  useEffect(() => {
    if (!isDraftLoaded) return;
    if (step < 5) {
      const now = new Date();
      const draftPayload = {
        step,
        formData,
        devicePhotos,
        savedAt: now.toISOString(),
      };
      localStorage.setItem('dcp_intake_draft', JSON.stringify(draftPayload));
      setLastSavedTime(now.toLocaleTimeString());
    }
  }, [formData, devicePhotos, step, isDraftLoaded]);

  useEffect(() => {
    if (formData.serviceTier && formData.destinationZipCode) {
      setQuote(calculateQuote(formData.serviceTier, formData.destinationZipCode));
    }
  }, [formData.serviceTier, formData.destinationZipCode]);

  const clearDraft = () => {
    localStorage.removeItem('dcp_intake_draft');
    reset({
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: '',
      imei: '',
      customerReportedIssue: '',
      waR2rPrivacyAcknowledged: false,
      waR2rDataBackupAcknowledged: false,
      waR2rPartsProvenanceAcknowledged: false,
      customerEmail: '',
      customerName: '',
      customerPhone: '',
      destinationZipCode: '',
      telemetry: {
        batteryHealthPercentage: 85,
        batteryTempCelsius: 32,
        ammeterDrawAmps: 0.5,
        isShortToGround: false,
      },
    });
    setStep(1);
    setDraftRestored(false);
    setLastSavedTime(null);
  };

  const [polling, setPolling] = useState(false);

  const pollHardware = async () => {
    setPolling(true);
    // Simulate WebUSB / Serial Diagnostic Polling
    // In production, this would use navigator.usb.requestDevice()
    await new Promise(r => setTimeout(r, 2000));
    
    const mockTelemetry = {
      batteryHealthPercentage: Math.floor(Math.random() * 20) + 80,
      batteryTempCelsius: Math.floor(Math.random() * 15) + 25,
      ammeterDrawAmps: parseFloat((Math.random() * 3).toFixed(2)),
      isShortToGround: Math.random() > 0.8,
    };

    setValue('telemetry', mockTelemetry);
    setPolling(false);
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['deviceManufacturer', 'deviceModel', 'imei'];
    if (step === 2) fieldsToValidate = ['serviceTier', 'customerReportedIssue', 'telemetry'];
    if (step === 3) fieldsToValidate = ['waR2rPrivacyAcknowledged', 'waR2rDataBackupAcknowledged', 'waR2rPartsProvenanceAcknowledged', 'customerEmail', 'customerName', 'customerPhone', 'destinationZipCode'];

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: IntakeFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/intake/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const res = await response.json();
      if (res.success) {
        localStorage.removeItem('dcp_intake_draft');
        setDraftRestored(false);
        setResult({ draftOrderId: res.draftOrderId, invoiceUrl: res.invoiceUrl });
        
        // Persist to local history
        const newEntry = {
          ...data,
          id: res.draftOrderId,
          date: new Date().toISOString(),
          quote
        };
        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('dcp_repairs', JSON.stringify(updatedHistory));
        
        showToast('Device intake synchronized with Spokane Lab.', 'success');
        setStep(5);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      showToast('Synchronization failure. Please verify connection and retry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6">
      {/* Progress Bar & Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between relative max-w-2xl">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10" />
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive ? "bg-slate-900 text-white shadow-lg scale-110" : 
                      isCompleted ? "bg-green-500 text-white" : "bg-white border-2 border-slate-100 text-slate-400"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest font-bold",
                    isActive ? "text-slate-900" : "text-slate-400"
                  )}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {history.length > 0 && step === 1 && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Fleet</p>
              <p className="text-sm font-bold text-slate-900">{history.length} Previous Repairs Found</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 overflow-hidden min-h-[650px] flex flex-col">
          {step < 5 && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">
                  {draftRestored ? 'Draft Restored from Local Session' : 'Draft Progress Auto-Saved'}
                </span>
                {lastSavedTime && (
                  <span className="text-[10px] font-medium text-slate-400">
                    • Last saved {lastSavedTime}
                  </span>
                )}
              </div>
              {(formData.deviceModel || formData.imei || formData.customerName || draftRestored) && (
                <button
                  type="button"
                  onClick={clearDraft}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Form
                </button>
              )}
            </div>
          )}
          <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div>
                <h2 className="text-3xl font-playfair font-black text-slate-900 mb-2">Device Reconnaissance</h2>
                <p className="text-slate-500">Identify the hardware unit and authenticate its global identifier.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Manufacturer</label>
                  <select 
                    {...register('deviceManufacturer')}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all appearance-none"
                  >
                    <option value={Manufacturer.APPLE}>Apple (iPhone/iPad)</option>
                    <option value={Manufacturer.SAMSUNG}>Samsung (Galaxy)</option>
                    <option value={Manufacturer.OTHER}>Other / Generic</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Model Variant</label>
                  <input 
                    {...register('deviceModel')}
                    placeholder="e.g. iPhone 14 Pro Max"
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all"
                  />
                  {errors.deviceModel && <p className="text-red-500 text-xs mt-1">{errors.deviceModel.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">IMEI (15 Digits)</label>
                  <input 
                    {...register('imei')}
                    placeholder="Enter 15-digit IMEI"
                    maxLength={15}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all font-mono tracking-widest text-lg"
                  />
                  {errors.imei && <p className="text-red-500 text-xs mt-1">{errors.imei.message}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div>
                <h2 className="text-3xl font-playfair font-black text-slate-900 mb-2">Triage & Telemetry</h2>
                <p className="text-slate-500">Capture failure modes, AI diagnostic recommendations, condition photos, and QA checklist steps.</p>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                {[
                  { id: 'telemetry', label: '1. Service & Telemetry' },
                  { id: 'smart_triage', label: '2. Smart Triage (AI)' },
                  { id: 'camera', label: `3. Device Photos (${devicePhotos.length})` },
                  { id: 'checklist', label: '4. Tech QA Checklist' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTriageSubTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      triageSubTab === tab.id
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {triageSubTab === 'telemetry' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Service Tier</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: ServiceTier.TIER_1_POWER, label: 'Tier 1: Power & Port', desc: 'Battery, Charging, Ports' },
                          { id: ServiceTier.TIER_2_DISPLAY, label: 'Tier 2: Display Renewal', desc: 'OLED/LCD Assemblies' },
                          { id: ServiceTier.TIER_3_BOARD, label: 'Tier 3: Specialized Board', desc: 'Micro-soldering, Logic Board' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setValue('serviceTier', t.id)}
                            className={cn(
                              "flex flex-col p-4 rounded-xl border-2 text-left transition-all",
                              formData.serviceTier === t.id ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                            )}
                          >
                            <span className="font-bold text-slate-900 text-sm">{t.label}</span>
                            <span className="text-xs text-slate-500">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Description</label>
                      <textarea 
                        {...register('customerReportedIssue')}
                        rows={4}
                        placeholder="Detailed symptoms, liquid exposure history, or prior repairs..."
                        className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all text-sm resize-none"
                      />
                      {errors.customerReportedIssue && <p className="text-red-500 text-xs mt-1">{errors.customerReportedIssue.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-6 shadow-xl shadow-slate-900/20">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Diagnostic Suite</h4>
                        <button 
                          type="button"
                          onClick={pollHardware}
                          disabled={polling}
                          className={cn(
                            "px-3 py-1 rounded text-[10px] font-bold transition-all",
                            polling ? "bg-blue-500/20 text-blue-400 animate-pulse" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          )}
                        >
                          {polling ? 'POLLING...' : 'POLL HARDWARE'}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Thermometer className={cn("w-5 h-5", formData.telemetry.batteryTempCelsius > 40 ? "text-orange-400" : "text-blue-400")} />
                            <span className="text-xs text-slate-300">Battery Temp</span>
                          </div>
                          <input 
                            type="number"
                            {...register('telemetry.batteryTempCelsius', { valueAsNumber: true })}
                            className="w-20 bg-slate-800 border-none rounded-lg px-3 py-1 text-right font-mono"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-slate-300">Ammeter Draw</span>
                          </div>
                          <input 
                            type="number"
                            step="0.01"
                            {...register('telemetry.ammeterDrawAmps', { valueAsNumber: true })}
                            className="w-20 bg-slate-800 border-none rounded-lg px-3 py-1 text-right font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-green-400" />
                            <span className="text-xs text-slate-300">Short Detection</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setValue('telemetry.isShortToGround', !formData.telemetry.isShortToGround)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-colors duration-300",
                              formData.telemetry.isShortToGround ? "bg-red-500" : "bg-slate-700"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                              formData.telemetry.isShortToGround ? "translate-x-7" : "translate-x-1"
                            )} />
                          </button>
                        </div>
                      </div>

                      {formData.telemetry.batteryTempCelsius > 45 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-[10px] font-bold">THERMAL LOCKOUT: Temperature exceeds 45°C safety threshold.</p>
                        </div>
                      )}
                    </div>

                    <AIDiagnostic 
                      telemetry={formData.telemetry} 
                      issue={formData.customerReportedIssue}
                      model={formData.deviceModel}
                    />
                  </div>
                </div>
              )}

              {triageSubTab === 'smart_triage' && (
                <SmartTriageChat
                  deviceModel={formData.deviceModel}
                  onApplyRecommendations={(tier, issueSummary) => {
                    setValue('serviceTier', tier as any);
                    setValue('customerReportedIssue', issueSummary);
                    setTriageSubTab('telemetry');
                  }}
                />
              )}

              {triageSubTab === 'camera' && (
                <DeviceCameraCapture
                  photos={devicePhotos}
                  onChange={(photos) => setDevicePhotos(photos)}
                />
              )}

              {triageSubTab === 'checklist' && (
                <TechnicianChecklist
                  deviceCategory={formData.deviceModel || 'mobile'}
                />
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div>
                <h2 className="text-3xl font-playfair font-black text-slate-900 mb-2">Statutory Compliance</h2>
                <p className="text-slate-500">Legal disclosures and customer contact registration (RCW 19.415).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-2xl border-2 transition-all",
                    formData.waR2rPrivacyAcknowledged ? "border-green-500 bg-green-50" : "border-slate-100"
                  )}>
                    <label className="flex gap-4 cursor-pointer">
                      <input type="checkbox" {...register('waR2rPrivacyAcknowledged')} className="mt-1" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Security & Privacy Steps</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">I acknowledge the technical measures taken to protect my data during service.</p>
                      </div>
                    </label>
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl border-2 transition-all",
                    formData.waR2rDataBackupAcknowledged ? "border-green-500 bg-green-50" : "border-slate-100"
                  )}>
                    <label className="flex gap-4 cursor-pointer">
                      <input type="checkbox" {...register('waR2rDataBackupAcknowledged')} className="mt-1" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Customer Data Safeguards</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">I have backed up my data or assume all responsibility for potential loss.</p>
                      </div>
                    </label>
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl border-2 transition-all",
                    formData.waR2rPartsProvenanceAcknowledged ? "border-green-500 bg-green-50" : "border-slate-100"
                  )}>
                    <label className="flex gap-4 cursor-pointer">
                      <input type="checkbox" {...register('waR2rPartsProvenanceAcknowledged')} className="mt-1" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Parts Provenance Notice</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">I understand D&CP LLC uses genuine or high-quality aftermarket components.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <input {...register('customerName')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                    <input {...register('customerEmail')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</label>
                      <input {...register('customerPhone')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">ZIP Code</label>
                      <input {...register('destinationZipCode')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div>
                <h2 className="text-3xl font-playfair font-black text-slate-900 mb-2">Quote & Review</h2>
                <p className="text-slate-500">Final service verification and Shopify synchronization.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{formData.deviceModel}</h3>
                      <p className="text-sm font-mono text-slate-500 uppercase">IMEI: {formData.imei}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Selected Service</span>
                      <span className="text-slate-900 font-bold">{formData.serviceTier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Diagnostic Status</span>
                      <span className={cn("font-bold uppercase tracking-widest text-[10px] px-2 py-1 rounded", formData.telemetry.isShortToGround ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                        {formData.telemetry.isShortToGround ? "Board Short Detected" : "Nominal Diagnostics"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Reported Issue</p>
                    <p className="text-sm text-slate-600 italic">"{formData.customerReportedIssue}"</p>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    By clicking Sync, you authorize the generation of a Shopify Draft Order and agree to the 
                    D&CP LLC Terms of Service and Washington Statutory Disclosures captured in Step 3.
                  </p>
                </div>

                {quote && (
                  <div className="bg-white rounded-3xl p-8 border-2 border-slate-900 shadow-xl shadow-slate-200/50 space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 border-b border-slate-100 pb-4">Financial Breakdown</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Parts Allocation</span>
                        <span className="font-bold text-slate-900">${quote.partsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Labor (${formData.serviceTier === ServiceTier.TIER_3_BOARD ? '2.5' : '0.75'} hrs)</span>
                        <span className="font-bold text-slate-900">${quote.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Overhead Markup (80%)</span>
                        <span className="font-bold text-slate-900">${quote.overhead.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="font-bold text-slate-900">${quote.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Estimated Tax (WA)</span>
                        <span className="font-bold text-slate-900">${quote.tax.toFixed(2)}</span>
                      </div>
                      <div className="pt-4 flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-blue-600">Total Quote</span>
                        <span className="text-4xl font-black text-slate-900">${quote.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 5 && result && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-4xl font-playfair font-black text-slate-900 mb-2">Intake Synchronized</h2>
                <p className="text-slate-500">Draft Order {result.draftOrderId} successfully provisioned in Shopify.</p>
              </div>
              <div className="flex gap-4">
                <a 
                  href={result.invoiceUrl} 
                  target="_blank" 
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  View Checkout Link
                  <ChevronRight className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  New Intake
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 5 && (
          <div className="mt-auto pt-12 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-slate-900 transition-colors font-bold uppercase tracking-widest text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all",
                  submitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {submitting ? 'Synchronizing...' : 'Sync with Shopify'}
                {!submitting && <CreditCard className="w-5 h-5" />}
              </button>
            )}
          </div>
        )}
      </form>

        {/* Sidebar History/Context */}
        <aside className="space-y-8">
          {history.length > 0 ? (
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-lg shadow-slate-200/40">
              <div className="flex items-center gap-3 mb-8">
                <History className="w-5 h-5 text-slate-900" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Repair History</h3>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {history.map((entry, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{entry.serviceTier}</span>
                      <span className="text-[10px] text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{entry.deviceModel}</h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase mb-3">IMEI: {entry.imei}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900">${entry.quote?.total.toFixed(2)}</span>
                      <button className="p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <ShieldCheck className="w-8 h-8 text-blue-400 mb-6" />
                <h3 className="text-xl font-playfair font-black mb-4">Engineering Protocol</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All intake data is validated against D&CP Engineering Specification Rev 4.0. Hardware telemetry ensures safety limits are respected prior to logic board intervention.
                </p>
              </div>
            </div>
          )}
          
          <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Support Direct</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">Need immediate Tier 3 assistance? Contact our Spokane laboratory directly.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                <Zap className="w-4 h-4 text-blue-600" />
                (509) 555-0123
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                triage@dcp-llc.com
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
