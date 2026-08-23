import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  Building2, 
  Phone, 
  User, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    platformInterest: 'Staff Attend',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      institution: '',
      platformInterest: 'Staff Attend',
      message: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 sm:px-8 pt-7 pb-5 border-b border-slate-200/80 relative">
          <button
            id="close-contact-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-xs border border-slate-200 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-bold tracking-[0.2em] text-[#0056D2] uppercase bg-blue-100/70 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2">
            <Mail className="w-3 h-3 text-[#0056D2]" />
            Hubungi Pasukan SYNCROZZ
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Konsultasi & Permohonan Platform
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bincangkan keperluan digital institusi, sekolah, atau komuniti anda bersama kami.
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                Mesej Anda Telah Diterima!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Terima kasih kerana menghubungi SYNCROZZ. Pasukan kami akan meneliti permohonan anda dan menghubungi semula dalam tempoh 24 jam.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#0056D2] text-white font-semibold text-sm hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Tutup Tingkap
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Penuh *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Cth: Cikgu Ahmad / En. Firdaus"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0056D2]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Emel Rasmi / Peribadi *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="nama@institusi.edu.my"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0056D2]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Institusi / Organisasi</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cth: SMK Seri Bintang / Kolej Vokasional"
                      value={formData.institution}
                      onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0056D2]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Platform Diminati</label>
                  <select
                    value={formData.platformInterest}
                    onChange={(e) => setFormData({...formData, platformInterest: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0056D2]"
                  >
                    <option value="Staff Attend">Staff Attend (Kehadiran Staf)</option>
                    <option value="Student Attend">Student Attend (Kehadiran Murid)</option>
                    <option value="Class Attend">Class Attend (Kehadiran PdP)</option>
                    <option value="SYNCROZZ QR">SYNCROZZ QR (Kod QR Dinamik)</option>
                    <option value="URUSTEAM">URUSTEAM (Papan Kolaborasi)</option>
                    <option value="KPM Match">KPM Match</option>
                    <option value="SYNCROZZ Link">SYNCROZZ Link</option>
                    <option value="Semua Platform">Pakej Penuh Ekosistem</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mesej / Keperluan Khas</label>
                <textarea
                  rows={3}
                  placeholder="Kongsikan secara ringkas bilangan pengguna atau jangkaan tarikh pelaksanaan..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0056D2] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0056D2] hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Menghantar Permohonan...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Hantar Permohonan Konsultasi</span>
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>

    </div>
  );
};
