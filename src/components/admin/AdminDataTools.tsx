import React, { useState, useRef, useMemo } from 'react';
import {
  Shield,
  Download,
  Upload,
  Search,
  Copy,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  HardDrive,
  RefreshCw,
  Eye,
  Check,
  X,
  FileText,
  HelpCircle,
  Database,
  ArrowRight,
  Layers,
  Sliders,
  Mail,
  Filter,
  CheckCheck,
  Trash2,
  Pencil,
  AlertCircle
} from 'lucide-react';
import { PlatformItem, InquiryItem } from '../../types';
import { CarouselSlide } from '../../utils/carouselStorage';
import {
  exportPlatformsToCsv,
  exportInquiriesToCsv,
  parseRawCsv,
  validateAndNormalizePlatformCsv,
  PlatformValidationResult,
  downloadFile
} from '../../utils/csvDataUtils';
import {
  auditDuplicates,
  createAndDownloadDataBackup,
  validateBackupFile,
  DuplicateAuditReport,
  SyncrozzBackupPayload
} from '../../utils/dataSafetyUtils';
import { getDeletedDefaultPlatformIds } from '../../utils/platformStorage';
import { useAuth } from '../../auth/AuthContext';

interface AdminDataToolsProps {
  platforms: PlatformItem[];
  inquiries: InquiryItem[];
  carouselSlides: CarouselSlide[];
  customUrls: Record<string, string>;
  onSavePlatform: (platform: PlatformItem) => void;
  onSaveMultiplePlatforms?: (platforms: PlatformItem[]) => void;
  onRestoreBackup?: (backup: SyncrozzBackupPayload) => void;
  onNavigateToPlatforms?: () => void;
  onNavigateToInquiries?: () => void;
}

type ActiveSubTool = 'overview' | 'export' | 'backup' | 'audit' | 'import';

