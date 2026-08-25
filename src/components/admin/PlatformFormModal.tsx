import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Layers, 
  Globe, 
  Tag, 
  Palette,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PlatformItem, PlatformCategory } from '../../types';
import { generateDefaultOgImage } from '../../utils/ogStorage';

interface PlatformFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PlatformItem | null;
  onSave: (platform: PlatformItem, ogImageDataUrl?: string) => void;
  existingIds: string[];
}

const CATEGORY_OPTIONS: { label: string; value: PlatformCategory }[] = [
  { label: 'Campus (Operasi & Kampus)', value: 'Campus' },
  { label: 'Education (Pendidikan & PdP)', value: 'Education' },
  { label: 'Productivity (Produktiviti & Automasi)', value: 'Productivity' },
  { label: 'Community (Komuniti & Kebajikan)', value: 'Community' },
  { label: 'Innovation (Inovasi & AI)', value: 'Innovation' }
];

const COLOR_PRESETS = [
  { name: 'Syncrozz Blue', accent: '#0056D2', badge: 'bg-blue-50 text-blue-700 border-blue-200', gradient: 'from-blue-600 to-indigo-600' },
  { name: 'Sky Cyan', accent: '#0284C7', badge: 'bg-sky-50 text-sky-700 border-sky-200', gradient: 'from-sky-500 to-blue-600' },
  { name: 'Indigo Deep', accent: '#4F46E5', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', gradient: 'from-indigo-500 to-purple-600' },
  { name: 'Emerald Green', accent: '#059669', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Purple Violet', accent: '#9333EA', badge: 'bg-purple-50 text-purple-700 border-purple-200', gradient: 'from-purple-600 to-pink-600' },
  { name: 'Amber Warm', accent: '#D97706', badge: 'bg-amber-50 text-amber-700 border-amber-200', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Rose Red', accent: '#E11D48', badge: 'bg-rose-50 text-rose-700 border-rose-200', gradient: 'from-rose-500 to-red-600' }
];

const ICON_PRESETS = [
  'UserCheck', 'GraduationCap', 'BookOpenCheck', 'QrCode', 'Calendar', 
  'Building2', 'Zap', 'Users', 'Lightbulb', 'Sparkles', 'ShieldCheck', 
  'ShoppingBag', 'CreditCard', 'Cpu', 'Layers', 'Activity', 'Globe'
];

export const PlatformFormModal: React.FC<PlatformFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  existingIds
}) => {
  const isEditing = !!initialData;

  const [name, setName] = useState('');
  const [subName, setSubName] = useState('');
  const [id, setId] = useState('');
  const [category, setCategory] = useState<PlatformCategory>('Campus');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'Active' | 'Beta' | 'New'>('Active');
  const [isPopular, setIsPopular] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [iconName, setIconName] = useState('Layers');
  
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  
  const [audience, setAudience] = useState<string[]>([]);
  const [audienceInput, setAudienceInput] = useState('');

  const [customOgImagePreview, setCustomOgImagePreview] = useState<string | null>(null);
  const [ogDataUrl, setOgDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-fill or reset fields on open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setSubName(initialData.subName || '');
        setId(initialData.id || '');
        setCategory(initialData.category || 'Campus');
        setTagline(initialData.tagline || '');
        setDescription(initialData.description || '');
        setUrl(initialData.url || '');
        setStatus(initialData.status || 'Active');
        setIsPopular(!!initialData.isPopular);
        setIconName(initialData.iconName || 'Layers');
        setFeatures(initialData.features || []);
        setAudience(initialData.audience || []);

        const matchedColor = COLOR_PRESETS.find(c => c.accent === initialData.accentColor) || COLOR_PRESETS[0];
        setSelectedColor(matchedColor);
        setCustomOgImagePreview(initialData.ogImage || null);
        setOgDataUrl(null);
      } else {
        setName('');
        setSubName('');
        setId('');
        setCategory('Campus');
        setTagline('');
        setDescription('');
        setUrl('');
        setStatus('New');
        setIsPopular(false);
        setSelectedColor(COLOR_PRESETS[0]);
        setIconName('Sparkles');
        setFeatures([
          'Papan pemuka pengurusan masa nyata bersepadu',
          'Automasi notifikasi & sinkronisasi data awan',
          'Laporan analitik pintar & eksport data PDF/Excel'
        ]);
        setAudience(['Institusi Pendidikan', 'Pentadbir & Pengurusan']);
        setCustomOgImagePreview(null);
        setOgDataUrl(null);
      }
      setErrorMsg(null);
    }
  }, [isOpen, initialData]);

  // Auto-slug generator for new platforms
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setId(generatedSlug);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleAddAudience = () => {
    if (audienceInput.trim()) {
      setAudience([...audience, audienceInput.trim()]);
      setAudienceInput('');
    }
  };

  const handleRemoveAudience = (index: number) => {
    setAudience(audience.filter((_, i) => i !== index));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const dataUrl = uploadEvent.target.result as string;
          setCustomOgImagePreview(dataUrl);
          setOgDataUrl(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = id.trim().toLowerCase();
    if (!cleanId) {
      setErrorMsg('Sila masukkan ID modul yang sah.');
      return;
    }

    if (!isEditing && existingIds.includes(cleanId)) {
      setErrorMsg(`ID modul "${cleanId}" sudah digunakan. Sila gunakan ID yang berbeza.`);
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Sila masukkan Nama Platform / Produk.');
      return;
    }

    const platformToSave: PlatformItem = {
      id: cleanId,
      name: name.trim(),
      subName: subName.trim() || undefined,
      tagline: tagline.trim() || `${name.trim()} - Modul Penyelesaian Bersepadu SYNCROZZ.`,
      description: description.trim() || 'Modul inovatif direka untuk memacu kecekapan pengurusan dan integrasi menyeluruh.',
      category: category as any,
      badgeColor: selectedColor.badge,
      accentColor: selectedColor.accent,
      logoBg: selectedColor.gradient,
      iconName: iconName,
      features: features.length > 0 ? features : ['Penyelesaian berpusat masa nyata', 'Integrasi API SYNCROZZ'],
      audience: audience.length > 0 ? audience : ['Institusi & Komuniti'],
      url: url.trim() || `https://syncrozz.com/${cleanId}`,
      isPopular: isPopular,
      status: status
    };

    onSave(platformToSave, ogDataUrl || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0056D2] flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Kemaskini Platform: ${initialData?.name}` : 'Tambah Produk / Platform Baharu'}
              </h3>
              <p className="text-xs text-slate-400">
                Konfigurasikan maklumat produk, pautan luaran, modul, dan visual OG.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Basic Info Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#0056D2]" />
              <span>Maklumat Asas Produk</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Utama Produk / Platform <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Cth: SMART CANTEEN / STAFF"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sub-Nama (Pilihan)
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Cth: SYSTEM / PORTAL / PRO"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ID Modul (Slug Unik) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="smart-canteen"
                  disabled={isEditing}
                  className={`w-full px-3.5 py-2 text-xs font-mono rounded-lg border text-slate-900 ${isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">ID ini digunakan dalam pautan sauh (cth: #smart-canteen).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Modul <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PlatformCategory)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tagline Ringkas (1 Ayat Tarikan)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Cth: Sistem pesanan & bayaran kantin tanpa tunai untuk institusi pintar."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Penerangan Terperinci
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Huraikan fungsi modul dan bagaimana ia menyelesaikan masalah operasi..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 2. External URL & Status Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0056D2]" />
              <span>Pautan Luar (Test Platform Target) & Status</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Laman Web / Aplikasi Sistem
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://app.syncrozz.com/modul-anda"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Pautan ini dibuka apabila butang "Test Platform" ditekan.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Pelancaran
                </label>
                <div className="flex items-center gap-3 pt-1">
                  {(['Active', 'New', 'Beta'] as const).map((s) => (
                    <label key={s} className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="platform-status"
                        value={s}
                        checked={status === s}
                        onChange={() => setStatus(s)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{s === 'Active' ? 'Aktif' : s === 'New' ? 'Baharu' : 'Beta'}</span>
                    </label>
                  ))}

                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer ml-3 pl-3 border-l border-slate-200">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-amber-700">Lencana Popular</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Features & Audience */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0056D2]" />
              <span>Ciri-Ciri Utama & Sasaran Pengguna</span>
            </h4>

            {/* Features list */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Senarai Ciri Utama (Features)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="Taip ciri sistem dan tekan Tambah..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded border border-slate-200/60 shadow-2xs">
                    <span className="truncate pr-2">• {feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sasaran Pengguna (Audience)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={audienceInput}
                  onChange={(e) => setAudienceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAudience();
                    }
                  }}
                  placeholder="Cth: Pejabat, Guru, Pelajar..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddAudience}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {audience.map((aud, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <span>{aud}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAudience(idx)}
                      className="text-blue-500 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Visual Themes & Open Graph */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#0056D2]" />
              <span>Tema Visual, Ikon & Imej Open Graph</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Warna Aksen & Lencana
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${selectedColor.name === color.name ? 'border-[#0056D2] ring-2 ring-blue-500/20 bg-blue-50/50 font-bold' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: color.accent }} />
                      <span className="text-[10px] text-slate-700 truncate">{color.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilihan Ikon Sistem
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {ICON_PRESETS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconName(ic)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${iconName === ic ? 'bg-[#0056D2] text-white font-bold' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* OG Banner Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Muat Naik Banner Open Graph (OG Image JPG 1200x630)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="relative aspect-[16/9] w-36 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-300">
                  <img
                    src={customOgImagePreview || generateDefaultOgImage({
                      id: id || 'preview',
                      name: name || 'Preview',
                      subName,
                      category,
                      accentColor: selectedColor?.accent || '#0056D2',
                      tagline,
                      description,
                      status: status as any
                    })}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <p className="text-xs text-slate-600">
                    Gunakan imej khusus atau biarkan kosong untuk jana banner OG SYNCROZZ secara automatik.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3 h-3 text-[#0056D2]" />
                    <span>Pilih Fail Imej (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0056D2] hover:bg-blue-700 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Platform Sekarang'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
