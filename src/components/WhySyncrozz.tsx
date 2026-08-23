import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  GitMerge, 
  Maximize2,
  Shield,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { WHY_SYNCROZZ_PRINCIPLES } from '../data/platforms';

export const WhySyncrozz: React.FC = () => {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'GitMerge':
        return <GitMerge className="w-6 h-6" />;
      case 'Maximize2':
        return <Maximize2 className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#0056D2] uppercase bg-blue-50 px-3 py-1 rounded-full inline-block">
            Mengapa SYNCROZZ
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Teknologi Yang Dibina Untuk Memudahkan
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-normal">
            Kami percaya bahawa teknologi terbaik adalah teknologi yang tidak membebankan pengguna, menyelesaikan masalah sebenar, dan bersedia berkembang bersama anda.
          </p>
        </div>

        {/* 4 Core Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_SYNCROZZ_PRINCIPLES.map((principle, index) => (
            <div
              key={principle.title}
              id={`principle-card-${principle.title.toLowerCase()}`}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group text-left"
            >
              <div>
                {/* Number & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0056D2] flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getIcon(principle.icon)}
                  </div>
                  <span className="text-xl font-bold text-slate-200 group-hover:text-blue-100 transition-colors font-mono">
                    0{index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#0056D2] transition-colors">
                  {principle.title}
                </h3>
                <div className="text-xs font-semibold text-[#0056D2] mb-2.5">
                  {principle.subtitle}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal mb-4">
                  {principle.description}
                </p>
              </div>

              {/* Bottom Micro Highlight */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="text-[#0056D2] bg-blue-50 px-2 py-0.5 rounded-md">
                  {principle.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
