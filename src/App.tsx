import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Smartphone, 
  Microscope, 
  Info,
  ShieldCheck,
  Search,
  Activity,
  Instagram,
  Linkedin,
  Twitter,
  ArrowUpRight
} from 'lucide-react';
import IntakeForm from './components/IntakeForm.tsx';
import FeaturedProducts from './components/FeaturedProducts.tsx';
import AboutUs from './components/AboutUs.tsx';
import Reviews from './components/Reviews.tsx';
import RepairStatusTracker from './components/RepairStatusTracker.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'intake' | 'track' | 'about'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Laboratory Store', icon: Smartphone },
    { id: 'intake', label: 'Device Intake', icon: Microscope },
    { id: 'track', label: 'Repair Status', icon: Activity },
    { id: 'about', label: 'Engineering Protocol', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-slate-900 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-playfair font-black text-slate-900 block leading-none">D&CP LLC</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Spokane • WA</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${isActive 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('track')}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Query Repair Status"
            >
              <Search className="w-5 h-5" />
              <span>Tracker</span>
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <button 
              onClick={() => setActiveTab('intake')}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
            >
              Start Intake
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 md:hidden space-y-4"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold ${activeTab === tab.id ? 'bg-slate-50 text-slate-900' : 'text-slate-400'}`}
                >
                  {tab.label}
                  <tab.icon className="w-5 h-5" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-32"
            >
              <section className="max-w-7xl mx-auto px-6 text-center space-y-12">
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    Now Accepting Tier 3 Board Repairs
                  </div>
                  <h1 className="text-7xl md:text-8xl font-playfair font-black text-slate-900 tracking-tight leading-[1.05]">
                    The Laboratory for <br />
                    <span className="text-slate-400">Mobile Recovery.</span>
                  </h1>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                    D&CP LLC provides mission-critical hardware restoration and data extraction 
                    services backed by precision telemetry.
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => setActiveTab('intake')}
                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    Initiate Triage
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('about')}
                    className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
                  >
                    Laboratory Protocol
                  </button>
                </div>
              </section>

              <FeaturedProducts />
              <Reviews />
            </motion.div>
          )}

          {activeTab === 'intake' && (
            <motion.div
              key="intake"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <IntakeForm />
            </motion.div>
          )}

          {activeTab === 'track' && (
            <motion.div
              key="track"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <RepairStatusTracker />
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AboutUs />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xl font-playfair font-black text-slate-900">D&CP LLC</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
                Premier Tier 3 electronics restoration laboratory specializing in complex micro-soldering and logic board triage. Spokane's home for Right to Repair.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Service Map</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('home')}>Store</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('intake')}>Intake</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('about')}>Protocol</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors">Safety Specs</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Laboratory Info</h4>
              <div className="space-y-4 text-sm font-bold text-slate-400">
                <p>Spokane, WA 99201</p>
                <p>(509) 555-0123</p>
                <p>Mon - Fri: 9AM - 6PM</p>
                <p className="text-blue-600">triage@dcp-llc.com</p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <p>© 2026 D&CP LLC. All Rights Reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-900 cursor-pointer">WA RCW 19.415 Disclosure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
