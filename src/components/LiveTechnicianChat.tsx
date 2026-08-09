import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast.tsx';
import { 
  Send, 
  User, 
  Bot, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Trash2, 
  Ticket, 
  Wifi, 
  CheckCircle2,
  ChevronRight,
  Circle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'technician';
  text: string;
  timestamp: string;
  technicianName?: string;
  technicianTitle?: string;
  technicianAvatar?: string;
}

const QUICK_PROMPTS = [
  "What is Tier 3 Micro-soldering?",
  "What is the average turnaround time?",
  "Is my data secure during hardware repair?",
  "Spokane Lab address and walk-in hours"
];

export default function LiveTechnicianChat() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'technician',
      text: "Welcome to D&CP Spokane Lab Live Support. I'm David Chen, Lead Systems Engineer. How can our engineering team assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      technicianName: "David Chen",
      technicianTitle: "Lead Systems Engineer",
      technicianAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [showTicketInput, setShowTicketInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Business Hours status check (PST timezone check or default active)
  const [isBusinessHours, setIsBusinessHours] = useState(true);
  const [currentTimePST, setCurrentTimePST] = useState('');

  useEffect(() => {
    const updatePST = () => {
      const now = new Date();
      const pstString = now.toLocaleTimeString('en-US', { 
        timeZone: 'America/Los_Angeles', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      setCurrentTimePST(pstString);

      // PST hours check (Mon-Fri 8am-6pm)
      const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      const day = pstDate.getDay(); // 0 is Sun, 6 is Sat
      const hour = pstDate.getHours();
      setIsBusinessHours(day >= 1 && day <= 5 && hour >= 8 && hour < 18);
    };

    updatePST();
    const interval = setInterval(updatePST, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          ticketId: ticketRef || undefined,
          conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.success) {
        const techMsg: ChatMessage = {
          id: `tech-${Date.now()}`,
          sender: 'technician',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          technicianName: data.technician?.name || "David Chen",
          technicianTitle: data.technician?.title || "Lead Systems Engineer",
          technicianAvatar: data.technician?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        };
        setMessages(prev => [...prev, techMsg]);
      } else {
        showToast('Chat transmission failed. Please retry.', 'error');
      }
    } catch (err) {
      setIsTyping(false);
      showToast('Network interruption during chat payload transmission.', 'error');
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'technician',
        text: "Chat cleared. D&CP Spokane Lab bench technicians are ready for your next question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        technicianName: "David Chen",
        technicianTitle: "Lead Systems Engineer",
        technicianAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
      }
    ]);
    showToast('Chat session reset.', 'info');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[640px]">
      {/* Top Technician Status Header */}
      <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
              alt="David Chen"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/50"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Spokane Engineering Bench</h3>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">David Chen & Sarah Martinez on Duty</p>
          </div>
        </div>

        {/* Business Hours & Quick Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lab Hours (PST)</p>
            <p className="text-xs font-bold text-slate-200">Mon–Fri 8AM–6PM ({currentTimePST || 'PST'})</p>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <button
            onClick={() => setShowTicketInput(!showTicketInput)}
            className={`p-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 ${
              ticketRef ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Attach Repair Ticket ID"
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden md:inline">{ticketRef ? ticketRef : 'Link Ticket'}</span>
          </button>

          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900 transition-all"
            title="Clear Chat Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ticket ID Reference Ribbon */}
      <AnimatePresence>
        {showTicketInput && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-950/80 border-b border-blue-900/50 px-6 py-3 text-xs text-blue-200 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Reference active intake order or ticket ID for specific telemetry lookup:</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="e.g. DCP-8842" 
                value={ticketRef}
                onChange={(e) => setTicketRef(e.target.value.toUpperCase())}
                className="bg-blue-900/60 border border-blue-700/60 rounded-lg px-3 py-1 text-xs text-white placeholder-blue-300 outline-none uppercase font-mono font-bold"
              />
              <button 
                onClick={() => {
                  if (ticketRef) showToast(`Ticket ${ticketRef} linked to live chat`, 'info');
                  setShowTicketInput(false);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px] hover:bg-blue-500 transition-all"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.sender === 'technician' && (
              <img 
                src={msg.technicianAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"} 
                alt={msg.technicianName || "Technician"} 
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 mt-1 shadow-sm"
                referrerPolicy="no-referrer"
              />
            )}

            <div className={`max-w-[80%] md:max-w-[70%] space-y-1 ${msg.sender === 'user' ? 'items-end text-right' : ''}`}>
              {msg.sender === 'technician' && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900">{msg.technicianName || 'David Chen'}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {msg.technicianTitle || 'Lead Tech'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                </div>
              )}

              <div className={`p-4 rounded-2xl text-sm leading-relaxed font-medium shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
              }`}>
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <span className="text-[10px] text-slate-400 font-medium px-1 block">{msg.timestamp}</span>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-slate-600 animate-pulse" />
            </div>
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">David Chen is reviewing telemetry...</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Quick Queries:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 border border-slate-200/60"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a technical question or query ticket telemetry..."
            className="flex-1 h-12 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 outline-none text-sm font-medium transition-all"
            disabled={isTyping}
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center shrink-0 shadow-md active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
