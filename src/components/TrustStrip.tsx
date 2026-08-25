import React from 'react';
import { 
  Smartphone, 
  Network, 
  ShieldCheck, 
  TrendingUp,
  Layout,
  Cpu,
  Lock,
  Sparkles
} from 'lucide-react';
import { TRUST_BENEFITS } from '../data/platforms';

export const TrustStrip: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Network':
        return <Network className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          iconBox: 'bg-blue-50 text-blue-600 border-blue-200/60',
          hoverBorder: 'hover:border-blue-300'
        };
      case 'indigo':
        return {
          iconBox: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
          hoverBorder: 'hover:border-indigo-300'
        };
      case 'sky':
        return {
          iconBox: 'bg-sky-50 text-sky-600 border-sky-200/60',
          hoverBorder: 'hover:border-sky-300'
        };
      case 'cyan':
        return {
          iconBox: 'bg-cyan-50 text-cyan-600 border-cyan-200/60',
          hoverBorder: 'hover:border-cyan-300'
        };
      default:
        return {
          iconBox: 'bg-blue-50 text-blue-600 border-blue-200/60',
          hoverBorder: 'hover:border-blue-300'
        };
    }
  };

  return (
    <section className="relative z-20 border-y border-slate-100 bg-slate-50/40 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4 Value Pillars Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-6">
          {TRUST_BENEFITS.map((benefit) => {
            return (
              <div 
                key={benefit.id} 
                className="flex items-center gap-2.5 group"
              >
                {/* Icon Box */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-lg shadow-2xs border border-slate-200/80 flex items-center justify-center shrink-0 text-[#0056D2] group-hover:scale-105 transition-transform">
                  {getIcon(benefit.iconName)}
                </div>

                {/* Content */}
                <div className="space-y-0.5 text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0056D2] transition-colors leading-snug">
                    {benefit.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal leading-tight line-clamp-1 sm:line-clamp-none">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
