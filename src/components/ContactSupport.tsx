import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast.tsx';
import LiveTechnicianChat from './LiveTechnicianChat.tsx';
import { 
  Send, 
  User, 
  Mail, 
  MessageSquare, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  FlaskConical,
  ShieldCheck,
  MessageCircle,
  Headphones
} from 'lucide-react';

export default function ContactSupport() {
  const { showToast } = useToast();
  const [supportMode, setSupportMode] = useState<'chat' | 'email'>('chat');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setErrorMsg('All fields are required for laboratory documentation.');
      return;
    }

    setStatus('sending');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        showToast('Support message transmitted to Spokane Lab HQ.', 'success');
      } else {
        setStatus('error');
        const error = data.error || 'Failed to transmit message to Spokane Lab HQ.';
        setErrorMsg(error);
        showToast(error, 'error');
      }
    } catch (err) {
      setStatus('error');
      const error = 'Network interference detected. Please check your connection and retry.';
      setErrorMsg(error);
      showToast(error, 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <FlaskConical className="w-3.5 h-3.5" />
          Technical Communications
        </div>
        <h2 className="text-4xl md:text-5xl font-playfair font-black text-slate-900 tracking-tight">
          Spokane Engineering Support
        </h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Connect directly with D&CP bench engineers via live technician chat or transmit a formal lab inquiry.
        </p>

        {/* Support Mode Switcher Bar */}
        <div className="pt-4 flex justify-center">
          <div className="p-1.5 bg-slate-100 rounded-2xl inline-flex items-center gap-2 border border-slate-200/80 shadow-inner">
            <button
              onClick={() => {
                setSupportMode('chat');
                showToast('Live Technician Channel initialized.', 'info');
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                supportMode === 'chat'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <MessageCircle className="w-4 h-4" />
              Live Technician Chat
            </button>

            <button
              onClick={() => setSupportMode('email')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                supportMode === 'email'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Mail className="w-4 h-4" />
              Lab Inquiry Form
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Left Side Protocol & Contact Information */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold">Lab Bench Channel</h3>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Active Duty
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold">Live Technical Chat</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Direct communication with Lead Systems Engineer David Chen during bench operation hours.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold">Inquiry Response Latency</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Formal email inquiries are logged into queue and processed within 4-12 business hours.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold">Data Privacy & RCW Standards</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">All chats and transmissions comply strictly with WA RCW 19.415 security protocols.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Spokane Lab HQ</p>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  D&CP Spokane Lab<br />
                  115 S Adams St<br />
                  Spokane, WA 99201
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Direct Lab Email</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">contact@dandcp.com</p>
            </div>
          </div>
        </div>

        {/* Right Side Content: Live Chat Widget OR Email Form */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {supportMode === 'chat' ? (
              <motion.div
                key="chat-mode"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <LiveTechnicianChat />
              </motion.div>
            ) : status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-emerald-900">Transmission Successful</h3>
                <p className="text-emerald-700 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                  Your inquiry has been logged into the D&CP Spokane Lab queue. An engineering lead will review your message shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all flex items-center gap-2 mx-auto"
                >
                  Send Another Inquiry
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 space-y-8"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Lab Inquiry Form</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spokane Queue</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 outline-none text-sm font-bold transition-all"
                        placeholder="Alex Mercer"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 outline-none text-sm font-bold transition-all"
                        placeholder="alex@domain.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject / Inquiry Type</label>
                  <div className="relative">
                    <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 outline-none text-sm font-bold transition-all"
                      placeholder="e.g. Bulk Intake Inquiry, Warranty Clarification"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full h-40 p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 outline-none text-sm font-medium transition-all resize-none leading-relaxed"
                    placeholder="Provide technical context or your specific query here..."
                    required
                  />
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {status === 'sending' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <FlaskConical className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {status === 'sending' ? 'Transmitting Inbound...' : 'Transmit to Laboratory'}
                </button>

                <p className="text-[10px] text-center text-slate-400 font-medium">
                  By transmitting this inquiry, you agree to our data protocol and laboratory compliance standards.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

