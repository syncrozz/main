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
  Activity
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { PLATFORMS_DATA } from '../../data/platforms';
import { MASTER_ADMIN_EMAIL } from '../../auth/authConfig';
import { AdminTab } from './AdminHeader';

interface AdminOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  customOgImagesCount: number;
  totalPlatformsCount?: number;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigateTab,
  customOgImagesCount,
  totalPlatformsCount
}) => {
  const { user, isMasterAdmin, getAdminEmails } = useAuth();
  const secondaryAdmins = getAdminEmails();

  const totalPlatforms = totalPlatformsCount !== undefined ? totalPlatformsCount : PLATFORMS_DATA.length;

  return (
    <div className="space-y-4">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Sesi Disahkan Google OAuth 2.0</span>
            </span>

            {isMasterAdmin && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center gap-1.5 shadow-xs">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>MASTER_ADMIN AUTHORIZED</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Welcome, Admin
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed">
            Anda log masuk sebagai <strong className="text-white font-mono">{user?.email}</strong>. 
            {isMasterAdmin 
              ? ' Memegang kebenaran Master Admin tertinggi bagi keseluruhan ekosistem SYNCROZZ.' 
              : ' Mempunyai hak akses pentadbir untuk mengurus visual dan kandungan platform.'}
          </p>

          <div className="pt-1 flex flex-wrap gap-2.5">
            <button
              id="overview-quick-og-btn"
              onClick={() => onNavigateTab('platforms')}
              className="px-3 py-1.5 rounded-lg bg-[#0056D2] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Urus Platform & Open Graph</span>
            </button>

            <button
              id="overview-quick-users-btn"
              onClick={() => onNavigateTab('users')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pengurusan Peranan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
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
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {customOgImagesCount} / {totalPlatforms}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Visual JPG Kustom dimuat naik
          </div>
        </div>

        {/* Admins Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pentadbir Berdaftar
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {1 + secondaryAdmins.length} Akaun
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            1 Master Admin ({MASTER_ADMIN_EMAIL.split('@')[0]}) + {secondaryAdmins.length} Sekunder
          </div>
        </div>

        {/* Security Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status Keselamatan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700 tracking-tight">
            Terkawal & Selamat
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1 font-mono">
            OAuth 2.0 • Token Enforced
          </div>
        </div>

      </div>

      {/* Two Column Layout: Master Admin Info + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Master Admin Security Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Pengesahan Identiti Master Admin
                </h3>
                <p className="text-xs text-slate-500">
                  Kebenaran tertinggi disahkan secara terus daripada Google OAuth 2.0
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-100 border border-amber-300 text-amber-900">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Master Admin Designated Email:
              </span>
              <div className="text-sm font-mono font-bold text-slate-900 flex items-center gap-2">
                <span>{MASTER_ADMIN_EMAIL}</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-600 pt-1">
                Akaun ini mempunyai hak mutlak (full administrative access) dalam sistem.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Sesi Semasa:
              </span>
              <div className="text-sm font-mono font-bold text-slate-900 truncate">
                {user?.email}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Padanan Identiti Sah ({user?.role})</span>
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Authentication Engine: Google Identity Services (GSI) / OAuth 2.0</span>
            <span className="font-mono text-[11px]">Sesi Aktif Sejak: {new Date(user?.authTime || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Right 1 Col: Quick Links */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0056D2]" />
            <span>Pintasan Tindakan</span>
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('logs')}
              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    Rekod Log Keselamatan
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Audit akses & percubaan log masuk
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
