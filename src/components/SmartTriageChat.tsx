import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  RotateCw, 
  AlertCircle, 
  HelpCircle,
  Zap,
  Wrench
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export interface SmartTriageResult {
  suspectedFault: string;
  recommendedTier: string;
  recommendedTierLabel: string;
  confidenceScore: number;
  summary: string;
  diyInitialSteps: string[];
  technicianChecklistAdvice: string[];
}

interface SmartTriageChatProps {
  deviceModel?: string;
  onApplyRecommendations?: (tier: string, issueSummary: string) => void;
}

export default function SmartTriageChat({ deviceModel = '', onApplyRecommendations }: SmartTriageChatProps) {
  const { showToast } = useToast();
  const [symptomInput, setSymptomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<SmartTriageResult | null>(null);
  const [history, setHistory] = useState<Array<{ role: 'user' | 'ai'; text: string; triage?: SmartTriageResult }>>([]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!symptomInput.trim()) {
      showToast('Please describe the symptoms or issues experienced.', 'error');
      return;
    }

    const currentQuery = symptomInput.trim();
    setLoading(true);
    setHistory((prev) => [...prev, { role: 'user', text: currentQuery }]);
    setSymptomInput('');

    try {
      const res = await fetch('/api/ai/smart-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceModel,
          symptomDescription: currentQuery,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${res.status})`);
      }

      const data = await res.json();
      if (res.ok && data.success && data.triage) {
        setTriageResult(data.triage);
        setHistory((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `Analysis complete: ${data.triage.suspectedFault} (${data.triage.confidenceScore}% confidence). Recommended: ${data.triage.recommendedTierLabel}`,
            triage: data.triage,
          },
        ]);
        showToast('Smart Triage complete!', 'success');
      } else {
        showToast(data.error || 'Failed to analyze symptoms. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Smart Triage Error:', err);
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (symptom: string) => {
    setSymptomInput(symptom);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Gemini AI Triage
              </span>
              <span className="text-xs text-slate-400 font-mono">Spokane Bench Assistant</span>
            </div>
            <h4 className="text-xl font-playfair font-black text-white mt-0.5">
              Smart Triage Diagnostic Assistant
            </h4>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed relative z-10 font-medium">
        Describe the device symptoms (e.g., liquid exposure, black screen with vibration, warm back glass, 0.45A ammeter draw). The Gemini AI engine will classify the likely fault and suggest immediate DIY steps.
      </p>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 relative z-10">
        <span className="text-[10px] text-slate-400 uppercase font-bold self-center">Quick Examples:</span>
        {[
          'Device dropped in water, won\'t charge or turn on',
          'Screen flickers and touch grid stops responding on top half',
          'Overheating near camera while charging; battery drains fast'
        ].map((promptText, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickPrompt(promptText)}
            className="px-3 py-1 bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all border border-slate-700 hover:border-indigo-500"
          >
            "{promptText.substring(0, 32)}..."
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="relative z-10 flex gap-2">
        <input
          type="text"
          value={symptomInput}
          onChange={(e) => setSymptomInput(e.target.value)}
          placeholder="Describe symptoms or observations..."
          className="w-full px-4 py-3 bg-slate-950/80 border border-indigo-500/30 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-indigo-600/30 disabled:opacity-50"
        >
          {loading ? (
            <RotateCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Triage</span>
            </>
          )}
        </button>
      </form>

      {/* Analysis Results Display */}
      {triageResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-6 space-y-5 relative z-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">
                Primary Suspected Fault
              </span>
              <h5 className="text-lg font-bold text-white mt-0.5">{triageResult.suspectedFault}</h5>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black">
                {triageResult.confidenceScore}% Match
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold">
                {triageResult.recommendedTierLabel}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            "{triageResult.summary}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* DIY Steps */}
            <div className="space-y-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" /> Initial DIY Troubleshooting
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {triageResult.diyInitialSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bench Advice */}
            <div className="space-y-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-blue-400 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Wrench className="w-3.5 h-3.5" /> Lab Technician Bench Steps
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {triageResult.technicianChecklistAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Button: Apply to Form */}
          {onApplyRecommendations && (
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  let mappedTier = 'TIER_1_POWER_PORT_REFRESH';
                  if (triageResult.recommendedTier.includes('TIER_2') || triageResult.recommendedTierLabel.includes('Tier 2')) {
                    mappedTier = 'TIER_2_DISPLAY_RENEWAL';
                  } else if (triageResult.recommendedTier.includes('TIER_3') || triageResult.recommendedTierLabel.includes('Tier 3')) {
                    mappedTier = 'TIER_3_MICRO_SOLDERING';
                  }
                  onApplyRecommendations(mappedTier, `${triageResult.suspectedFault}: ${triageResult.summary}`);
                  showToast('AI Triage recommendations applied to Intake Form!', 'success');
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Apply Recommendations to Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
