import React, { useState, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  Table,
  LayoutGrid,
  Save,
  SlidersHorizontal,
  CheckCheck,
  Star,
  Download,
  HardDrive,
  Database,
  X
} from 'lucide-react';
import { PlatformItem } from '../../types';
import { generateDefaultOgImage, getOfficialMasterOgImage, getCustomPlatformUrls, saveCustomPlatformUrl, removeCustomPlatformUrl } from '../../utils/ogStorage';
import { SYNCROZZ_OGI_OFFICIAL } from '../../data/syncrozzAssets';
import { compressImageFile } from '../../utils/imageCompressor';
import { useAuth } from '../../auth/AuthContext';
import { PlatformFormModal } from './PlatformFormModal';
import { exportPlatformsToCsv, downloadFile, parseRawCsv, validateAndNormalizePlatformCsv } from '../../utils/csvDataUtils';
import { createAndDownloadDataBackup, auditDuplicates } from '../../utils/dataSafetyUtils';
import { getDeletedDefaultPlatformIds } from '../../utils/platformStorage';
import { getLocalCarouselSlides } from '../../utils/carouselStorage';
import { getStoredInquiries } from '../../utils/inquiryStorage';

interface AdminPlatformsProps {
  platforms: PlatformItem[];
  customOgImages: Record<string, string>;
  customUrls?: Record<string, string>;
  onSaveOgImage: (platformId: string, dataUrl: string) => void;
  onRemoveOgImage: (platformId: string) => void;
  onSaveCustomUrl?: (platformId: string, url: string) => void;
  onRemoveCustomUrl?: (platformId: string) => void;
  onSavePlatform: (platform: PlatformItem, ogImageDataUrl?: string) => void;
  onDeletePlatform: (platformId: string) => void;
}

