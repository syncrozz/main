import React from 'react';
import { 
  Rocket, 
  Mail, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Users
} from 'lucide-react';

interface CtaSectionProps {
  onExploreClick: () => void;
  onContactClick: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onExploreClick, onContactClick }) => {
  return (
    <section className="py-16 md:py-24 bg-slate-50/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Main CTA Light Container Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-indigo-50/80 p-8 sm:p-12 lg:p-14 border border-blue-100 shadow-xs overflow-hidden">
          
          {/* Subtle Graphic Accents in Background */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#0056D2] uppercase bg-white/90 border border-blue-200/80 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0056D2]" />
                Mulakan Transformasi Digital
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Bersedia untuk pengalaman digital yang lebih baik?
              </h2>

              <p className="text-base text-slate-600 leading-relaxed font-normal max-w-xl">
                Sertai ribuan pengguna dan institusi yang telah memilih SYNCROZZ untuk memudahkan urusan harian, meningkatkan produktiviti dan membawa inovasi ke tahap seterusnya.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="cta-contact-btn"
                  onClick={onContactClick}
                  className="bg-[#0056D2] text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-98 transition-all cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4" />
                  <span>Hubungi Kami</span>
                </button>

                <button
                  id="cta-explore-btn"
                  onClick={onExploreClick}
                  className="border border-slate-200 text-slate-700 px-7 py-3.5 rounded-xl font-bold bg-white hover:bg-slate-50 active:scale-98 transition-colors cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right KPI Summary Bento */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              
              <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Tingkatkan Produktiviti</div>
                  <div className="text-2xl font-black text-[#0056D2] font-mono">+60%</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0056D2] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Penjimatan Masa Kerja</div>
                  <div className="text-2xl font-black text-indigo-600 font-mono">-40%</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Kepuasan Pengguna</div>
                  <div className="text-2xl font-black text-emerald-600 font-mono">99%</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ThumbsUp className="w-5 h-5" />
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
