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
    <section id="about" className="py-10 md:py-14 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-1">
          <span className="text-[10px] font-bold tracking-[0.18em] text-[#0056D2] uppercase bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
            Mengapa SYNCROZZ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Teknologi Yang Dibina Untuk Memudahkan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Penyelesaian digital yang praktikal, tidak membebankan, dan bersedia berkembang bersama anda.
          </p>
        </div>

        {/* 4 Core Principles Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY_SYNCROZZ_PRINCIPLES.map((principle, index) => (
            <div
              key={principle.title}
              id={`principle-card-${principle.title.toLowerCase()}`}
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between group text-left"
            >
              <div>
                {/* Number & Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0056D2] flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getIcon(principle.icon)}
                  </div>
                  <span className="text-base font-bold text-slate-200 group-hover:text-blue-100 transition-colors font-mono">
                    0{index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-[#0056D2] transition-colors">
                  {principle.title}
                </h3>
                <div className="text-xs font-semibold text-[#0056D2] mb-2">
                  {principle.subtitle}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed font-normal mb-3">
                  {principle.description}
                </p>
              </div>

              {/* Bottom Micro Highlight */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
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
