import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  ShieldAlert, 
  Crown,
  Lock,
  Sparkles,
  Mail,
  Info
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { MASTER_ADMIN_EMAIL } from '../../auth/authConfig';
import { SYNCROZZ_PRIMARY_LOGO } from '../../data/syncrozzAssets';

interface AdminLoginProps {
  onBackToHome: () => void;
  onSuccessRedirect?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToHome, onSuccessRedirect }) => {
  const { 
    loginWithRealGooglePopup, 
    loginWithGoogleEmail, 
    isLoading, 
    error, 
    clearAuthError 
  } = useAuth();

  const [inputEmail, setInputEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'verify'>('direct');

  // Real Google Popup Login
  const handleRealGoogleLogin = async () => {
    clearAuthError();
    setIsAuthenticating(true);
    const success = await loginWithRealGooglePopup();
    setIsAuthenticating(false);
    if (success && onSuccessRedirect) {
      onSuccessRedirect();
    }
  };

  // Direct Master Admin Login for khaikerr@gmail.com
  const handleMasterAdminLogin = async () => {
    clearAuthError();
    setIsAuthenticating(true);
    const success = await loginWithGoogleEmail(
      MASTER_ADMIN_EMAIL,
      'Khaikerr (Master Admin)',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    );
    setIsAuthenticating(false);
    if (success && onSuccessRedirect) {
      onSuccessRedirect();
    }
  };

  // Custom email verification submission (only khaikerr@gmail.com succeeds, others get Access Denied)
  const handleEmailVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;

    clearAuthError();
    setIsAuthenticating(true);
    const cleanEmail = inputEmail.trim().toLowerCase();
    
    const success = await loginWithGoogleEmail(
      cleanEmail,
      cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() ? 'Khaikerr (Master Admin)' : 'Google User'
    );
    setIsAuthenticating(false);
    if (success && onSuccessRedirect) {
      onSuccessRedirect();
    }
  };

  // Test unauthorized login to demonstrate restriction
  const handleTestUnauthorized = async () => {
    clearAuthError();
    setIsAuthenticating(true);
    await loginWithGoogleEmail(
      'pelawat.luar@gmail.com',
      'Pelawat Luar (Unauthorized)'
    );
    setIsAuthenticating(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative subtle background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center z-10">
        <button
          id="admin-login-back-btn"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/60 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Laman Utama</span>
        </button>

        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">
          Strict Access Control
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 p-7 sm:p-9 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden shadow-md shadow-blue-500/20 mb-1 bg-white p-1 border border-slate-100">
            <img 
              src={SYNCROZZ_PRIMARY_LOGO} 
              alt="SYNCROZZ" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            SYNCROZZ
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-current" />
            <span>Master Admin Access Only</span>
          </div>

          <p className="text-xs text-slate-500 pt-1">
            Akses pentadbir dihadkan secara eksklusif kepada akaun <strong className="text-slate-800 font-mono">khaikerr@gmail.com</strong>.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Akses Ditolak</span>
              <p className="text-red-600 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Action Options */}
        <div className="space-y-4">
          
          {/* PRIMARY OPTION 1: 1-Click Master Admin Login (Guaranteed & Seamless) */}
          <div className="bg-blue-50/70 border border-blue-200/90 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900">Akaun Master Admin Utama</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-bold text-[10px]">
                AUTORITI
              </span>
            </div>

            <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-lg border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0056D2] font-bold text-xs flex items-center justify-center shrink-0">
                K
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 font-mono truncate">{MASTER_ADMIN_EMAIL}</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Akses Penuh Dibenarkan</span>
                </div>
              </div>
            </div>

            <button
              id="master-admin-direct-login-btn"
              onClick={handleMasterAdminLogin}
              disabled={isLoading || isAuthenticating}
              className="w-full py-3 px-4 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isAuthenticating ? 'Mengesahkan Master Admin...' : `Log Masuk sebagai ${MASTER_ADMIN_EMAIL}`}</span>
            </button>
          </div>

          {/* OPTION 2: Continue with Google OAuth Popup */}
          <button
            id="continue-with-google-btn"
            onClick={handleRealGoogleLogin}
            disabled={isLoading || isAuthenticating}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 group text-xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Log Masuk Google (OAuth 2.0 Popup)</span>
          </button>

          {/* OPTION 3: Test Access Verification for Any Email */}
          <div className="pt-2">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sahkan Emel Google Lain</span>
                </span>
                <span className="text-[10px] text-slate-600 font-normal">Ujian Sekatan</span>
              </div>

              <form onSubmit={handleEmailVerificationSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Masukkan emel Google..."
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputEmail.trim() || isAuthenticating}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg cursor-pointer disabled:opacity-50 shrink-0"
                >
                  Sahkan
                </button>
              </form>

              {/* Demo test button for unauthorized account */}
              <div className="pt-1 flex items-center justify-between border-t border-slate-200/70 text-[10px]">
                <span className="text-slate-600">Cuba akaun tanpa kebenaran:</span>
                <button
                  type="button"
                  onClick={handleTestUnauthorized}
                  className="text-amber-700 hover:text-amber-900 font-semibold underline cursor-pointer"
                >
                  pelawat.luar@gmail.com
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Security Rule Information Box */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Peraturan Keselamatan Ketat Dikuatkuasakan</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal pl-5">
            Sebarang akaun Google selain <span className="font-mono font-bold text-slate-700">khaikerr@gmail.com</span> akan disekat dengan status <strong>ACCESS DENIED</strong> dan direkodkan ke log audit keselamatan.
          </p>
        </div>

      </div>
    </div>
  );
};
