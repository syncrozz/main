import React, { useState } from 'react';
import { 
  Mail, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Phone, 
  Building2, 
  Sparkles, 
  Zap, 
  MessageSquare, 
  Eye, 
  RotateCcw, 
  Send, 
  Check, 
  Copy,
  Filter,
  UserCheck,
  AlertCircle,
  X,
  Download
} from 'lucide-react';
import { InquiryItem } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import { exportInquiriesToCsv, downloadFile } from '../../utils/csvDataUtils';

interface AdminInquiriesProps {
  inquiries: InquiryItem[];
  onUpdateInquiryStatus: (id: string, status: InquiryItem['status'], read?: boolean) => void;
  onDeleteInquiry: (id: string) => void;
}

export const AdminInquiries: React.FC<AdminInquiriesProps> = ({
  inquiries,
  onUpdateInquiryStatus,
  onDeleteInquiry
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const newCount = inquiries.filter(i => i.status === 'new' || !i.read).length;
  const contactedCount = inquiries.filter(i => i.status === 'contacted').length;
  const resolvedCount = inquiries.filter(i => i.status === 'resolved').length;

  const platformsList = Array.from(
    new Set(inquiries.map(i => i.platformInterest).filter(Boolean))
  ) as string[];

  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.organization && item.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.platformInterest && item.platformInterest.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'new' && (item.status === 'new' || !item.read)) ||
      item.status === statusFilter;

    const matchesPlatform = 
      platformFilter === 'all' || item.platformInterest === platformFilter;

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (val: number | string | undefined) => {
    if (!val) return 'Baru sahaja';
    try {
      const d = typeof val === 'number' ? new Date(val) : new Date(val);
      if (isNaN(d.getTime())) return 'Baru sahaja';
      return d.toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Baru sahaja';
    }
  };

  const cleanPhoneForWa = (phoneStr?: string) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '60' + cleaned.substring(1);
    }
    return cleaned;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#0056D2] uppercase bg-blue-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-blue-100">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              Peti Masuk Pertanyaan Rasmi
            </span>
            {newCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-bounce flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" />
                <span>{newCount} Baharu</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Inquiries & Permohonan Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau dan maklum balas permohonan konsultasi serta pertanyaan dari institusi, sekolah, dan pengguna.
          </p>
        </div>

        {/* Quick Stats Counter Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
            <div className="text-[10px] font-bold uppercase text-slate-600">Jumlah Mesej</div>
            <div className="text-lg font-black text-slate-900">{inquiries.length}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-left">
            <div className="text-[10px] font-bold uppercase text-amber-900 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Belum Dibaca
            </div>
            <div className="text-lg font-black text-amber-900">{newCount}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-left">
            <div className="text-[10px] font-bold uppercase text-blue-900">Dihubungi</div>
            <div className="text-lg font-black text-blue-900">{contactedCount}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
            <div className="text-[10px] font-bold uppercase text-emerald-900">Selesai</div>
            <div className="text-lg font-black text-emerald-900">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-inquiries-input"
            type="text"
            placeholder="Cari nama, emel, organisasi, mesej..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0056D2] focus:bg-white transition-all text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status & Platform Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="filter-all-inquiries-btn"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' 
                  ? 'bg-white text-[#0056D2] shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({inquiries.length})
            </button>
            <button
              id="filter-new-inquiries-btn"
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'new' 
                  ? 'bg-amber-500 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-amber-600'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              Baharu ({newCount})
            </button>
            <button
              id="filter-contacted-inquiries-btn"
              onClick={() => setStatusFilter('contacted')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'contacted' 
                  ? 'bg-blue-600 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Dihubungi ({contactedCount})
            </button>
            <button
              id="filter-resolved-inquiries-btn"
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'resolved' 
                  ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Selesai ({resolvedCount})
            </button>
          </div>

          {/* Platform Filter Dropdown */}
          {platformsList.length > 0 && (
            <select
              id="select-platform-filter"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2] cursor-pointer"
            >
              <option value="all">Semua Platform ({inquiries.length})</option>
              {platformsList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}

          {/* Export CSV Button */}
          <button
            onClick={() => {
              const csv = exportInquiriesToCsv(filteredInquiries);
              downloadFile(csv, `SYNCROZZ_INQUIRIES_${new Date().toISOString().slice(0, 10)}.csv`);
            }}
            title="Eksport data permohonan ke fail CSV"
            className="px-3 py-2 bg-slate-50 hover:bg-[#0056D2] hover:text-white border border-slate-200 hover:border-[#0056D2] text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Simpan CSV ({filteredInquiries.length})</span>
          </button>

        </div>
      </div>

      {/* Inquiries List View */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Mail className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Tiada Permohonan Dijumpai
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all' || platformFilter !== 'all'
              ? 'Tiada rekod yang sepadan dengan kriteria tapisan carian anda.'
              : 'Peti masuk permohonan kosong buat masa ini. Pertanyaan dari borang laman web akan dipaparkan di sini secara automatik.'}
          </p>
          {(searchTerm || statusFilter !== 'all' || platformFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPlatformFilter('all'); }}
              className="px-4 py-1.5 bg-blue-50 text-[#0056D2] rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              Tetapkan Semula Tapisan
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((item) => {
            const isUnread = !item.read || item.status === 'new';
            const waNumber = cleanPhoneForWa(item.phone || item.organization);

            return (
              <div
                key={item.id}
                id={`inquiry-card-${item.id}`}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md p-4 sm:p-5 relative ${
                  isUnread 
                    ? 'border-blue-300 bg-blue-50/20 shadow-xs' 
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  
                  {/* Left: User & Message Information */}
                  <div className="space-y-2 flex-1">
                    
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isUnread && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>BAHARU</span>
                        </span>
                      )}

                      {item.status === 'contacted' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          <span>Telah Dihubungi</span>
                        </span>
                      )}

                      {item.status === 'resolved' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai</span>
                        </span>
                      )}

                      {item.platformInterest && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0056D2]/10 text-[#0056D2] border border-blue-200">
                          {item.platformInterest}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-600 flex items-center gap-1 ml-auto lg:ml-0">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Sender Details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {item.name}
                      </span>
                      <a 
                        href={`mailto:${item.email}`}
                        className="text-[#0056D2] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {item.email}
                      </a>
                      {(item.phone || item.organization) && (
                        <span className="text-slate-600 flex items-center gap-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {item.organization || item.phone}
                        </span>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </div>

                  </div>

                  {/* Right Actions & Status Controls */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {/* Action buttons row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      
                      {/* Email Reply */}
                      <a
                        href={`mailto:${item.email}?subject=Maklumbalas Permohonan SYNCROZZ (${item.platformInterest || 'Platform'})&body=Salam sejahtera ${item.name},%0D%0A%0D%0ATerima kasih atas pertanyaan anda mengenai SYNCROZZ.`}
                        onClick={() => onUpdateInquiryStatus(item.id, item.status === 'new' ? 'contacted' : item.status, true)}
                        className="px-3 py-1.5 rounded-lg bg-[#0056D2] text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        title="Balas Melalui Emel"
                      >
                        <Send className="w-3 h-3" />
                        <span>Balas Emel</span>
                      </a>

                      {/* WhatsApp Button (if phone exists) */}
                      {waNumber && (
                        <a
                          href={`https://wa.me/${waNumber}?text=Salam%20sejahtera%20${encodeURIComponent(item.name)},%20kami%20dari%20pasukan%20SYNCROZZ%20merujuk%20kepada%20pertanyaan%20anda%20mengenai%20${encodeURIComponent(item.platformInterest || 'Platform')}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onUpdateInquiryStatus(item.id, item.status === 'new' ? 'contacted' : item.status, true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          title="Hubungi melalui WhatsApp"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Quick Details View */}
                      <button
                        onClick={() => {
                          setSelectedInquiry(item);
                          if (!item.read) {
                            onUpdateInquiryStatus(item.id, item.status, true);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Lihat Butiran Penuh"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Butiran</span>
                      </button>

                      {/* Copy Info */}
                      <button
                        onClick={() => handleCopy(`${item.name} | ${item.email} | ${item.phone || item.organization || ''} | ${item.platformInterest}\nMesej: ${item.message}`, item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Salin Maklumat Pertanyaan"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Adakah anda pasti mahu memadamkan pertanyaan daripada "${item.name}"?`)) {
                            onDeleteInquiry(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Padam Rekod Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                    {/* Status Picker Pill */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold mt-1">
                      <button
                        onClick={() => onUpdateInquiryStatus(item.id, 'new', false)}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          item.status === 'new' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Baharu
                      </button>
                      <button
                        onClick={() => onUpdateInquiryStatus(item.id, 'contacted', true)}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          item.status === 'contacted' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Dihubungi
                      </button>
                      <button
                        onClick={() => onUpdateInquiryStatus(item.id, 'resolved', true)}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          item.status === 'resolved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Selesai
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedInquiry(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in zoom-in-95 duration-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-[#0056D2]">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Butiran Pertanyaan Penuh
                  </h3>
                  <p className="text-xs text-slate-600">
                    ID: {selectedInquiry.id} • {formatDate(selectedInquiry.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sender Info Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-600 block text-[10px] uppercase font-bold">Nama Pemohon</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] uppercase font-bold">Platform Diminati</span>
                  <span className="font-bold text-[#0056D2]">{selectedInquiry.platformInterest || 'Umum'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] uppercase font-bold">Emel</span>
                  <span className="font-medium text-slate-800">{selectedInquiry.email}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] uppercase font-bold">Organisasi / Telefon</span>
                  <span className="font-medium text-slate-800">{selectedInquiry.organization || selectedInquiry.phone || '-'}</span>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Kandungan Mesej:</label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onUpdateInquiryStatus(selectedInquiry.id, 'resolved', true);
                    setSelectedInquiry(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandakan Selesai</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Maklumbalas SYNCROZZ&body=Salam ${selectedInquiry.name},`}
                  className="px-4 py-2 rounded-xl bg-[#0056D2] text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Balas Emel Sekarang</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
