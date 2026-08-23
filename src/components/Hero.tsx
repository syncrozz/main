import React, { useState } from 'react';
import { 
  Rocket, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  Users, 
  Layers, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Clock,
  Laptop,
  Smartphone
} from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onVideoDemoClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onVideoDemoClick }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'qr'>('dashboard');

  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-white">
      
      {/* Background Soft Glow Accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-50/70 via-purple-50/40 to-sky-50/50 blur-3xl -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-50/60 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Main 2-Column Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand Statement & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Tag Badge */}
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#0056D2] uppercase mb-4 bg-blue-50 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0056D2]"></span>
              Syncrozz Innovation Platform
            </span>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold leading-[1.12] text-slate-900 mb-6 tracking-tight">
              Smart Solutions for <span className="text-[#0056D2]">Education</span>, Productivity & Innovation
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed font-normal">
              Providing practical digital solutions that help educators, institutions, and organizations work more efficiently through modern technology.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                id="hero-primary-cta"
                onClick={onExploreClick}
                className="bg-[#0056D2] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-98 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Terokai Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-secondary-cta"
                onClick={onVideoDemoClick}
                className="border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 active:scale-98 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-700 text-slate-700" />
                <span>Lihat Platform</span>
              </button>
            </div>

            {/* Trust Quick Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 mt-8 border-t border-slate-100 w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">10+</div>
                  <div className="text-[11px] text-slate-500 font-medium">Platform</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">1,000+</div>
                  <div className="text-[11px] text-slate-500 font-medium">Pengguna Aktif</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">99.9%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Kebolehpercayaan</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">24/7</div>
                  <div className="text-[11px] text-slate-500 font-medium">Sokongan Sistem</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: High-Fidelity Multi-Device Ecosystem Mockup */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Device Background Halo */}
            <div className="w-full aspect-square bg-gradient-to-br from-blue-50 via-purple-50/50 to-indigo-50/40 rounded-full relative overflow-hidden flex items-center justify-center p-6">
              
              {/* Laptop Screen Content (Live Dashboard UI) */}
              <div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-left font-sans transition-transform hover:scale-[1.01]">
                
                {/* Traffic lights header */}
                <div className="h-7 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">syncrozz.app</div>
                  <div className="w-2.5 h-2.5"></div>
                </div>

                {/* Dashboard Inner Screen */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-[#0056D2] text-white flex items-center justify-center font-black text-[10px]">
                        S
                      </div>
                      <span className="font-bold text-xs text-slate-900">SYNCROZZ Hub</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Live
                    </span>
                  </div>

                  {/* Metrics Strip */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-medium">Kehadiran Staf</div>
                      <div className="text-sm font-black text-[#0056D2]">98.4% Hadir</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-medium">Imbasan QR</div>
                      <div className="text-sm font-black text-emerald-600">1,420 Scan</div>
                    </div>
                  </div>

                  {/* Platform Quick Strip */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div className="p-2 bg-blue-50/60 rounded-lg text-center border border-blue-100/60">
                      <div className="text-[9px] font-bold text-[#0056D2]">Staff Attend</div>
                      <div className="text-[8px] text-slate-500">Aktif</div>
                    </div>
                    <div className="p-2 bg-purple-50/60 rounded-lg text-center border border-purple-100/60">
                      <div className="text-[9px] font-bold text-purple-700">URUSTEAM</div>
                      <div className="text-[8px] text-slate-500">Aktif</div>
                    </div>
                    <div className="p-2 bg-emerald-50/60 rounded-lg text-center border border-emerald-100/60">
                      <div className="text-[9px] font-bold text-emerald-700">SYNC QR</div>
                      <div className="text-[8px] text-slate-500">Aktif</div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Smartphone Mockup */}
              <div className="absolute bottom-4 right-2 sm:right-4 w-28 sm:w-32 bg-slate-950 rounded-[28px] border-4 border-slate-800 shadow-2xl p-2 animate-float">
                <div className="w-10 h-1 bg-slate-700 mx-auto rounded-full mb-2"></div>
                <div className="bg-white rounded-[18px] p-2 text-center border border-slate-100">
                  <div className="w-10 h-10 mx-auto bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center mb-1">
                    <QrCode className="w-6 h-6 text-slate-900" />
                  </div>
                  <div className="text-[8px] font-bold text-slate-900">QR Disahkan</div>
                  <div className="text-[7px] text-[#0056D2] font-semibold">08:30 AM • GPS OK</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