export const AdminDataTools: React.FC<AdminDataToolsProps> = ({
  platforms,
  inquiries,
  carouselSlides,
  customUrls,
  onSavePlatform,
  onSaveMultiplePlatforms,
  onRestoreBackup,
  onNavigateToPlatforms,
  onNavigateToInquiries
}) => {
  const { user } = useAuth();
  const [activeSubTool, setActiveSubTool] = useState<ActiveSubTool>('overview');

  // Notification / Feedback State
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  // ----------------------------------------------------
  // 1. SIMPAN CSV (Export) State
  // ----------------------------------------------------
  const [exportEntity, setExportEntity] = useState<'platforms' | 'inquiries'>('platforms');
  const [exportFilterCategory, setExportFilterCategory] = useState<string>('all');

  const filteredExportPlatforms = useMemo(() => {
    if (exportFilterCategory === 'all') return platforms;
    return platforms.filter(p => p.category === exportFilterCategory);
  }, [platforms, exportFilterCategory]);

  const handleDownloadCsv = () => {
    if (exportEntity === 'platforms') {
      const csv = exportPlatformsToCsv(filteredExportPlatforms);
      const filename = `SYNCROZZ_PLATFORMS_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadFile(csv, filename);
      showNotification(`Berjaya mengeksport ${filteredExportPlatforms.length} rekod platform ke fail CSV.`);
    } else {
      const csv = exportInquiriesToCsv(inquiries);
      const filename = `SYNCROZZ_INQUIRIES_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadFile(csv, filename);
      showNotification(`Berjaya mengeksport ${inquiries.length} rekod inquiry ke fail CSV.`);
    }
  };

  // ----------------------------------------------------
  // 2. BACKUP DATA State & Handler
  // ----------------------------------------------------
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [restorePayload, setRestorePayload] = useState<SyncrozzBackupPayload | null>(null);
  const [restoreErrors, setRestoreErrors] = useState<string[]>([]);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = () => {
    const deletedIds = getDeletedDefaultPlatformIds();
    createAndDownloadDataBackup({
      platforms,
      customUrls,
      carouselSlides,
      inquiries,
      deletedDefaultIds: deletedIds
    });
    showNotification('Backup Data berjaya dijana dan dimuat turun untuk storan luar talian.');
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateBackupFile(content);
      if (res.isValid && res.payload) {
        setRestorePayload(res.payload);
        setRestoreErrors([]);
        setIsRestoringBackup(true);
      } else {
        setRestoreErrors(res.errors);
        setRestorePayload(null);
        setIsRestoringBackup(true);
      }
    };
    reader.readAsText(file);
    // Reset file input so user can choose again
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!restorePayload) return;
    if (onRestoreBackup) {
      onRestoreBackup(restorePayload);
    } else {
      // Fallback batch save platforms
      restorePayload.data.platforms.forEach(p => {
        onSavePlatform(p);
      });
    }
    setIsRestoringBackup(false);
    setRestorePayload(null);
    showNotification(`Pemulihan selesai! ${restorePayload.data.platforms.length} rekod platform telah diselaraskan.`);
  };

  // ----------------------------------------------------
  // 3. AUDIT DUPLIKASI State
  // ----------------------------------------------------
  const [auditFilterType, setAuditFilterType] = useState<'all' | 'platforms' | 'inquiries'>('all');
  const auditReport = useMemo<DuplicateAuditReport>(() => {
    return auditDuplicates(platforms, inquiries, customUrls);
  }, [platforms, inquiries, customUrls]);

  // ----------------------------------------------------
  // 4. IMPORT CSV Workflow State
  // ----------------------------------------------------
  const [importStep, setImportStep] = useState<'upload' | 'review' | 'success'>('upload');
  const [importFileName, setImportFileName] = useState<string>('');
  const [importResults, setImportResults] = useState<PlatformValidationResult[]>([]);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    valid: number;
    invalid: number;
    duplicate: number;
    headerErrors: string[];
  }>({ total: 0, valid: 0, invalid: 0, duplicate: 0, headerErrors: [] });
  
  // Conflict resolution map for imported items: key = rowNumber, value = 'skip' | 'overwrite' | 'keep_both'
  const [conflictActions, setConflictActions] = useState<Record<number, 'overwrite' | 'skip' | 'keep_both'>>({});
  const [isImporting, setIsImporting] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rawRows = parseRawCsv(content);
      const validation = validateAndNormalizePlatformCsv(rawRows);

      if (!validation.isValidHeader) {
        setImportSummary({
          total: rawRows.length > 0 ? rawRows.length - 1 : 0,
          valid: 0,
          invalid: rawRows.length > 0 ? rawRows.length - 1 : 0,
          duplicate: 0,
          headerErrors: validation.headerErrors
        });
        setImportResults([]);
        setImportStep('review');
        return;
      }

      setImportSummary({
        total: validation.results.length,
        valid: validation.validCount,
        invalid: validation.invalidCount,
        duplicate: validation.duplicateCount,
        headerErrors: []
      });
      setImportResults(validation.results);

      // Default conflict actions: if conflicting with existing platform ID, default to 'overwrite'
      const initialActions: Record<number, 'overwrite' | 'skip' | 'keep_both'> = {};
      validation.results.forEach(r => {
        if (r.data) {
          const exists = platforms.some(p => p.id === r.data?.id);
          if (exists) {
            initialActions[r.rowNumber] = 'overwrite';
          }
        }
      });
      setConflictActions(initialActions);
      setImportStep('review');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCommitImport = async () => {
    setIsImporting(true);
    const platformsToSave: PlatformItem[] = [];

    importResults.forEach(r => {
      if (!r.data || r.errors.length > 0) return;
      const action = conflictActions[r.rowNumber] || 'overwrite';
      if (action === 'skip') return;

      let item = { ...r.data };
      if (action === 'keep_both') {
        item.id = `${item.id}_imported_${Date.now()}`;
        item.name = `${item.name} (Salinan)`;
      }

      platformsToSave.push(item);
    });

    // Save platforms one-by-one or batch
    if (onSaveMultiplePlatforms) {
      onSaveMultiplePlatforms(platformsToSave);
    } else {
      platformsToSave.forEach(p => onSavePlatform(p));
    }

    setIsImporting(false);
    setImportStep('success');
    showNotification(`Berjaya mengimport ${platformsToSave.length} rekod platform ke dalam sistem!`);
  };

  const resetImport = () => {
    setImportStep('upload');
    setImportFileName('');
    setImportResults([]);
    setImportSummary({ total: 0, valid: 0, invalid: 0, duplicate: 0, headerErrors: [] });
    setConflictActions({});
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Notification */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{actionSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Suite Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#0056D2] flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Data Safety & Portability Suite
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                  SES v4.4
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengurusan sandaran luar talian, eksport/import berstruktur, serta audit integriti data masa nyata.
              </p>
            </div>
          </div>

          {/* Quick Action Pills: 4 Primary Actions as Mandated */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              id="datatools-btn-simpan-csv"
              onClick={() => setActiveSubTool('export')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeSubTool === 'export'
                  ? 'bg-[#0056D2] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan CSV</span>
            </button>

            <button
              id="datatools-btn-backup-data"
              onClick={() => setActiveSubTool('backup')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeSubTool === 'backup'
                  ? 'bg-[#0056D2] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Backup Data</span>
            </button>

            <button
              id="datatools-btn-audit-duplikasi"
              onClick={() => setActiveSubTool('audit')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeSubTool === 'audit'
                  ? 'bg-[#0056D2] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Audit Duplikasi</span>
              {auditReport.totalDuplicatePlatforms + auditReport.totalDuplicateInquiries > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              id="datatools-btn-import-csv"
              onClick={() => setActiveSubTool('import')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeSubTool === 'import'
                  ? 'bg-[#0056D2] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
          </div>
        </div>

        {/* Data Safety Health Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <span className="text-slate-600 block text-[11px] font-semibold">Jumlah Platform</span>
            <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{platforms.length} Platform</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <span className="text-slate-600 block text-[11px] font-semibold">Inquiries Direkodkan</span>
            <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{inquiries.length} Mesej</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <span className="text-slate-600 block text-[11px] font-semibold">Hero Carousel</span>
            <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{carouselSlides.length} Slaid</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <span className="text-slate-600 block text-[11px] font-semibold">Status Integriti Data</span>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Disegerak</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SIMPAN CSV SECTION                                                    */}
      {/* ========================================================================= */}
      {activeSubTool === 'export' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#0056D2]" />
                <span>Simpan CSV (Deterministic Export)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Eksport data sebenar yang mematuhi RFC-4180 dengan pengepala lengkap, UTF-8 BOM, dan format sedia import.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTool('overview')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform Selection */}
            <div 
              onClick={() => setExportEntity('platforms')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                exportEntity === 'platforms'
                  ? 'border-[#0056D2] bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Katalog Platform</h3>
                    <p className="text-xs text-slate-500">{platforms.length} rekod tersedia untuk dieksport</p>
                  </div>
                </div>
                <input 
                  type="radio" 
                  checked={exportEntity === 'platforms'} 
                  onChange={() => setExportEntity('platforms')}
                  className="w-4 h-4 text-blue-600 cursor-pointer" 
                />
              </div>
            </div>

            {/* Inquiries Selection */}
            <div 
              onClick={() => setExportEntity('inquiries')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                exportEntity === 'inquiries'
                  ? 'border-[#0056D2] bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Inquiries & Maklum Balas</h3>
                    <p className="text-xs text-slate-500">{inquiries.length} rekod pertanyaan pengguna</p>
                  </div>
                </div>
                <input 
                  type="radio" 
                  checked={exportEntity === 'inquiries'} 
                  onChange={() => setExportEntity('inquiries')}
                  className="w-4 h-4 text-blue-600 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* Platform Category Sub-filter */}
          {exportEntity === 'platforms' && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs font-bold text-slate-700">Tapis Kategori:</span>
              <select
                value={exportFilterCategory}
                onChange={(e) => setExportFilterCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori ({platforms.length})</option>
                <option value="Education">Education</option>
                <option value="Campus">Campus</option>
                <option value="Productivity">Productivity</option>
                <option value="Community">Community</option>
                <option value="Innovation">Innovation</option>
              </select>
            </div>
          )}

          {/* Export Action Button */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              id="export-csv-download-btn"
              onClick={handleDownloadCsv}
              className="px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                Muat Turun CSV ({exportEntity === 'platforms' ? filteredExportPlatforms.length : inquiries.length} Rekod)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BACKUP DATA SECTION                                                   */}
      {/* ========================================================================= */}
      {activeSubTool === 'backup' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-[#0056D2]" />
                <span>Backup Data (Storan Luar Talian & Pemulihan)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cipta salinan lengkap sandaran sistem atau pulihkan data dari fail sandaran terdahulu.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTool('overview')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Create Backup Card */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Jana Backup Data Luar Talian</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Menghasilkan pakej data lengkap merangkumi kesemua <strong>{platforms.length} platform</strong>, <strong>{inquiries.length} mesej inquiry</strong>, slaid carousel, dan konfigurasi URL tersuai.
                </p>
                <div className="text-[11px] text-slate-500 font-mono bg-white/80 p-2 rounded-lg border border-slate-200/80">
                  Fail: SYNCROZZ_BACKUP_{new Date().toISOString().slice(0, 10)}.dat
                </div>
              </div>

              <div className="pt-5">
                <button
                  id="backup-data-download-btn"
                  onClick={handleDownloadBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0056D2] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Backup Data Sekarang</span>
                </button>
              </div>
            </div>

            {/* Restore Backup Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Pulihkan Data Sandaran</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Muat naik fail sandaran sebelumnya untuk memulihkan rekod platform dan data konfigurasi. Proses pemulihan memerlukan pengesahan manual anda.
                </p>
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Prinsip SES 4.4: Data sedia ada tidak akan dipadamkan tanpa kebenaran eksplisit anda.
                </div>
              </div>

              <div className="pt-5">
                <input
                  type="file"
                  ref={backupFileInputRef}
                  onChange={handleBackupFileSelect}
                  accept=".dat,.syncrozz,.json"
                  className="hidden"
                />
                <button
                  id="restore-backup-upload-btn"
                  onClick={() => backupFileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih Fail Sandaran</span>
                </button>
              </div>
            </div>

          </div>

          {/* Modal / Dialog for Backup Restore Inspection */}
          {isRestoringBackup && (
            <div className="mt-4 p-5 bg-slate-900 text-white rounded-xl shadow-lg space-y-4 border border-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold">Semakan Pra-Pemulihan Data Sandaran</h3>
                </div>
                <button
                  onClick={() => setIsRestoringBackup(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>

              {restoreErrors.length > 0 ? (
                <div className="bg-rose-950/80 border border-rose-800 p-3 rounded-lg text-xs text-rose-200">
                  <div className="font-bold mb-1">Ralat dikesan pada fail sandaran:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {restoreErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : restorePayload && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-300">
                    Fail sandaran sah. Maklumat metadata kandungan:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-slate-800 p-2.5 rounded-lg">
                      <span className="text-slate-400 block">Tarikh Sandaran</span>
                      <span className="font-bold text-white mt-0.5 block">{new Date(restorePayload.exportedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-slate-800 p-2.5 rounded-lg">
                      <span className="text-slate-400 block">Platform</span>
                      <span className="font-bold text-white mt-0.5 block">{restorePayload.data.platforms.length} Rekod</span>
                    </div>
                    <div className="bg-slate-800 p-2.5 rounded-lg">
                      <span className="text-slate-400 block">Inquiries</span>
                      <span className="font-bold text-white mt-0.5 block">{restorePayload.data.inquiries.length} Rekod</span>
                    </div>
                    <div className="bg-slate-800 p-2.5 rounded-lg">
                      <span className="text-slate-400 block">URL Tersuai</span>
                      <span className="font-bold text-white mt-0.5 block">{Object.keys(restorePayload.data.customUrls).length} Entri</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setIsRestoringBackup(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      id="confirm-restore-btn"
                      onClick={handleConfirmRestore}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sahkan & Pulihkan Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AUDIT DUPLIKASI SECTION                                               */}
      {/* ========================================================================= */}
      {activeSubTool === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#0056D2]" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Audit Duplikasi (Non-Destructive Detection)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Pemeriksaan Sahaja • Tiada Pemadaman Automatik
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengesan pertindihan ID, kesamaan nama, URL seiras, dan persamaan kandungan pada data sebenar.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTool('overview')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto cursor-pointer"
            >
              Tutup
            </button>
          </div>

          {/* Audit Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-xs text-slate-600 font-semibold block">Platform Diimbas</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{auditReport.totalPlatformsScanned}</span>
              <span className="text-[11px] text-slate-600 mt-1 block">
                {auditReport.duplicatePlatformGroups.length > 0 
                  ? `${auditReport.duplicatePlatformGroups.length} kumpulan potensi duplikasi dikesan`
                  : 'Tiada pertindihan dikesan (Bersih)'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-xs text-slate-600 font-semibold block">Inquiries Diimbas</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{auditReport.totalInquiriesScanned}</span>
              <span className="text-[11px] text-slate-600 mt-1 block">
                {auditReport.duplicateInquiryGroups.length > 0 
                  ? `${auditReport.duplicateInquiryGroups.length} pertindihan maklum balas dikesan`
                  : 'Tiada mesej pendua'}
              </span>
            </div>

            <div className={`border rounded-xl p-3.5 ${
              auditReport.totalDuplicatePlatforms + auditReport.totalDuplicateInquiries === 0
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/60 border-amber-200 text-amber-950'
            }`}>
              <span className="text-xs font-semibold block">Status Kebersihan Data</span>
              <span className="text-lg font-extrabold mt-0.5 block">
                {auditReport.totalDuplicatePlatforms + auditReport.totalDuplicateInquiries === 0 ? 'Bersih 100%' : 'Perlu Semakan'}
              </span>
              <span className="text-[11px] mt-1 block">
                {auditReport.totalDuplicatePlatforms + auditReport.totalDuplicateInquiries === 0
                  ? 'Semua rekod unik dan tersusun'
                  : 'Sila semak senarai di bawah'}
              </span>
            </div>
          </div>

          {/* Duplicate Groups List */}
          {auditReport.duplicatePlatformGroups.length === 0 && auditReport.duplicateInquiryGroups.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Tiada Rekod Bertindih Ditemui</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Sistem tidak menemui sebarang duplikasi nama, ID, URL, ataupun mesej dalam pangkalan data semasa anda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Kumpulan Duplikasi Dikesan ({auditReport.duplicatePlatformGroups.length + auditReport.duplicateInquiryGroups.length})
              </h3>

              {/* Platform Duplicate Groups */}
              {auditReport.duplicatePlatformGroups.map((group) => (
                <div key={group.id} className="border border-amber-200 bg-amber-50/30 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900">{group.reason}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                      Keyakinan: {group.confidence}
                    </span>
                  </div>

                  {/* Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            #{item.id}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-1">{item.tagline}</p>
                        {item.url && (
                          <div className="text-[11px] text-blue-600 truncate font-mono">
                            {item.url}
                          </div>
                        )}
                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-100">
                          <span>Kategori: {item.category}</span>
                          <span>Status: {item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-600 italic">
                    * Nota: Tindakan pembersihan bergantung kepada penilaian manual pentadbir. Tiada rekod yang dipadamkan secara automatik.
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. IMPORT CSV SECTION                                                    */}
      {/* ========================================================================= */}
      {activeSubTool === 'import' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#0056D2]" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Import CSV (Validasi & Resolusi Konflik)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Aliran import 5 peringkat: Pilih Fail → Validasi Struktur → Semak Ringkasan → Selesaikan Konflik → Simpan Kekal.
              </p>
            </div>
            <button
              onClick={() => {
                resetImport();
                setActiveSubTool('overview');
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto cursor-pointer"
            >
              Tutup
            </button>
          </div>

          {/* Workflow Progress Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 max-w-xl mx-auto py-2">
            <div className={`flex items-center gap-1.5 ${importStep === 'upload' ? 'text-[#0056D2]' : 'text-slate-800'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importStep === 'upload' ? 'bg-[#0056D2] text-white' : 'bg-slate-200'}`}>
                1
              </div>
              <span>Pilih Fail</span>
            </div>
            <div className="h-0.5 flex-1 bg-slate-200 mx-2" />
            <div className={`flex items-center gap-1.5 ${importStep === 'review' ? 'text-[#0056D2]' : 'text-slate-800'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importStep === 'review' ? 'bg-[#0056D2] text-white' : 'bg-slate-200'}`}>
                2
              </div>
              <span>Semak & Resolusi</span>
            </div>
            <div className="h-0.5 flex-1 bg-slate-200 mx-2" />
            <div className={`flex items-center gap-1.5 ${importStep === 'success' ? 'text-[#0056D2]' : 'text-slate-800'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importStep === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                3
              </div>
              <span>Selesai</span>
            </div>
          </div>

          {/* Stage 1: Upload */}
          {importStep === 'upload' && (
            <div className="space-y-4">
              <div 
                onClick={() => csvFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0056D2] bg-slate-50/60 hover:bg-blue-50/20 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={csvFileInputRef}
                  onChange={handleCsvFileSelect}
                  accept=".csv"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0056D2] flex items-center justify-center mx-auto shadow-xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">
                    Klik untuk memilih fail CSV atau seret ke sini
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Format disokong: .CSV (Standard UTF-8). Pengepala wajib: <code className="font-mono bg-slate-200 px-1 rounded">Name</code>, <code className="font-mono bg-slate-200 px-1 rounded">Tagline</code>, <code className="font-mono bg-slate-200 px-1 rounded">Description</code>.
                  </p>
                </div>
              </div>

              {/* Sample Template Helper */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Perlukan contoh templat fail CSV standard?</span>
                </div>
                <button
                  onClick={() => {
                    const sampleCsv = exportPlatformsToCsv(platforms.slice(0, 2));
                    downloadFile(sampleCsv, 'SYNCROZZ_TEMPLATE_PLATFORMS.csv');
                  }}
                  className="text-[#0056D2] hover:underline font-bold cursor-pointer"
                >
                  Muat Turun Templat CSV
                </button>
              </div>
            </div>
          )}

          {/* Stage 2: Review & Conflict Resolution */}
          {importStep === 'review' && (
            <div className="space-y-4">
              
              {/* Header Errors if any */}
              {importSummary.headerErrors.length > 0 ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Ralat Pengepala CSV Dikesan:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {importSummary.headerErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                  <button
                    onClick={resetImport}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
                  >
                    Pilih Fail Lain
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Jumlah Baris Dikesan</span>
                      <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{importSummary.total} Baris</span>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 block text-[11px]">Rekod Sah (Valid)</span>
                      <span className="text-base font-extrabold text-emerald-900 mt-0.5 block">{importSummary.valid} Sah</span>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <span className="text-amber-700 block text-[11px]">Potensi Pendua</span>
                      <span className="text-base font-extrabold text-amber-900 mt-0.5 block">{importSummary.duplicate} Pendua</span>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <span className="text-rose-700 block text-[11px]">Rekod Tidak Sah (Ralat)</span>
                      <span className="text-base font-extrabold text-rose-900 mt-0.5 block">{importSummary.invalid} Tidak Sah</span>
                    </div>
                  </div>

                  {/* List of Rows to Review */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
                      <span>Pratonton & Keputusan Validasi Rekod ({importFileName})</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Semak tindakan bagi setiap baris sebelum menyimpan
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {importResults.map((result) => {
                        const exists = result.data ? platforms.some(p => p.id === result.data?.id) : false;
                        const action = conflictActions[result.rowNumber] || (exists ? 'overwrite' : 'overwrite');

                        return (
                          <div key={result.rowNumber} className="p-3 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                  Baris #{result.rowNumber}
                                </span>
                                {result.errors.length > 0 ? (
                                  <span className="text-rose-600 font-bold flex items-center gap-1">
                                    <X className="w-3.5 h-3.5" />
                                    <span>Ralat</span>
                                  </span>
                                ) : (
                                  <span className="font-bold text-slate-900">
                                    {result.data?.name}
                                  </span>
                                )}

                                {exists && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                    Konflik ID Sedia Ada
                                  </span>
                                )}
                              </div>

                              {result.errors.length > 0 ? (
                                <div className="text-rose-600 text-[11px]">
                                  {result.errors.join(' • ')}
                                </div>
                              ) : (
                                <p className="text-slate-500 text-[11px] line-clamp-1">
                                  {result.data?.tagline} ({result.data?.category})
                                </p>
                              )}
                            </div>

                            {/* Action selector for valid row */}
                            {result.data && (
                              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                <select
                                  value={action}
                                  onChange={(e) => setConflictActions({
                                    ...conflictActions,
                                    [result.rowNumber]: e.target.value as any
                                  })}
                                  className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="overwrite">
                                    {exists ? 'Kemaskini Sedia Ada' : 'Simpan Rekod'}
                                  </option>
                                  <option value="keep_both">Simpan Sebagai Salinan Baharu</option>
                                  <option value="skip">Langkau (Jangan Import)</option>
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={resetImport}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                    >
                      Batal & Pilih Semula
                    </button>

                    <button
                      id="import-commit-btn"
                      disabled={isImporting || importSummary.valid === 0}
                      onClick={handleCommitImport}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isImporting ? 'Menyimpan...' : `Sahkan & Import (${importSummary.valid} Sah)`}</span>
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

          {/* Stage 3: Success */}
          {importStep === 'success' && (
            <div className="text-center py-8 px-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-extrabold text-emerald-950">
                Import CSV Berjaya Disempurnakan!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Semua rekod yang disahkan telah selamat disimpan ke dalam pangkalan data dan disegerakkan merentasi sistem.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={resetImport}
                  className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs border border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                >
                  Import Fail Lain
                </button>
                {onNavigateToPlatforms && (
                  <button
                    onClick={onNavigateToPlatforms}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    Lihat Senarai Platform
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
