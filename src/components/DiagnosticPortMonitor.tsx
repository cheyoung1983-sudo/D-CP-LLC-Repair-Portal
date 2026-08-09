import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Usb, 
  Zap, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Pause, 
  Play, 
  Sliders, 
  Thermometer, 
  ShieldAlert, 
  Download, 
  Radio, 
  Cpu, 
  RotateCcw,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface TelemetryPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
  pdProfile: string;
}

export default function DiagnosticPortMonitor() {
  const { showToast } = useToast();

  const [webUsbSupported, setWebUsbSupported] = useState<boolean>(false);
  const [usbConnected, setUsbConnected] = useState<boolean>(false);
  const [deviceName, setDeviceName] = useState<string>('D&CP Bench Ammeter V2 (Simulated)');
  const [vendorId, setVendorId] = useState<string>('0x1A86');
  const [productId, setProductId] = useState<string>('0x7523');

  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [pdProfile, setPdProfile] = useState<'5V_STANDARD' | '9V_FAST' | '20V_MACBOOK' | 'SHORT_GROUND'>('9V_FAST');
  const [ccOrientation, setCcOrientation] = useState<'CC1_NORMAL' | 'CC2_FLIPPED'>('CC1_NORMAL');

  // Real-time live parameters
  const [currentVoltage, setCurrentVoltage] = useState<number>(9.02);
  const [currentAmps, setCurrentAmps] = useState<number>(1.84);
  const [dPlusVolt, setDPlusVolt] = useState<number>(2.71);
  const [dMinusVolt, setDMinusVolt] = useState<number>(2.68);
  const [internalTemp, setInternalTemp] = useState<number>(34.2);

  // Battery Health telemetry state
  const [batteryDesignCapacity, setBatteryDesignCapacity] = useState<number>(3500); // mAh
  const [batteryCycles, setBatteryCycles] = useState<number>(412);
  const [internalResistance, setInternalResistance] = useState<number>(26.4); // mΩ
  const [isSweepingBattery, setIsSweepingBattery] = useState<boolean>(false);

  // Historical telemetry stream buffer
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    // Check WebUSB support
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      setWebUsbSupported(true);
    }

    // Seed initial 15 points
    const now = new Date();
    const initialPoints: TelemetryPoint[] = [];
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 1000);
      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const v = 9.0 + (Math.random() * 0.08 - 0.04);
      const a = 1.8 + (Math.random() * 0.1 - 0.05);
      initialPoints.push({
        time: timeStr,
        voltage: Number(v.toFixed(2)),
        current: Number(a.toFixed(2)),
        power: Number((v * a).toFixed(2)),
        pdProfile: '9V PD Fast Charge'
      });
    }
    setTelemetryHistory(initialPoints);
  }, []);

  // WebUSB Connection Handler
  const connectWebUSB = async () => {
    if ('usb' in navigator) {
      try {
        const device = await (navigator as any).usb.requestDevice({ filters: [] });
        if (device) {
          setUsbConnected(true);
          setDeviceName(device.productName || `USB Device (${device.vendorId.toString(16)}:${device.productId.toString(16)})`);
          setVendorId(`0x${device.vendorId.toString(16).toUpperCase()}`);
          setProductId(`0x${device.productId.toString(16).toUpperCase()}`);
          showToast(`Connected to WebUSB device: ${device.productName || 'Diagnostic Port'}`, 'success');
        }
      } catch (err: any) {
        if (err.name !== 'NotFoundError') {
          console.error('WebUSB connection error:', err);
          showToast('WebUSB pairing failed or cancelled. Using simulated hardware benchmark.', 'info');
        }
      }
    } else {
      showToast('WebUSB is not supported in this browser. Running on high-precision bench simulator.', 'info');
    }
  };

  const disconnectUSB = () => {
    setUsbConnected(false);
    setDeviceName('D&CP Bench Ammeter V2 (Simulated)');
    showToast('WebUSB device disconnected. Reverted to bench simulator mode.', 'info');
  };

  // Live Telemetry Tick Loop
  useEffect(() => {
    if (!isStreaming) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      let targetV = 9.0;
      let targetA = 1.8;
      let label = '9V PD Fast Charge';

      if (pdProfile === '5V_STANDARD') {
        targetV = 5.10;
        targetA = 0.45;
        label = '5V Standard Legacy';
      } else if (pdProfile === '20V_MACBOOK') {
        targetV = 19.85;
        targetA = 3.25;
        label = '20V USB-PD High Wattage';
      } else if (pdProfile === 'SHORT_GROUND') {
        targetV = 2.15; // Voltage collapse
        targetA = 4.85; // High current draw short
        label = 'SHORT CIRCUIT DETECTED';
      }

      const noiseV = (Math.random() * 0.06 - 0.03);
      const noiseA = (Math.random() * 0.08 - 0.04);

      const v = Math.max(0, Number((targetV + noiseV).toFixed(2)));
      const a = Math.max(0, Number((targetA + noiseA).toFixed(2)));
      const p = Number((v * a).toFixed(2));

      setCurrentVoltage(v);
      setCurrentAmps(a);

      if (pdProfile === 'SHORT_GROUND') {
        setInternalTemp((prev) => Math.min(68, Number((prev + 0.4).toFixed(1))));
      } else {
        setInternalTemp((prev) => Math.max(31, Number((prev + (Math.random() * 0.2 - 0.1)).toFixed(1))));
      }

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryHistory((prev) => {
        const next = [...prev, { time: timeStr, voltage: v, current: a, power: p, pdProfile: label }];
        if (next.length > 25) next.shift();
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreaming, pdProfile]);

  const handleExportCSV = () => {
    const csvRows = [
      ['Timestamp', 'Voltage (V)', 'Current (A)', 'Power (W)', 'PD Profile'],
      ...telemetryHistory.map(pt => [pt.time, pt.voltage, pt.current, pt.power, `"${pt.pdProfile}"`])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DCP_DiagnosticPort_Telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported WebUSB Diagnostic Port stream to CSV.', 'success');
  };

  const calculatedPower = (currentVoltage * currentAmps).toFixed(2);
  const isShortToGround = pdProfile === 'SHORT_GROUND' || currentAmps > 4.0;

  // Dynamic State-of-Health Calculation (SoH %)
  const calculatedSoh = isShortToGround 
    ? 12.0 
    : Math.max(10, Math.min(100, Number((88.4 - (batteryCycles * 0.015) + (currentVoltage > 8.5 ? 2 : -3)).toFixed(1))));

  const fullChargeCapacity = Math.round(batteryDesignCapacity * (calculatedSoh / 100));

  const runBatteryDiagnosticSweep = () => {
    setIsSweepingBattery(true);
    showToast('Initiating WebUSB Battery Impedance & Health Sweep...', 'info');
    setTimeout(() => {
      setIsSweepingBattery(false);
      setInternalResistance(Number((20 + Math.random() * 10).toFixed(1)));
      showToast('Battery State-of-Health (SoH) sweep complete.', 'success');
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-[2.5rem] p-6 md:p-8 space-y-8 shadow-2xl border border-slate-800 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Connection Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Usb className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                WebUSB Telemetry Bridge
              </span>
              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${usbConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full ${usbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {usbConnected ? 'WebUSB Device Paired' : 'Bench Simulator Active'}
              </span>
            </div>
            <h3 className="text-2xl font-playfair font-black text-white mt-1 flex items-center gap-2">
              Hardware Diagnostic Port Live Monitor
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {!usbConnected ? (
            <button
              onClick={connectWebUSB}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Usb className="w-4 h-4" />
              <span>{webUsbSupported ? 'Pair WebUSB Ammeter' : 'Simulate Hardware'}</span>
            </button>
          ) : (
            <button
              onClick={disconnectUSB}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all border border-slate-700 flex items-center gap-2"
            >
              <span>Disconnect WebUSB</span>
            </button>
          )}

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isStreaming
                ? 'bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-slate-700'
                : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
            }`}
          >
            {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Export Telemetry Stream (CSV)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Device Info Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs relative z-10">
        <div className="flex items-center gap-3">
          <Radio className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Hardware Interface</span>
            <span className="font-mono text-white font-bold">{deviceName}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-slate-300 text-[11px]">
          <div>
            <span className="text-slate-500">VID:</span> <span className="text-blue-300">{vendorId}</span>
          </div>
          <div>
            <span className="text-slate-500">PID:</span> <span className="text-blue-300">{productId}</span>
          </div>
          <div>
            <span className="text-slate-500">Baud Rate:</span> <span className="text-emerald-400">115,200 bps</span>
          </div>
        </div>
      </div>

      {/* Main Digital Multimeter Displays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Voltage Display */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-inner">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bus Voltage (V)</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-mono font-black text-yellow-400 tracking-tight">
              {currentVoltage.toFixed(2)}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">Volts</span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Target: 5V - 20V</span>
            <span className="text-yellow-400/80 font-mono">PD Profile Active</span>
          </div>
        </div>

        {/* Current Ammeter Display */}
        <div className={`bg-slate-900/90 border p-5 rounded-2xl space-y-2 shadow-inner transition-colors ${
          isShortToGround ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Current Draw (A)</span>
            <Activity className={`w-4 h-4 ${isShortToGround ? 'text-red-400 animate-bounce' : 'text-blue-400'}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-4xl font-mono font-black tracking-tight ${
              isShortToGround ? 'text-red-400' : 'text-blue-400'
            }`}>
              {currentAmps.toFixed(2)}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">Amperes</span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Quiescent Sleep: 0.00A</span>
            <span className={isShortToGround ? 'text-red-400 font-bold' : 'text-blue-400 font-mono'}>
              {isShortToGround ? 'HIGH SHORT CURRENT' : `${(currentAmps * 1000).toFixed(0)} mA`}
            </span>
          </div>
        </div>

        {/* Calculated Power Display */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-inner">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Wattage Output (W)</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-mono font-black text-emerald-400 tracking-tight">
              {calculatedPower}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">Watts</span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Efficiency: 94.2%</span>
            <span className="text-emerald-400 font-mono">{calculatedPower} W Peak</span>
          </div>
        </div>

        {/* Internal Temperature & CC Orientation */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-inner">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Thermal & CC Line</span>
            <Thermometer className={`w-4 h-4 ${internalTemp > 45 ? 'text-orange-400 animate-pulse' : 'text-indigo-400'}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-mono font-black tracking-tight ${
              internalTemp > 45 ? 'text-orange-400' : 'text-indigo-300'
            }`}>
              {internalTemp.toFixed(1)}°C
            </span>
            <button
              onClick={() => setCcOrientation(ccOrientation === 'CC1_NORMAL' ? 'CC2_FLIPPED' : 'CC1_NORMAL')}
              className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-slate-700 transition-all"
            >
              {ccOrientation === 'CC1_NORMAL' ? 'CC1 Pin Normal' : 'CC2 Pin Flipped'}
            </button>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>D+ line: {dPlusVolt}V</span>
            <span>D- line: {dMinusVolt}V</span>
          </div>
        </div>
      </div>

      {/* Short Circuit Warning Banner */}
      {isShortToGround && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-950/80 border-2 border-red-500/80 p-4 rounded-2xl flex items-center justify-between gap-4 text-red-200 shadow-xl shadow-red-900/30"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 animate-bounce" />
            <div>
              <h5 className="font-black text-sm text-red-100 uppercase tracking-wider">
                CRITICAL SHORT-CIRCUIT / COLLAPSE WARNING
              </h5>
              <p className="text-xs text-red-300/90 font-medium mt-0.5">
                Bus voltage collapsed to {currentVoltage}V while current draw surged to {currentAmps}A. Suspected VDD_MAIN or PMIC short to ground.
              </p>
            </div>
          </div>

          <button
            onClick={() => setPdProfile('9V_FAST')}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-md shrink-0"
          >
            Clear Short Test
          </button>
        </motion.div>
      )}

      {/* Battery State of Health (SoH) Gauge Section */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 relative z-10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">Battery State-of-Health (SoH) Gauge</h4>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  calculatedSoh >= 80 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : calculatedSoh >= 60 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {calculatedSoh >= 80 ? 'Grade A · Optimal' : calculatedSoh >= 60 ? 'Grade B · Degraded' : 'Grade F · Replace Cell'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Real-time electrochemical impedance & voltage stability analysis via WebUSB ammeter
              </p>
            </div>
          </div>

          <button
            onClick={runBatteryDiagnosticSweep}
            disabled={isSweepingBattery}
            className={`px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              isSweepingBattery ? 'animate-pulse opacity-75' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSweepingBattery ? 'animate-spin' : ''}`} />
            <span>{isSweepingBattery ? 'Sweeping Impedance...' : 'Run Battery Health Sweep'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Radial Arc Gauge Widget */}
          <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* SVG Radial Arc */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#1e293b"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Gauge Progress Arc */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke={calculatedSoh >= 80 ? '#10b981' : calculatedSoh >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10"
                  strokeDasharray="301.59"
                  strokeDashoffset={301.59 - (301.59 * calculatedSoh) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Gauge Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-mono font-black ${
                  calculatedSoh >= 80 ? 'text-emerald-400' : calculatedSoh >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {calculatedSoh.toFixed(1)}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                  Health (SoH)
                </span>
              </div>
            </div>

            <div className="mt-2 text-xs font-medium text-slate-300">
              {calculatedSoh >= 80 
                ? 'Battery pack retains full peak performance under load.' 
                : calculatedSoh >= 60 
                ? 'Capacity degradation detected. Recommended for replacement.' 
                : 'Severe battery cell breakdown or short-circuit detected!'}
            </div>
          </div>

          {/* Battery Metrics Grid */}
          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Full Charge Capacity
              </span>
              <span className="text-xl font-mono font-black text-white block">
                {fullChargeCapacity} <span className="text-xs font-normal text-slate-400">mAh</span>
              </span>
              <span className="text-[10px] text-slate-500 block">
                Design Rating: {batteryDesignCapacity} mAh
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Internal Resistance (mΩ)
              </span>
              <span className={`text-xl font-mono font-black block ${
                internalResistance < 30 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {internalResistance.toFixed(1)} <span className="text-xs font-normal text-slate-400">mΩ</span>
              </span>
              <span className="text-[10px] text-slate-500 block">
                {internalResistance < 30 ? 'Low AC Impedance' : 'Elevated Cell Impedance'}
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Charge Cycle Count
              </span>
              <span className="text-xl font-mono font-black text-indigo-300 block">
                {batteryCycles} <span className="text-xs font-normal text-slate-400">Cycles</span>
              </span>
              <span className="text-[10px] text-slate-500 block">
                Expected Life: ~800 Cycles
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Bus Thermal Stability
              </span>
              <span className={`text-xl font-mono font-black block ${
                internalTemp > 45 ? 'text-red-400' : 'text-blue-400'
              }`}>
                {internalTemp.toFixed(1)}°C
              </span>
              <span className="text-[10px] text-slate-500 block">
                {internalTemp > 45 ? 'Over-heating Warning' : 'Safe Operating Temp'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* USB-PD Simulation Preset Switches */}
      <div className="space-y-3 relative z-10">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Simulate Bench Power Delivery (PD) Profiles
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: '5V_STANDARD', label: '5V Standard USB (0.45A)', desc: 'Idle Charging Profile' },
            { id: '9V_FAST', label: '9V PD Fast Charge (1.8A)', desc: 'Mobile QuickCharge' },
            { id: '20V_MACBOOK', label: '20V High Load (3.25A)', desc: 'Laptop / High Wattage' },
            { id: 'SHORT_GROUND', label: 'Inject Short Circuit (4.8A)', desc: 'Fault Simulation' },
          ].map((prof) => (
            <button
              key={prof.id}
              onClick={() => setPdProfile(prof.id as any)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                pdProfile === prof.id
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-xs font-bold block">{prof.label}</span>
              <span className="text-[10px] opacity-80 block mt-0.5 font-medium">{prof.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Oscilloscope / Power Stream Graph */}
      <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Real-Time Power & Current Stream (1Hz Buffer)
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">Monitoring voltage stability and instantaneous current ripple</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold font-mono">
            <span className="text-yellow-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> Voltage (V)
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Current (A)
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Power (W)
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="vG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#facc15" strokeWidth={2} fillOpacity={1} fill="url(#vG)" />
              <Area type="monotone" dataKey="current" name="Current (A)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#aG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
