import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  X, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  ArrowLeft,
  QrCode
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QR_IMAGE_URL = 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/Bank%20QR/QR%20RYT%20for%20Sumbangan.jpg';

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [isHowToPayOpen, setIsHowToPayOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Keyboard Escape listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveQR = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(QR_IMAGE_URL, { mode: 'cors' });
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SYNCROZZ-Sumbangan-QR.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      // Fallback: direct download link opening
      const a = document.createElement('a');
      a.href = QR_IMAGE_URL;
      a.target = '_blank';
      a.download = 'SYNCROZZ-Sumbangan-QR.jpg';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fade-in text-left"
      onClick={onClose}
      id="support-modal-backdrop"
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        id="support-modal-card"
      >
        {/* Header Bar */}
        <div className="relative px-6 pt-6 pb-4 bg-white border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                Sumbangan Sukarela
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              Sokong Inovasi Ini ❤️
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Platform ini dibangunkan secara berterusan bagi memudahkan warga pendidik dan komuniti. Sokongan ikhlas anda membantu kesinambungan pelayan dan pembangunan inovasi seterusnya.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup"
            id="close-support-modal-btn"
            className="w-8 h-8 -mr-2 -mt-1 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* QR Code Container */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col items-center justify-center text-center">
            <div className="relative bg-white p-2.5 rounded-xl shadow-xs border border-slate-200/80 max-w-[240px] w-full">
              <img
                src={QR_IMAGE_URL}
                alt="Kod QR DuitNow Sumbangan SYNCROZZ"
                className="w-full h-auto object-contain rounded-lg aspect-square"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>DuitNow QR / Mana-mana Bank & e-Wallet Malaysia</span>
            </div>

            {/* RM1 Pun Amat Dihargai Badge */}
            <div className="mt-2.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-bold inline-flex items-center gap-1">
              <span>RM1 pun amat dihargai 👏</span>
            </div>

            {/* Save QR Code Button */}
            <div className="mt-4 w-full">
              <button
                type="button"
                id="save-qr-code-btn"
                onClick={handleSaveQR}
                disabled={isDownloading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0056D2] hover:bg-[#0045a8] text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow cursor-pointer disabled:opacity-75"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Kod QR Disimpan!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Menyimpan...' : 'Save QR Code'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Accordion: "Cara Bayar Guna Galeri (How To Pay)" */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              id="how-to-pay-accordion-btn"
              onClick={() => setIsHowToPayOpen(!isHowToPayOpen)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/70 transition-colors flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                <Smartphone className="w-4 h-4 text-[#0056D2]" />
                <span>Cara Bayar Guna Galeri (How To Pay)</span>
              </div>
              {isHowToPayOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {isHowToPayOpen && (
              <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-600 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[10px] flex items-center justify-center mt-0.5">
                    1
                  </span>
                  <span>Tekan butang <strong>"Save QR Code"</strong> untuk menyimpan imej QR ke dalam galeri telefon anda.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[10px] flex items-center justify-center mt-0.5">
                    2
                  </span>
                  <span>Buka aplikasi bank (Maybank, CIMB, Bank Islam, dsb.) atau e-Wallet (Touch 'n Go, MAE, GrabPay, Boost).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[10px] flex items-center justify-center mt-0.5">
                    3
                  </span>
                  <span>Pilih menu <strong>Scan / DuitNow QR</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[10px] flex items-center justify-center mt-0.5">
                    4
                  </span>
                  <span>Tekan ikon <strong>Galeri / Album / Upload QR</strong> dan pilih gambar QR yang disimpan tadi.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[10px] flex items-center justify-center mt-0.5">
                    5
                  </span>
                  <span>Masukkan nilai sumbangan seikhlas hati dan sahkan pembayaran.</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer with "Kembali ke SYNCROZZ" Button */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Terima kasih atas sokongan anda
          </span>
          <button
            type="button"
            id="back-to-syncrozz-btn"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke SYNCROZZ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
