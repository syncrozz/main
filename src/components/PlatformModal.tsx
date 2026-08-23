import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Layers,
  QrCode,
  Calendar,
  Clock,
  Compass,
  Link2,
  Check
} from 'lucide-react';
import { PlatformItem } from '../types';

interface PlatformModalProps {
  platform: PlatformItem | null;
  onClose: () => void;
  onContactClick: () => void;
}

export const PlatformModal: React.FC<PlatformModalProps> = ({ platform, onClose, onContactClick }) => {
  const [copied, setCopied] = useState(false);
  const [demoState, setDemoState] = useState<'idle' | 'simulating' | 'success'>('idle');

  if (!platform) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.origin + '#' + platform.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    setDemoState('simulating');
    setTimeout(() => {
      setDemoState('success');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 px-6 sm:px-8 pt-8 pb-6 border-b border-slate-200/80 relative">
          
          {/* Close Button */}
          <button
            id="close-platform-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-xs border border-slate-200/60 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            
            {/* Logo Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#0056D2] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              {platform.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${platform.badgeColor}`}>
                  {platform.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Status: {platform.status}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-2">
                <span>{platform.name}</span>
                {platform.subName && (
                  <span className="text-[#0056D2]">{platform.subName}</span>
                )}
              </h3>
              
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                {platform.tagline}
              </p>
            </div>

          </div>

        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Mengenai Platform
            </h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {platform.description}
            </p>
          </div>

          {/* Interactive Simulation Sandbox */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800">Pratonton Antara Muka Interaktif</span>
              </div>
              <span className="text-[11px] text-slate-500">Simulasi Langsung</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800">Modul: {platform.name} {platform.subName || ''}</span>
                <span className="text-emerald-600 font-medium">Sistem Bersepadu SYNCROZZ</span>
              </div>

              {demoState === 'idle' && (
                <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-slate-600">
                    Klik untuk uji simulasi pengesahan pantas bagi modul ini.
                  </p>
                  <button
                    onClick={handleSimulate}
                    className="px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
                  >
                    Uji Tindakan Segera
                  </button>
                </div>
              )}

              {demoState === 'simulating' && (
                <div className="py-4 text-center space-y-2">
                  <div className="inline-block w-5 h-5 border-2 border-[#0056D2] border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-xs text-slate-600 font-medium">Menyelaraskan data ke ekosistem SYNCROZZ...</div>
                </div>
              )}

              {demoState === 'success' && (
                <div className="py-2 flex items-center justify-between bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tindakan Berjaya Diproses & Diselaraskan!</span>
                  </div>
                  <button
                    onClick={() => setDemoState('idle')}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Set Semula
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Ciri & Keupayaan Utama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {platform.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-[#0056D2] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Sesuai Untuk:
            </h4>
            <div className="flex flex-wrap gap-2">
              {platform.audience.map((aud, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-blue-50 text-[#0056D2] text-xs font-medium border border-blue-100">
                  {aud}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Pautan Disalin!' : 'Salin Pautan Platform'}</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onContactClick();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Daftar / Mohon Akses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
