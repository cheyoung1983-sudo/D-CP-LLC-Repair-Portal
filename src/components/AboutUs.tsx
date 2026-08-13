import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Microscope, 
  Cpu, 
  CheckCircle2,
  Lock,
  ChevronDown,
  HelpCircle,
  Clock,
  Shield,
  Award,
  Terminal,
  Wrench,
  GraduationCap
} from 'lucide-react';

const TEAM = [
  {
    name: "David Chen",
    role: "Lead Systems Engineer",
    bio: "With over 15 years in precision micro-electronics, David leads our Tier 3 intervention unit. He specializes in VDD_MAIN short isolation and BGA re-balling protocols for critical infrastructure devices.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    certs: ["IPC-A-610 Certified", "Apple Certified iOS Technician (ACiT)"],
    expertise: ["BGA Reballing", "NAND Recovery", "Thermal Management"],
    icon: Terminal
  },
  {
    name: "Sarah Martinez",
    role: "Senior Diagnostic Lead",
    bio: "Sarah oversees our high-speed diagnostic triage. Her expertise in signal integrity and schematic analysis ensures that even the most complex liquid damage cases receive a definitive restoration path.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    certs: ["CompTIA A+", "Mobile Device Security Specialist"],
    expertise: ["Signal Analysis", "Liquid Damage Restoration", "Secure Data Erasure"],
    icon: Award
  },
  {
    name: "James Wilson",
    role: "Restoration Specialist",
    bio: "James manages the precision assembly floor. He is an expert in mechanical structural integrity and ensure that every device returned to the client meets or exceeds OEM seal and torque specifications.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    certs: ["ESD Control Specialist", "Master Technician Certification"],
    expertise: ["Mechanical Assembly", "Structural Integrity", "OLED Calibration"],
    icon: Wrench
  }
];

const FAQS = [
  {
    question: "What is the typical repair turnaround time?",
    answer: "Most Tier 1 and Tier 2 repairs (screens, batteries, charging ports) are completed within 24-48 hours. Tier 3 micro-soldering or complex logic board recovery typically requires 3-5 business days due to the precision telemetry and multi-stage stress testing required for laboratory certification.",
    icon: Clock
  },
  {
    question: "Do you offer a warranty on your repairs?",
    answer: "We provide a limited lifetime warranty on all Tier 1 and Tier 2 part renewals. This covers any defects in the part or our workmanship. Tier 3 logic board interventions carry a 90-day laboratory guarantee. Please note that accidental damage or subsequent liquid exposure voids all warranties.",
    icon: Shield
  },
  {
    question: "What if the device is deemed non-repairable?",
    answer: "We adhere to a 'No Fix, No Fee' protocol for most standard repairs. If our engineers determine a device is beyond restoration during diagnostic triage, you are only responsible for the return shipping and a nominal $35 bench fee to cover laboratory consumables.",
    icon: HelpCircle
  },
  {
    question: "Do you use genuine OEM parts?",
    answer: "We utilize 'OEM-Spec' or 'Refurbished Original' components to ensure 100% compatibility with FaceID, TouchID, and TrueTone calibration systems. Every part is individually serialized and logged into our inventory system for lifetime provenance tracking.",
    icon: Cpu
  },
  {
    question: "Is my device data secure during the restoration process?",
    answer: "Data integrity is our highest priority. We are RCW 19.415 compliant and utilize end-to-end encryption for all diagnostic logs. We never require passcodes for hardware-only repairs unless software-level calibration is explicitly required.",
    icon: Lock
  }
];

function FAQItem({ faq, isOpen, onClick }: { faq: typeof FAQS[0], isOpen: boolean, onClick: () => void }) {
  const Icon = faq.icon;
  return (
    <div className={`rounded-3xl border transition-all duration-300 mb-4 overflow-hidden ${
      isOpen 
        ? 'bg-slate-50 border-slate-200 shadow-sm' 
        : 'bg-white border-slate-100 hover:border-slate-200'
    }`}>
      <button 
        onClick={onClick}
        className="w-full p-6 md:p-8 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isOpen ? 'bg-slate-900 text-white rotate-[360deg]' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-900'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className={`text-lg font-bold tracking-tight transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
            {faq.question}
          </span>
        </div>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
          isOpen ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-400'
        }`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-8 pb-10 md:px-12 md:pb-12 pt-0 ml-16 md:ml-17">
              <div className="h-px bg-slate-200 mb-6 w-12" />
              <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-2xl">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AboutUs({ onOpenBlueprint }: { onOpenBlueprint?: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-20 px-6 space-y-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Brand Story */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              Display & Cell Pros LLC
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-mono text-[10px] font-bold rounded-full border border-blue-200">
              SAM.gov UEI Certified
            </span>
          </div>

          <h1 className="text-6xl font-playfair font-black text-slate-900 leading-[1.1]">
            Engineering <span className="text-slate-400">Excellence</span> in Spokane.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
            Display & Cell Pros LLC operates at the intersection of consumer electronics repair and precision engineering. 
            From our Spokane bench HQ in Washington, we specialize in Tier 3 board-level interventions 
            and data recovery for critical mobile infrastructure under federal and state procurement frameworks.
          </p>

          {onOpenBlueprint && (
            <button
              type="button"
              onClick={onOpenBlueprint}
              className="px-5 py-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Explore Master Operational Blueprint & Governance</span>
            </button>
          )}
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
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%3C%230f172a'/%3E%3Cpath d='M150 200 L250 120 L350 220 L450 140 L550 250' stroke='%3C%232563eb' stroke-width='6' fill='none'/%3E%3Ccircle cx='250' cy='120' r='10' fill='%3C%2338bdf8'/%3E%3Ccircle cx='450' cy='140' r='10' fill='%3C%2310b981'/%3E%3Ctext x='300' y='320' text-anchor='middle' fill='%3C%2394a3b8' font-family='sans-serif' font-size='16' font-weight='bold'%3ESpokane Laboratory Bench%3C/text%3E%3C/svg%3E";
              }}
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

      {/* Meet the Team */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">The Engineering Unit</h2>
          <p className="text-4xl font-playfair font-black text-slate-900">Meet the Team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {TEAM.map((member, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col h-full"
            >
              <div className="relative mb-8 group">
                <div className="aspect-square rounded-[2.5rem] overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%3C%231e293b'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%3C%2364748b'/%3E%3Cpath d='M20 85 C20 62, 35 55, 50 55 C65 55, 80 62, 80 85 Z' fill='%3C%2364748b'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <member.icon className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-6 flex-1 flex flex-col">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{member.name}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600 mt-1">{member.role}</p>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {member.bio}
                </p>

                <div className="space-y-4 pt-6 border-t border-slate-50 mt-auto">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <GraduationCap className="w-3 h-3" />
                      Certifications
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {member.certs.map((cert, cidx) => (
                        <span key={cidx} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Cpu className="w-3 h-3" />
                      Core Expertise
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((exp, eidx) => (
                        <span key={eidx} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">Common Queries</h2>
          <p className="text-4xl font-playfair font-black text-slate-900">Protocol & Policy FAQ</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {FAQS.map((faq, idx) => (
            <FAQItem 
              key={idx} 
              faq={faq} 
              isOpen={openIndex === idx} 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)} 
            />
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
