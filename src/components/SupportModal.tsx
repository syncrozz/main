import React, { useState } from 'react';
import { 
  Heart, 
  X, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Sparkles
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

  if (!isOpen) return null;

  const handleSaveQR = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(QR_IMAGE_URL);
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
      // Fallback: open direct link
      window.open(QR_IMAGE_URL, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in text-left">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-blue-50/80 via-slate-50/40 to-white border-b border-slate-100">
          <button
            onClick={onClose}
            aria-label="Tutup"
            id="close-support-modal-btn"
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              Sokongan Komuniti
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Sokong Inisiatif SYNCROZZ
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Jika platform ini bermanfaat kepada anda, anda dialu-alukan untuk menyokong usaha ini. Setiap sumbangan sukarela membantu kelangsungan ekosistem digital dan alatan percuma kami.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* QR Code Container */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col items-center justify-center text-center">
            <div className="relative bg-white p-3 rounded-xl shadow-xs border border-slate-200 max-w-[280px] w-full">
              <img
                src={QR_IMAGE_URL}
                alt="Kod QR DuitNow Sumbangan SYNCROZZ"
                className="w-full h-auto object-contain rounded-lg aspect-square"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>DuitNow QR / Pembayaran Perbankan & e-Wallet Sah</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 w-full flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                id="save-qr-code-btn"
                onClick={handleSaveQR}
                disabled={isDownloading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0056D2] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-75"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Kod QR Disimpan!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Menyimpan...' : 'Simpan Kod QR (Save QR)'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Expandable "Cara Bayar Guna Galeri" (How To Pay) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              id="how-to-pay-toggle-btn"
              onClick={() => setIsHowToPayOpen(!isHowToPayOpen)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left cursor-pointer"
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
              <div className="p-4 bg-white border-t border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[11px] flex items-center justify-center mt-0.5">
                    1
                  </span>
                  <span>Klik butang <strong>"Simpan Kod QR"</strong> di atas ke galeri telefon anda.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[11px] flex items-center justify-center mt-0.5">
                    2
                  </span>
                  <span>Buka mana-mana aplikasi perbankan dalam talian (Maybank, CIMB, Bank Islam, dsb.) atau e-Wallet (Touch 'n Go, Boost, MAE, GrabPay).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[11px] flex items-center justify-center mt-0.5">
                    3
                  </span>
                  <span>Pilih fungsi <strong>Scan QR / DuitNow QR</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[11px] flex items-center justify-center mt-0.5">
                    4
                  </span>
                  <span>Pilih ikon <strong>Galeri / Album</strong> dan muat naik gambar Kod QR yang telah disimpan.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[11px] flex items-center justify-center mt-0.5">
                    5
                  </span>
                  <span>Masukkan jumlah sumbangan mengikut keikhlasan anda.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] font-bold text-[11px] flex items-center justify-center mt-0.5">
                    6
                  </span>
                  <span>Sahkan transaksi pembayaran. Terima kasih atas sokongan ikhlas anda!</span>
                </div>
              </div>
            )}
          </div>

          {/* Gentle Note */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/80 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#0056D2] shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              Sumbangan ini bersifat sukarela dan bukan keperluan untuk menggunakan platform. Anda bebas menutup tetingkap ini pada bila-bila masa.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
