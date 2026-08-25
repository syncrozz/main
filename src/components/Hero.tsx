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
    <section id="home" className="relative pt-20 pb-10 md:pt-24 md:pb-12 overflow-hidden bg-white">
      
      {/* Background Soft Glow Accents */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-blue-50/70 via-purple-50/40 to-sky-50/50 blur-3xl -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-28 right-10 w-72 h-72 bg-blue-50/50 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column: Brand Statement & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Tag Badge */}
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#0056D2] uppercase mb-3 bg-blue-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0056D2]"></span>
              Syncrozz Innovation Platform
            </span>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-[1.14] text-slate-900 mb-4 tracking-tight">
              Smart Solutions for <span className="text-[#0056D2]">Education</span>, Productivity & Innovation
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-slate-600 mb-5 max-w-xl leading-relaxed font-normal">
              Menyediakan ekosistem penyelesaian digital praktikal untuk membantu pendidik, institusi, dan organisasi bekerja lebih cekap dan tersusun.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="hero-primary-cta"
                onClick={onExploreClick}
                className="bg-[#0056D2] text-white px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl font-bold shadow-md shadow-blue-200 hover:scale-[1.01] hover:bg-blue-700 active:scale-98 transition-all cursor-pointer inline-flex items-center gap-2 text-sm"
              >
                <span>Terokai Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-secondary-cta"
                onClick={onVideoDemoClick}
                className="border border-slate-200 text-slate-700 px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl font-bold hover:bg-slate-50 active:scale-98 transition-colors cursor-pointer inline-flex items-center gap-2 text-sm"
              >
                <Play className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                <span>Lihat Platform</span>
              </button>
            </div>

            {/* Trust Quick Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100 w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">10+</div>
                  <div className="text-[10px] text-slate-500 font-medium">Platform</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">1,000+</div>
                  <div className="text-[10px] text-slate-500 font-medium">Pengguna</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">99.9%</div>
                  <div className="text-[10px] text-slate-500 font-medium">Kebolehpercayaan</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">24/7</div>
                  <div className="text-[10px] text-slate-500 font-medium">Sokongan</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: High-Fidelity Multi-Device Ecosystem Mockup */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Device Background Halo */}
            <div className="w-full max-w-[420px] aspect-square bg-gradient-to-br from-blue-50 via-purple-50/50 to-indigo-50/40 rounded-full relative overflow-hidden flex items-center justify-center p-4">
              
              {/* Laptop Screen Content (Live Dashboard UI) */}
              <div className="w-full bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col overflow-hidden text-left font-sans transition-transform hover:scale-[1.01]">
                
                {/* Traffic lights header */}
                <div className="h-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-[9px] font-bold text-slate-400">syncrozz.app</div>
                  <div className="w-2 h-2"></div>
                </div>

                {/* Dashboard Inner Screen */}
                <div className="p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0056D2] text-white flex items-center justify-center font-black text-[9px]">
                        S
                      </div>
                      <span className="font-bold text-xs text-slate-900">SYNCROZZ Hub</span>
                    </div>
                    <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Live
                    </span>
                  </div>

                  {/* Metrics Strip */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[9px] text-slate-500 font-medium">Kehadiran Staf</div>
                      <div className="text-xs sm:text-sm font-black text-[#0056D2]">98.4% Hadir</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[9px] text-slate-500 font-medium">Imbasan QR</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-600">1,420 Scan</div>
                    </div>
                  </div>

                  {/* Platform Quick Strip */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    <div className="p-1.5 bg-blue-50/60 rounded-lg text-center border border-blue-100/60">
                      <div className="text-[9px] font-bold text-[#0056D2]">Staff Attend</div>
                      <div className="text-[8px] text-slate-500">Aktif</div>
                    </div>
                    <div className="p-1.5 bg-purple-50/60 rounded-lg text-center border border-purple-100/60">
                      <div className="text-[9px] font-bold text-purple-700">URUSTEAM</div>
                      <div className="text-[8px] text-slate-500">Aktif</div>
                    </div>
                    <div className="p-1.5 bg-emerald-50/60 rounded-lg text-center border border-emerald-100/60">
                      <div className="text-[9px] font-bold text-emerald-700">SYNC QR</div>
                      <div className="text-[8px] text-slate-500">Aktif</div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Smartphone Mockup */}
              <div className="absolute bottom-3 right-2 sm:right-3 w-24 sm:w-28 bg-slate-950 rounded-[22px] border-[3px] border-slate-800 shadow-xl p-1.5 animate-float">
                <div className="w-8 h-0.5 bg-slate-700 mx-auto rounded-full mb-1.5"></div>
                <div className="bg-white rounded-[14px] p-1.5 text-center border border-slate-100">
                  <div className="w-8 h-8 mx-auto bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center mb-1">
                    <QrCode className="w-4 h-4 text-slate-900" />
                  </div>
                  <div className="text-[7px] font-bold text-slate-900">QR Disahkan</div>
                  <div className="text-[6.5px] text-[#0056D2] font-semibold">08:30 AM • GPS OK</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
