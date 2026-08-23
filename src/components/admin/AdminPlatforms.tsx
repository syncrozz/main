import React, { useState } from 'react';
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
  Copy
} from 'lucide-react';
import { PLATFORMS_DATA } from '../../data/platforms';
import { PlatformItem } from '../../types';
import { generateDefaultOgImage } from '../../utils/ogStorage';
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

  const currentCustomImage = customOgImages[selectedPlatform.id];
  const activeImage = currentCustomImage || generateDefaultOgImage(selectedPlatform);

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

  const handleCopyMetaTags = () => {
    const metaSnippet = `<!-- Open Graph Metadata for ${selectedPlatform.name} -->
<meta property="og:title" content="${selectedPlatform.name} — ${selectedPlatform.tagline}" />
<meta property="og:description" content="${selectedPlatform.description}" />
<meta property="og:image" content="${window.location.origin}/og/${selectedPlatform.id}.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />`;

    navigator.clipboard?.writeText?.(metaSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Pengurusan Open Graph Images (JPG)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              1200 × 630 Standard
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Muat naik dan selaraskan visual Open Graph (JPG) untuk setiap modul platform bagi paparan perkongsian media sosial (Facebook, WhatsApp, Twitter/X, LinkedIn).
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {Object.keys(customOgImages).length} / {PLATFORMS_DATA.length} Kustom JPG Aktif
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Platform Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Pilih Modul Platform
          </h3>

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
                        JPG Kustom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                        Visual Asal
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
                  {selectedPlatform.name}
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

              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-950 relative aspect-[1200/630]">
                <img
                  src={activeImage}
                  alt={`Open Graph Preview for ${selectedPlatform.name}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
                  {currentCustomImage ? 'Custom File (JPG)' : 'Generated Vector Fallback'}
                </div>
              </div>
            </div>

            {/* Meta Tags Generator Snippet */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-purple-600" />
                  <span>HTML Open Graph Meta Tags</span>
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
<meta property="og:image" content="${selectedPlatform.id}-og.jpg" />
<meta property="og:type" content="website" />`}
              </pre>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
