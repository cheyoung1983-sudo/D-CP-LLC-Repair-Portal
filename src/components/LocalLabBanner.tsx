import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Navigation, Calendar, X, Sparkles, Building2 } from 'lucide-react';

interface LocalLabBannerProps {
  onBookDropOff: () => void;
}

export default function LocalLabBanner({ onBookDropOff }: LocalLabBannerProps) {
  const [isLocalZone, setIsLocalZone] = useState<boolean>(false);
  const [timeZoneName, setTimeZoneName] = useState<string>('');
  const [labStatus, setLabStatus] = useState<{ isOpen: boolean; text: string }>({ isOpen: false, text: '' });
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [geoVerified, setGeoVerified] = useState<boolean>(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      setTimeZoneName(tz);

      // Check if time zone is Pacific / West Coast (Spokane is in America/Los_Angeles)
      const pacificZones = [
        'America/Los_Angeles',
        'America/Vancouver',
        'America/Tijuana',
        'PST8PDT',
        'America/Boise',
        'America/Seattle'
      ];

      const offsetMinutes = new Date().getTimezoneOffset(); // 420 or 480 mins for UTC-7/8
      const isPacificOffset = offsetMinutes >= 420 && offsetMinutes <= 480;

      if (pacificZones.includes(tz) || isPacificOffset || tz.toLowerCase().includes('los_angeles') || tz.toLowerCase().includes('pacific')) {
        setIsLocalZone(true);
      } else {
        // Default to true for demo experience so Spokane visitors can see local lab banner
        setIsLocalZone(true);
      }

      // Calculate current Spokane lab open status (Mon-Fri 8:00 AM - 6:00 PM PST)
      const now = new Date();
      // Get Spokane time
      const spokaneDateStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      const spokaneDate = new Date(spokaneDateStr);
      const day = spokaneDate.getDay(); // 0 = Sun, 6 = Sat
      const hours = spokaneDate.getHours();

      if (day >= 1 && day <= 5 && hours >= 8 && hours < 18) {
        setLabStatus({ isOpen: true, text: 'Lab Open Now (Closing at 6:00 PM PST)' });
      } else {
        setLabStatus({ isOpen: false, text: 'Lab Closed (24/7 Lockbox Drop-Off Active)' });
      }
    } catch (e) {
      setIsLocalZone(true);
    }
  }, []);

  const handleVerifyGeo = () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Spokane WA coords: ~47.6588° N, 117.4260° W
        const spokaneLat = 47.6588;
        const spokaneLon = -117.4260;
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // Haversine formula
        const R = 6371; // km
        const dLat = ((userLat - spokaneLat) * Math.PI) / 180;
        const dLon = ((userLon - spokaneLon) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((spokaneLat * Math.PI) / 180) *
            Math.cos((userLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        setDistanceKm(Math.round(d));
        setGeoVerified(true);
        setIsLocalZone(true);
      },
      () => {
        // Fallback
        setGeoVerified(true);
      }
    );
  };

  if (!isLocalZone || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-slate-900 text-white text-xs border-b border-slate-800 relative z-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-wider border border-blue-500/30">
              <MapPin className="w-3 h-3 text-blue-400" />
              Spokane Local Hub
            </span>

            <div className="flex items-center gap-2 font-medium text-slate-200">
              <span className="font-bold text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Lab Hours:
              </span>
              <span>Mon–Fri 8:00 AM – 6:00 PM PST</span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-300">115 S Adams St, Spokane WA</span>
            </div>

            {/* Live Open / Closed Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
              labStatus.isOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${labStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {labStatus.text}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {distanceKm !== null && (
              <span className="text-[11px] font-mono text-blue-300 hidden md:inline">
                ~{distanceKm} km from Spokane Lab
              </span>
            )}

            {!geoVerified && (
              <button
                onClick={handleVerifyGeo}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 underline underline-offset-2"
                title="Verify distance via GPS"
              >
                <Navigation className="w-3 h-3 text-blue-400" />
                GPS Check
              </button>
            )}

            <button
              onClick={onBookDropOff}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm text-[11px]"
            >
              <Calendar className="w-3 h-3" />
              Schedule Drop-Off
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-white transition-colors rounded-md"
              title="Dismiss Alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
