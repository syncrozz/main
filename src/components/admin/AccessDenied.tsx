import React from 'react';
import { ShieldX, ArrowLeft, LogOut, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface AccessDeniedProps {
  onBackToHome: () => void;
  onTryAnotherAccount: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  onBackToHome,
  onTryAnotherAccount
}) => {
  const { user, logout } = useAuth();

  const handleSwitchAccount = () => {
    logout();
    onTryAnotherAccount();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-red-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200 p-8 sm:p-10 text-center relative z-10">
        
        {/* Red Shield Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100 text-red-600 shadow-xs mb-5">
          <ShieldX className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Access Denied
        </h2>

        {/* Requisite Error Text */}
        <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
          Your Google account is not authorized to access the SYNCROZZ Admin Panel.
        </p>

        {/* Identity Verification Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left mb-6 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span>Akaun Google Yang Disahkan:</span>
            <span className="text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-bold">
              Tiada Kebenaran
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-slate-300 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.name || 'Google User'}
              </div>
              <div className="text-[11px] font-mono text-slate-500 truncate">
                {user?.email || 'unauthorized@gmail.com'}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Peranan Diberikan:</span>
            <span className="font-mono font-semibold text-slate-700">USER (Standard)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            id="try-another-google-account-btn"
            onClick={handleSwitchAccount}
            className="w-full py-3 px-4 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cuba Akaun Google Lain</span>
          </button>

          <button
            id="access-denied-home-btn"
            onClick={onBackToHome}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Laman Utama</span>
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-600 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span>Percubaan akses telah direkodkan dalam log keselamatan audit.</span>
        </div>

      </div>
    </div>
  );
};
