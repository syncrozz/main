import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  Eye, 
  Download, 
  Share2, 
  Sparkles,
  Settings,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import { PLATFORMS_DATA } from '../data/platforms';
import { PlatformItem } from '../types';
import { generateDefaultOgImage, getOfficialMasterOgImage } from '../utils/ogStorage';
import { SYNCROZZ_OGI_OFFICIAL } from '../data/syncrozzAssets';

interface AdminOgModalProps {
  isOpen: boolean;
  onClose: () => void;
  customOgImages: Record<string, string>;
  onSaveOgImage: (platformId: string, dataUrl: string) => void;
  onRemoveOgImage: (platformId: string) => void;
}

export const AdminOgModal: React.FC<AdminOgModalProps> = ({
  isOpen,
  onClose,
  customOgImages,
  onSaveOgImage,
  onRemoveOgImage
}) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(PLATFORMS_DATA[0].id);
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentPlatform = PLATFORMS_DATA.find((p) => p.id === selectedPlatformId) || PLATFORMS_DATA[0];
  const customImage = customOgImages[currentPlatform.id];
  const activeOgImage = customImage || generateDefaultOgImage(currentPlatform);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    // Check if image file
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej berformat JPG / JPEG / PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onSaveOgImage(currentPlatform.id, dataUrl);
        showNotification(`Open Graph Image untuk ${currentPlatform.name} berjaya dimuat naik!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyOfficialMaster = () => {
    onSaveOgImage(currentPlatform.id, SYNCROZZ_OGI_OFFICIAL.rawUrl);
    showNotification(`Visual rasmi OGI.MAINv2.jpg diterapkan untuk ${currentPlatform.name}!`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopyMetaTag = () => {
    const metaTag = `<meta property="og:image" content="${customImage || SYNCROZZ_OGI_OFFICIAL.rawUrl}" />\n<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />\n<meta property="og:image:type" content="image/jpeg" />`;
    navigator.clipboard.writeText(metaTag);
    setCopiedId('meta');
    setTimeout(() => setCopiedId(null), 2000);
    showNotification('Meta Tag HTML Open Graph disalin!');
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 my-8 text-left animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0056D2] text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Admin Mode: Pengurusan Open Graph Image (JPG)
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ADMIN AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Urus dan muat naik gambar Open Graph (1200 × 630 px) bagi setiap kad platform.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast if any */}
        {notification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[80vh] overflow-y-auto">
          
          {/* Left Column: Platform List Selector */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pilih Kad Platform ({PLATFORMS_DATA.length})
              </span>
              <span className="text-[11px] text-[#0056D2] font-semibold">
                {Object.keys(customOgImages).length} Tersuai
              </span>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {PLATFORMS_DATA.map((item) => {
                const isSelected = item.id === selectedPlatformId;
                const hasCustom = Boolean(customOgImages[item.id]);

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPlatformId(item.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#0056D2] text-[#0056D2] shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#0056D2] text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {item.name} {item.subName || ''}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.category}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {hasCustom ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          JPG OK
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          Default
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Platform OG Upload & Preview Sandbox */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header info */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-[#0056D2] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {currentPlatform.category}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-1">
                  {currentPlatform.name} {currentPlatform.subName || ''}
                </h4>
                <p className="text-xs text-slate-500">
                  {currentPlatform.tagline}
                </p>
              </div>

              {customImage && (
                <button
                  onClick={() => onRemoveOgImage(currentPlatform.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Padam & Reset Default</span>
                </button>
              )}
            </div>

            {/* Open Graph Image Live 1200x630 Preview Canvas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#0056D2]" />
                  Open Graph Image (1200 × 630 px • Nisbah 1.91:1)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyOfficialMaster}
                    className="text-[11px] font-bold text-[#0056D2] hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gunakan OGI.MAINv2.jpg</span>
                  </button>
                  <span className="font-mono text-[11px] text-slate-400">
                    {customImage ? 'Fail JPG Tersuai' : 'White / Light SVG Default'}
                  </span>
                </div>
              </div>

              {/* Direct Reference Info Callout */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#0056D2] shrink-0" />
                  <span className="text-slate-700 truncate">
                    Rujukan Visual Rasmi: <strong>OGI.MAINv2.jpg</strong> (White/Corporate Asymmetrical)
                  </span>
                </div>
                <a
                  href={SYNCROZZ_OGI_OFFICIAL.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 font-bold hover:underline shrink-0 flex items-center gap-1 text-[11px]"
                >
                  <span>Lihat di GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Card Preview Container */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md group aspect-[1200/630]">
                <img
                  src={activeOgImage}
                  alt={`Open Graph Preview ${currentPlatform.name}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>OG IMAGE PREVIEW (1200 × 630)</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-white/20">
                  1200 × 630 JPG
                </div>
              </div>
            </div>


            {/* Upload Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-[#0056D2] bg-blue-50/70 scale-[1.01]'
                  : 'border-slate-300 hover:border-[#0056D2] hover:bg-slate-50/80 bg-slate-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/jpg, image/png, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0056D2] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>

              <div className="text-sm font-bold text-slate-800 mb-1">
                Klik untuk Muat Naik Fail JPG Open Graph atau Seret ke Sini
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Disyorkan resolusi <strong>1200 × 630 piksel</strong>, format <strong>.JPG / .JPEG</strong> (Maksimum 5MB).
              </p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="px-2.5 py-1 rounded bg-white text-[11px] font-semibold text-slate-600 border border-slate-200">
                  .JPG
                </span>
                <span className="px-2.5 py-1 rounded bg-white text-[11px] font-semibold text-slate-600 border border-slate-200">
                  .JPEG
                </span>
                <span className="px-2.5 py-1 rounded bg-white text-[11px] font-semibold text-slate-600 border border-slate-200">
                  .PNG
                </span>
              </div>
            </div>

            {/* Social Share Preview & Quick HTML Code */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#0056D2]" />
                  Pratonton Perkongsian Sosial (Facebook, WhatsApp, LinkedIn, X)
                </div>
                <button
                  onClick={handleCopyMetaTag}
                  className="text-xs font-semibold text-[#0056D2] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'meta' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'meta' ? 'Disalin!' : 'Salin Meta Tag'}</span>
                </button>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs font-mono text-slate-600 overflow-x-auto">
                <code>{`<meta property="og:image" content="https://syncrozz.com/og/${currentPlatform.id}.jpg" />`}</code>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Perubahan disimpan secara automatik dalam simpanan tempatan pelayar anda.
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Selesai & Tutup Admin Mode
          </button>
        </div>

      </div>
    </div>
  );
};
