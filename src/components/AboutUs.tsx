import { motion } from 'motion/react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Microscope, 
  Cpu, 
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="w-full max-w-5xl mx-auto py-20 px-6 space-y-32">
      {/* Brand Story */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            Established 2012
          </div>
          <h1 className="text-6xl font-playfair font-black text-slate-900 leading-[1.1]">
            Engineering <span className="text-slate-400">Excellence</span> in Spokane.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
            D&CP LLC operates at the intersection of consumer electronics repair and precision engineering. 
            From our laboratory in the Pacific Northwest, we specialize in Tier 3 board-level interventions 
            and data recovery for critical mobile infrastructure.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900">12k+</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Units Restored</span>
            </div>
            <div className="w-px h-12 bg-slate-100" />
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900">99.2%</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Success Rate</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="aspect-[4/5] bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50">
            <img 
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000" 
              alt="Engineering Lab"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-900/10 max-w-[240px]">
            <Lock className="w-8 h-8 text-blue-600 mb-4" />
            <p className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-widest">Privacy First</p>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              RCW 19.415 Compliant Laboratory. All data is handled with end-to-end encryption protocols.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">Our Capabilities</h2>
          <p className="text-4xl font-playfair font-black text-slate-900">Laboratory Infrastructure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: Microscope,
              title: "Tier 3 Micro-soldering",
              desc: "Deep component-level repair including CPU re-balling and VDD_MAIN short-circuit isolation."
            },
            {
              icon: Cpu,
              title: "Logic Board Recovery",
              desc: "NAND flash data extraction and FPC connector reconstruction using Rev 4.0 specifications."
            },
            {
              icon: ShieldCheck,
              title: "R2R Compliance",
              desc: "Adherence to Washington State's Right to Repair mandates ensuring part provenance and security."
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact & Status */}
      <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white grid grid-cols-1 lg:grid-cols-2 gap-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
        
        <div className="space-y-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-playfair font-black">Get in Touch</h2>
            <p className="text-slate-400 max-w-sm font-medium">Have a complex logic board issue? Our engineers are ready to assist.</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Laboratory HQ</p>
                <p className="text-sm font-bold">Spokane, WA 99201</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engineering Line</p>
                <p className="text-sm font-bold">(509) 555-0123</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Intake</p>
                <p className="text-sm font-bold">triage@dcp-llc.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 space-y-8 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest">Service Pulse</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-500">OPERATIONAL</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Queue Status</span>
              <span className="font-bold">LOW VOL</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Avg Triage Time</span>
              <span className="font-bold">14 MINS</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Parts Availability</span>
              <span className="font-bold text-green-400">94%</span>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Alerts</p>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Shopify sync engine optimized for 2026 API Rev. Intake forms now support WebUSB diagnostic polling.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
