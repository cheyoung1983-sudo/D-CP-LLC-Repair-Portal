import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast.tsx';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Sparkles, 
  GraduationCap, 
  Clock, 
  ShieldAlert, 
  Tv, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Search, 
  Cpu, 
  Layers, 
  Zap, 
  Sparkle, 
  Microscope, 
  Flame,
  ArrowRight
} from 'lucide-react';

export interface TutorialScene {
  stepNumber: number;
  title: string;
  narration: string;
  durationSeconds: number;
  visualPrompt: string;
  graphicType: 'cleaning' | 'cable' | 'microscope' | 'battery' | 'tool' | 'warning';
  highlightRegion: { x: number; y: number; label: string };
  actionTip: string;
}

export interface VideoTutorial {
  id: string;
  title: string;
  category: 'Display' | 'Power' | 'Cleanliness' | 'ESD' | 'Tools';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  description: string;
  thumbnailUrl: string;
  requiredTools: string[];
  safetyWarnings: string[];
  scenes: TutorialScene[];
}

const PRESET_TUTORIALS: VideoTutorial[] = [
  {
    id: 'vid-screen-cleaning',
    title: 'Oleophobic Glass Cleaning & Surface Disinfection',
    category: 'Cleanliness',
    difficulty: 'Beginner',
    estimatedTime: '2:15 mins',
    description: 'Learn how to safely eliminate oils and fingerprints while restoring oleophobic protection without damaging delicate display bezels.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    requiredTools: ['99.9% Anhydrous Isopropyl Alcohol', 'Ultra-Soft Microfiber Cloth', 'Precision Nylon Brush'],
    safetyWarnings: [
      'Never spray liquid alcohol directly onto smartphone speaker grilles or mic ports.',
      'Power down the device completely before applying any liquid solvents.'
    ],
    scenes: [
      {
        stepNumber: 1,
        title: 'Power Shutdown & ESD Wrist Grounding',
        narration: 'Step 1: Power down the phone completely. Ground yourself with an ESD wrist strap attached to a grounded bench terminal.',
        durationSeconds: 5,
        visualPrompt: 'Technician securing grounding strap and holding device under anti-reflective ring lamp.',
        graphicType: 'warning',
        highlightRegion: { x: 50, y: 35, label: 'Power Off & Grounding Strap' },
        actionTip: 'Static charges can disrupt touch digitizer controllers even when the screen is off.'
      },
      {
        stepNumber: 2,
        title: 'Solvent Saturation on Microfiber Weave',
        narration: 'Step 2: Dispense 2-3 drops of 99.9% anhydrous isopropyl alcohol onto your microfiber cloth. Never soak the towel.',
        durationSeconds: 6,
        visualPrompt: 'Precision dropper applying alcohol to microfiber cloth fibers.',
        graphicType: 'cleaning',
        highlightRegion: { x: 40, y: 50, label: 'Cloth Saturation Zone' },
        actionTip: 'Standard 70% rubbing alcohol contains 30% water which can cause corrosion behind display layers.'
      },
      {
        stepNumber: 3,
        title: 'Concentric Circular Motion Buffing',
        narration: 'Step 3: Buff the display in small overlapping concentric circles from the center out to dissolve lipid deposits.',
        durationSeconds: 7,
        visualPrompt: 'Diagram showing concentric circular wiping path over display grid.',
        graphicType: 'microscope',
        highlightRegion: { x: 50, y: 50, label: 'Circular Buffing Vectors' },
        actionTip: 'Maintain uniform 200-gram light pressure. Avoid pressing hard near edge bezels.'
      },
      {
        stepNumber: 4,
        title: 'Perimeter Inspection under Angled Light',
        narration: 'Step 4: Inspect the screen edge seals at a 45-degree angle under a bright LED light to confirm zero residue remains.',
        durationSeconds: 5,
        visualPrompt: 'LED light reflecting off streak-free glass surface.',
        graphicType: 'tool',
        highlightRegion: { x: 65, y: 30, label: '45° Optical Reflection' },
        actionTip: 'Allow 60 seconds for solvent vaporization before turning power back on.'
      }
    ]
  },
  {
    id: 'vid-cable-replacement',
    title: 'FPC Flex Cable Seating & ZIF Latch Lock Protocol',
    category: 'Display',
    difficulty: 'Intermediate',
    estimatedTime: '3:00 mins',
    description: 'Master the delicate technique of disconnecting and re-seating FPC connectors and zero-insertion-force ribbon latches.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=600',
    requiredTools: ['Non-Conductive Plastic Spudger', 'ESD Curved Tweezers', 'Stereo Zoom Microscope'],
    safetyWarnings: [
      'NEVER use metal tweezers on active battery connectors or live board pads.',
      'Applying force at an angle will crush gold contact pins inside the FPC header.'
    ],
    scenes: [
      {
        stepNumber: 1,
        title: 'Disconnecting Battery Terminal First',
        narration: 'Step 1: Always disconnect the main battery FPC connector before touching any other flex cables on the motherboard.',
        durationSeconds: 6,
        visualPrompt: 'Spudger lifting battery flex cable off motherboard socket under microscope.',
        graphicType: 'battery',
        highlightRegion: { x: 30, y: 60, label: 'Battery Disconnect Terminal' },
        actionTip: 'Skipping battery isolation can blow the display backlight fuse instantaneously.'
      },
      {
        stepNumber: 2,
        title: 'Aligning FPC Connector Pins',
        narration: 'Step 2: Position the new flex cable header directly over the socket. Feel for the mechanical snap alignment without pressing.',
        durationSeconds: 7,
        visualPrompt: 'Microscopic 3D view of male FPC pin header hovering over female socket.',
        graphicType: 'cable',
        highlightRegion: { x: 50, y: 45, label: 'Gold Connector Alignment' },
        actionTip: 'If it does not click effortlessly, inspect for bent pins using a 10x loupe.'
      },
      {
        stepNumber: 3,
        title: 'Perpendicular Press Technique',
        narration: 'Step 3: Apply downward pressure across the center of the FPC connector using a flat plastic spudger until a distinct click is felt.',
        durationSeconds: 6,
        visualPrompt: 'Spudger tip applying centered downward force.',
        graphicType: 'microscope',
        highlightRegion: { x: 50, y: 50, label: 'Centered Downward Vector' },
        actionTip: 'Never press one side first; uneven pressure buckles the connector frame.'
      },
      {
        stepNumber: 4,
        title: 'Securing ZIF Latch & Shield Plate',
        narration: 'Step 4: Flip down the ZIF locking arm and re-install the EMI retention bracket with calibrated torque screws.',
        durationSeconds: 6,
        visualPrompt: 'Plastic probe flipping locking latch closed over ribbon cable.',
        graphicType: 'tool',
        highlightRegion: { x: 70, y: 40, label: 'ZIF Retention Lock' },
        actionTip: 'Ensure screws return to their exact original posts to prevent long-screw motherboard damage.'
      }
    ]
  },
  {
    id: 'vid-esd-setup',
    title: 'ESD Anti-Static Bench Grounding & Safety Setup',
    category: 'ESD',
    difficulty: 'Beginner',
    estimatedTime: '2:40 mins',
    description: 'Set up a professional ESD-safe workplace with 1 Megohm resistance grounding mats and wrist strap telemetry.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    requiredTools: ['ESD Anti-Static Bench Mat', '1MΩ Coiled Wrist Strap', 'Surface Resistance Meter'],
    safetyWarnings: [
      'Ensure the wrist strap cable contains a built-in 1 Megohm safety resistor.',
      'Do not connect ESD mats directly to high-voltage AC lines.'
    ],
    scenes: [
      {
        stepNumber: 1,
        title: 'Bench Mat Snap Terminal Grounding',
        narration: 'Step 1: Attach the snap fastener of your conductive silicone bench mat to a tested electrical earth ground connection.',
        durationSeconds: 6,
        visualPrompt: 'Grounding wire snap attaching to blue ESD bench mat corner.',
        graphicType: 'warning',
        highlightRegion: { x: 25, y: 25, label: 'Earth Ground Snap' },
        actionTip: 'Test outlet ground polarity before connecting any ESD equipment.'
      },
      {
        stepNumber: 2,
        title: 'Verifying Wrist Strap Skin Contact',
        narration: 'Step 2: Fasten the elastic stainless-steel weave wrist strap snug against bare skin on your non-dominant wrist.',
        durationSeconds: 6,
        visualPrompt: 'Technician adjusting wrist strap tightness.',
        graphicType: 'tool',
        highlightRegion: { x: 50, y: 60, label: 'Conductive Skin Contact' },
        actionTip: 'Loose straps allow static potential to accumulate above 100 volts.'
      },
      {
        stepNumber: 3,
        title: 'Continuous Ground Loop Verification',
        narration: 'Step 3: Measure resistance using a surface meter. The reading must stay between 1 Megohm and 10 Megohms for safety.',
        durationSeconds: 7,
        visualPrompt: 'Digital ohmmeter displaying 1.25 MΩ status.',
        graphicType: 'microscope',
        highlightRegion: { x: 60, y: 45, label: '1.25 MΩ Telemetry Display' },
        actionTip: 'Annual replacement of coiled wrist cords is recommended due to internal flex fatigue.'
      }
    ]
  }
];

