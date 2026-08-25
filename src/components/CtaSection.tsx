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
    <section className="py-10 md:py-14 bg-slate-50/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main CTA Light Container Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-indigo-50/80 p-6 sm:p-8 lg:p-10 border border-blue-100 shadow-2xs overflow-hidden">
          
          {/* Subtle Graphic Accents in Background */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#0056D2] uppercase bg-white/90 border border-blue-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#0056D2]" />
                Mulakan Transformasi Digital
              </span>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Bersedia untuk pengalaman digital yang lebih baik?
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
                Sertai ribuan pengguna dan institusi yang telah memilih SYNCROZZ untuk memudahkan urusan harian, meningkatkan produktiviti dan membawa inovasi ke tahap seterusnya.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  id="cta-contact-btn"
                  onClick={onContactClick}
                  className="bg-[#0056D2] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-200 hover:scale-[1.01] hover:bg-blue-700 active:scale-98 transition-all cursor-pointer inline-flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Hubungi Kami</span>
                </button>

                <button
                  id="cta-explore-btn"
                  onClick={onExploreClick}
                  className="border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold bg-white hover:bg-slate-50 active:scale-98 transition-colors cursor-pointer inline-flex items-center gap-2 text-xs sm:text-sm"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Right KPI Summary Bento */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
              
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-white shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Tingkatkan Produktiviti</div>
                  <div className="text-lg sm:text-xl font-black text-[#0056D2] font-mono">+60%</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0056D2] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-white shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Penjimatan Masa Kerja</div>
                  <div className="text-lg sm:text-xl font-black text-indigo-600 font-mono">-40%</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-white shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Kepuasan Pengguna</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-600 font-mono">99%</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ThumbsUp className="w-4 h-4" />
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
