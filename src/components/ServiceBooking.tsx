import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast.tsx';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  MapPin, 
  AlertCircle, 
  QrCode, 
  CalendarPlus, 
  ChevronLeft, 
  ChevronRight, 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Cpu, 
  PackageCheck, 
  ArrowRight, 
  Lock,
  Building2,
  FileText
} from 'lucide-react';

export interface BookingDetails {
  bookingId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  dropOffType: 'in_person' | 'express_lockbox' | 'courier';
  deviceCategory: string;
  serviceTier: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  createdAt: string;
}

const TIME_SLOTS = [
  { time: '08:30 AM', period: 'Morning', capacity: '3 slots open' },
  { time: '09:30 AM', period: 'Morning', capacity: '2 slots open' },
  { time: '10:30 AM', period: 'Morning', capacity: '4 slots open' },
  { time: '11:30 AM', period: 'Morning', capacity: '1 slot open' },
  { time: '01:00 PM', period: 'Afternoon', capacity: '3 slots open' },
  { time: '02:00 PM', period: 'Afternoon', capacity: '2 slots open' },
  { time: '03:00 PM', period: 'Afternoon', capacity: '5 slots open' },
  { time: '04:00 PM', period: 'Afternoon', capacity: '2 slots open' },
  { time: '05:00 PM', period: 'Evening', capacity: '1 slot open' },
];

const DROP_OFF_METHODS = [
  {
    id: 'in_person',
    title: 'In-Person Bench Consultation',
    subtitle: 'Meet with Lead Engineer David Chen or Sarah Martinez',
    icon: User,
    badge: 'Recommended',
    description: 'Direct 1-on-1 diagnostic intake at our Spokane Lab bench. Get immediate visual inspection and diagnostic feedback.'
  },
  {
    id: 'express_lockbox',
    title: '24/7 Express Lockbox Drop',
    subtitle: 'Drop off anytime at 115 S Adams St lockbox bay',
    icon: Lock,
    badge: '24/7 Access',
    description: 'Receive a secure single-use digital keypad code. Drop off your device securely day or night.'
  },
  {
    id: 'courier',
    title: 'Spokane Metro Express Courier',
    subtitle: 'Local pickup within Spokane metropolitan area',
    icon: PackageCheck,
    badge: 'Local Pickup',
    description: 'Our bonded courier collects your device directly from your home or office address.'
  }
];

const SERVICE_TIERS = [
  { id: 'tier1', label: 'Tier 1: Battery & Power', duration: '30 mins intake', price: 'Est. $45 - $85', icon: Zap },
  { id: 'tier2', label: 'Tier 2: Display & Screen Renewal', duration: '45 mins intake', price: 'Est. $145 - $185', icon: Layers },
  { id: 'tier3', label: 'Tier 3: Logic Board & Soldering', duration: '60 mins triage', price: 'Custom Quote', icon: Cpu },
  { id: 'general', label: 'General Diagnostic Evaluation', duration: '20 mins intake', price: 'Free Triage', icon: Wrench },
];

