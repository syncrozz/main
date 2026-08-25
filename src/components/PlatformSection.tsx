import React, { useState, useMemo, useRef } from 'react';
import { 
  ArrowRight, 
  Search, 
  Sparkles, 
  ExternalLink,
  Layers,
  GraduationCap,
  Building2,
  Zap,
  Users,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  Settings,
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  Check,
  ShieldAlert,
  Info,
  Plus
} from 'lucide-react';
import { PLATFORMS_DATA } from '../data/platforms';
import { PlatformItem, PlatformCategory } from '../types';
import { generateDefaultOgImage } from '../utils/ogStorage';
import { useAuth } from '../auth/AuthContext';

interface PlatformSectionProps {
  platforms?: PlatformItem[];
  onSelectPlatform: (platform: PlatformItem) => void;
  customOgImages: Record<string, string>;
  onSaveOgImage: (platformId: string, dataUrl: string) => void;
  onRemoveOgImage: (platformId: string) => void;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  onOpenAdminModal: () => void;
  onAdminClick?: () => void;
  onAddPlatformClick?: () => void;
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({ 
  platforms = PLATFORMS_DATA,
  onSelectPlatform,
  customOgImages,
  onSaveOgImage,
  onRemoveOgImage,
  isAdminMode,
  onToggleAdminMode,
  onOpenAdminModal,
  onAdminClick,
  onAddPlatformClick
}) => {
  const { isAuthenticated, isAdmin, isMasterAdmin } = useAuth();
  const hasAdminAccess = isAdminMode || (isAuthenticated && (isAdmin || isMasterAdmin));

  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);

  const categories: { label: string; value: PlatformCategory; icon: React.ReactNode }[] = [
    { label: 'Semua Platform', value: 'All', icon: <Layers className="w-4 h-4" /> },
    { label: 'Education', value: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Campus', value: 'Campus', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Productivity', value: 'Productivity', icon: <Zap className="w-4 h-4" /> },
    { label: 'Community', value: 'Community', icon: <Users className="w-4 h-4" /> },
  ];

