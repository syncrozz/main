import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Users, 
  Image as ImageIcon, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Crown, 
  KeyRound, 
  FileText, 
  Activity, 
  Mail, 
  Zap, 
  Sparkles, 
  Send,
  Database
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { MASTER_ADMIN_EMAIL } from '../../auth/authConfig';
import { AdminTab } from './AdminHeader';
import { InquiryItem } from '../../types';

interface AdminOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  customOgImagesCount: number;
  totalPlatformsCount?: number;
  inquiries?: InquiryItem[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigateTab,
  customOgImagesCount,
  totalPlatformsCount,
  inquiries = []
}) => {
  const { user, isMasterAdmin, getAdminEmails } = useAuth();
  const secondaryAdmins = getAdminEmails();

  const totalPlatforms = totalPlatformsCount !== undefined ? totalPlatformsCount : 0;
  const unreadCount = inquiries.filter(i => !i.read || i.status === 'new').length;
  const recentInquiries = inquiries.slice(0, 3);

  return (
    <div className="space-y-4">
      
      {/* Welcome Banner - High Prominence Harmonious Admin Deck */}
      <div 
        id="admin-overview-welcome-banner"
        className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-2xl p-4 sm:p-6 text-white shadow-lg border border-slate-800/80 relative overflow-hidden"
      >
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          
          {/* Left Column: Greeting, Role & Context */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-3 min-w-0">
            {/* Status Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="whitespace-nowrap">Admin Access (PIN)</span>
              </span>

              {isMasterAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1.5 shadow-xs shrink-0">
                  <Crown className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="whitespace-nowrap">MASTER ADMIN</span>
                </span>
              )}

              {unreadCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center gap-1.5 shadow-xs animate-pulse shrink-0">
                  <Zap className="w-3 h-3 fill-current shrink-0" />
                  <span className="whitespace-nowrap">{unreadCount} Inquiries Baharu</span>
                </span>
              ) : (
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap">Sistem Segerak Awan Aktif</span>
                </span>
              )}
            </div>

            {/* Main Greeting */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Welcome, Admin</span>
                <span className="text-blue-400 inline-block">⚡</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1 break-words">
                Sesi aktif sebagai <span className="inline-block bg-white/10 px-2 py-0.5 rounded-md text-white font-mono text-xs border border-white/15 break-all sm:break-normal font-semibold">{user?.email}</span>.
                <span className="hidden sm:inline text-slate-400 ml-1">
                  {isMasterAdmin 
                    ? 'Kawalan penuh penyelarasan katalog dan pengurusan platform.' 
                    : 'Hak akses pentadbiran visual dan konfigurasi platform.'}
                </span>
              </p>
            </div>
          </div>

          {/* Right Column: Quick Command Actions (2x2 Balanced Grid) */}
          <div className="lg:col-span-5 xl:col-span-5 w-full">
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              
              {/* Button 1: Inquiries */}
              <button
                id="overview-quick-inquiries-btn"
                onClick={() => onNavigateTab('inquiries')}
                className="group relative p-2.5 sm:p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 hover:border-amber-400 transition-all duration-150 flex flex-col justify-between text-left cursor-pointer active:scale-98"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-amber-300 group-hover:text-amber-200 leading-tight">
                    Peti Inquiries
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {inquiries.length} mesej masuk
                  </div>
                </div>
              </button>

              {/* Button 2: Urus Platform */}
              <button
                id="overview-quick-og-btn"
                onClick={() => onNavigateTab('platforms')}
                className="group relative p-2.5 sm:p-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 hover:border-blue-400 transition-all duration-150 flex flex-col justify-between text-left cursor-pointer active:scale-98"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0056D2] text-white flex items-center justify-center shadow-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-blue-200 group-hover:text-white leading-tight">
                    Urus Platform
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {totalPlatforms} modul aktif
                  </div>
                </div>
              </button>

              {/* Button 3: Data Tools & Backup */}
              <button
                id="overview-quick-datatools-btn"
                onClick={() => onNavigateTab('datatools')}
                className="group relative p-2.5 sm:p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 hover:border-emerald-400 transition-all duration-150 flex flex-col justify-between text-left cursor-pointer active:scale-98"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Database className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-200 group-hover:text-white leading-tight">
                    Data & Sandaran
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Eksport & Pulih
                  </div>
                </div>
              </button>

              {/* Button 4: Pengurusan Peranan */}
              <button
                id="overview-quick-users-btn"
                onClick={() => onNavigateTab('users')}
                className="group relative p-2.5 sm:p-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 hover:border-indigo-400 transition-all duration-150 flex flex-col justify-between text-left cursor-pointer active:scale-98"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-300 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-indigo-200 group-hover:text-white leading-tight">
                    Peranan Admin
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Pengesahan PIN
                  </div>
                </div>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Inquiries Metric Card */}
        <button
          onClick={() => onNavigateTab('inquiries')}
          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-700">
              Inquiries & Mesej
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${unreadCount > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-blue-50 text-[#0056D2]'}`}>
              {unreadCount > 0 ? <Zap className="w-3.5 h-3.5 fill-current text-amber-500" /> : <Mail className="w-3.5 h-3.5" />}
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{inquiries.length} Permohonan</span>
          </div>
          <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
            {unreadCount > 0 ? (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                {unreadCount} Belum Dibaca
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Semua Mesej Telah Disemak
              </span>
            )}
          </div>
        </button>

        {/* Total Platforms */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Modul Platform
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0056D2] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {totalPlatforms} Modul
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Semua Aktif & Beroperasi</span>
          </div>
        </div>

        {/* Custom OG Images */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Open Graph JPG
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {customOgImagesCount} / {totalPlatforms}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Visual JPG Kustom dimuat naik
          </div>
        </div>

        {/* Admins Count */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pentadbir Berdaftar
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {1 + secondaryAdmins.length} Akaun
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            1 Master + {secondaryAdmins.length} Sekunder
          </div>
        </div>

        {/* Data Tools & Sandaran Metric Card */}
        <button
          id="overview-card-datatools"
          onClick={() => onNavigateTab('datatools')}
          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700">
              Data & Sandaran
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Standard SES</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>CSV, Backup & Audit Siap</span>
          </div>
        </button>

      </div>

      {/* Two Column Layout: Recent Inquiries + Master Admin Info + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Inquiries & Master Admin */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Recent Inquiries Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Permohonan Terkini (Inquiries)</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                        {unreadCount} Baharu
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mesej dari borang konsultasi dan permohonan platform
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('inquiries')}
                className="text-xs font-bold text-[#0056D2] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua ({inquiries.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Tiada permohonan baru diterima lagi.
              </div>
            ) : (
              <div className="space-y-2">
                {recentInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => onNavigateTab('inquiries')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{inq.name}</span>
                        {(!inq.read || inq.status === 'new') && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                            BAHARU
                          </span>
                        )}
                        <span className="text-[11px] text-slate-600 font-mono">{inq.email}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {inq.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {inq.platformInterest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {inq.platformInterest}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-600">
                        {typeof inq.createdAt === 'number' ? new Date(inq.createdAt).toLocaleDateString('ms-MY') : 'Baru'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master Admin Security Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pengesahan Identiti Master Admin
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kebenaran tertinggi disahkan melalui 4-Digit Security PIN Pentadbir
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 border border-amber-300 text-amber-900">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Master Admin Email:
                </span>
                <div className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{MASTER_ADMIN_EMAIL}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Sesi Semasa:
                </span>
                <div className="text-xs font-mono font-bold text-slate-900 truncate">
                  {user?.email}
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Padanan Sah ({user?.role})</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Quick Links */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0056D2]" />
            <span>Pintasan Tindakan</span>
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
                    Peti Masuk Inquiries
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Semak {inquiries.length} permohonan pengguna
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700" />
            </button>

            <button
              onClick={() => onNavigateTab('platforms')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0056D2]" />
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#0056D2]">
                    Modul Platform & Visual
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Urus maklumat kad & Open Graph
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0056D2]" />
            </button>

            <button
              onClick={() => onNavigateTab('datatools')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0056D2]" />
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#0056D2]">
                    Data Tools & Sandaran
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Backup, eksport/import CSV & audit
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0056D2]" />
            </button>

            <button
              onClick={() => onNavigateTab('logs')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    Rekod Log Keselamatan
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Audit akses & log aktiviti
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
