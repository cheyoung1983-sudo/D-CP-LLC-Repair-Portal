import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border min-w-[320px] max-w-md
                ${toast.type === 'success' ? 'bg-emerald-900 border-emerald-800 text-emerald-50' : ''}
                ${toast.type === 'error' ? 'bg-red-950 border-red-900 text-red-50' : ''}
                ${toast.type === 'info' ? 'bg-slate-900 border-slate-800 text-slate-50' : ''}
              `}>
                <div className={`
                  w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                  ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                  ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                  ${toast.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
                `}>
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-0.5">
                    {toast.type === 'success' ? 'Transmission Success' : toast.type === 'error' ? 'Laboratory Alert' : 'System Notice'}
                  </p>
                  <p className="text-sm font-bold leading-relaxed">{toast.message}</p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
