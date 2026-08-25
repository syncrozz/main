import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  Eye, 
  ExternalLink,
  Code,
  Sparkles,
  RefreshCw,
  Copy,
  Info,
  CheckCircle2,
  Globe,
  Pencil,
  RotateCcw
} from 'lucide-react';
import { PLATFORMS_DATA } from '../../data/platforms';
import { PlatformItem } from '../../types';
import { generateDefaultOgImage, getOfficialMasterOgImage, getCustomPlatformUrls, saveCustomPlatformUrl, removeCustomPlatformUrl } from '../../utils/ogStorage';
import { SYNCROZZ_OGI_OFFICIAL } from '../../data/syncrozzAssets';
import { useAuth } from '../../auth/AuthContext';

interface AdminPlatformsProps {
  customOgImages: Record<string, string>;
  onSaveOgImage: (platformId: string, dataUrl: string) => void;
  onRemoveOgImage: (platformId: string) => void;
}

export const AdminPlatforms: React.FC<AdminPlatformsProps> = ({
  customOgImages,
  onSaveOgImage,
  onRemoveOgImage
}) => {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem>(PLATFORMS_DATA[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Custom Platform URLs State
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [editingUrl, setEditingUrl] = useState('');
  const [urlSavedMessage, setUrlSavedMessage] = useState(false);

  useEffect(() => {
    setCustomUrls(getCustomPlatformUrls());
  }, []);

  useEffect(() => {
    const activeUrl = customUrls[selectedPlatform.id] || selectedPlatform.url || `https://syncrozz.com/${selectedPlatform.id}`;
    setEditingUrl(activeUrl);
  }, [selectedPlatform, customUrls]);

  const currentCustomImage = customOgImages[selectedPlatform.id];
  const activeImage = currentCustomImage || generateDefaultOgImage(selectedPlatform);
  const activePlatformUrl = customUrls[selectedPlatform.id] || selectedPlatform.url || `https://syncrozz.com/${selectedPlatform.id}`;

  const handleSavePlatformUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = editingUrl.trim();
    if (finalUrl) {
      saveCustomPlatformUrl(selectedPlatform.id, finalUrl);
      setCustomUrls((prev) => ({ ...prev, [selectedPlatform.id]: finalUrl }));
    } else {
      removeCustomPlatformUrl(selectedPlatform.id);
      setCustomUrls((prev) => {
        const next = { ...prev };
        delete next[selectedPlatform.id];
        return next;
      });
    }
    setUrlSavedMessage(true);
    setTimeout(() => setUrlSavedMessage(false), 2500);
  };

  const handleResetPlatformUrl = () => {
    removeCustomPlatformUrl(selectedPlatform.id);
    setCustomUrls((prev) => {
      const next = { ...prev };
      delete next[selectedPlatform.id];
      return next;
    });
    setEditingUrl(selectedPlatform.url || `https://syncrozz.com/${selectedPlatform.id}`);
    setUrlSavedMessage(true);
    setTimeout(() => setUrlSavedMessage(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, platformId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          onSaveOgImage(platformId, dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyOfficialMaster = (platformId: string) => {
    onSaveOgImage(platformId, SYNCROZZ_OGI_OFFICIAL.rawUrl);
  };

  const handleCopyMetaTags = () => {
    const imgUrl = currentCustomImage || SYNCROZZ_OGI_OFFICIAL.rawUrl;
    const metaSnippet = `<!-- SYNCROZZ Open Graph Metadata (1200x630 px) -->
<meta property="og:title" content="${selectedPlatform.name} — ${selectedPlatform.tagline}" />
<meta property="og:description" content="${selectedPlatform.description}" />
<meta property="og:image" content="${imgUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${imgUrl}" />`;

    navigator.clipboard?.writeText?.(metaSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Official Master OGI Reference Banner */}
      <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#0056D2] uppercase tracking-wider">
                Direct Visual Reference
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">
                1200 × 630 px • JPG
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Rujukan Visual Utama: SYNCROZZ OGI.MAINv2.jpg
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Mematuhi sistem visual rasmi: <strong>White / Light / Modern / Clean / Premium Corporate</strong>, komposisi asimetri kiri-kanan (maklumat di kiri, ilustrasi ekosistem teknologi di kanan) dengan palet <strong>SYNCROZZ Blue + dark navy + white</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={SYNCROZZ_OGI_OFFICIAL.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              <span>GitHub OGI.MAINv2.jpg</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => handleApplyOfficialMaster(selectedPlatform.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0056D2] hover:bg-blue-700 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gunakan OGI.MAINv2 untuk {selectedPlatform.name}</span>
            </button>
          </div>
        </div>

        {/* Master OGI Visual Thumbnail Bar */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-48 aspect-[1200/630] rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0 shadow-2xs">
            <img 
              src={SYNCROZZ_OGI_OFFICIAL.rawUrl}
              alt="SYNCROZZ Master OGI Reference"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Piawaian Identiti Digital SYNCROZZ Terkunci</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Direct Reference: <code className="text-blue-700 font-mono text-[10px] break-all">{SYNCROZZ_OGI_OFFICIAL.rawUrl}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Platform Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pilih Modul Platform ({PLATFORMS_DATA.length})
            </h3>
            <span className="text-[11px] text-blue-600 font-bold">
              {Object.keys(customOgImages).length} Kustom
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {PLATFORMS_DATA.map((plat) => {
              const isSelected = selectedPlatform.id === plat.id;
              const hasCustom = !!customOgImages[plat.id];

              return (
                <div
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#0056D2] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-[#0056D2] text-white flex items-center justify-center font-black text-sm shrink-0">
                      {plat.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {plat.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {plat.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasCustom ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        JPG Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                        Light Template
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Platform Preview & Upload Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            
            {/* Header with Title and Upload Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2]">
                  {selectedPlatform.category}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {selectedPlatform.name} {selectedPlatform.subName || ''}
                </h3>
              </div>

              {/* Upload & Reset Buttons */}
              <div className="flex items-center gap-2">
                {currentCustomImage && (
                  <button
                    onClick={() => onRemoveOgImage(selectedPlatform.id)}
                    className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset Asal</span>
                  </button>
                )}

                <label className="px-4 py-1.5 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{currentCustomImage ? 'Tukar JPG' : 'Muat Naik JPG'}</span>
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, selectedPlatform.id)}
                  />
                </label>
              </div>
            </div>

            {/* Social Card Aspect Ratio 1200x630 Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#0056D2]" />
                  <span>Pratonton Open Graph Card (1200 × 630 px)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-600">
                  Ratio 1.91:1
                </span>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-md bg-white relative aspect-[1200/630]">
                <img
                  src={activeImage}
                  alt={`Open Graph Preview for ${selectedPlatform.name}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
                  {currentCustomImage ? 'JPG Custom / Master' : '1200x630 SVG Template'}
                </div>
              </div>
            </div>

            {/* External Platform Link Manager (Test Platform Action Target) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#0056D2]" />
                  <span>Pautan Luar Platform (Test Platform Target URL)</span>
                </span>

                <a 
                  href={activePlatformUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0056D2] hover:underline"
                >
                  <span>Uji Pautan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {urlSavedMessage && (
                <div className="py-1.5 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pautan URL platform berjaya dikemaskini!</span>
                </div>
              )}

              <form onSubmit={handleSavePlatformUrl} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={editingUrl}
                    onChange={(e) => setEditingUrl(e.target.value)}
                    placeholder={`https://syncrozz.com/${selectedPlatform.id}`}
                    className="flex-grow px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleResetPlatformUrl}
                      className="px-2.5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Reset kepada URL asal"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-2 text-xs font-bold text-white bg-[#0056D2] hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan URL</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  URL ini akan dibuka apabila pengguna atau staf menekan butang <strong>"Test Platform"</strong> di modal platform.
                </p>
              </form>
            </div>

            {/* Meta Tags Generator Snippet */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#0056D2]" />
                  <span>HTML Open Graph Meta Tags (1200 × 630 px)</span>
                </span>

                <button
                  onClick={handleCopyMetaTags}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0056D2] hover:text-blue-700 cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kod Meta</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
{`<meta property="og:title" content="${selectedPlatform.name} — ${selectedPlatform.tagline}" />
<meta property="og:description" content="${selectedPlatform.description}" />
<meta property="og:image" content="${currentCustomImage || SYNCROZZ_OGI_OFFICIAL.rawUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />`}
              </pre>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

