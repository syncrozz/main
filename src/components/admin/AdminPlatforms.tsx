import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Upload, 
  Sparkles, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Check, 
  RefreshCw,
  Copy,
  Info,
  CheckCircle2,
  Globe,
  Pencil,
  RotateCcw,
  Plus,
  Search,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { PlatformItem } from '../../types';
import { generateDefaultOgImage, getOfficialMasterOgImage, getCustomPlatformUrls, saveCustomPlatformUrl, removeCustomPlatformUrl } from '../../utils/ogStorage';
import { SYNCROZZ_OGI_OFFICIAL } from '../../data/syncrozzAssets';
import { useAuth } from '../../auth/AuthContext';
import { PlatformFormModal } from './PlatformFormModal';

interface AdminPlatformsProps {
  platforms: PlatformItem[];
  customOgImages: Record<string, string>;
  onSaveOgImage: (platformId: string, dataUrl: string) => void;
  onRemoveOgImage: (platformId: string) => void;
  onSavePlatform: (platform: PlatformItem, ogImageDataUrl?: string) => void;
  onDeletePlatform: (platformId: string) => void;
}

export const AdminPlatforms: React.FC<AdminPlatformsProps> = ({
  platforms,
  customOgImages,
  onSaveOgImage,
  onRemoveOgImage,
  onSavePlatform,
  onDeletePlatform
}) => {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem>(platforms[0] || {} as PlatformItem);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states for Add & Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [platformToEdit, setPlatformToEdit] = useState<PlatformItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Custom Platform URLs State
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [editingUrl, setEditingUrl] = useState('');
  const [urlSavedMessage, setUrlSavedMessage] = useState(false);

  // Keep selectedPlatform valid if platforms array changes
  useEffect(() => {
    if (!selectedPlatform?.id && platforms.length > 0) {
      setSelectedPlatform(platforms[0]);
    } else if (selectedPlatform?.id) {
      const match = platforms.find(p => p.id === selectedPlatform.id);
      if (match) {
        setSelectedPlatform(match);
      } else if (platforms.length > 0) {
        setSelectedPlatform(platforms[0]);
      }
    }
  }, [platforms, selectedPlatform?.id]);

  useEffect(() => {
    setCustomUrls(getCustomPlatformUrls());
  }, []);

  useEffect(() => {
    if (selectedPlatform?.id) {
      const activeUrl = customUrls[selectedPlatform.id] || selectedPlatform.url || `https://syncrozz.com/${selectedPlatform.id}`;
      setEditingUrl(activeUrl);
    }
  }, [selectedPlatform, customUrls]);

  const currentCustomImage = selectedPlatform?.id ? customOgImages[selectedPlatform.id] : undefined;
  const activeImage = selectedPlatform?.id ? (currentCustomImage || generateDefaultOgImage(selectedPlatform)) : '';
  const activePlatformUrl = selectedPlatform?.id ? (customUrls[selectedPlatform.id] || selectedPlatform.url || `https://syncrozz.com/${selectedPlatform.id}`) : '';

  const filteredPlatforms = platforms.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSavePlatformUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform?.id) return;
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
    if (!selectedPlatform?.id) return;
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

  const handleOpenAddModal = () => {
    setPlatformToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (platform: PlatformItem) => {
    setPlatformToEdit(platform);
    setIsFormModalOpen(true);
  };

  const handleDelete = (platformId: string) => {
    onDeletePlatform(platformId);
    setDeleteConfirmId(null);
  };

  const handleCopyMetaTags = () => {
    if (!selectedPlatform?.id) return;
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
      
      {/* Top Action Header: Title + Add New Platform Button */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#0056D2] uppercase tracking-wider">
              Modul & Produk Pentadbir
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {platforms.length} Platform Aktif
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Pengurusan Modul & Pautan Platform SYNCROZZ
          </h2>
          <p className="text-xs text-slate-600">
            Tambah produk atau platform baharu ke ekosistem, kemaskini maklumat sistem, tetapkan URL luaran, dan muat naik imej Open Graph (OG).
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Platform Baharu</span>
        </button>
      </div>

      {/* Official Master OGI Reference Banner */}
      <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-xs space-y-4">
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
            <h3 className="text-base font-extrabold text-slate-900">
              Piawaian Visual Rasmi: SYNCROZZ OGI.MAINv2.jpg
            </h3>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Mematuhi sistem visual rasmi: <strong>White / Light / Modern / Clean / Premium Corporate</strong>, komposisi asimetri kiri-kanan dengan palet <strong>SYNCROZZ Blue + dark navy + white</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={SYNCROZZ_OGI_OFFICIAL.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              <span>GitHub Reference</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {selectedPlatform?.id && (
              <button
                onClick={() => handleApplyOfficialMaster(selectedPlatform.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0056D2] hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Terapkan untuk {selectedPlatform.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Platform Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Senarai Platform ({filteredPlatforms.length})
            </h3>
            <span className="text-[11px] text-blue-600 font-bold">
              {Object.keys(customOgImages).length} Imej Kustom
            </span>
          </div>

          {/* Search bar inside admin */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari platform mengikut nama/kategori..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredPlatforms.map((plat) => {
              const isSelected = selectedPlatform?.id === plat.id;
              const hasCustom = !!customOgImages[plat.id];

              return (
                <div
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#0056D2] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div 
                      className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: plat.accentColor || '#0056D2' }}
                    >
                      {plat.name?.charAt(0) || 'P'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{plat.name} {plat.subName || ''}</span>
                        {plat.isPopular && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Pop
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                        <span>{plat.category}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">#{plat.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(plat);
                      }}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Edit Maklumat Platform"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {hasCustom ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        JPG
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Platform Preview & Configuration Panel */}
        {selectedPlatform?.id ? (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              
              {/* Header with Title, Category, Edit & Delete Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2]">
                      {selectedPlatform.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                      ID: #{selectedPlatform.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedPlatform.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                      {selectedPlatform.status || 'Active'}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                    {selectedPlatform.name} {selectedPlatform.subName || ''}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedPlatform.tagline}</p>
                </div>

                {/* Edit, Delete & Upload Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedPlatform)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Edit butiran teks, ciri & kategori"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Data</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(selectedPlatform.id)}
                    className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                    title="Padam / Sembunyi Platform ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <label className="px-3.5 py-1.5 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{currentCustomImage ? 'Tukar OG' : 'Muat Naik OG'}</span>
                    <input
                      type="file"
                      accept="image/jpeg, image/jpg, image/png"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, selectedPlatform.id)}
                    />
                  </label>
                </div>
              </div>

              {/* Delete Confirmation Alert */}
              {deleteConfirmId === selectedPlatform.id && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Sahkan pemadaman modul {selectedPlatform.name}?</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Platform ini akan dipadamkan daripada senarai paparan dan ekosistem SYNCROZZ.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1 bg-white border border-rose-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPlatform.id)}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                    >
                      Ya, Padamkan
                    </button>
                  </div>
                </div>
              )}

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

                <div className="relative aspect-[1200/630] rounded-xl overflow-hidden border border-slate-300 bg-slate-950 shadow-md">
                  <img
                    src={activeImage}
                    alt={`OG Preview for ${selectedPlatform.name}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {currentCustomImage && (
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Kustom Aktif</span>
                      </span>
                    </div>
                  )}
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
                    <span>Uji Pautan Luar</span>
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
                  <span className="text-xs font-bold text-slate-700">
                    Kod Tag Meta HTML (1200 × 630 px)
                  </span>
                  <button
                    onClick={handleCopyMetaTags}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Disalin!' : 'Salin Tag Meta'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed">
{`<!-- SYNCROZZ Open Graph Metadata -->
<meta property="og:title" content="${selectedPlatform.name} — ${selectedPlatform.tagline}" />
<meta property="og:image" content="${activeImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`}
                </pre>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <p className="text-sm text-slate-500">Tiada platform dipilih.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#0056D2] text-white text-xs font-bold rounded-xl"
            >
              + Tambah Platform Baharu
            </button>
          </div>
        )}

      </div>

      {/* Platform Form Modal (Add & Edit) */}
      <PlatformFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setPlatformToEdit(null);
        }}
        initialData={platformToEdit}
        onSave={onSavePlatform}
        existingIds={platforms.map(p => p.id)}
      />

    </div>
  );
};