export default function ServiceBooking({ onSelectTracker }: { onSelectTracker?: (ticketId: string) => void }) {
  const { showToast } = useToast();

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1); // Skip Sunday
    return tomorrow.toISOString().split('T')[0];
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:30 AM');
  const [dropOffType, setDropOffType] = useState<'in_person' | 'express_lockbox' | 'courier'>('in_person');
  const [serviceTier, setServiceTier] = useState<string>('tier2');
  const [deviceCategory, setDeviceCategory] = useState<string>('iPhone / iOS Device');

  // Contact Info
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingDetails | null>(null);

  // Calendar Date Helper Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    const now = new Date();
    if (prev.getFullYear() < now.getFullYear() || (prev.getFullYear() === now.getFullYear() && prev.getMonth() < now.getMonth())) {
      return; // Don't go before current month
    }
    setCurrentMonthDate(prev);
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const isDateDisabled = (dayNum: number) => {
    const checkDate = new Date(year, month, dayNum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Past dates or Sundays (0) disabled
    return checkDate < today || checkDate.getDay() === 0;
  };

  const handleDateSelect = (dayNum: number) => {
    if (isDateDisabled(dayNum)) return;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    setSelectedDateStr(dateStr);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please complete all required customer contact fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    showToast('Scheduling Spokane Lab Drop-off Reservation...', 'info');

    try {
      const res = await fetch('/api/booking/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDateStr,
          timeSlot: selectedTimeSlot,
          dropOffType,
          deviceCategory,
          serviceTier,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          notes: formData.notes
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.booking) {
        setConfirmedBooking(data.booking);
        showToast(`Appointment confirmed! Booking ID: ${data.booking.bookingId}`, 'success');
      } else {
        showToast(data.error || 'Booking reservation failed. Please retry.', 'error');
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast('Network error while transmitting reservation payload.', 'error');
    }
  };

  // Generate .ics Calendar Download File
  const handleDownloadIcs = () => {
    if (!confirmedBooking) return;

    const dateFormatted = confirmedBooking.date.replace(/-/g, '');
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//D&CP LLC Spokane Lab//Drop-off Reservation//EN
BEGIN:VEVENT
SUMMARY:D&CP Spokane Lab Device Drop-Off (${confirmedBooking.bookingId})
DESCRIPTION:Drop-off reservation at D&CP Spokane Lab HQ.\\nService: ${confirmedBooking.serviceTier}\\nMethod: ${confirmedBooking.dropOffType}\\nAddress: 115 S Adams St, Spokane, WA 99201.
LOCATION:115 S Adams St, Spokane, WA 99201
DTSTART:${dateFormatted}T093000Z
DTEND:${dateFormatted}T100000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DCP_DropOff_${confirmedBooking.bookingId}.ics`;
    a.click();
    showToast('Calendar invitation (.ics) saved to device.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <CalendarIcon className="w-3.5 h-3.5" />
          Spokane Lab Service Scheduling
        </div>
        <h2 className="text-4xl md:text-5xl font-playfair font-black text-slate-900 tracking-tight">
          Schedule Device Drop-Off
        </h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Reserve a dedicated bench triage time or 24/7 lockbox slot at our Spokane laboratory (115 S Adams St). Guaranteed zero queue waiting time upon arrival.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {confirmedBooking ? (
          /* Confirmation Screen */
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-8 max-w-3xl mx-auto"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                  Drop-Off Reservation Confirmed
                </span>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  Pass ID: {confirmedBooking.bookingId}
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  A confirmation summary was transmitted to {confirmedBooking.customerEmail}
                </p>
              </div>
            </div>

            {/* QR Scanner & Ticket Pass Box */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled Date & Time</p>
                  <p className="text-xl font-bold text-white">{confirmedBooking.date} • {confirmedBooking.timeSlot}</p>
                </div>

                <div className="space-y-1 border-t border-slate-800 pt-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location Address</p>
                  <p className="text-xs font-bold text-slate-300">D&CP Spokane Lab • 115 S Adams St, Spokane, WA 99201</p>
                </div>

                <div className="space-y-1 border-t border-slate-800 pt-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drop-off Protocol</p>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    {confirmedBooking.dropOffType === 'express_lockbox' ? '24/7 Digital Lockbox (Keypad Pin Sent)' : 'In-Person Bench Consultation'}
                  </p>
                </div>
              </div>

              {/* QR Code Pass Graphic */}
              <div className="bg-white p-4 rounded-2xl shrink-0 flex flex-col items-center justify-center space-y-2 shadow-lg">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="text-[9px] font-mono font-bold text-slate-600 tracking-wider">
                  SCAN AT LAB KIOSK
                </span>
              </div>
            </div>

            {/* Preparation Checklist */}
            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Pre-Arrival Laboratory Checklist
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Perform a local data backup if touch screen digitizer remains responsive.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Remove SIM card or memory expansion cards unless relevant to repair.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  For liquid ingress cases: Do NOT attempt to charge or connect power cables.
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleDownloadIcs}
                className="py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <CalendarPlus className="w-4 h-4" />
                Add to Apple / Google Calendar
              </button>

              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setFormData({ name: '', email: '', phone: '', notes: '' });
                }}
                className="py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
              >
                Book Another Drop-Off
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Booking Form with Calendar */
          <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Calendar & Time Slot Picker (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Calendar Control Box */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-900">
                      {monthNames[month]} {year}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Spokane Lab operational hours: Mon-Fri 8am-6pm PST</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                      title="Next Month"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Day Name Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Blank slots before first day */}
                  {Array.from({ length: firstDay }).map((_, idx) => (
                    <div key={`blank-${idx}`} className="h-12" />
                  ))}

                  {/* Day numbers */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isDisabled = isDateDisabled(dayNum);
                    
                    const mStr = String(month + 1).padStart(2, '0');
                    const dStr = String(dayNum).padStart(2, '0');
                    const thisDateStr = `${year}-${mStr}-${dStr}`;
                    const isSelected = selectedDateStr === thisDateStr;

                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => handleDateSelect(dayNum)}
                        disabled={isDisabled}
                        className={`h-12 rounded-2xl font-bold text-xs transition-all flex flex-col items-center justify-center relative ${
                          isDisabled 
                            ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed' 
                            : isSelected
                              ? 'bg-slate-900 text-white shadow-lg scale-105'
                              : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-800'
                        }`}
                      >
                        <span>{dayNum}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selector */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Select Arrival Time Slot ({selectedDateStr})
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                    Guaranteed Fast Triage
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot, idx) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <p className="font-bold text-xs">{slot.time}</p>
                        <p className={`text-[9px] font-medium mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {slot.capacity}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drop-Off Method Selector */}
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-900 px-2">Select Drop-Off Method</h3>
                <div className="space-y-3">
                  {DROP_OFF_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isActive = dropOffType === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setDropOffType(method.id as any)}
                        className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${
                          isActive
                            ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-lg'
                            : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900">{method.title}</h4>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {method.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{method.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Customer Info & Service Selection (5 Cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-black text-xl text-slate-900">Contact & Device Info</h3>
                  <p className="text-xs text-slate-400 font-medium">Provide your details for automated pass creation</p>
                </div>

                {/* Device Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Device Platform</label>
                  <select
                    value={deviceCategory}
                    onChange={(e) => setDeviceCategory(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:border-slate-900 transition-all"
                  >
                    <option value="iPhone / iOS Device">iPhone / Apple iOS Device</option>
                    <option value="MacBook / Mac Computer">MacBook / Mac Desktop</option>
                    <option value="Android Smartphone / Tablet">Android Smartphone / Tablet</option>
                    <option value="Gaming Console / PCB">Gaming Console / Custom PCB</option>
                    <option value="Other Micro-electronics">Other Precision Micro-electronics</option>
                  </select>
                </div>

                {/* Service Tier */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Requirement</label>
                  <div className="space-y-2">
                    {SERVICE_TIERS.map((tier) => {
                      const isSel = serviceTier === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setServiceTier(tier.id)}
                          className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isSel ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="font-bold">{tier.label}</span>
                          <span className={`text-[10px] font-mono ${isSel ? 'text-blue-300' : 'text-slate-500'}`}>{tier.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Contact Fields */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-slate-900 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. eleanor@spokane.org"
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-slate-900 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. (509) 555-0192"
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-slate-900 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Symptom Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Brief description of device malfunction..."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-slate-900 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit Reservation */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all shadow-xl disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <span>Processing Reservation...</span>
                  ) : (
                    <>
                      <span>Confirm Drop-Off Reservation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
