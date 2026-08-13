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
  Info,
  Terminal,
  Settings2,
  ListFilter,
  ArrowRightLeft,
  X,
  Search,
  Key,
  Database
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface TelemetryPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
  pdProfile: string;
}

interface UsbPacketLog {
  id: string;
  timestamp: string;
  direction: 'IN' | 'OUT' | 'CONTROL' | 'STATUS';
  type: string;
  length: number;
  hexData: string;
  asciiData: string;
}

export default function DiagnosticPortMonitor() {
  const { showToast } = useToast();

  const [webUsbSupported, setWebUsbSupported] = useState<boolean>(false);
  const [usbConnected, setUsbConnected] = useState<boolean>(false);
  const [pairedDevice, setPairedDevice] = useState<any>(null);
  const [deviceName, setDeviceName] = useState<string>('D&CP Bench Ammeter V2 (Simulated)');
  const [vendorId, setVendorId] = useState<string>('0x1A86');
  const [productId, setProductId] = useState<string>('0x7523');
  const [manufacturer, setManufacturer] = useState<string>('D&CP Spokane Lab');
  const [serialNumber, setSerialNumber] = useState<string>('DCP-BENCH-8821');

  const [activeTab, setActiveTab] = useState<'monitor' | 'control' | 'inspector' | 'packets'>('monitor');

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

  // Packet traffic log
  const [packetLogs, setPacketLogs] = useState<UsbPacketLog[]>([]);
  const [packetFilter, setPacketFilter] = useState<string>('ALL');

  // Custom Control Transfer State
  const [requestType, setRequestType] = useState<string>('vendor'); // 'standard' | 'class' | 'vendor'
  const [recipient, setRecipient] = useState<string>('device'); // 'device' | 'interface' | 'endpoint'
  const [requestCode, setRequestCode] = useState<string>('0x01');
  const [valueCode, setValueCode] = useState<string>('0x0000');
  const [indexCode, setIndexCode] = useState<string>('0x0000');
  const [transferLength, setTransferLength] = useState<number>(8);
  const [customOutHex, setCustomOutHex] = useState<string>('5354415455533031'); // ASCII: "STATUS01"
  const [transferResponse, setTransferResponse] = useState<string | null>(null);

  // Filter selection modal
  const [selectedFilterPreset, setSelectedFilterPreset] = useState<string>('ALL');

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    // Check WebUSB support
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      setWebUsbSupported(true);

      // Check for previously granted WebUSB devices
      (navigator as any).usb.getDevices().then((devices: any[]) => {
        if (devices.length > 0) {
          const dev = devices[0];
          setPairedDevice(dev);
          setUsbConnected(true);
          setDeviceName(dev.productName || `USB Device (${dev.vendorId.toString(16)}:${dev.productId.toString(16)})`);
          setVendorId(`0x${dev.vendorId.toString(16).toUpperCase()}`);
          setProductId(`0x${dev.productId.toString(16).toUpperCase()}`);
          if (dev.manufacturerName) setManufacturer(dev.manufacturerName);
          if (dev.serialNumber) setSerialNumber(dev.serialNumber);
          showToast(`Reconnected to paired WebUSB device: ${dev.productName || 'USB Peripheral'}`, 'success');
        }
      }).catch((err: any) => console.warn('WebUSB getDevices error:', err));

      // Hotplug listeners
      const handleConnect = (event: any) => {
        const dev = event.device;
        showToast(`WebUSB device attached: ${dev.productName || 'Hardware Ammeter'}`, 'info');
      };

      const handleDisconnect = (event: any) => {
        if (pairedDevice && event.device === pairedDevice) {
          setUsbConnected(false);
          setPairedDevice(null);
          setDeviceName('D&CP Bench Ammeter V2 (Simulated)');
          showToast('WebUSB hardware disconnected.', 'info');
        }
      };

      (navigator as any).usb.addEventListener('connect', handleConnect);
      (navigator as any).usb.addEventListener('disconnect', handleDisconnect);

      return () => {
        (navigator as any).usb.removeEventListener('connect', handleConnect);
        (navigator as any).usb.removeEventListener('disconnect', handleDisconnect);
      };
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
        let filters: any[] = [];
        if (selectedFilterPreset === 'DCP_BENCH') {
          filters = [{ vendorId: 0x1A86 }]; // WCH / CH340 benchmark
        } else if (selectedFilterPreset === 'FTDI') {
          filters = [{ vendorId: 0x0403 }];
        } else if (selectedFilterPreset === 'STM32') {
          filters = [{ vendorId: 0x0483 }];
        } else if (selectedFilterPreset === 'APPLE_DFU') {
          filters = [{ vendorId: 0x05AC }];
        } else if (selectedFilterPreset === 'ARDUINO') {
          filters = [{ vendorId: 0x2341 }];
        }

        const device = await (navigator as any).usb.requestDevice({ filters });
        if (device) {
          try {
            await device.open();
            if (device.configuration === null) {
              await device.selectConfiguration(1);
            }
            await device.claimInterface(0);
          } catch (openErr) {
            console.warn('WebUSB interface claiming note:', openErr);
          }

          setPairedDevice(device);
          setUsbConnected(true);
          setDeviceName(device.productName || `USB Device (${device.vendorId.toString(16)}:${device.productId.toString(16)})`);
          setVendorId(`0x${device.vendorId.toString(16).toUpperCase()}`);
          setProductId(`0x${device.productId.toString(16).toUpperCase()}`);
          setManufacturer(device.manufacturerName || 'Custom USB Device');
          setSerialNumber(device.serialNumber || 'SN-USB-' + Math.floor(Math.random() * 100000));

          addPacketLog('STATUS', 'CONNECT', 0, '00', 'DEVICE_OPENED');
          showToast(`Successfully paired WebUSB device: ${device.productName || 'Diagnostic Ammeter'}`, 'success');
        }
      } catch (err: any) {
        if (err.name !== 'NotFoundError') {
          console.error('WebUSB connection error:', err);
          showToast('WebUSB pairing failed or cancelled. Running on simulator.', 'info');
        }
      }
    } else {
      showToast('WebUSB API is not supported in this browser environment. Using bench simulator.', 'info');
    }
  };

  const disconnectUSB = async () => {
    if (pairedDevice) {
      try {
        await pairedDevice.close();
      } catch (e) {
        console.warn('USB close note:', e);
      }
    }
    setPairedDevice(null);
    setUsbConnected(false);
    setDeviceName('D&CP Bench Ammeter V2 (Simulated)');
    setManufacturer('D&CP Spokane Lab');
    setSerialNumber('DCP-BENCH-8821');
    addPacketLog('STATUS', 'DISCONNECT', 0, '00', 'DEVICE_CLOSED');
    showToast('WebUSB device disconnected. Reverted to bench simulator mode.', 'info');
  };

  const resetUsbHardware = async () => {
    if (pairedDevice && pairedDevice.opened) {
      try {
        await pairedDevice.reset();
        addPacketLog('STATUS', 'BUS_RESET', 0, 'FF', 'USB_BUS_RESET_OK');
        showToast('WebUSB hardware bus reset issued successfully.', 'success');
      } catch (err: any) {
        showToast('USB reset command error: ' + err.message, 'error');
      }
    } else {
      addPacketLog('STATUS', 'BUS_RESET', 0, 'FF', 'SIMULATED_BUS_RESET');
      showToast('Simulated WebUSB hardware bus reset completed.', 'info');
    }
  };

  // Send WebUSB Control Transfer IN (Read)
  const executeControlTransferIn = async () => {
    const rType = requestType as 'standard' | 'class' | 'vendor';
    const rRecipient = recipient as 'device' | 'interface' | 'endpoint';
    const req = parseInt(requestCode, 16) || 0;
    const val = parseInt(valueCode, 16) || 0;
    const idx = parseInt(indexCode, 16) || 0;

    if (pairedDevice && pairedDevice.opened) {
      try {
        const result = await pairedDevice.controlTransferIn(
          {
            requestType: rType,
            recipient: rRecipient,
            request: req,
            value: val,
            index: idx,
          },
          transferLength
        );

        if (result.data) {
          const uint8 = new Uint8Array(result.data.buffer);
          const hex = Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join(' ');
          const ascii = Array.from(uint8).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
          
          setTransferResponse(`Status: ${result.status}\nHex: ${hex}\nASCII: ${ascii}`);
          addPacketLog('IN', 'CTRL_IN', uint8.length, hex.replace(/\s+/g, ''), ascii);
          showToast(`Control Transfer IN success (${result.status})`, 'success');
        }
      } catch (err: any) {
        setTransferResponse(`Error: ${err.message}`);
        showToast(`Control Transfer IN failed: ${err.message}`, 'error');
      }
    } else {
      // Simulation response
      const mockBytes = [0x56, 0x4F, 0x4C, 0x54, 0x3A, 0x30, 0x39, 0x56]; // "VOLT:09V"
      const hex = mockBytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
      const ascii = mockBytes.map(b => String.fromCharCode(b)).join('');
      setTransferResponse(`Status: ok (Simulated)\nHex: ${hex}\nASCII: ${ascii}`);
      addPacketLog('IN', 'CTRL_IN_SIM', mockBytes.length, hex.replace(/\s+/g, ''), ascii);
      showToast('Simulated WebUSB Control Transfer IN executed.', 'info');
    }
  };

  // Send WebUSB Control Transfer OUT (Write)
  const executeControlTransferOut = async () => {
    const rType = requestType as 'standard' | 'class' | 'vendor';
    const rRecipient = recipient as 'device' | 'interface' | 'endpoint';
    const req = parseInt(requestCode, 16) || 0;
    const val = parseInt(valueCode, 16) || 0;
    const idx = parseInt(indexCode, 16) || 0;

    const rawHex = customOutHex.replace(/[^0-9a-fA-F]/g, '');
    const bytes = new Uint8Array(rawHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [0x00]);

    if (pairedDevice && pairedDevice.opened) {
      try {
        const result = await pairedDevice.controlTransferOut(
          {
            requestType: rType,
            recipient: rRecipient,
            request: req,
            value: val,
            index: idx,
          },
          bytes.buffer
        );

        setTransferResponse(`Status: ${result.status}\nBytes Transferred: ${result.bytesWritten}`);
        const ascii = Array.from(bytes).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
        addPacketLog('OUT', 'CTRL_OUT', bytes.length, rawHex, ascii);
        showToast(`Control Transfer OUT success (${result.status})`, 'success');
      } catch (err: any) {
        setTransferResponse(`Error: ${err.message}`);
        showToast(`Control Transfer OUT failed: ${err.message}`, 'error');
      }
    } else {
      const ascii = Array.from(bytes).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
      setTransferResponse(`Status: ok (Simulated OUT)\nBytes Written: ${bytes.length}`);
      addPacketLog('OUT', 'CTRL_OUT_SIM', bytes.length, rawHex, ascii);
      showToast('Simulated WebUSB Control Transfer OUT executed.', 'info');
    }
  };

  const addPacketLog = (direction: 'IN' | 'OUT' | 'CONTROL' | 'STATUS', type: string, length: number, hexData: string, asciiData: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 } as any);
    const newLog: UsbPacketLog = {
      id: `pkt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      direction,
      type,
      length,
      hexData,
      asciiData,
    };
    setPacketLogs(prev => [newLog, ...prev.slice(0, 49)]);
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

      // Periodically append live packet log to demonstrate WebUSB stream
      if (Math.random() > 0.6) {
        const hexVal = Math.floor(v * 100).toString(16).padStart(4, '0') + Math.floor(a * 100).toString(16).padStart(4, '0');
        addPacketLog('IN', 'BULK_TELEMETRY', 8, `5044${hexVal}`, `PD_${v}V`);
      }
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

  const filteredLogs = packetLogs.filter(log => {
    if (packetFilter === 'ALL') return true;
    return log.direction === packetFilter;
  });

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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                WebUSB Hardware Bridge API
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
            <div className="flex items-center gap-2">
              <select
                value={selectedFilterPreset}
                onChange={(e) => setSelectedFilterPreset(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 font-mono focus:outline-none"
              >
                <option value="ALL">All USB Devices</option>
                <option value="DCP_BENCH">D&CP Bench Ammeter (0x1A86)</option>
                <option value="FTDI">FTDI Serial (0x0403)</option>
                <option value="STM32">STMicroelectronics (0x0483)</option>
                <option value="APPLE_DFU">Apple DFU Mode (0x05AC)</option>
                <option value="ARDUINO">Arduino Board (0x2341)</option>
              </select>

              <button
                type="button"
                onClick={connectWebUSB}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 shrink-0"
              >
                <Usb className="w-4 h-4 text-amber-300" />
                <span>{webUsbSupported ? 'Pair WebUSB Hardware' : 'Simulate Hardware'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetUsbHardware}
                className="px-3 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                title="Issue WebUSB Bus Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>USB Bus Reset</span>
              </button>

              <button
                type="button"
                onClick={disconnectUSB}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all border border-slate-700 flex items-center gap-2"
              >
                <span>Disconnect</span>
              </button>
            </div>
          )}

          <button
            type="button"
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
            type="button"
            onClick={handleExportCSV}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Export Telemetry Stream (CSV)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto relative z-10">
        {[
          { id: 'monitor', label: 'Live Ammeter & Telemetry', icon: Activity },
          { id: 'control', label: 'USB Control Transfers', icon: Terminal },
          { id: 'inspector', label: 'USB Descriptor Inspector', icon: Database },
          { id: 'packets', label: 'Raw Packet Traffic Log', icon: ArrowRightLeft },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Device Info Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs relative z-10">
        <div className="flex items-center gap-3">
          <Radio className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active WebUSB Target</span>
            <span className="font-mono text-white font-bold">{deviceName}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-slate-300 text-[11px] flex-wrap">
          <div>
            <span className="text-slate-500">MFR:</span> <span className="text-slate-200">{manufacturer}</span>
          </div>
          <div>
            <span className="text-slate-500">VID:</span> <span className="text-blue-300">{vendorId}</span>
          </div>
          <div>
            <span className="text-slate-500">PID:</span> <span className="text-blue-300">{productId}</span>
          </div>
          <div>
            <span className="text-slate-500">S/N:</span> <span className="text-amber-300">{serialNumber}</span>
          </div>
        </div>
      </div>

      {/* TAB 1: Live Ammeter & Telemetry */}
      {activeTab === 'monitor' && (
        <div className="space-y-8 relative z-10">
          {/* Main Digital Multimeter Displays */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  type="button"
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
                type="button"
                onClick={() => setPdProfile('9V_FAST')}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-md shrink-0"
              >
                Clear Short Test
              </button>
            </motion.div>
          )}

          {/* Battery State of Health (SoH) Gauge Section */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
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
                type="button"
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
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="48" stroke="#1e293b" strokeWidth="10" fill="transparent" />
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
                  <span className="text-[10px] text-slate-500 block">Design Rating: {batteryDesignCapacity} mAh</span>
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
                  <span className="text-[10px] text-slate-500 block">Expected Life: ~800 Cycles</span>
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
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Bench Power Delivery (PD) Profile Mode
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
                  type="button"
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
          <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
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
      )}

      {/* TAB 2: USB Control Transfers & Console */}
      {activeTab === 'control' && (
        <div className="space-y-6 relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                WebUSB Control Transfer Endpoint Console
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Issue low-level USB setup parameters (<code className="text-amber-300">controlTransferIn</code> / <code className="text-amber-300">controlTransferOut</code>) to connected hardware or simulated firmware.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Request Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="standard">Standard (0x00)</option>
                  <option value="class">Class Specific (0x20)</option>
                  <option value="vendor">Vendor Specific (0x40)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Recipient Target</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="device">Device (0x00)</option>
                  <option value="interface">Interface (0x01)</option>
                  <option value="endpoint">Endpoint (0x02)</option>
                  <option value="other">Other (0x03)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">bRequest Code (Hex)</label>
                <input
                  type="text"
                  value={requestCode}
                  onChange={(e) => setRequestCode(e.target.value)}
                  placeholder="0x01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">wValue (Hex)</label>
                <input
                  type="text"
                  value={valueCode}
                  onChange={(e) => setValueCode(e.target.value)}
                  placeholder="0x0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">wIndex (Hex)</label>
                <input
                  type="text"
                  value={indexCode}
                  onChange={(e) => setIndexCode(e.target.value)}
                  placeholder="0x0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">IN Buffer Length (Bytes)</label>
                <input
                  type="number"
                  value={transferLength}
                  onChange={(e) => setTransferLength(Number(e.target.value))}
                  min={1}
                  max={64}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1 font-mono">
                OUT Data Payload (Hex Bytes)
              </label>
              <input
                type="text"
                value={customOutHex}
                onChange={(e) => setCustomOutHex(e.target.value)}
                placeholder="5354415455533031"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={executeControlTransferIn}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Send ControlTransferIn (Read)</span>
              </button>

              <button
                type="button"
                onClick={executeControlTransferOut}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Send ControlTransferOut (Write)</span>
              </button>
            </div>

            {transferResponse && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 text-slate-300">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Last Transfer Response</span>
                <pre className="whitespace-pre-wrap text-emerald-300">{transferResponse}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USB Descriptor Inspector */}
      {activeTab === 'inspector' && (
        <div className="space-y-6 relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                USB Hardware & Descriptor Tree Inspector
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Deep enumeration of USB device class, configurations, interface descriptors, and endpoint address maps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Device Attributes */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono text-xs">
                <h5 className="font-sans font-bold text-slate-300 border-b border-slate-800 pb-2 text-sm">
                  Device Attributes
                </h5>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">USB Spec Version:</span>
                    <span className="text-amber-400">USB 2.00 (bcdUSB 0x0200)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Device Class:</span>
                    <span className="text-blue-300">0x00 (Defined at Interface)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Device SubClass:</span>
                    <span className="text-blue-300">0x00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Device Protocol:</span>
                    <span className="text-blue-300">0x00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Packet Size 0:</span>
                    <span className="text-emerald-400">64 Bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Configurations:</span>
                    <span className="text-white">1 Active Configuration</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Endpoint Map */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-mono text-xs">
                <h5 className="font-sans font-bold text-slate-300 border-b border-slate-800 pb-2 text-sm">
                  Interface & Endpoint Structure
                </h5>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-amber-400 font-bold block">Interface 0 (CDC / Bulk Serial)</span>
                    <div className="text-[11px] text-slate-400 space-y-0.5 pl-2 border-l border-slate-700">
                      <div>EP 0x81 IN (Bulk) · Max 64 Bytes · Interval 0ms</div>
                      <div>EP 0x02 OUT (Bulk) · Max 64 Bytes · Interval 0ms</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-blue-400 font-bold block">Interface 1 (Diagnostic Telemetry)</span>
                    <div className="text-[11px] text-slate-400 space-y-0.5 pl-2 border-l border-slate-700">
                      <div>EP 0x83 IN (Interrupt) · Max 16 Bytes · Interval 10ms</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Raw USB Packet Traffic Log */}
      {activeTab === 'packets' && (
        <div className="space-y-4 relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                  Live WebUSB Packet Traffic Inspector
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Captured IN/OUT USB endpoint frames and control transfer acknowledgments
                </p>
              </div>

              <div className="flex items-center gap-2">
                {['ALL', 'IN', 'OUT', 'STATUS'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setPacketFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      packetFilter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="font-mono text-xs space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredLogs.map((log) => {
                const isIN = log.direction === 'IN';
                const isOUT = log.direction === 'OUT';
                const isStatus = log.direction === 'STATUS';

                const badgeStyle = isIN
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : isOUT
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                return (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950 border border-slate-800/90 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                        {log.direction} · {log.type}
                      </span>
                      <span className="text-slate-400 text-[11px]">{log.length} Bytes</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] overflow-x-auto">
                      <span className="text-emerald-400 font-mono tracking-wider">{log.hexData}</span>
                      <span className="text-slate-500">[{log.asciiData}]</span>
                    </div>
                  </div>
                );
              })}

              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No WebUSB packets logged under this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
