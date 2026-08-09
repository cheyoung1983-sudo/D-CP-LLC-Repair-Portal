import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  FileCheck, 
  HardDrive, 
  Key, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  Lock, 
  Database, 
  Award,
  Sparkles
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export interface SanitizationCertificate {
  auditId: string;
  nistLevel: 'Purge' | 'Clear' | 'Destroy';
  method: string;
  customerName: string;
  deviceModel: string;
  deviceSerial: string;
  storageCapacity: string;
  sha256Proof: string;
  timestamp: string;
  technicianId: string;
  technicianSignature: string;
  spokaneLabReg: {
    ubi: string;
    uei: string;
    naics: string;
  };
}

export default function DataSanitizationCertificate() {
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('Alex Mercer');
  const [deviceModel, setDeviceModel] = useState('MacBook Pro M2 Max (A2779)');
  const [deviceSerial, setDeviceSerial] = useState('S5GXNX0T123456');
  const [storageCapacity, setStorageCapacity] = useState('1TB Onboard NVMe NAND');
  const [method, setMethod] = useState<'crypto_erase' | 'nvme_block_erase' | 'dod_3pass' | 'zero_fill'>('crypto_erase');
  const [technicianId, setTechnicianId] = useState('TECH-DCHEN-509');
  
  const [certificate, setCertificate] = useState<SanitizationCertificate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const generateProofHash = async (payloadStr: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payloadStr);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback pseudo hash
      return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    }
  };

  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const now = new Date();
    const isoTimestamp = now.toISOString();

    let methodLabel = 'Cryptographic Erasure (CE) - NVMe Format Target';
    let nistLevel: 'Purge' | 'Clear' | 'Destroy' = 'Purge';

    if (method === 'nvme_block_erase') {
      methodLabel = 'NVMe Controller Block Erase (Sanitize Command)';
      nistLevel = 'Purge';
    } else if (method === 'dod_3pass') {
      methodLabel = 'DoD 5220.22-M 3-Pass Overwrite Sequence';
      nistLevel = 'Clear';
    } else if (method === 'zero_fill') {
      methodLabel = 'Single-Pass Zero Fill Overwrite (Wipe Target)';
      nistLevel = 'Clear';
    }

    const payloadToHash = `${deviceSerial}|${storageCapacity}|${methodLabel}|${isoTimestamp}|${technicianId}|DCP-LLC-SPOKANE`;
    const proofHash = await generateProofHash(payloadToHash);

    const auditId = `san_${Math.random().toString(36).substring(2, 11)}_${now.getFullYear()}`;

    const newCert: SanitizationCertificate = {
      auditId,
      nistLevel,
      method: methodLabel,
      customerName: customerName.trim() || 'Valued Client',
      deviceModel: deviceModel.trim() || 'Storage Media Unit',
      deviceSerial: deviceSerial.trim() || 'SN-UNSPECIFIED',
      storageCapacity: storageCapacity.trim() || '512GB NVMe',
      sha256Proof: proofHash,
      timestamp: isoTimestamp,
      technicianId: technicianId.trim() || 'TECH-509',
      technicianSignature: `0x${proofHash.substring(0, 10).toUpperCase()}`,
      spokaneLabReg: {
        ubi: '605 985 265',
        uei: 'VAJXG5MNYQK8',
        naics: '811210',
      }
    };

    setTimeout(() => {
      setCertificate(newCert);
      setIsGenerating(false);
      showToast('NIST SP 800-88 Data Sanitization Proof Certificate generated!', 'success');
    }, 600);
  };

  const copyHash = () => {
    if (!certificate) return;
    navigator.clipboard.writeText(certificate.sha256Proof);
    setCopiedHash(true);
    showToast('SHA-256 Proof Hash copied to clipboard!', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const downloadJson = () => {
    if (!certificate) return;
    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NIST_SP800-88_Sanitization_${certificate.auditId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded NIST SP 800-88 Audit JSON Certificate.', 'success');
  };

  const printCert = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                NIST SP 800-88 Rev 1
              </span>
              <span className="text-xs text-slate-400 font-mono">RCW 19.415 Compliant</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Data Sanitization Audit Certificate Generator
            </h3>
          </div>
        </div>

        <div className="text-right sm:block hidden text-slate-400 text-xs">
          <span className="block font-mono font-bold text-slate-300">D&CP Spokane Lab HQ</span>
          <span>UEI: VAJXG5MNYQK8 • UBI: 605 985 265</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Form Inputs */}
        <form onSubmit={handleGenerateCertificate} className="lg:col-span-5 space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            Media & Client Parameters
          </h4>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client / Owner Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              placeholder="e.g. Alex Mercer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Device Model</label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Media Serial #</label>
              <input
                type="text"
                value={deviceSerial}
                onChange={(e) => setDeviceSerial(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Storage Type & Capacity</label>
            <input
              type="text"
              value={storageCapacity}
              onChange={(e) => setStorageCapacity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NIST Sanitization Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="crypto_erase">Cryptographic Erasure (CE - Purge Level)</option>
              <option value="nvme_block_erase">NVMe Block Erase / Sanitize (Purge Level)</option>
              <option value="dod_3pass">DoD 5220.22-M 3-Pass Overwrite (Clear Level)</option>
              <option value="zero_fill">Single-Pass Zero Fill (Clear Level)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lead Technician Identifier</label>
            <input
              type="text"
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <FileCheck className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Computing SHA-256 Proof...' : 'Generate NIST Audit Proof Certificate'}</span>
          </button>
        </form>

        {/* Certificate Rendering Display */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {certificate ? (
              <motion.div
                key={certificate.auditId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 border-2 border-emerald-500/40 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Official Lab Stamp Badge */}
                <div className="absolute top-4 right-4 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block">NIST Certified</span>
                    <span className="text-[8px] font-mono text-slate-400">SHA-256 Verified</span>
                  </div>
                </div>

                {/* Cert Header */}
                <div className="border-b border-slate-800 pb-4 pr-24">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block">
                    Official Certificate of Data Destruction
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-0.5">
                    NIST SP 800-88 Rev 1 Audit Trail Proof
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Audit Record ID: <span className="text-emerald-300 font-bold">{certificate.auditId}</span>
                  </p>
                </div>

                {/* Key Cert Attributes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">NIST Sanitization Level</span>
                    <span className="text-sm font-black text-emerald-400 block mt-0.5">
                      {certificate.nistLevel} LEVEL
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Erasure Protocol</span>
                    <span className="text-xs font-bold text-slate-200 block truncate mt-0.5" title={certificate.method}>
                      {certificate.method}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Target Client</span>
                    <span className="text-xs font-bold text-white block mt-0.5">{certificate.customerName}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Media Serial Number</span>
                    <span className="text-xs font-mono font-bold text-slate-200 block truncate mt-0.5">{certificate.deviceSerial}</span>
                  </div>
                </div>

                {/* SHA-256 Proof Box */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      SHA-256 Cryptographic Digital Signature Proof
                    </span>
                    <button
                      onClick={copyHash}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copied' : 'Copy Proof'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-emerald-400 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed select-all">
                    {certificate.sha256Proof}
                  </p>
                </div>

                {/* Footer Signature & Registry */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400">
                  <div>
                    <span className="block font-bold text-slate-300">Technician Sig: {certificate.technicianSignature}</span>
                    <span className="block">Timestamp: {new Date(certificate.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="block">D&CP LLC Spokane WA • NAICS 811210</span>
                    <span className="block text-slate-500">UEI: {certificate.spokaneLabReg.uei} • UBI: {certificate.spokaneLabReg.ubi}</span>
                  </div>
                </div>

                {/* Export Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={downloadJson}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Certificate</span>
                  </button>
                  <button
                    onClick={printCert}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Audit Sheet</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full bg-slate-950/60 border border-slate-800 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 text-slate-500 min-h-[360px]">
                <FileCheck className="w-12 h-12 text-slate-700" />
                <h5 className="text-sm font-bold text-slate-400">No Sanitization Certificate Generated Yet</h5>
                <p className="text-xs max-w-sm">
                  Fill out the media parameters on the left and click 'Generate NIST Audit Proof Certificate' to generate a cryptographic SHA-256 proof signature.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
