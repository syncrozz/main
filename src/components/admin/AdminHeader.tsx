import React from 'react';
import { 
  Shield, 
  LogOut, 
  LayoutDashboard, 
  Layers, 
  Users, 
  Settings, 
  FileText, 
  ExternalLink,
  Crown,
  Sparkles,
  Sliders,
  Mail,
  Zap,
  Database
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { SYNCROZZ_PRIMARY_LOGO } from '../../data/syncrozzAssets';

export type AdminTab = 'overview' | 'platforms' | 'carousel' | 'inquiries' | 'datatools' | 'users' | 'settings' | 'logs';

interface AdminHeaderProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitToWebsite: () => void;
  unreadInquiriesCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  onSelectTab,
  onExitToWebsite,
  unreadInquiriesCount = 0
}) => {
  const { user, isMasterAdmin, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    onExitToWebsite();
  };

  const navItems: { 
    id: AdminTab; 
    label: string; 
    icon: React.ReactNode; 
    badgeCount?: number; 
    requiresMaster?: boolean 
  }[] = [
    { id: 'overview', label: 'Papan Pemuka', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'platforms', label: 'Open Graph & Platform', icon: <Layers className="w-4 h-4" /> },
    { id: 'carousel', label: 'Hero Carousel', icon: <Sliders className="w-4 h-4" /> },
    { 
      id: 'inquiries', 
      label: 'Inquiries & Mesej', 
      icon: <Mail className="w-4 h-4" />,
      badgeCount: unreadInquiriesCount 
    },
    { id: 'datatools', label: 'Data & Sandaran', icon: <Database className="w-4 h-4" /> },
    { id: 'users', label: 'Pengguna & Peranan', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'PIN & Keselamatan', icon: <Settings className="w-4 h-4" /> },
    { id: 'logs', label: 'Log Audit', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Greeting */}
          <button
            id="admin-brand-logo-btn"
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-3 text-left group cursor-pointer hover:opacity-90 transition-all focus:outline-none"
            title="Ke Paparan Default Dashboard Pentadbir"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 shrink-0 bg-white p-0.5 border border-slate-100 transition-transform group-hover:scale-105">
              <img 
                src={SYNCROZZ_PRIMARY_LOGO} 
                alt="SYNCROZZ" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-[#0056D2] transition-colors">
                  SYNCROZZ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                  Admin Panel
                </span>
                {isMasterAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                    <Crown className="w-3 h-3 fill-current" />
                    <span>Master Admin</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Welcome, Admin
              </p>
            </div>
          </button>

          {/* Right User Identity & Actions */}
          <div className="flex items-center gap-3">
            
            {/* View live site button */}
            <button
              id="admin-view-live-site-btn"
              onClick={onExitToWebsite}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              <span>Laman Utama</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-slate-300 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#0056D2] text-white flex items-center justify-center font-bold text-xs">
                  {user?.email?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-none">
                  {user?.name}
                </div>
                <div className="text-[10px] font-mono text-slate-500 leading-none mt-1">
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              id="admin-sign-out-btn"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 transition-all cursor-pointer"
              title="Sign Out dari Admin Panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1.5 scrollbar-thin scrollbar-thumb-slate-300">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const hasBadge = (item.badgeCount || 0) > 0;

              return (
                <button
                  key={item.id}
                  id={`admin-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 relative ${
                    isActive
                      ? 'bg-[#0056D2] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 bg-white/60 sm:bg-transparent border sm:border-transparent border-slate-200/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {hasBadge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white flex items-center gap-0.5 animate-pulse shadow-xs">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>{item.badgeCount}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
