import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Building2, 
  Users, 
  Zap, 
  Lightbulb, 
  ArrowRight,
  Layers,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CATEGORIES_DATA } from '../data/platforms';
import { PlatformItem, CategoryDetail } from '../types';

interface CategoriesSectionProps {
  platforms?: PlatformItem[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ 
  platforms = [],
  onSelectCategory 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Education');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6" />;
      case 'Building2':
        return <Building2 className="w-6 h-6" />;
      case 'Users':
        return <Users className="w-6 h-6" />;
      case 'Zap':
        return <Zap className="w-6 h-6" />;
      case 'Lightbulb':
        return <Lightbulb className="w-6 h-6" />;
      default:
        return <Layers className="w-6 h-6" />;
    }
  };

  // Dynamic category calculations based on actual platforms data
  const dynamicCategories = useMemo(() => {
    return CATEGORIES_DATA.map((cat) => {
      const matchingPlatforms = platforms.filter(
        (p) => p.category?.toLowerCase() === cat.name.toLowerCase() || p.category?.toLowerCase() === cat.id.toLowerCase()
      );

      const dynamicCount = matchingPlatforms.length > 0 ? matchingPlatforms.length : cat.count;
      const dynamicHighlighted = matchingPlatforms.length > 0 
        ? matchingPlatforms.map((p) => p.name).slice(0, 5)
        : cat.highlightedPlatforms;

      return {
        ...cat,
        count: dynamicCount,
        highlightedPlatforms: dynamicHighlighted,
      };
    });
  }, [platforms]);

  return (
    <section id="solutions" className="py-10 md:py-14 bg-slate-50/40 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-1">
          <span className="text-[10px] font-bold tracking-[0.18em] text-[#0056D2] uppercase bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
            Kategori Penyelesaian
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Direka Mengikut Sektor & Keperluan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Struktur ekosistem yang teratur mengikut objektif khusus institusi, tenaga pendidik, dan komuniti anda.
          </p>
        </div>

        {/* Categories Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {dynamicCategories.map((cat) => (
            <div
              key={cat.id}
              id={`category-card-${cat.id.toLowerCase()}`}
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0056D2] flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-700 text-[11px] font-bold">
                    {cat.count} Platform
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-[#0056D2] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs font-semibold text-[#0056D2] mb-2">
                  {cat.tagline}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4 font-normal">
                  {cat.description}
                </p>

                {/* Highlighted Tools */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Platform Termasuk:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.highlightedPlatforms.map((tool, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200/80"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectCategory(cat.name)}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-[#0056D2] border border-slate-200/80 hover:border-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Platform {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
