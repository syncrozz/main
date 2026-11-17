import React from 'react';
import { MessageCircle, ArrowUpRight } from 'lucide-react';

const WHATSAPP_NUMBER = '60145313756';
const WHATSAPP_PREFILL =
  'Salam SYNCROZZ. Saya berminat untuk mengetahui lebih lanjut mengenai platform SYNCROZZ.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;

export const WhatsAppContactSection: React.FC = () => {
  return (
    <section id="about" className="py-12 sm:py-16 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Concise About Block */}
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#0056D2] mb-2">
            Mengenai SYNCROZZ
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            Direktori Rasmi Ekosistem Digital SYNCROZZ
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            SYNCROZZ membangunkan penyelesaian digital praktikal untuk pendidikan, produktiviti institusi dan pengurusan komuniti — daripada rekod kehadiran pintar hingga sistem koordinasi pasukan serta utiliti acara.
          </p>
        </div>

        {/* Direct WhatsApp Contact Section */}
        <div
          id="contact"
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-xl">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Hubungi SYNCROZZ Secara Terus
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ingin mendapatkan akses, pelaksanaan institusi atau pertanyaan lanjut mengenai mana-mana platform SYNCROZZ? Terus hubungi pasukan kami melalui WhatsApp rasmi.
            </p>
            <p className="text-xs font-medium text-slate-500 tabular-nums">
              WhatsApp Rasmi: +60145313756
            </p>
          </div>

          <a
            id="whatsapp-direct-cta"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-[#0056D2] hover:bg-[#0045a8] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2] focus-visible:ring-offset-2"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp Kami</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
};
