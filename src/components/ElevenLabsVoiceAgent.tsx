import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
  Sparkles,
  Bot,
  User,
  Settings,
  X,
  Radio,
  HelpCircle,
  Headphones,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface ElevenLabsVoiceAgentProps {
  defaultAgentId?: string;
}

interface MessageItem {
  id: string;
  source: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export default function ElevenLabsVoiceAgent({ defaultAgentId }: ElevenLabsVoiceAgentProps) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [agentId, setAgentId] = useState(
    defaultAgentId ||
    (import.meta as any).env?.VITE_ELEVENLABS_AGENT_ID ||
    ''
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [audioStreamError, setAudioStreamError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      showToast('Voice Assistant connected to D&CP Lab', 'success');
      setAudioStreamError(null);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          source: 'ai',
          message: 'Hello! I am your D&CP Lab Voice Technician. How can I assist you with your repair or diagnostic today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    },
    onDisconnect: () => {
      showToast('Voice session ended', 'info');
    },
    onMessage: (message: any) => {
      if (message?.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            source: message.source === 'user' ? 'user' : 'ai',
            message: message.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    },
    onError: (error: any) => {
      console.error('ElevenLabs ConvAI Error:', error);
      const errMsg = typeof error === 'string' ? error : error?.message || 'Voice connection failed';
      setAudioStreamError(errMsg);
      showToast(`Voice Error: ${errMsg}`, 'error');
    }
  });

  const { status, isSpeaking } = conversation;
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSpeaking]);

  const handleStartConversation = useCallback(async () => {
    setAudioStreamError(null);

    // Request microphone permissions
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      const msg = 'Microphone permission denied. Please allow microphone access.';
      setAudioStreamError(msg);
      showToast(msg, 'error');
      return;
    }

    try {
      // Check if backend signed-url is available or connect directly with agentId
      let signedUrl: string | undefined;
      const targetAgentId = agentId.trim();

      try {
        const res = await fetch(`/api/elevenlabs/signed-url${targetAgentId ? `?agentId=${encodeURIComponent(targetAgentId)}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          if (data.signedUrl) {
            signedUrl = data.signedUrl;
          }
          if (data.agentId && !targetAgentId) {
            setAgentId(data.agentId);
          }
        }
      } catch (backendErr) {
        console.warn('Backend signed-url check skipped/unavailable:', backendErr);
      }

      if (signedUrl) {
        await conversation.startSession({ signedUrl });
      } else if (targetAgentId) {
        await conversation.startSession({ agentId: targetAgentId });
      } else {
        setShowConfig(true);
        showToast('Please enter your ElevenLabs Agent ID to begin.', 'info');
      }
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      const msg = err?.message || 'Failed to establish voice connection';
      setAudioStreamError(msg);
      showToast(msg, 'error');
    }
  }, [agentId, conversation, showToast]);

  const handleEndConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err: any) {
      console.error('Error ending conversation:', err);
    }
  }, [conversation]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    conversation.setVolume({ volume: newVol });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <AnimatePresence>
          {!isOpen && isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-slate-700/50 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Voice Live</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Voice Technician Assistant"
          className={`
            relative p-4 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300
            ${isConnected 
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/25 ring-4 ring-emerald-400/20' 
              : isConnecting 
              ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-amber-500/25 animate-pulse' 
              : 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-slate-900/30 hover:shadow-indigo-500/20 border border-slate-800'}
          `}
        >
          {isConnected ? (
            <Headphones className="w-6 h-6 animate-bounce" />
          ) : (
            <Bot className="w-6 h-6" />
          )}

          {/* Pulsing Voice Indicator */}
          {isConnected && isSpeaking && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Slide-over Voice Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[80vh] h-[640px] bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">D&CP Voice Tech</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      11Labs ConvAI
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConnected
                          ? 'bg-emerald-400 animate-pulse'
                          : isConnecting
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-slate-500'
                      }`}
                    />
                    <span className="text-xs text-slate-400 capitalize">
                      {isConnecting ? 'Connecting...' : isConnected ? (isSpeaking ? 'Agent Speaking...' : 'Listening to you...') : 'Ready to talk'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors ${showConfig ? 'bg-slate-800 text-white' : ''}`}
                  title="Configure Agent ID"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Config Banner (Collapsible) */}
            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-950/80 border-b border-slate-800 p-4 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-slate-300 font-semibold">
                    <span>ElevenLabs Agent Setup</span>
                    <span className="text-[10px] text-slate-500">.env or direct</span>
                  </div>
                  <input
                    type="text"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="Enter ElevenLabs Agent ID (e.g. agt_...)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Set <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">VITE_ELEVENLABS_AGENT_ID</code> and <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">ELEVENLABS_API_KEY</code> in <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">.env</code> for automatic backend signing.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Interactive Stage */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col">
              {/* Central Voice Visualizer Orb */}
              <div className="my-auto py-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Outer glowing pulsing rings */}
                  <motion.div
                    animate={{
                      scale: isConnected ? (isSpeaking ? [1, 1.35, 1] : [1, 1.15, 1]) : 1,
                      opacity: isConnected ? (isSpeaking ? [0.4, 0.8, 0.4] : [0.2, 0.5, 0.2]) : 0.1
                    }}
                    transition={{ repeat: Infinity, duration: isSpeaking ? 1.2 : 2.5, ease: 'easeInOut' }}
                    className={`absolute w-36 h-36 rounded-full blur-xl ${
                      isConnected ? 'bg-gradient-to-tr from-indigo-500 to-emerald-400' : 'bg-slate-700'
                    }`}
                  />

                  {/* Visualizer Soundwave Bars */}
                  <div className="w-28 h-28 rounded-full bg-slate-950 border border-slate-700/60 shadow-2xl flex items-center justify-center gap-1.5 z-10 overflow-hidden relative">
                    {isConnected ? (
                      [0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7].map((heightMultiplier, idx) => (
                        <motion.span
                          key={idx}
                          animate={{
                            height: isSpeaking
                              ? [`${15 * heightMultiplier}px`, `${50 * heightMultiplier}px`, `${20 * heightMultiplier}px`]
                              : [`${8 * heightMultiplier}px`, `${18 * heightMultiplier}px`, `${8 * heightMultiplier}px`]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6 + idx * 0.1,
                            ease: 'easeInOut'
                          }}
                          className={`w-1.5 rounded-full ${
                            isSpeaking
                              ? 'bg-gradient-to-t from-emerald-400 to-teal-200'
                              : 'bg-gradient-to-t from-indigo-400 to-indigo-200'
                          }`}
                        />
                      ))
                    ) : (
                      <Radio className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h4 className="font-bold text-white text-base">
                    {isConnected
                      ? isSpeaking
                        ? 'D&CP Agent Speaking...'
                        : 'Listening... (Speak naturally)'
                      : 'Voice Assistant Standby'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    {isConnected
                      ? 'Hands-free conversational diagnostic and lab intake support.'
                      : 'Press Start Call to speak with our AI diagnostic agent.'}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {audioStreamError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <p>{audioStreamError}</p>
                </div>
              )}

              {/* Conversation Live Stream Feed */}
              {messages.length > 0 && (
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 space-y-2.5 max-h-44 overflow-y-auto">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Live Transcript</span>
                    <span>{messages.length} messages</span>
                  </div>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-2 text-xs ${
                        m.source === 'user' ? 'text-indigo-200' : 'text-slate-300'
                      }`}
                    >
                      {m.source === 'user' ? (
                        <User className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                      )}
                      <div className="flex-1">
                        <span className="font-semibold">{m.source === 'user' ? 'You' : 'Agent'}: </span>
                        <span>{m.message}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3">
              {/* Volume Slider */}
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  onClick={() => handleVolumeChange(volume === 0 ? 0.8 : 0)}
                  className="hover:text-white transition-colors"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Call Action Button */}
              {isConnected ? (
                <button
                  onClick={handleEndConversation}
                  className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/20 active:scale-95"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Session</span>
                </button>
              ) : (
                <button
                  disabled={isConnecting}
                  onClick={handleStartConversation}
                  className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Start Voice Call'}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
