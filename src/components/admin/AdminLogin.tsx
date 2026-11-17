import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { SYNCROZZ_PRIMARY_LOGO } from '../../data/syncrozzAssets';

interface AdminLoginProps {
  onBackToHome: () => void;
  onSuccessRedirect?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToHome, onSuccessRedirect }) => {
  const { loginWithGoogle, error: authError, clearAuthError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLocalError(null);
    clearAuthError();

    const result = await loginWithGoogle();
    setIsSubmitting(false);

    if (result.ok && result.authorized) {
      if (onSuccessRedirect) {
        onSuccessRedirect();
      }
    } else if (!result.ok && result.error) {
      setLocalError(result.error);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative subtle background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="w-full max-w-sm mb-6 flex justify-between items-center z-10">
        <button
          id="admin-login-back-btn"
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/60 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Laman Utama</span>
        </button>

        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">
          Admin Portal
        </span>
      </div>

      {/* Main Google Auth Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200 p-7 sm:p-8 relative z-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs mb-4 p-2">
          <img
            src={SYNCROZZ_PRIMARY_LOGO}
            alt="SYNCROZZ"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          SYNCROZZ Admin Portal
        </h1>

        <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed font-normal">
          Log masuk menggunakan Akaun Google rasmi yang berautoriti untuk mengakses papan pemuka pentadbiran.
        </p>

        {displayError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-left text-xs font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{displayError}</span>
          </div>
        )}

        <button
          type="button"
          id="admin-google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 shadow-xs text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-[#0056D2] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
          )}
          <span>{isSubmitting ? 'Mengesahkan Google...' : 'Sign in with Google'}</span>
        </button>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0056D2]" />
          <span>Dilindungi Firebase Google Authentication</span>
        </div>
      </div>
    </div>
  );
};
