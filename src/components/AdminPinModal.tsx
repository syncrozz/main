import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, Key, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginWithPin } = useAuth();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg(null);
      setIsSubmitting(false);
      // Immediate and delayed focus to ensure cursor is active
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Unified authentication/validation function
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
      onClose();
      onSuccess();
    } else {
      setIsSubmitting(false);
      setPin('');
      setErrorMsg('PIN tidak sah. Sila cuba lagi.');
      // Refocus immediately so user can type again right away
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSubmitting, loginWithPin, onClose, onSuccess]);

  // Handle keyboard inputs: auto-submit on 4th digit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Only accept numeric digits, maximum 4 characters
    const numericValue = rawValue.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
    if (errorMsg) setErrorMsg(null);

    // Auto-enter / auto-submit immediately when the 4th digit is entered
    if (numericValue.length === 4) {
      handleValidatePin(numericValue);
    }
  };

  // Keyboard navigation: Enter to submit, Escape to close
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValidatePin(pin);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Global Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 text-center animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top 🔒 Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0056D2] shadow-xs mb-4">
          <Lock className="w-6 h-6" />
        </div>

        {/* Header Title & Subtitle */}
        <h2 id="admin-modal-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
          Akses Mod Admin
        </h2>

        <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed font-normal">
          Sila masukkan 4-digit PIN keselamatan untuk aktifkan mod suntingan admin.
        </p>

        {/* PIN Input & Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleValidatePin(pin);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="admin-pin-input" className="sr-only">
              Masukkan 4-digit PIN
            </label>
            <input
              ref={inputRef}
              id="admin-pin-input"
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
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="admin-pin-submit-btn"
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
