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
  Check,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { PlatformItem } from '../types';
import { generateDefaultOgImage } from '../utils/ogStorage';
import { useAuth } from '../auth/AuthContext';

interface PlatformModalProps {
  platform: PlatformItem | null;
  onClose: () => void;
  onContactClick: () => void;
  customOgImages?: Record<string, string>;
  onSaveOgImage?: (platformId: string, dataUrl: string) => void;
  isAdminMode?: boolean;
}

export const PlatformModal: React.FC<PlatformModalProps> = ({ 
  platform, 
  onClose, 
  onContactClick,
  customOgImages = {},
  onSaveOgImage,
  isAdminMode = false
}) => {
  const { isAuthenticated, isAdmin, isMasterAdmin } = useAuth();
  const hasAdminAccess = isAdminMode || (isAuthenticated && (isAdmin || isMasterAdmin));

  const [copied, setCopied] = useState(false);
  const [demoState, setDemoState] = useState<'idle' | 'simulating' | 'success'>('idle');

  if (!platform) return null;

  const customImage = customOgImages[platform.id];
  const ogImageUrl = customImage || generateDefaultOgImage(platform);

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onSaveOgImage) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          onSaveOgImage(platform.id, dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Open Graph Image Header Preview Banner */}
        <div className="relative aspect-[16/7] w-full bg-slate-900 overflow-hidden">
          <img
            src={ogImageUrl}
            alt={`Open Graph ${platform.name}`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40"></div>

          {/* Close Button */}
          <button
            id="close-platform-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-xs border border-white/20 transition-all cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Open Graph Tag & Upload Button */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20 flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3 text-sky-400" />
              <span>Open Graph Image (1200 × 630 JPG)</span>
            </span>

            {onSaveOgImage && hasAdminAccess && (
              <label className="px-2.5 py-1 rounded-lg bg-[#0056D2] hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs">
                <Upload className="w-3 h-3" />
                <span>Upload JPG</span>
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
              </label>
            )}
          </div>

          {/* Title on Banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-800 shadow-xs`}>
                {platform.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white">
                {platform.status}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{platform.name}</span>
              {platform.subName && (
                <span className="text-sky-300">{platform.subName}</span>
              )}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Tagline & Description */}
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
