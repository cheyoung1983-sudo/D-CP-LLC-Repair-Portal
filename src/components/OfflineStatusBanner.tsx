import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, ShieldCheck, HardDrive } from 'lucide-react';

export default function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-amber-600 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-md relative z-50 animate-pulse">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
          <span>
            <strong>Lab Connection Offline:</strong> Operating in PWA Offline Lab Cache Mode. Local drafts, WebUSB telemetry, and intake data remain fully active.
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] uppercase bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full">
          <HardDrive className="w-3 h-3" /> SW Cache Active
        </span>
      </div>
    </div>
  );
}