export const AdminPlatforms: React.FC<AdminPlatformsProps> = ({
  platforms,
  customOgImages,
  customUrls: propCustomUrls,
  onSaveOgImage,
  onRemoveOgImage,
  onSaveCustomUrl,
  onRemoveCustomUrl,
  onSavePlatform,
  onDeletePlatform
}) => {
  const { user } = useAuth();
  
  // View mode: 'list' (unified table/list editor) or 'studio' (2-column detail & OG studio)
  const [viewMode, setViewMode] = useState<'list' | 'studio'>('list');
  
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem>(platforms[0] || {} as PlatformItem);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Modal states for Add & Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [platformToEdit, setPlatformToEdit] = useState<PlatformItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Custom Platform URLs State
  const [customUrls, setCustomUrls] = useState<Record<string, string>>(() => propCustomUrls || getCustomPlatformUrls());
  const [editingUrl, setEditingUrl] = useState('');
  const [urlSavedMessage, setUrlSavedMessage] = useState(false);

  // Unified List In-line edits state (for bulk or quick row editing)
  const [rowUrls, setRowUrls] = useState<Record<string, string>>({});
  const [rowStatuses, setRowStatuses] = useState<Record<string, 'Active' | 'Coming Soon' | 'Beta' | 'Maintenance'>>({});
  const [savedRowIds, setSavedRowIds] = useState<Record<string, boolean>>({});
  const [bulkSaveNotice, setBulkSaveNotice] = useState<string | null>(null);

  // Data Safety Toolbar Actions
  const [dataSafetyNotice, setDataSafetyNotice] = useState<string | null>(null);
  const platformCsvInputRef = React.useRef<HTMLInputElement>(null);

  const handleQuickExportCsv = () => {
    const csv = exportPlatformsToCsv(filteredPlatforms);
    downloadFile(csv, `SYNCROZZ_PLATFORMS_${new Date().toISOString().slice(0, 10)}.csv`);
    setDataSafetyNotice(`Berjaya mengeksport ${filteredPlatforms.length} platform ke CSV.`);
    setTimeout(() => setDataSafetyNotice(null), 3500);
  };

  const handleQuickBackupData = () => {
    const deletedIds = getDeletedDefaultPlatformIds();
    const slides = getLocalCarouselSlides();
    const inquiries = getStoredInquiries();
    createAndDownloadDataBackup({
      platforms,
      customUrls,
      carouselSlides: slides,
      inquiries,
      deletedDefaultIds: deletedIds
    });
    setDataSafetyNotice('Backup Data berjaya dimuat turun.');
    setTimeout(() => setDataSafetyNotice(null), 3500);
  };

  const handleQuickAuditDuplicates = () => {
    const inquiries = getStoredInquiries();
    const report = auditDuplicates(platforms, inquiries, customUrls);
    if (report.totalDuplicatePlatforms === 0) {
      setDataSafetyNotice('Audit Selesai: 100% Bersih! Tiada rekod bertindih ditemui.');
    } else {
      setDataSafetyNotice(`Audit: Dikesan ${report.duplicatePlatformGroups.length} kumpulan potensi duplikasi platform.`);
    }
    setTimeout(() => setDataSafetyNotice(null), 5000);
  };

  const handleQuickImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rawRows = parseRawCsv(content);
      const res = validateAndNormalizePlatformCsv(rawRows);

      if (!res.isValidHeader) {
        alert(res.headerErrors.join('\n'));
        return;
      }

      let imported = 0;
      res.results.forEach(r => {
        if (r.data && r.errors.length === 0) {
          onSavePlatform(r.data);
          imported++;
        }
      });

      setDataSafetyNotice(`Berjaya mengimport ${imported} rekod platform daripada fail CSV.`);
      setTimeout(() => setDataSafetyNotice(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Synchronize when prop changes
  useEffect(() => {
    if (propCustomUrls) {
      setCustomUrls(propCustomUrls);
    }
  }, [propCustomUrls]);

  // Categories list for filter
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    platforms.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [platforms]);

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
    const urls = getCustomPlatformUrls();
    setCustomUrls(urls);
    
    // Initialize rowUrls & rowStatuses
    const initialUrls: Record<string, string> = {};
    const initialStatuses: Record<string, any> = {};
    platforms.forEach(p => {
      initialUrls[p.id] = urls[p.id] || p.url || `https://syncrozz.com/${p.id}`;
      initialStatuses[p.id] = p.status || 'Active';
    });
    setRowUrls(initialUrls);
    setRowStatuses(initialStatuses);
  }, [platforms]);

  useEffect(() => {
    if (selectedPlatform?.id) {
      const activeUrl = customUrls[selectedPlatform.id] || selectedPlatform.url || `https://syncrozz.com/${selectedPlatform.id}`;
      setEditingUrl(activeUrl);
    }
  }, [selectedPlatform, customUrls]);

  const currentCustomImage = selectedPlatform?.id ? customOgImages[selectedPlatform.id] : undefined;
  const activeImage = selectedPlatform?.id ? (currentCustomImage || generateDefaultOgImage(selectedPlatform)) : '';
  const activePlatformUrl = selectedPlatform?.id ? (customUrls[selectedPlatform.id] || selectedPlatform.url || `https://syncrozz.com/${selectedPlatform.id}`) : '';

  const filteredPlatforms = useMemo(() => {
    return platforms.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.url && p.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rowUrls[p.id] && rowUrls[p.id].toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategoryFilter === 'all' || p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [platforms, searchQuery, selectedCategoryFilter, rowUrls]);

  // Check how many rows have modified unsaved changes
  const modifiedCount = useMemo(() => {
    let count = 0;
    platforms.forEach(p => {
      const originalUrl = customUrls[p.id] || p.url || `https://syncrozz.com/${p.id}`;
      const currentUrl = rowUrls[p.id] || '';
      const originalStatus = p.status || 'Active';
      const currentStatus = rowStatuses[p.id] || 'Active';

      if (currentUrl !== originalUrl || currentStatus !== originalStatus) {
        count++;
      }
    });
    return count;
  }, [platforms, customUrls, rowUrls, rowStatuses]);

  // Handle single row inline save in unified list
  const handleSaveRow = (platform: PlatformItem) => {
    const newUrl = (rowUrls[platform.id] || '').trim();
    const newStatus = rowStatuses[platform.id] || platform.status || 'Active';

    // 1. Save URL to storage & firestore
    if (newUrl) {
      if (onSaveCustomUrl) {
        onSaveCustomUrl(platform.id, newUrl);
      } else {
        saveCustomPlatformUrl(platform.id, newUrl);
      }
      setCustomUrls(prev => ({ ...prev, [platform.id]: newUrl }));
    }

    // 2. Save full platform if status or URL changed
    const updatedPlatform: PlatformItem = {
      ...platform,
      url: newUrl || platform.url,
      status: newStatus as any
    };
    onSavePlatform(updatedPlatform);

    // Flash success checkmark on row
    setSavedRowIds(prev => ({ ...prev, [platform.id]: true }));
    setTimeout(() => {
      setSavedRowIds(prev => {
        const next = { ...prev };
        delete next[platform.id];
        return next;
      });
    }, 2000);
  };

  // Handle bulk save for all modified rows in unified list
  const handleBulkSave = () => {
    let savedTotal = 0;
    platforms.forEach(platform => {
      const originalUrl = customUrls[platform.id] || platform.url || `https://syncrozz.com/${platform.id}`;
      const currentUrl = (rowUrls[platform.id] || '').trim();
      const originalStatus = platform.status || 'Active';
      const currentStatus = rowStatuses[platform.id] || 'Active';

      if (currentUrl !== originalUrl || currentStatus !== originalStatus) {
        if (currentUrl) {
          if (onSaveCustomUrl) {
            onSaveCustomUrl(platform.id, currentUrl);
          } else {
            saveCustomPlatformUrl(platform.id, currentUrl);
          }
          setCustomUrls(prev => ({ ...prev, [platform.id]: currentUrl }));
        }

        const updatedPlatform: PlatformItem = {
          ...platform,
          url: currentUrl || platform.url,
          status: currentStatus as any
        };
        onSavePlatform(updatedPlatform);
        savedTotal++;
      }
    });

    setBulkSaveNotice(`Berjaya menyelaraskan ${savedTotal} platform ke pangkalan data.`);
    setTimeout(() => setBulkSaveNotice(null), 3000);
  };

  const handleSavePlatformUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform?.id) return;
    const finalUrl = editingUrl.trim();
    if (finalUrl) {
      if (onSaveCustomUrl) {
        onSaveCustomUrl(selectedPlatform.id, finalUrl);
      } else {
        saveCustomPlatformUrl(selectedPlatform.id, finalUrl);
      }
      setCustomUrls((prev) => ({ ...prev, [selectedPlatform.id]: finalUrl }));
      setRowUrls(prev => ({ ...prev, [selectedPlatform.id]: finalUrl }));
    } else {
      if (onRemoveCustomUrl) {
        onRemoveCustomUrl(selectedPlatform.id);
      } else {
        removeCustomPlatformUrl(selectedPlatform.id);
      }
      setCustomUrls((prev) => {
        const next = { ...prev };
        delete next[selectedPlatform.id];
        return next;
      });
    }
    
    // Also save platform so full metadata stays synced
    onSavePlatform({
      ...selectedPlatform,
      url: finalUrl || selectedPlatform.url
    });

    setUrlSavedMessage(true);
    setTimeout(() => setUrlSavedMessage(false), 2500);
  };

  const handleResetPlatformUrl = () => {
    if (!selectedPlatform?.id) return;
    if (onRemoveCustomUrl) {
      onRemoveCustomUrl(selectedPlatform.id);
    } else {
      removeCustomPlatformUrl(selectedPlatform.id);
    }
    setCustomUrls((prev) => {
      const next = { ...prev };
      delete next[selectedPlatform.id];
      return next;
    });
    const defaultUrl = selectedPlatform.url || `https://syncrozz.com/${selectedPlatform.id}`;
    setEditingUrl(defaultUrl);
    setRowUrls(prev => ({ ...prev, [selectedPlatform.id]: defaultUrl }));
    
    onSavePlatform({
      ...selectedPlatform,
      url: defaultUrl
    });
    setUrlSavedMessage(true);
    setTimeout(() => setUrlSavedMessage(false), 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, platformId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImageFile(file, {
          maxWidth: 1200,
          maxHeight: 630,
          quality: 0.85,
          format: 'image/jpeg'
        });
        if (compressed) {
          onSaveOgImage(platformId, compressed);
        }
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            onSaveOgImage(platformId, dataUrl);
          }
        };
        reader.readAsDataURL(file);
      }
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
    <div className="space-y-3.5">
      
      {/* Top Action Header: Title + View Switcher + Add Platform */}
      <div className="bg-white rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-blue-100 text-[#0056D2] uppercase tracking-wider">
              Modul Pentadbir
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {platforms.length} Platform Ekosistem
            </span>
            {Object.keys(customOgImages).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {Object.keys(customOgImages).length} Imej OG
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            Pengurusan & Penyelarasan Platform SYNCROZZ
          </h2>
          <p className="text-[11px] text-slate-500 line-clamp-1">
            Kawal, kemaskini URL sasaran, status, dan imej Open Graph bagi setiap produk dalam satu senarai yang diselaraskan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Data Safety Standard Toolbar (SES 4.4) */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={handleQuickExportCsv}
              title="Simpan CSV - Eksport katalog platform semasa ke CSV"
              className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-700 hover:text-[#0056D2] hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Simpan CSV</span>
            </button>

            <button
              onClick={handleQuickBackupData}
              title="Backup Data - Jana fail sandaran data luar talian"
              className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-700 hover:text-[#0056D2] hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <HardDrive className="w-3 h-3" />
              <span>Backup Data</span>
            </button>

            <button
              onClick={handleQuickAuditDuplicates}
              title="Audit Duplikasi - Imbas pertindihan ID, nama & URL"
              className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-700 hover:text-[#0056D2] hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3 h-3" />
              <span>Audit Duplikasi</span>
            </button>

            <input
              type="file"
              ref={platformCsvInputRef}
              onChange={handleQuickImportCsv}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => platformCsvInputRef.current?.click()}
              title="Import CSV - Muat naik dan import fail CSV"
              className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-700 hover:text-[#0056D2] hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Import CSV</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 flex items-center gap-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#0056D2] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Senarai & Edit</span>
            </button>
            
            <button
              onClick={() => setViewMode('studio')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'studio'
                  ? 'bg-white text-[#0056D2] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Studio Visual & OG</span>
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#0056D2] hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Platform</span>
          </button>
        </div>
      </div>

      {/* Data Safety Notification Feedback */}
      {dataSafetyNotice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0056D2] shrink-0" />
            <span>{dataSafetyNotice}</span>
          </div>
          <button
            onClick={() => setDataSafetyNotice(null)}
            className="text-blue-600 hover:text-blue-900 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW MODE 1: UNIFIED LIST / TABLE EDITOR (Diselaraskan dalam 1 senarai - Compact Design) */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          
          {/* Filter & Bulk Actions Bar */}
          <div className="bg-white rounded-xl px-3.5 py-2.5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            
            {/* Search & Category Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <div className="relative min-w-[200px] max-w-xs">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, ID, kategori, URL..."
                  className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({platforms.length})
                </button>
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Save / Sync Action */}
            <div className="flex items-center gap-2 shrink-0">
              {bulkSaveNotice && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3 h-3" />
                  {bulkSaveNotice}
                </span>
              )}

              {modifiedCount > 0 && (
                <button
                  onClick={handleBulkSave}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
                >
                  <Save className="w-3 h-3" />
                  <span>Simpan Semua ({modifiedCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Delete Confirmation Alert Banner if active */}
          {deleteConfirmId && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-rose-900 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>
                  Sahkan pemadaman modul <strong>#{deleteConfirmId}</strong> daripada ekosistem?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-2.5 py-0.5 bg-white border border-rose-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-2.5 py-0.5 bg-rose-600 text-white rounded-md text-xs font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Padamkan
                </button>
              </div>
            </div>
          )}

          {/* Main Synchronized Compact Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Platform</th>
                    <th className="py-2.5 px-3 min-w-[110px]">Status</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Pautan Sasaran (URL)</th>
                    <th className="py-2.5 px-3 min-w-[100px]">Imej OG</th>
                    <th className="py-2.5 px-3 text-right min-w-[110px]">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredPlatforms.map((plat, idx) => {
                    const rowUrl = rowUrls[plat.id] ?? (customUrls[plat.id] || plat.url || `https://syncrozz.com/${plat.id}`);
                    const rowStatus = rowStatuses[plat.id] ?? (plat.status || 'Active');
                    const hasCustomOg = !!customOgImages[plat.id];
                    const isSaved = !!savedRowIds[plat.id];
                    const isModified = (rowUrl !== (customUrls[plat.id] || plat.url || `https://syncrozz.com/${plat.id}`)) ||
                                       (rowStatus !== (plat.status || 'Active'));

                    return (
                      <tr 
                        key={plat.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isModified ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Index Number */}
                        <td className="py-2 px-3 text-center font-mono text-slate-400 font-bold text-[10px]">
                          {idx + 1}
                        </td>

                        {/* Platform Name, Subname, Category, ID */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-7 h-7 rounded-md text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-2xs"
                              style={{ backgroundColor: plat.accentColor || '#0056D2' }}
                            >
                              {plat.name?.charAt(0) || 'P'}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                                <span className="truncate">{plat.name} {plat.subName || ''}</span>
                                {plat.isPopular && (
                                  <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                    Pop
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <span className="text-[#0056D2] font-semibold">{plat.category}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-400">#{plat.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status Dropdown Selector */}
                        <td className="py-2 px-3">
                          <select
                            value={rowStatus}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setRowStatuses(prev => ({ ...prev, [plat.id]: val }));
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                              rowStatus === 'Active' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : rowStatus === 'Coming Soon'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="Coming Soon">Coming Soon</option>
                            <option value="Beta">Beta</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                        </td>

                        {/* Inline Platform URL Editor */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="url"
                              value={rowUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRowUrls(prev => ({ ...prev, [plat.id]: val }));
                              }}
                              placeholder={`https://syncrozz.com/${plat.id}`}
                              className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
                            />
                            
                            {/* External Test Link */}
                            <a
                              href={rowUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md border border-slate-200 transition-colors shrink-0"
                              title="Uji pautan luar"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </td>

                        {/* OG Image Indicator & Upload */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            {hasCustomOg ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Kustom
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
                                Default
                              </span>
                            )}

                            <label className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer" title="Muat Naik Imej OG">
                              <Upload className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/jpeg, image/jpg, image/png"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, plat.id)}
                              />
                            </label>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            
                            {/* Quick Save Row */}
                            <button
                              onClick={() => handleSaveRow(plat)}
                              className={`p-1 rounded-md border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isSaved
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : isModified
                                  ? 'bg-[#0056D2] text-white border-[#0056D2] hover:bg-blue-700 shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                              title={isSaved ? 'Tersimpan!' : 'Simpan Baris Ini'}
                            >
                              {isSaved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                            </button>

                            {/* Full Edit Modal */}
                            <button
                              onClick={() => handleOpenEditModal(plat)}
                              className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                              title="Edit Data Penuh"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteConfirmId(plat.id)}
                              className="p-1 rounded-md bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                              title="Padam Platform"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPlatforms.length === 0 && (
              <div className="p-8 text-center text-slate-500 space-y-1.5">
                <p className="text-xs font-semibold">Tiada platform dijumpai untuk carian ini.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryFilter('all');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold"
                >
                  Reset Carian
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW MODE 2: TWO-COLUMN DETAIL & OG CARD STUDIO */}
      {viewMode === 'studio' && (
        <div className="space-y-3.5">
          
          {/* Official Master OGI Reference Banner */}
          <div className="bg-white rounded-xl px-4 py-3 border border-blue-200 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-blue-100 text-[#0056D2] uppercase tracking-wider">
                    Visual Reference
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    1200 × 630 px • JPG
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Piawaian Visual Rasmi: SYNCROZZ OGI.MAINv2.jpg
                </h3>
                <p className="text-[11px] text-slate-500 max-w-3xl">
                  Mematuhi sistem visual rasmi: <strong>White / Light / Modern / Clean / Premium Corporate</strong> dengan palet <strong>SYNCROZZ Blue + dark navy + white</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={SYNCROZZ_OGI_OFFICIAL.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span>GitHub Reference</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {selectedPlatform?.id && (
                  <button
                    onClick={() => handleApplyOfficialMaster(selectedPlatform.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold text-white bg-[#0056D2] hover:bg-blue-700 shadow-2xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Terapkan untuk {selectedPlatform.name}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Column: Platform Selector List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pilih Platform ({filteredPlatforms.length})
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
        </div>
      )}

      {/* Platform Form Modal (Add & Edit) */}
      <PlatformFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setPlatformToEdit(null);
        }}
        initialData={platformToEdit}
        onSave={(platform, ogDataUrl) => {
          onSavePlatform(platform);
          if (ogDataUrl) {
            onSaveOgImage(platform.id, ogDataUrl);
          }
        }}
        existingIds={platforms.map(p => p.id)}
      />

    </div>
  );
};

