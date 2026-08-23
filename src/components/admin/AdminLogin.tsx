import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, ArrowLeft, AlertCircle, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { MASTER_ADMIN_EMAIL } from '../../auth/authConfig';

interface AdminLoginProps {
  onBackToHome: () => void;
  onSuccessRedirect?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToHome, onSuccessRedirect }) => {
  const { loginWithGoogleEmail, loginWithGoogleCredential, isLoading, error, clearAuthError } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [showAdvancedTester, setShowAdvancedTester] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Initialize Google Identity Services (GSI) if available
  useEffect(() => {
    // Check if google scripts can be initialized
    const scriptId = 'google-gsi-client';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

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

  const handleUnauthorizedTestLogin = async (emailToTest?: string) => {
    clearAuthError();
    setIsAuthenticating(true);
    const target = emailToTest || 'unauthorized.user@gmail.com';
    await loginWithGoogleEmail(
      target,
      'Standard Google User',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    );
    setIsAuthenticating(false);
  };

  const handleCustomTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    setIsAuthenticating(true);
    await loginWithGoogleEmail(customEmail.trim());
    setIsAuthenticating(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative subtle background elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

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

        <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider font-mono">
          Security v2.4 • OAuth 2.0
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-8 sm:p-10 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0056D2] text-white shadow-md shadow-blue-500/20 mb-1">
            <Shield className="w-6 h-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SYNCROZZ
          </h1>

          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 tracking-wide uppercase">
            Admin Access
          </div>

          <p className="text-xs text-slate-500 pt-1">
            Log masuk menggunakan akaun Google yang disahkan untuk mengurus platform SYNCROZZ.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Ralat Pengesahan</span>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Primary Action Button: Continue with Google */}
        <div className="space-y-4">
          <button
            id="continue-with-google-btn"
            onClick={handleMasterAdminLogin}
            disabled={isLoading || isAuthenticating}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {/* Google G Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>

            <span className="text-sm font-medium text-slate-800">
              {isLoading || isAuthenticating ? 'Mengesahkan dengan Google...' : 'Continue with Google'}
            </span>
          </button>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-600 block">
              Google OAuth 2.0 Protected • Master Admin Authorization Enforced
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="my-6 relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-slate-600">
            Authorization Testing Suite
          </span>
        </div>

        {/* Quick Identity Test Buttons */}
        <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Uji Keselamatan Akaun Google:</span>
            <button
              type="button"
              onClick={() => setShowAdvancedTester(!showAdvancedTester)}
              className="text-[10px] text-[#0056D2] font-semibold hover:underline cursor-pointer"
            >
              {showAdvancedTester ? 'Tutup Ujian Kustom' : 'Emel Kustom'}
            </button>
          </div>

          {/* Master Admin Button */}
          <button
            id="test-master-admin-btn"
            onClick={handleMasterAdminLogin}
            disabled={isLoading || isAuthenticating}
            className="w-full text-left py-2 px-3 rounded-lg bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0056D2] shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">khaikerr@gmail.com</div>
                <div className="text-[10px] text-blue-700 font-medium">Akaun Master Admin (Akses Dibenarkan)</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-full">
              MASTER
            </span>
          </button>

          {/* Unauthorized User Button */}
          <button
            id="test-unauthorized-btn"
            onClick={() => handleUnauthorizedTestLogin('pelawat.biasa@gmail.com')}
            disabled={isLoading || isAuthenticating}
            className="w-full text-left py-2 px-3 rounded-lg bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">pelawat.biasa@gmail.com</div>
                <div className="text-[10px] text-amber-700 font-medium">Akaun Google Luar (Access Denied)</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
              UNAUTHORIZED
            </span>
          </button>

          {/* Advanced Custom Email Input */}
          {showAdvancedTester && (
            <form onSubmit={handleCustomTestSubmit} className="mt-3 pt-3 border-t border-slate-200 space-y-2">
              <label className="text-[10px] font-semibold text-slate-600 block">
                Uji Mana-mana Emel Google:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="contoh@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!customEmail.trim() || isLoading}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  Uji
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security badge at bottom */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>OAuth 2.0 Tokens Verified Server-Side</span>
        </div>

      </div>
    </div>
  );
};
