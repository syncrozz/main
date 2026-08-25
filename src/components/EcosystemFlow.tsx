import React, { useState } from 'react';
import { 
  Users, 
  AppWindow, 
  Database, 
  Gauge, 
  Trophy, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ECOSYSTEM_FLOW_STEPS } from '../data/platforms';

export const EcosystemFlow: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'AppWindow':
        return <AppWindow className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'Gauge':
        return <Gauge className="w-5 h-5" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const activeStep = ECOSYSTEM_FLOW_STEPS[activeStepIndex];

  return (
    <section id="flow" className="py-10 md:py-14 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-1">
          <span className="text-[10px] font-bold tracking-[0.18em] text-[#0056D2] uppercase bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
            Ekosistem Bersepadu
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bagaimana Ekosistem SYNCROZZ Berfungsi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Menghubungkan manusia, platform, data, dan hasil secara berperingkat dan harmoni.
          </p>
        </div>

        {/* Step Flow Ribbon (Desktop & Tablet) */}
        <div className="relative mb-6">
          
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-100 -translate-y-1/2 -z-0" />

          {/* Steps Horizontal Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 relative z-10">
            {ECOSYSTEM_FLOW_STEPS.map((step, index) => {
              const isActive = index === activeStepIndex;
              return (
                <button
                  key={step.stepNumber}
                  id={`flow-step-btn-${step.title.toLowerCase()}`}
                  onClick={() => setActiveStepIndex(index)}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'bg-white border-[#0056D2] shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-[#0056D2] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {step.stepNumber}
                    </span>
                    <div className={`p-1.5 rounded-lg ${
                      isActive ? 'bg-blue-50 text-[#0056D2]' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {getStepIcon(step.iconName)}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-xs sm:text-sm font-bold transition-colors ${
                      isActive ? 'text-[#0056D2]' : 'text-slate-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {step.subTitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Detailed Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100 shadow-2xs max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            
            {/* Left side: Icon badge & context */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0056D2] flex items-center justify-center border border-blue-100 shadow-2xs">
                {getStepIcon(activeStep.iconName)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#0056D2] tracking-wider uppercase font-mono">
                  Langkah {activeStep.stepNumber}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeStep.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeStep.subTitle}
                </p>
              </div>
            </div>

            {/* Right side: Detailed Description & Key Deliverables */}
            <div className="md:col-span-8 space-y-3 text-left">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {activeStep.description}
              </p>

              <div className="pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Komponen & Hasil Utama:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeStep.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Controls between steps */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer text-xs"
                >
                  ← Sebelumnya
                </button>
                <div className="flex items-center gap-1">
                  {ECOSYSTEM_FLOW_STEPS.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveStepIndex(i)}
                      className={`h-1.5 rounded-full cursor-pointer transition-all ${
                        i === activeStepIndex ? 'w-5 bg-[#0056D2]' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  disabled={activeStepIndex === ECOSYSTEM_FLOW_STEPS.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(ECOSYSTEM_FLOW_STEPS.length - 1, prev + 1))}
                  className="px-2.5 py-1 rounded-lg bg-[#0056D2] text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 cursor-pointer text-xs"
                >
                  <span>Seterusnya</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
