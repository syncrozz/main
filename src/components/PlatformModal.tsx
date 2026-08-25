import React, { useState, useEffect } from 'react';
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
  Image as ImageIcon,
  Pencil,
  RotateCcw,
  Globe
} from 'lucide-react';
import { PlatformItem } from '../types';
import { generateDefaultOgImage, getCustomPlatformUrls, saveCustomPlatformUrl, removeCustomPlatformUrl } from '../utils/ogStorage';
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
  
  // Custom Platform External Link State
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState('');
  const [urlSavedToast, setUrlSavedToast] = useState(false);

  useEffect(() => {
    setCustomUrls(getCustomPlatformUrls());
  }, [platform]);

  useEffect(() => {
    if (platform) {
      const currentUrl = customUrls[platform.id] || platform.url || `https://syncrozz.com/${platform.id}`;
      setEditedUrl(currentUrl);
      setIsEditingUrl(false);
    }
  }, [platform, customUrls]);

  // Keyboard Escape listener & body scroll lock
  useEffect(() => {
    if (!platform) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [platform, onClose]);

  if (!platform) return null;

  const customImage = customOgImages[platform.id];
  const ogImageUrl = customImage || generateDefaultOgImage(platform);
  const targetExternalUrl = customUrls[platform.id] || platform.url || `https://syncrozz.com/${platform.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.origin + '#' + platform.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternalLink = () => {
    if (targetExternalUrl) {
      window.open(targetExternalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) return;
    const finalUrl = editedUrl.trim();
    if (finalUrl) {
      saveCustomPlatformUrl(platform.id, finalUrl);
      setCustomUrls((prev) => ({ ...prev, [platform.id]: finalUrl }));
    } else {
      removeCustomPlatformUrl(platform.id);
      setCustomUrls((prev) => {
        const next = { ...prev };
        delete next[platform.id];
        return next;
      });
    }
    setIsEditingUrl(false);
    setUrlSavedToast(true);
    setTimeout(() => setUrlSavedToast(false), 2500);
  };

  const handleResetDefaultUrl = () => {
    if (!platform) return;
    removeCustomPlatformUrl(platform.id);
    setCustomUrls((prev) => {
      const next = { ...prev };
      delete next[platform.id];
      return next;
    });
    setEditedUrl(platform.url || `https://syncrozz.com/${platform.id}`);
    setIsEditingUrl(false);
    setUrlSavedToast(true);
    setTimeout(() => setUrlSavedToast(false), 2500);
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      
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

          {/* Interactive Simulation Sandbox & External Link Hub */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800">Akses Platform & Pautan Luar</span>
              </div>
              <div className="flex items-center gap-2">
                {hasAdminAccess && (
                  <button
                    id="admin-edit-platform-url-btn"
                    onClick={() => setIsEditingUrl(!isEditingUrl)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80 transition-colors cursor-pointer"
                    title="Edit Pautan Luar (Admin Access)"
                  >
                    <Pencil className="w-3 h-3 text-amber-600" />
                    <span>{isEditingUrl ? 'Tutup Edit' : 'Edit Pautan'}</span>
                  </button>
                )}
                <span className="text-[11px] text-slate-500">Akses Langsung</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800">Modul: {platform.name} {platform.subName || ''}</span>
                <span className="text-emerald-600 font-medium">Sistem Bersepadu SYNCROZZ</span>
              </div>

              {/* Toast when URL is saved */}
              {urlSavedToast && (
                <div className="py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pautan platform berjaya dikemaskini & disimpan!</span>
                </div>
              )}

              {/* Admin URL Editing Panel */}
              {isEditingUrl && hasAdminAccess ? (
                <form onSubmit={handleSaveUrl} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>URL Pautan Luar (External Link)</span>
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      Akses Pentadbir
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <input
                      type="url"
                      value={editedUrl}
                      onChange={(e) => setEditedUrl(e.target.value)}
                      placeholder="https://app.syncrozz.com/modul-anda"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="text-[11px] text-slate-500">
                      Masukkan pautan penuh (cth: <code>https://...</code>). Pengguna yang menekan butang <strong>Test Platform</strong> akan terus dibawa ke laman ini.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleResetDefaultUrl}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Kembalikan kepada URL lalai"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Lalai</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingUrl(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan Pautan</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-1 text-left w-full sm:w-auto">
                    <p className="text-xs text-slate-600">
                      Buka dan uji platform langsung pada tab baharu.
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate max-w-xs sm:max-w-md">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{targetExternalUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {hasAdminAccess && (
                      <button
                        type="button"
                        onClick={() => setIsEditingUrl(true)}
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-amber-600 shadow-2xs transition-colors cursor-pointer"
                        title="Edit Pautan Luar (Admin)"
                        aria-label="Edit Pautan Luar Platform"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      id="simulate-platform-test-btn"
                      onClick={handleOpenExternalLink}
                      className="px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                      title="Buka pautan platform luar di tab baharu"
                    >
                      <span>Test Platform</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
