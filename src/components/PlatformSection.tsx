import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Search, 
  Sparkles, 
  ExternalLink,
  Layers,
  GraduationCap,
  Building2,
  Zap,
  Users,
  Lightbulb,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { PLATFORMS_DATA } from '../data/platforms';
import { PlatformItem, PlatformCategory } from '../types';

interface PlatformSectionProps {
  onSelectPlatform: (platform: PlatformItem) => void;
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({ onSelectPlatform }) => {
  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const categories: { label: string; value: PlatformCategory; icon: React.ReactNode }[] = [
    { label: 'Semua Platform', value: 'All', icon: <Layers className="w-4 h-4" /> },
    { label: 'Education', value: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Campus', value: 'Campus', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Productivity', value: 'Productivity', icon: <Zap className="w-4 h-4" /> },
    { label: 'Community', value: 'Community', icon: <Users className="w-4 h-4" /> },
    { label: 'Innovation', value: 'Innovation', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  const filteredPlatforms = useMemo(() => {
    return PLATFORMS_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subName && item.subName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Render product brand logos faithfully matching the visual identity
  const renderProductLogo = (item: PlatformItem) => {
    switch (item.id) {
      case 'staff-attend':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/50"></div>
              <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
            </div>
          </div>
        );
      case 'student-attend':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-sky-50/50"></div>
              <svg className="w-7 h-7 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>
        );
      case 'class-attend':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-50/50"></div>
              <svg className="w-7 h-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
            </div>
          </div>
        );
      case 'syncrozz-qr':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-50/50"></div>
              <svg className="w-7 h-7 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="5" height="5" x="3" y="3" rx="1" />
                <rect width="5" height="5" x="16" y="3" rx="1" />
                <rect width="5" height="5" x="3" y="16" rx="1" />
                <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                <path d="M21 21v.01" />
                <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                <path d="M12 12v9" />
                <path d="M16 12h1" />
              </svg>
            </div>
          </div>
        );
      case 'urusteam':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-rose-50/50"></div>
              <svg className="w-7 h-7 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
          </div>
        );
      case 'kpm-match':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/50"></div>
              <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#2563EB" />
              </svg>
            </div>
          </div>
        );
      case 'syncrozz-link':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-50/50"></div>
              <svg className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
          </div>
        );
      case 'rc-fun-ride':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/50"></div>
              <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="12" x2="10" y2="12" />
                <line x1="8" y1="10" x2="8" y2="14" />
                <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="3" />
                <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="3" />
                <rect x="2" y="6" width="20" height="12" rx="6" />
              </svg>
            </div>
          </div>
        );
      case 'rc-zone':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 p-0.5 shadow-sm">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <svg className="w-7 h-7 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="14" r="8" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="14" x2="15" y2="11" />
              </svg>
            </div>
          </div>
        );
      case 'peluang-pentas':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-50/50"></div>
              <svg className="w-7 h-7 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10s3-3 5-3 5 3 5 3-3 3-5 3-5-3-5-3Z" />
                <path d="M12 10s3-3 5-3 5 3 5 3-3 3-5 3-5-3-5-3Z" />
                <path d="M12 21a6 6 0 0 0 6-6H6a6 6 0 0 0 6 6Z" />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            S
          </div>
        );
    }
  };

  return (
    <section id="platform" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="text-left space-y-2">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#0056D2] uppercase bg-blue-50 px-3 py-1 rounded-full inline-block">
              Platform Kami
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Satu Platform, Banyak Penyelesaian
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-normal">
              Terokai ekosistem penyelesaian digital SYNCROZZ yang direka untuk setiap keperluan anda.
            </p>
          </div>
          
          <button 
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="text-sm font-bold text-[#0056D2] flex items-center gap-1 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-50 rounded-2xl max-w-full overflow-x-auto border border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat.value}
                id={`filter-tab-${cat.value.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-white text-[#0056D2] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="platform-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari platform..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0056D2] transition-all placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* Platform Cards Grid */}
        {filteredPlatforms.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">Tiada platform dijumpai untuk carian ini.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-3 text-xs font-semibold text-[#0056D2] hover:underline"
            >
              Reset tapisan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlatforms.map((item) => (
              <div
                key={item.id}
                id={`card-platform-${item.id}`}
                onClick={() => onSelectPlatform(item)}
                className="group relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer text-left"
              >
                <div>
                  
                  {/* Top Row: Logo & Category Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
                      {renderProductLogo(item)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-200/80 bg-slate-50 text-slate-700">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Project Name & Subtitle */}
                  <div className="mb-1.5">
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 font-sans flex items-center gap-1.5 group-hover:text-[#0056D2] transition-colors">
                      <span>{item.name}</span>
                      {item.subName && (
                        <span className="text-[#0056D2]">
                          {item.subName}
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Tagline / Description */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4 font-normal">
                    {item.tagline}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 mb-4">
                    {item.features.slice(0, 2).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0056D2] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card Footer CTA */}
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#0056D2] group-hover:text-blue-700">
                  <span className="inline-flex items-center gap-1.5">
                    Terokai
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Ketahui Lanjut</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