export default function RepairAcademy({ onSelectIntake }: { onSelectIntake?: () => void }) {
  const { showToast } = useToast();
  const [tutorials, setTutorials] = useState<VideoTutorial[]>(PRESET_TUTORIALS);
  const [selectedTutorial, setSelectedTutorial] = useState<VideoTutorial>(PRESET_TUTORIALS[0]);
  
  // Custom AI Video Generator State
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Interactive Video Player State
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<any>(null);

  const activeScene = selectedTutorial.scenes[currentSceneIdx] || selectedTutorial.scenes[0];

  // Speech Synthesis Narration Voiceover
  const speakSceneNarration = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0 * playbackSpeed;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synth error:', e);
    }
  };

  // Canvas Animation Visual Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      step += 0.03 * playbackSpeed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Grid Pattern
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render Graphic Simulation based on graphicType
      const graphicType = activeScene.graphicType;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (graphicType === 'microscope' || graphicType === 'cleaning') {
        // Microscope Reticle / Screen Surface Simulation
        ctx.save();
        ctx.translate(centerX, centerY);

        // Circular reticle ring
        ctx.beginPath();
        ctx.arc(0, 0, 140, 0, Math.PI * 2);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 155, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-180, 0); ctx.lineTo(180, 0);
        ctx.moveTo(0, -180); ctx.lineTo(0, 180);
        ctx.stroke();

        // Animated Cleaning / Sweep Effect
        const sweepX = Math.sin(step) * 100;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.arc(sweepX, 0, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (graphicType === 'cable') {
        // FPC Cable Alignment Graphic
        ctx.save();
        ctx.translate(centerX, centerY);

        // Socket Box
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 3;
        ctx.roundRect(-120, -40, 240, 80, 12);
        ctx.fill();
        ctx.stroke();

        // Gold Contacts
        for (let i = -100; i <= 100; i += 20) {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(i, -30, 10, 60);
        }

        // Hovering Cable
        const hoverY = -70 + Math.sin(step * 2) * 15;
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.roundRect(-100, hoverY - 40, 200, 50, 8);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      } else if (graphicType === 'battery' || graphicType === 'warning') {
        // Battery Isolation / Hazard Warning Pulse
        ctx.save();
        ctx.translate(centerX, centerY);

        const pulseScale = 1 + Math.sin(step * 3) * 0.08;
        ctx.scale(pulseScale, pulseScale);

        ctx.strokeStyle = graphicType === 'warning' ? '#EF4444' : '#10B981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 110, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = graphicType === 'warning' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
        ctx.fill();

        ctx.restore();
      } else {
        // Default Precision Tool Vector
        ctx.save();
        ctx.translate(centerX, centerY);

        ctx.fillStyle = '#64748B';
        ctx.fillRect(-15, -120 + Math.sin(step * 2) * 10, 30, 200);

        ctx.restore();
      }

      // Render Highlight Target Region Overlay
      if (activeScene.highlightRegion) {
        const hx = (activeScene.highlightRegion.x / 100) * canvas.width;
        const hy = (activeScene.highlightRegion.y / 100) * canvas.height;

        ctx.save();
        ctx.beginPath();
        ctx.arc(hx, hy, 28 + Math.sin(step * 4) * 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.stroke();

        // Dot center
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeScene, playbackSpeed]);

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying) {
      speakSceneNarration(activeScene.narration);

      const totalSecs = activeScene.durationSeconds;
      let elapsed = 0;
      const intervalMs = 100;

      timerRef.current = setInterval(() => {
        elapsed += (intervalMs / 1000) * playbackSpeed;
        const pct = Math.min(100, (elapsed / totalSecs) * 100);
        setProgressPercent(pct);

        if (elapsed >= totalSecs) {
          clearInterval(timerRef.current);
          if (currentSceneIdx < selectedTutorial.scenes.length - 1) {
            setCurrentSceneIdx(prev => prev + 1);
            setProgressPercent(0);
          } else {
            setIsPlaying(false);
            setProgressPercent(100);
            showToast(`Tutorial "${selectedTutorial.title}" completed!`, 'success');
          }
        }
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIdx, selectedTutorial, playbackSpeed, isMuted]);

  // Custom AI Video Generator Trigger
  const handleGenerateAIVideo = async (topicToRun?: string) => {
    const topic = (topicToRun || customTopic).trim();
    if (!topic) return;

    setIsGenerating(true);
    showToast(`Initializing Gemini AI Video Generation for: "${topic}"...`, 'info');

    try {
      const res = await fetch('/api/academy/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setIsGenerating(false);

      if (res.ok && data.success && data.video) {
        const newVid: VideoTutorial = {
          ...data.video,
          id: `ai-vid-${Date.now()}`,
          thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
        };

        setTutorials(prev => [newVid, ...prev]);
        setSelectedTutorial(newVid);
        setCurrentSceneIdx(0);
        setIsPlaying(true);
        setCustomTopic('');
        showToast('AI Video Tutorial & Script generated successfully!', 'success');
      } else {
        showToast(data.error || 'Video generation encountered an issue. Please retry.', 'error');
      }
    } catch (err) {
      console.warn('AI Video generation error:', err);
      setIsGenerating(false);
      showToast('Network error during AI Video generation.', 'error');
    }
  };

  // Download PDF / Text Guide
  const handleDownloadGuide = () => {
    const content = `
=====================================================
D&CP SPOKANE REPAIR ACADEMY - DIY REPAIR GUIDE
TUTORIAL: ${selectedTutorial.title}
DIFFICULTY: ${selectedTutorial.difficulty} | EST. TIME: ${selectedTutorial.estimatedTime}
=====================================================

DESCRIPTION:
${selectedTutorial.description}

REQUIRED TOOLS:
${selectedTutorial.requiredTools.map(t => `- ${t}`).join('\n')}

SAFETY WARNINGS:
${selectedTutorial.safetyWarnings.map(w => `! ${w}`).join('\n')}

STEP-BY-STEP REPAIR PROTOCOL:
${selectedTutorial.scenes.map(s => `
[STEP ${s.stepNumber}] ${s.title}
Narration: "${s.narration}"
Technician Tip: ${s.actionTip}
`).join('\n')}

=====================================================
Spokane Lab HQ - 115 S Adams St, Spokane, WA 99201
Need Professional Micro-soldering? Visit https://dcp-llc.com
=====================================================
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DCP_Guide_${selectedTutorial.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    showToast('Tutorial Guide downloaded to local device.', 'success');
  };

  const categories = ['All', 'Cleanliness', 'Display', 'ESD', 'Power', 'Tools'];
  const filteredTutorials = activeCategory === 'All' 
    ? tutorials 
    : tutorials.filter(t => t.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <GraduationCap className="w-4 h-4" />
          Spokane Repair Academy • AI Video Studio
        </div>
        <h2 className="text-5xl md:text-6xl font-playfair font-black text-slate-900 tracking-tight">
          DIY Technical Tutorials
        </h2>
        <p className="text-slate-500 text-base font-medium leading-relaxed">
          Master common mobile maintenance procedures with short, step-by-step AI-generated video simulations, voiceover narrations, and telemetry schematics formulated by D&CP bench engineers.
        </p>
      </div>

      {/* AI Video Generation Prompt Tool */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-64 h-64 text-blue-400" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Generate Custom AI Repair Video Tutorial</h3>
              <p className="text-xs text-slate-400">Type any repair procedure (e.g. "Screen cleaning", "Camera lens glass replacement")</p>
            </div>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateAIVideo();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Oleophobic screen cleaning, MacBook battery safety, USB-C port lint removal..."
              className="flex-1 h-14 px-6 rounded-2xl bg-slate-800 border-2 border-slate-700/80 text-white placeholder-slate-400 text-sm font-medium outline-none focus:border-blue-500 transition-all"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!customTopic.trim() || isGenerating}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-blue-600/30"
            >
              {isGenerating ? (
                <>
                  <Sparkle className="w-4 h-4 animate-spin" />
                  Generating AI Video...
                </>
              ) : (
                <>
                  <Tv className="w-4 h-4" />
                  Generate Video
                </>
              )}
            </button>
          </form>

          {/* Quick AI Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0">Popular AI Topics:</span>
            {[
              "Oleophobic Screen Cleaning",
              "Flex Cable Ribbon Seating",
              "USB-C Lint Extraction",
              "ESD Wrist Strap Grounding"
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCustomTopic(p);
                  handleGenerateAIVideo(p);
                }}
                disabled={isGenerating}
                className="px-3 py-1 bg-slate-800 hover:bg-blue-900/60 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all shrink-0 border border-slate-700/60"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Player & Tutorial Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Video Player (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div 
            ref={playerContainerRef}
            className="bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 relative group flex flex-col"
          >
            {/* Viewport Screen */}
            <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />

              {/* Dynamic Overlay Box */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between gap-4 pointer-events-none z-10">
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    STEP {activeScene.stepNumber}/{selectedTutorial.scenes.length}: {activeScene.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-600/80 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {activeScene.graphicType} Telemetry
                  </span>
                </div>
              </div>

              {/* Highlight Region Floating Label */}
              {activeScene.highlightRegion && (
                <div 
                  className="absolute pointer-events-none z-10 bg-amber-500/90 text-slate-950 font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 transition-all duration-300 border border-amber-300"
                  style={{
                    left: `${activeScene.highlightRegion.x}%`,
                    top: `${activeScene.highlightRegion.y + 12}%`
                  }}
                >
                  🎯 {activeScene.highlightRegion.label}
                </div>
              )}

              {/* Subtitle / Voiceover Narration Bar */}
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center z-10">
                <p className="text-sm md:text-base font-bold text-white leading-relaxed">
                  "{activeScene.narration}"
                </p>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4">
              {/* Progress Scrubber */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
                  <span>Scene {currentSceneIdx + 1} of {selectedTutorial.scenes.length}</span>
                  <span>{activeScene.durationSeconds}s Duration</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentSceneIdx > 0) {
                        setCurrentSceneIdx(prev => prev - 1);
                        setProgressPercent(0);
                      }
                    }}
                    disabled={currentSceneIdx === 0}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl disabled:opacity-30 transition-all"
                    title="Previous Scene"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 px-5"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    <span className="text-xs font-black uppercase tracking-wider">{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (currentSceneIdx < selectedTutorial.scenes.length - 1) {
                        setCurrentSceneIdx(prev => prev + 1);
                        setProgressPercent(0);
                      }
                    }}
                    disabled={currentSceneIdx === selectedTutorial.scenes.length - 1}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl disabled:opacity-30 transition-all"
                    title="Next Scene"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentSceneIdx(0);
                      setProgressPercent(0);
                      setIsPlaying(true);
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all ml-2"
                    title="Restart Tutorial"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Playback Speed Selector */}
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                    {[0.5, 1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                          playbackSpeed === spd ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Mute Toggle */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Technician Tip Box */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                Technician Tip for Step {activeScene.stepNumber}
              </h4>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                {activeScene.actionTip}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Tutorial Metadata & Checklist (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {selectedTutorial.category}
              </span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-3">
                {selectedTutorial.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                {selectedTutorial.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 text-xs">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Difficulty</p>
                <p className="font-bold text-slate-800">{selectedTutorial.difficulty}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                <p className="font-bold text-slate-800">{selectedTutorial.estimatedTime}</p>
              </div>
            </div>

            {/* Required Tools */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                Required Bench Tools
              </h4>
              <div className="space-y-2">
                {selectedTutorial.requiredTools.map((tool, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Warnings */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Safety Guidelines
              </h4>
              <div className="space-y-2">
                {selectedTutorial.safetyWarnings.map((warn, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-amber-900 font-medium p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{warn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleDownloadGuide}
                className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Printable Repair Guide
              </button>

              {onSelectIntake && (
                <button
                  onClick={onSelectIntake}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Wrench className="w-4 h-4" />
                  Request Pro Bench Intake Instead
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Catalog Grid */}
      <div className="space-y-8 pt-8 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Tutorial Library</h3>
            <p className="text-xs text-slate-500 font-medium">Select a video tutorial to load into the AI simulator</p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredTutorials.map((tut) => {
            const isSelected = selectedTutorial.id === tut.id;
            return (
              <motion.div
                key={tut.id}
                whileHover={{ y: -4 }}
                onClick={() => {
                  setSelectedTutorial(tut);
                  setCurrentSceneIdx(0);
                  setIsPlaying(true);
                  showToast(`Loaded tutorial: ${tut.title}`, 'info');
                }}
                className={`bg-white rounded-[2rem] border transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xl' 
                    : 'border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="relative aspect-video overflow-hidden group">
                  <img 
                    src={tut.thumbnailUrl} 
                    alt={tut.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='350' viewBox='0 0 600 350'%3E%3Crect width='600' height='350' fill='%3C%230f172a'/%3E%3Crect x='200' y='100' width='200' height='150' rx='16' fill='%3C%231e293b' stroke='%3C%232563eb' stroke-width='4'/%3E%3Cpolygon points='280,145 340,175 280,205' fill='%3C%2338bdf8'/%3E%3Ctext x='300' y='290' text-anchor='middle' fill='%3C%2394a3b8' font-family='sans-serif' font-size='14' font-weight='bold'%3ERepair Tutorial Video%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-[9px] font-black uppercase tracking-wider">
                    {tut.estimatedTime}
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>{tut.category}</span>
                      <span className="text-blue-600">{tut.difficulty}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {tut.title}
                    </h4>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Watch Simulation</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
