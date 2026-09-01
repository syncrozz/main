import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Check, 
  X, 
  ExternalLink, 
  Eye, 
  MoveUp, 
  MoveDown,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CarouselSlide, DEFAULT_HERO_CAROUSEL_SLIDES } from '../../utils/carouselStorage';
import { compressImageFile, compressDataUrl } from '../../utils/imageCompressor';

interface AdminCarouselProps {
  slides: CarouselSlide[];
  onSaveSlides: (slides: CarouselSlide[]) => void;
}

export const AdminCarousel: React.FC<AdminCarouselProps> = ({
  slides,
  onSaveSlides
}) => {
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    badge: 'Sorotan SYNCROZZ',
    linkUrl: '#platform',
    isActive: true
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      badge: 'Sorotan SYNCROZZ',
      linkUrl: '#platform',
      isActive: true
    });
    setUploadPreview(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      imageUrl: slide.imageUrl,
      badge: slide.badge || 'Sorotan SYNCROZZ',
      linkUrl: slide.linkUrl || '#platform',
      isActive: slide.isActive !== false
    });
    setUploadPreview(slide.imageUrl);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej yang sah (PNG, JPG, WebP).');
      return;
    }

    try {
      const compressedUrl = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 675,
        quality: 0.82,
        format: 'image/webp'
      });
      setUploadPreview(compressedUrl);
      setFormData(prev => ({ ...prev, imageUrl: compressedUrl }));
    } catch (err) {
      console.warn('Fallback standard file reader for image:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadPreview(dataUrl);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Sila masukkan tajuk slaid.');
      return;
    }
    if (!formData.imageUrl.trim()) {
      alert('Sila masukkan URL imej atau muat naik imej slaid.');
      return;
    }

    // Compress data URL if needed
    let finalImageUrl = formData.imageUrl;
    if (finalImageUrl.startsWith('data:image/') && finalImageUrl.length > 80000) {
      try {
        finalImageUrl = await compressDataUrl(finalImageUrl, {
          maxWidth: 1200,
          maxHeight: 675,
          quality: 0.82
        });
      } catch {}
    }

    let updatedList: CarouselSlide[];

    if (editingSlide) {
      // Edit existing
      updatedList = slides.map((s) => {
        if (s.id === editingSlide.id) {
          return {
            ...s,
            title: formData.title,
            subtitle: formData.subtitle,
            imageUrl: finalImageUrl,
            badge: formData.badge,
            linkUrl: formData.linkUrl,
            isActive: formData.isActive
          };
        }
        return s;
      });
      showNotification('Slaid carousel berjaya dikemaskini!');
    } else {
      // Add new
      const newSlide: CarouselSlide = {
        id: `slide-${Date.now()}`,
        title: formData.title,
        subtitle: formData.subtitle,
        imageUrl: finalImageUrl,
        badge: formData.badge,
        linkUrl: formData.linkUrl,
        order: slides.length + 1,
        isActive: formData.isActive
      };
      updatedList = [...slides, newSlide];
      showNotification('Slaid carousel baharu berjaya ditambah!');
    }

    onSaveSlides(updatedList);
    setIsFormOpen(false);
  };

  const handleDeleteSlide = (id: string) => {
    if (confirm('Adakah anda pasti mahu memadam slaid ini daripada carousel?')) {
      const updated = slides.filter((s) => s.id !== id);
      onSaveSlides(updated);
      showNotification('Slaid telah dipadam.');
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = slides.map((s) => {
      if (s.id === id) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    });
    onSaveSlides(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // update order property
    const reordered = newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    onSaveSlides(reordered);
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan kepada senarai slaid default SYNCROZZ?')) {
      onSaveSlides(DEFAULT_HERO_CAROUSEL_SLIDES);
      showNotification('Slaid dikembalikan kepada default.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0056D2] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Pengurusan Hero Carousel</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tambah, sunting, susun turutan, atau padam imej dan tajuk slaid yang dipaparkan pada halaman utama. Carousel akan berputar secara automatik (Auto-Swap) jika terdapat lebih daripada 1 slaid aktif.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset ke Default"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0056D2] hover:bg-[#0045a8] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Slaid Baharu</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Slide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`bg-white rounded-2xl border ${
              slide.isActive !== false ? 'border-slate-200/80 shadow-xs' : 'border-slate-200 opacity-60 bg-slate-50'
            } overflow-hidden flex flex-col transition-all`}
          >
            {/* Image Preview Container */}
            <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              
              {/* Top status badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                  #{index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(slide.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    slide.isActive !== false
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {slide.isActive !== false ? 'Aktif' : 'Nyahaktif'}
                </button>
              </div>

              {/* Bottom title overlay */}
              <div className="absolute bottom-2.5 inset-x-2.5 text-white">
                <span className="text-[9px] font-semibold text-blue-300 uppercase tracking-wider block">
                  {slide.badge || 'Sorotan'}
                </span>
                <h4 className="text-xs font-bold truncate">{slide.title}</h4>
              </div>
            </div>

            {/* Slide details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-slate-500 line-clamp-2">
                {slide.subtitle || 'Tiada penerangan tambahan.'}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Gerak ke Hadapan"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Gerak ke Belakang"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit and Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(slide)}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0056D2] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Padam Slaid"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Slide Edit/Add Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left my-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0056D2]" />
                <span>{editingSlide ? 'Sunting Slaid Carousel' : 'Tambah Slaid Carousel Baharu'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tajuk Utama Slaid <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth. Ekosistem SYNCROZZ Pintar"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penerangan Ringkas (Sub-tajuk)
                </label>
                <textarea
                  rows={2}
                  placeholder="cth. Platform pintar untuk sekolah, institusi dan organisasi..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Badge Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Label Lencana (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="cth. Sorotan SYNCROZZ"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    placeholder="cth. #platform atau https://..."
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Image Source (URL or File Upload) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Imej Slaid (16:9 disyorkan) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Masukkan URL imej terus (https://...)"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                      setUploadPreview(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">atau</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Muat Naik Dari Komputer</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </div>
                </div>

                {/* Preview Box */}
                {uploadPreview && (
                  <div className="mt-3 relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] font-bold">
                      Pratonton Imej
                    </div>
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="slide-is-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="slide-is-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Aktifkan slaid ini dalam putaran Carousel
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0056D2] hover:bg-[#0045a8] transition-all shadow-xs cursor-pointer"
                >
                  Simpan Slaid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