  const filteredPlatforms = useMemo(() => {
    return platforms.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subName && item.subName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [platforms, selectedCategory, searchQuery]);

  const handleCardImageUpload = (platformId: string, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Sila muat naik fail imej berformat JPG / JPEG / PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onSaveOgImage(platformId, dataUrl);
        setUploadSuccessId(platformId);
        setTimeout(() => setUploadSuccessId(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Render product brand logos faithfully matching the visual identity
  const renderProductLogo = (item: PlatformItem) => {
    switch (item.id) {
      case 'staff-attend':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/50"></div>
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
            </div>
          </div>
        );
      case 'student-attend':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-sky-50/50"></div>
              <svg className="w-6 h-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>
        );
      case 'class-attend':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-50/50"></div>
              <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
            </div>
          </div>
        );
      case 'syncrozz-qr':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-50/50"></div>
              <svg className="w-6 h-6 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="5" height="5" x="3" y="3" rx="1" />
                <rect width="5" height="5" x="16" y="3" rx="1" />
                <rect width="5" height="5" x="3" y="16" rx="1" />
                <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                <path d="M21 21v.01" />
                <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                <path d="M12 12v9" />
                <path d="M16 12h1" />
              </svg>
            </div>
          </div>
        );
      case 'urusteam':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-rose-50/50"></div>
              <svg className="w-6 h-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
          </div>
        );
      case 'kpm-match':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/50"></div>
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#2563EB" />
              </svg>
            </div>
          </div>
        );
      case 'syncrozz-link':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-50/50"></div>
              <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
          </div>
        );
      case 'rc-fun-ride':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/50"></div>
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="12" x2="10" y2="12" />
                <line x1="8" y1="10" x2="8" y2="14" />
                <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="3" />
                <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="3" />
                <rect x="2" y="6" width="20" height="12" rx="6" />
              </svg>
            </div>
          </div>
        );
      case 'rc-zone':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 p-0.5 shadow-xs">
            <div className="w-full h-full bg-slate-900 rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="14" r="8" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="14" x2="15" y2="11" />
              </svg>
            </div>
          </div>
        );
      case 'peluang-pentas':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-xs">
            <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-50/50"></div>
              <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10s3-3 5-3 5 3 5 3-3 3-5 3-5-3-5-3Z" />
                <path d="M12 10s3-3 5-3 5 3 5 3-3 3-5 3-5-3-5-3Z" />
                <path d="M12 21a6 6 0 0 0 6-6H6a6 6 0 0 0 6 6Z" />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-[#0056D2] text-white flex items-center justify-center font-bold">
            S
          </div>
        );
    }
  };

  return (
    <section id="platform" className="py-10 md:py-14 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Admin Gear Control */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-3">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#0056D2] uppercase bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
                Platform Kami
              </span>

              {/* Admin Mode Status Badge */}
              {isAdminMode && (
                <span className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-200 animate-pulse">
                  <Settings className="w-3 h-3 text-amber-600" />
                  Admin Mode Aktif
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Satu Platform, Banyak Penyelesaian
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Terokai ekosistem penyelesaian digital SYNCROZZ dengan sokongan Open Graph Image (JPG).
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Add Platform Button for Admins */}
            {hasAdminAccess && onAddPlatformClick && (
              <button
                id="admin-add-platform-btn"
                onClick={onAddPlatformClick}
                title="Tambah Platform / Produk Baharu"
                className="p-2 px-3 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Platform</span>
              </button>
            )}

            {/* Gear Icon to Access Admin Portal */}
            <button
              id="admin-gear-access-btn"
              onClick={onAdminClick || onOpenAdminModal}
              title="Akses Mod Admin"
              className="p-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-[#0056D2] transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#0056D2]" />
              <span className="hidden sm:inline">Admin Portal</span>
            </button>

            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-xs sm:text-sm font-bold text-[#0056D2] flex items-center gap-1 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Admin Quick Action Banner (When Admin Mode is on) */}
        {isAdminMode && (
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-blue-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span>Mod Pentadbir: Ruang Muat Naik Open Graph Image (JPG)</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-200/80 text-amber-900 font-mono">1200×630</span>
                </div>
                <div className="text-[10px] text-amber-800">
                  Klik butang <strong>"Muat Naik JPG"</strong> di setiap kad untuk kemaskini imej Open Graph.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenAdminModal}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-[#0056D2] text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Hab Pengurusan OG</span>
              </button>
              <button
                onClick={onToggleAdminMode}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Tutup Mod
              </button>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-slate-50 rounded-xl max-w-full overflow-x-auto border border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat.value}
                id={`filter-tab-${cat.value.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-white text-[#0056D2] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="platform-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari platform..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0056D2] transition-all placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* Platform Cards Grid */}
        {filteredPlatforms.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-xs">Tiada platform dijumpai untuk carian ini.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-2 text-xs font-semibold text-[#0056D2] hover:underline cursor-pointer"
            >
              Reset tapisan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredPlatforms.map((item) => {
              const customImage = customOgImages[item.id];
              const cardOgImage = customImage || generateDefaultOgImage(item);
              const isUploadSuccess = uploadSuccessId === item.id;

              return (
                <div
                  key={item.id}
                  id={`card-platform-${item.id}`}
                  onClick={() => onSelectPlatform(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectPlatform(item);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Buka butiran platform ${item.name}`}
                  className="group relative bg-white rounded-xl border border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0056D2]/30"
                >
                  {/* Card Main Area */}
                  <div>
                    {/* 1. Open Graph Image Banner (1200x630 format) for each card - Clickable */}
                    <div className="relative aspect-[16/8.2] w-full bg-slate-900 overflow-hidden border-b border-slate-100 cursor-pointer">
                      <img
                        src={cardOgImage}
                        alt={`Open Graph for ${item.name}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />

                      {/* OG Image Pill Overlay */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono font-bold text-white border border-white/20 flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5 text-sky-400" />
                          <span>OG (JPG)</span>
                        </span>

                        {customImage && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/90 text-white text-[8px] font-bold">
                            Tersuai
                          </span>
                        )}
                      </div>

                      {/* Quick Gear / Admin Trigger on Card - Only visible when Admin Mode or Google OAuth Admin is active */}
                      {hasAdminAccess && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                          <label 
                            title="Muat naik fail Open Graph Image (JPG)"
                            className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-white hover:bg-[#0056D2] transition-colors text-[9px] font-bold flex items-center gap-1 cursor-pointer border border-white/20 shadow-xs"
                          >
                            <Upload className="w-2.5 h-2.5" />
                            <span>JPG</span>
                            <input
                              type="file"
                              accept="image/jpeg, image/jpg, image/png"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleCardImageUpload(item.id, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}

                      {/* Success Feedback Notification */}
                      {isUploadSuccess && (
                        <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex items-center justify-center gap-1 text-white text-xs font-bold animate-in fade-in">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>OG JPG Dikemaskini!</span>
                        </div>
                      )}
                    </div>

                    {/* Dedicated Open Graph Upload Drop Area (Visible when Admin Mode active) */}
                    {isAdminMode && (
                      <div 
                        className="p-2.5 bg-amber-50/70 border-b border-amber-100 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-amber-950 text-[10px] flex items-center gap-1">
                            <Upload className="w-2.5 h-2.5 text-amber-700" />
                            Ruang Upload OG JPG (1200×630):
                          </span>
                          {customImage && (
                            <button
                              onClick={() => onRemoveOgImage(item.id)}
                              className="text-[9px] text-rose-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              Reset
                            </button>
                          )}
                        </div>

                        <label className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-white border border-dashed border-amber-300 hover:border-[#0056D2] hover:bg-blue-50/50 transition-all cursor-pointer">
                          <ImageIcon className="w-3 h-3 text-[#0056D2]" />
                          <span className="text-[10px] font-semibold text-slate-700">
                            Pilih Fail JPG
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg, image/jpg, image/png"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleCardImageUpload(item.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}

                    {/* Card Content Details */}
                    <div className="p-4 cursor-pointer">
                      {/* Top Row: Logo & Category Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
                          {renderProductLogo(item)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200/80 bg-slate-50 text-slate-700">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Project Name & Subtitle */}
                      <div className="mb-1">
                        <h3 className="text-base font-bold tracking-tight text-slate-900 font-sans flex items-center gap-1.5 group-hover:text-[#0056D2] transition-colors">
                          <span>{item.name}</span>
                          {item.subName && (
                            <span className="text-[#0056D2]">
                              {item.subName}
                            </span>
                          )}
                        </h3>
                      </div>

                      {/* Tagline / Description */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 font-normal">
                        {item.tagline}
                      </p>

                      {/* Key Highlights */}
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        {item.features.slice(0, 2).map((feat, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <CheckCircle2 className="w-3 h-3 text-[#0056D2] shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>

                  {/* Card Footer CTA */}
                  <div 
                    className="px-4 pb-3.5 pt-0.5 flex items-center justify-between text-xs font-bold text-[#0056D2] group-hover:text-blue-700 cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1">
                      Terokai & Butiran
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal">1200×630 JPG</span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

