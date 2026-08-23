import React, { useState } from 'react';
import { 
  Calculator, 
  Check, 
  Clock, 
  FileSpreadsheet, 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Zap,
  HelpCircle
} from 'lucide-react';

interface CostCalculatorProps {
  onContactClick: () => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ onContactClick }) => {
  const [orgType, setOrgType] = useState<'school' | 'college' | 'community' | 'enterprise'>('school');
  const [userCount, setUserCount] = useState<number>(350);
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'staff-attend',
    'student-attend',
    'syncrozz-qr'
  ]);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Realistic efficiency impact metrics based on selections
  const estimatedHoursSavedWeekly = Math.round((userCount * 0.08) * (selectedModules.length * 0.6));
  const estimatedSheetsPaperSavedMonthly = Math.round(userCount * (selectedModules.length * 4.5));
  const estimatedAccuracyRate = 99.8;

  return (
    <section id="kos" className="py-16 md:py-24 bg-white relative border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#0056D2] uppercase bg-blue-50 px-3 py-1 rounded-full inline-block">
            Penilaian Nilai & Kos
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kira Penjimatan Masa & Kecekapan Organisasi Anda
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-normal">
            Platform SYNCROZZ direka untuk memaksimumkan pulangan nilai melalui automasi tugas harian dan penjimatan kos operasi pengurusan.
          </p>
        </div>

        {/* Interactive Calculator Container */}
        <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-xs max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input Selection Controls */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Step 1: Organisation Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Jenis Organisasi / Institusi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'school', label: 'Sekolah' },
                    { id: 'college', label: 'Kolej / IPT' },
                    { id: 'community', label: 'Komuniti / Kelab' },
                    { id: 'enterprise', label: 'Agensi / Swasta' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setOrgType(type.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        orgType === type.id
                          ? 'bg-[#0056D2] text-white border-[#0056D2] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: User Volume Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Anggaran Bilangan Warga / Pengguna:
                  </label>
                  <span className="text-sm font-bold text-[#0056D2] font-mono bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {userCount} Orang
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="2500"
                  step="10"
                  value={userCount}
                  onChange={(e) => setUserCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0056D2]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>20 Warga</span>
                  <span>500</span>
                  <span>1,500</span>
                  <span>2,500+ Warga</span>
                </div>
              </div>

              {/* Step 3: Modules Needed */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Pilih Modul Yang Diperlukan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'staff-attend', name: 'Staff Attend', desc: 'Kehadiran staf pantas' },
                    { id: 'student-attend', name: 'Student Attend', desc: 'Kehadiran murid berpusat' },
                    { id: 'class-attend', name: 'Class Attend', desc: 'Rekod kehadiran PdP' },
                    { id: 'syncrozz-qr', name: 'SYNCROZZ QR', desc: 'QR dinamik berparameter' },
                    { id: 'urusteam', name: 'URUSTEAM', desc: 'Papan kerja & program' },
                    { id: 'syncrozz-link', name: 'SYNCROZZ Link', desc: 'Pautan pintar bio' }
                  ].map((mod) => {
                    const isSelected = selectedModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-[#0056D2] shadow-xs ring-1 ring-blue-500/20'
                            : 'bg-white/70 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{mod.name}</div>
                          <div className="text-[11px] text-slate-500">{mod.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-[#0056D2] border-[#0056D2] text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right: Projected Value Summary Box */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 text-left">
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" />
                  Unjuran Manfaat Digital
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Ringkasan Nilai Operasi
                </h3>
              </div>

              {/* Metrics Highlights */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0056D2] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#0056D2]">
                      ~{estimatedHoursSavedWeekly} Jam / Minggu
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Penjimatan masa kerja manual & pengesanan rekod
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-emerald-900">
                      ~{estimatedSheetsPaperSavedMonthly.toLocaleString()} Helaian / Bulan
                    </div>
                    <div className="text-xs text-emerald-700 font-medium">
                      Penjimatan kertas fizikal ke arah digital hijau
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">
                      {estimatedAccuracyRate}% Ketepatan Rekod
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Sifar ralat keciciran atau kelewatan dokumentasi
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  id="calc-quote-btn"
                  onClick={onContactClick}
                  className="w-full py-3.5 px-4 rounded-xl text-center font-bold text-white bg-[#0056D2] hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span>Dapatkan Pelan & Konsultasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Penyesuaian percuma mengikut spesifikasi institusi anda.
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
