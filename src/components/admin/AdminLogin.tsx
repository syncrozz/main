import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, Key, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { SYNCROZZ_PRIMARY_LOGO } from '../../data/syncrozzAssets';

interface AdminLoginProps {
  onBackToHome: () => void;
  onSuccessRedirect?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToHome, onSuccessRedirect }) => {
  const { loginWithPin, error } = useAuth();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    setPin('');
    setErrorMsg(null);
    setIsSubmitting(false);
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Validation function
  const handleValidatePin = useCallback(async (pinToTest: string) => {
    if (isSubmitting) return;

    if (!pinToTest || pinToTest.length < 4) {
      setErrorMsg('Sila masukkan 4-digit PIN keselamatan.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await loginWithPin(pinToTest);

    if (success) {
      setIsSubmitting(false);
      setPin('');
      setErrorMsg(null);
      if (onSuccessRedirect) {
        onSuccessRedirect();
      }
    } else {
      setIsSubmitting(false);
      setPin('');
      setErrorMsg(error || 'PIN tidak sah. Sila cuba lagi.');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSubmitting, loginWithPin, onSuccessRedirect, error]);

  // Handle keyboard inputs: auto-submit on 4th digit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
    if (errorMsg) setErrorMsg(null);

    // Auto enter when 4th digit is entered
    if (numericValue.length === 4) {
      handleValidatePin(numericValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValidatePin(pin);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative subtle background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="w-full max-w-sm mb-6 flex justify-between items-center z-10">
        <button
          id="admin-login-back-btn"
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

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200 p-7 sm:p-8 relative z-10 text-center">
        
        {/* Brand Logo & Lock Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0056D2] shadow-xs mb-4">
          <Lock className="w-6 h-6" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Akses Mod Admin
        </h1>

        <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed font-normal">
          Sila masukkan 4-digit PIN keselamatan untuk aktifkan mod suntingan admin.
        </p>

        {/* PIN Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleValidatePin(pin);
          }}
          className="space-y-4 text-left"
        >
          <div>
            <label htmlFor="admin-page-pin-input" className="sr-only">
              Masukkan 4-digit PIN
            </label>
            <input
              ref={inputRef}
              id="admin-page-pin-input"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Masukkan 4-digit PIN"
              disabled={isSubmitting}
              autoComplete="current-password"
              className={`w-full text-center text-xl font-bold tracking-[0.5em] py-3.5 px-4 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:text-xs placeholder:font-normal focus:bg-white focus:outline-none transition-all ${
                errorMsg 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/30' 
                  : 'border-slate-300 focus:border-[#0056D2] focus:ring-3 focus:ring-blue-100'
              }`}
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="admin-page-pin-submit-btn"
            disabled={isSubmitting || pin.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-[#0056D2] hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>{isSubmitting ? 'Mengesahkan...' : 'Sahkan PIN Admin'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
