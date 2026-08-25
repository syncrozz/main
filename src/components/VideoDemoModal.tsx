import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface VideoDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreClick: () => void;
}

export const VideoDemoModal: React.FC<VideoDemoModalProps> = ({ isOpen, onClose, onExploreClick }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'qr' | 'reporting'>('attendance');

  // Keyboard Escape listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0056D2] flex items-center justify-center font-black text-sm">
              S
            </div>
            <div>
              <h3 className="text-base font-bold">Pengenalan Ekosistem SYNCROZZ</h3>
              <p className="text-[11px] text-slate-400">Pratonton Fungsi & Aliran Kerja Digital</p>
            </div>
          </div>

          <button
            id="close-video-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Tour Walkthrough */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-white text-[#0056D2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Kehadiran Bersepadu
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-[#0056D2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Kod QR Dinamik
            </button>
            <button
              onClick={() => setActiveTab('reporting')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reporting'
                  ? 'bg-white text-[#0056D2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Analitik & Laporan
            </button>
          </div>

          {/* Interactive Screen Display */}
          <div className="bg-slate-950 rounded-2xl p-6 text-white relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-blue-400">MODUL: STAFF & STUDENT ATTEND</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">99.9% Uptime</span>
                </div>
                <h4 className="text-xl font-bold text-white">Log Masuk Pantas Tanpa Sentuhan</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Pendidik dan kakitangan mengimbas kod selamat melalui peranti masing-masing. Sistem secara automatik mengesahkan koordinat geolokasi institusi dan mengemas kini pangkalan data dalam masa nyata.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Masa Pengesahan</div>
                    <div className="text-lg font-bold text-blue-400 font-mono">&lt; 1.2 Saat</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Integriti Data</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">Disahkan GPS</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-cyan-400">MODUL: SYNCROZZ QR DINAMIK</span>
                  <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[10px]">Real-Time Parameter</span>
                </div>
                <h4 className="text-xl font-bold text-white">Kod QR Fleksibel & Selamat</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Kemaskini destinasi pautan, borang atau dokumen bila-bila masa tanpa perlu mencetak semula kod QR fizikal. Dilengkapi statistik imbasan komprehensif.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Kemaskini Segera</div>
                    <div className="text-lg font-bold text-cyan-400 font-mono">Masa Nyata</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Jejak Lokasi Imbasan</div>
                    <div className="text-lg font-bold text-indigo-400 font-mono">Aktif</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reporting' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-indigo-400">MODUL: DASHBOARD & PELAPORAN</span>
                  <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px]">Automasi Penuh</span>
                </div>
                <h4 className="text-xl font-bold text-white">Eksport Format Excel & PDF Segera</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Hapuskan pengiraan manual setiap hujung bulan. Jana laporan kehadiran mengikut jabatan, kelas, atau individu dengan satu klik.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Penjimatan Masa</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">90% Lebih Cekap</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Format Standard</div>
                    <div className="text-lg font-bold text-amber-400 font-mono">KPM / Piawaian</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onExploreClick();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Terokai Semua Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
