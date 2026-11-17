import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | null;

interface LegalModalProps {
  docType: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ docType, onClose }) => {
  useEffect(() => {
    if (!docType) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [docType, onClose]);

  if (!docType) return null;

  const isPrivacy = docType === 'privacy';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
            {isPrivacy ? 'Dasar Privasi (Privacy Policy)' : 'Terma Penggunaan (Terms of Use)'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto">
          {isPrivacy ? (
            <>
              <p>
                Portal direktori rasmi SYNCROZZ menghormati privasi pelawat dan hanya memaparkan maklumat platform rasmi serta saluran komunikasi terus kepada pasukan SYNCROZZ.
              </p>
              <p>
                Setiap aplikasi individu dalam ekosistem SYNCROZZ mempunyai dasar pengumpulan data dan kebenaran akses tersendiri mengikut keperluan institusi atau organisasi yang melanggannya.
              </p>
              <p>
                Sebarang pertanyaan mengenai data atau pemadaman rekod boleh diajukan terus melalui WhatsApp rasmi SYNCROZZ di talian +60145313756.
              </p>
            </>
          ) : (
            <>
              <p>
                Penggunaan portal SYNCROZZ tertakluk kepada tujuan penemuan, semakan dan capaian terus kepada platform digital rasmi yang dibangunkan atau diuruskan oleh SYNCROZZ.
              </p>
              <p>
                Segala nama jenama, paparan Open Graph Image rasmi, dan pautan platform adalah hak milik SYNCROZZ atau rakan operasi yang disahkan. Akses pentadbiran terhad kepada pentadbir yang diberi kuasa sahaja.
              </p>
              <p>
                Platform yang berstatus URL Belum Ditetapkan menandakan capaian awam sedang dimuktamadkan atau disediakan secara khusus atas permintaan organisasi.
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
