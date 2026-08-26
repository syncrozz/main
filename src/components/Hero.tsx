import React, { useState } from 'react';
import { 
  Rocket, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight
} from 'lucide-react';
import { HeroCarousel } from './HeroCarousel';
import { CarouselSlide } from '../utils/carouselStorage';

interface HeroProps {
  onExploreClick: () => void;
  onVideoDemoClick: () => void;
  carouselSlides?: CarouselSlide[];
}

export const Hero: React.FC<HeroProps> = ({ 
  onExploreClick, 
  onVideoDemoClick,
  carouselSlides = []
}) => {
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.25] mb-3.5">
              Smart Solutions for{' '}
              <span className="text-[#0056D2]">Every Situation</span> ❤️
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed max-w-2xl">
              Platform bersepadu yang memudahkan urusan harian pendidik, komuniti, dan organisasi — daripada kehadiran staf, penstrukturan tugas, hingga penerbitan digital yang pantas dan tersusun.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-8">
              <button
                id="hero-explore-btn"
                onClick={onExploreClick}
                className="w-full sm:w-auto px-6 py-3 bg-[#0056D2] hover:bg-[#0045a8] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Terokai Ekosistem</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="hero-video-demo-btn"
                onClick={onVideoDemoClick}
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-blue-50 text-[#0056D2] flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Tonton Video Pengenalan</span>
              </button>
            </div>

            {/* Quick Benefits Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 w-full max-w-lg">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">100%</div>
                  <div className="text-[10px] text-slate-500 font-medium">Keselamatan Data</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0056D2] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">Pantas</div>
                  <div className="text-[10px] text-slate-500 font-medium">Cloud Terkini</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">24/7</div>
                  <div className="text-[10px] text-slate-500 font-medium">Sokongan</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Carousel with Automatic Auto-Swap */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <HeroCarousel 
              slides={carouselSlides}
              onExplorePlatforms={onExploreClick}
            />
          </div>

        </div>

      </div>
    </section>
  );
};
