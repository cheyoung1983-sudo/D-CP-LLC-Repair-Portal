import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Activity, Clock, AlertTriangle, CheckCircle2, TrendingUp, Filter, Download, 
  Cpu, Zap, ShieldCheck, RefreshCw, BarChart3, Wrench, Layers, UserCheck
} from 'lucide-react';
import { useToast } from './Toast.tsx';

// 30-day turnaround time trend data (in hours)
const TURNAROUND_TREND_DATA = [
  { day: 'Jul 10', target: 6.0, avgHours: 5.8, expressHours: 2.1, volume: 11 },
  { day: 'Jul 13', target: 6.0, avgHours: 5.2, expressHours: 1.9, volume: 14 },
  { day: 'Jul 16', target: 6.0, avgHours: 4.9, expressHours: 1.8, volume: 12 },
  { day: 'Jul 19', target: 6.0, avgHours: 4.5, expressHours: 1.5, volume: 16 },
  { day: 'Jul 22', target: 6.0, avgHours: 4.8, expressHours: 1.6, volume: 10 },
  { day: 'Jul 25', target: 6.0, avgHours: 4.2, expressHours: 1.4, volume: 15 },
  { day: 'Jul 28', target: 6.0, avgHours: 3.9, expressHours: 1.3, volume: 18 },
  { day: 'Jul 31', target: 6.0, avgHours: 4.1, expressHours: 1.2, volume: 13 },
  { day: 'Aug 03', target: 6.0, avgHours: 3.7, expressHours: 1.1, volume: 19 },
  { day: 'Aug 06', target: 6.0, avgHours: 3.5, expressHours: 1.0, volume: 17 },
  { day: 'Aug 08', target: 6.0, avgHours: 3.4, expressHours: 0.9, volume: 21 },
];

// Common Failure Modes & Root Cause Rates
const FAILURE_RATES_DATA = [
  { name: 'Cracked OLED / Digitizer', count: 124, percentage: 36.2, category: 'Display', color: '#2563eb' },
  { name: 'Battery Degradation / Swelling', count: 86, percentage: 25.1, category: 'Power', color: '#3b82f6' },
  { name: 'Liquid Ingress Corrosion', count: 48, percentage: 14.0, category: 'Micro-Soldering', color: '#06b6d4' },
  { name: 'PMIC / Power Rail Short', count: 38, percentage: 11.1, category: 'Logic Board', color: '#10b981' },
  { name: 'USB-C / Lightning Port Wear', count: 28, percentage: 8.2, category: 'I/O Assembly', color: '#f59e0b' },
  { name: 'Audio IC / NAND Fracture', count: 18, percentage: 5.4, category: 'Logic Board', color: '#6366f1' },
];

// Turnaround Time & Volume by Device Platform
const PLATFORM_PERFORMANCE_DATA = [
  { platform: 'iPhone / iOS', avgTurnaround: 2.8, successRate: 99.1, jobs: 162 },
  { platform: 'MacBook Pro/Air', avgTurnaround: 6.4, successRate: 97.5, jobs: 84 },
  { platform: 'Android / Galaxy', avgTurnaround: 3.6, successRate: 98.2, jobs: 58 },
  { platform: 'Custom PCB / Consoles', avgTurnaround: 8.2, successRate: 95.8, jobs: 38 },
];

// Technician Bench Benchmark Performance
const TECH_BENCHMARK_DATA = [
  { name: 'David Chen', role: 'Lead Micro-Soldering Specialist', completed: 128, avgTime: '3.1 hrs', yieldRate: '99.2%', score: 98 },
  { name: 'Sarah Martinez', role: 'Display & Battery Lead', completed: 114, avgTime: '2.4 hrs', yieldRate: '98.8%', score: 96 },
  { name: 'Alex Rivera', role: 'Diagnostic & Triage Tech', completed: 100, avgTime: '3.8 hrs', yieldRate: '97.9%', score: 94 },
];

export default function RepairAnalytics() {
  const { showToast } = useToast();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('30-Day Laboratory Repair Metrics refreshed from Spokane Lab DB.', 'success');
    }, 600);
  };

  const handleExportReport = () => {
    showToast('Exporting Technician Performance & Failure Analysis Report (CSV)...', 'info');
    setTimeout(() => {
      showToast('Technician_Analytics_30Days_Report.csv downloaded.', 'success');
    }, 800);
  };

  const filteredFailureRates = selectedCategory === 'All' 
    ? FAILURE_RATES_DATA 
    : FAILURE_RATES_DATA.filter(item => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <BarChart3 className="w-3.5 h-3.5" />
            Spokane Laboratory Benchmark
          </div>
          <h2 className="text-4xl font-playfair font-black text-slate-900 tracking-tight">
            Repair Telemetry & Failure Analytics
          </h2>
          <p className="text-slate-500 text-xs font-medium max-w-xl">
            Real-time bench turnaround metrics, failure mode distribution, and technician yield rates over the last 30 operational days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filter Buttons */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-700 transition-all shadow-sm"
            title="Refresh Bench Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={handleExportReport}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Turnaround Time</span>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">3.4 hrs</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                -18.2%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">vs. 4.2 hrs previous 30-day cycle</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">First-Pass Yield</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">98.4%</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                +0.6%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">RMA return rate under 1.2%</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">30-Day Completed Jobs</span>
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">342</span>
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-0.5">
                +14.5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">11.4 repairs per operational day</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Micro-Soldering Triage</span>
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">24.5%</span>
              <span className="text-xs font-bold text-amber-600">84 Board Triage</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Level 3 BGA / PMIC Component Work</p>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Grid: Turnaround Trend + Failure Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Turnaround Time Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Turnaround Time Velocity (Hours)
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Average hours from intake pass scan to final quality pass</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" /> Standard Bench
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Express Pass
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TURNAROUND_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="h" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} hrs`, '']}
                />
                <Area type="monotone" dataKey="avgHours" name="Standard Repair" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                <Area type="monotone" dataKey="expressHours" name="Express Drop-off" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorExpress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Failure Mode Rates (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Failure Mode Breakdown
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Top hardware fault triggers logged at triage</p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Display', 'Power', 'Micro-Soldering', 'Logic Board'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredFailureRates} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} devices`, 'Volume']}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {filteredFailureRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform Performance & Tech Bench Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Platform Velocity (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Turnaround Velocity by Device Category
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Performance breakdown per hardware platform</p>
          </div>

          <div className="space-y-4">
            {PLATFORM_PERFORMANCE_DATA.map((plat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{plat.platform}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{plat.jobs} Jobs Completed • {plat.successRate}% Yield</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-black text-slate-900 shadow-sm">
                    {plat.avgTurnaround} hrs avg
                  </span>
                  <p className="text-[9px] text-emerald-600 font-bold">Passed QA Triage</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technician Bench Metrics (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Technician Bench Productivity
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Individual laboratory engineer throughput metrics</p>
          </div>

          <div className="space-y-4">
            {TECH_BENCHMARK_DATA.map((tech, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="font-bold text-sm text-white">{tech.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{tech.role}</p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-black text-blue-400">{tech.completed} Jobs</p>
                    <p className="text-[10px] text-slate-400 font-mono">{tech.avgTime} / job</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl border border-blue-500/30 flex items-center justify-center font-black text-xs text-blue-300">
                    {tech.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
