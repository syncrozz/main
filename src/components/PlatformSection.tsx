import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ArrowUpRight, Globe } from 'lucide-react';
import { PlatformItem, PlatformCategory, DiscoveredPlatformMetadata } from '../types';
import { generateDefaultOgImage, resolvePlatformOgImage } from '../utils/ogStorage';
import { resolvePlatformUrl } from '../utils/platformUrlUtils';
import { discoverPlatformMetadataApi } from '../services/apiService';

interface PlatformSectionProps {
  platforms?: PlatformItem[];
  customOgImages: Record<string, string>;
  customUrls?: Record<string, string>;
  selectedCategory?: PlatformCategory;
  onSelectCategoryFilter?: (cat: PlatformCategory) => void;
}

export const PlatformSection: React.FC<PlatformSectionProps> = ({
  platforms = [],
  customOgImages,
  customUrls = {},
  selectedCategory: controlledCategory,
  onSelectCategoryFilter,
}) => {
  const [internalCategory, setInternalCategory] = useState<PlatformCategory>('All');
  const selectedCategory = controlledCategory !== undefined ? controlledCategory : internalCategory;
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveredByUrl, setDiscoveredByUrl] = useState<Record<string, DiscoveredPlatformMetadata>>({});
  const [failedOgIds, setFailedOgIds] = useState<Record<string, boolean>>({});

  const handleCategoryChange = (cat: PlatformCategory) => {
    setInternalCategory(cat);
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter(cat);
    }
  };

  // Dynamically generate category filters from actual platform data
  const availableCategories = useMemo<PlatformCategory[]>(() => {
    const seen = new Set<PlatformCategory>();
    platforms.forEach((p) => {
      if (p.category) seen.add(p.category);
    });
    return ['All', ...Array.from(seen)];
  }, [platforms]);

  // Reset selected category to 'All' if it no longer exists in live platforms
  useEffect(() => {
    if (selectedCategory !== 'All' && !availableCategories.includes(selectedCategory)) {
      handleCategoryChange('All');
    }
  }, [availableCategories, selectedCategory]);

  // Non-blocking server-side PWA manifest + OGI metadata discovery for platforms with verified URLs
  useEffect(() => {
    let cancelled = false;

    const urlsToDiscover = Array.from(
      new Set(
        platforms
          .map((item) => resolvePlatformUrl(item, customUrls))
          .filter((u): u is string => Boolean(u))
      )
    );

    urlsToDiscover.forEach((url) => {
      if (discoveredByUrl[url]) return;
      discoverPlatformMetadataApi(url).then((meta) => {
        if (!cancelled && meta) {
          setDiscoveredByUrl((prev) => (prev[url] ? prev : { ...prev, [url]: meta }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [platforms, customUrls]);

  const filteredPlatforms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return platforms.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const resolvedUrl = resolvePlatformUrl(item, customUrls);
      const discovered = resolvedUrl ? discoveredByUrl[resolvedUrl] : undefined;

      const searchable = [
        item.name,
        item.subName,
        item.tagline,
        item.description,
        item.category,
        discovered?.name,
        discovered?.shortName,
        discovered?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [platforms, selectedCategory, searchQuery, customUrls, discoveredByUrl]);

  return (
    <section id="platforms" className="py-12 sm:py-16 bg-white">
      <div id="platform" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            Available Platforms
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Terokai platform digital rasmi SYNCROZZ untuk pendidikan, produktiviti dan pengurusan komuniti.
          </p>
        </div>

        {/* Dynamic Category Filter & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200/80">
          {availableCategories.length > 1 && (
            <div
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full"
              role="tablist"
              aria-label="Filter kategori platform"
            >
              {availableCategories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    id={`filter-tab-${cat.toLowerCase()}`}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'All' ? 'Semua Platform' : cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Platform Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              id="platform-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari platform atau kategori..."
              aria-label="Cari platform"
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Kosongkan carian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Responsive Platform Directory Grid Card */}
        {filteredPlatforms.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600">Tiada platform ditemui untuk carian semasa.</p>
            <button
              type="button"
              onClick={() => {
                handleCategoryChange('All');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-[#0056D2] hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Reset Tapisan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredPlatforms.map((item) => {
              const resolvedUrl = resolvePlatformUrl(item, customUrls);
              const discovered = resolvedUrl ? discoveredByUrl[resolvedUrl] : undefined;
              const { src: resolvedOgSrc } = resolvePlatformOgImage(item, customOgImages, discovered);
              const imageSrc = failedOgIds[item.id] ? generateDefaultOgImage(item) : resolvedOgSrc;

              const displayTitle =
                `${item.name || discovered?.name || discovered?.shortName || 'Platform'} ${item.subName || ''}`.trim();
              const shortDescription =
                item.tagline ||
                item.description ||
                (!discovered?.isRootPortalFallback ? discovered?.description : undefined) ||
                'Penyelesaian digital SYNCROZZ.';

              const cardInner = (
                <>
                  {/* Official Open Graph Visual (1200 x 630 ratio) */}
                  <div className="relative aspect-[1200/630] w-full bg-slate-100 overflow-hidden border-b border-slate-100 shrink-0">
                    <img
                      src={imageSrc}
                      alt={`${displayTitle} Official Open Graph Visual`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() => {
                        if (!failedOgIds[item.id]) {
                          setFailedOgIds((prev) => ({ ...prev, [item.id]: true }));
                        }
                      }}
                    />
                  </div>

                  {/* Card Details */}
                  <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow">
                    <div>
                      {item.category && (
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                          {item.category}
                        </p>
                      )}
                      <h3 className="mt-1 text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-[#0056D2] transition-colors">
                        {displayTitle}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {shortDescription}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {resolvedUrl ? (
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0056D2] group-hover:text-[#0045a8] transition-colors whitespace-nowrap">
                          <span>Explore Platform</span>
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-400 whitespace-nowrap truncate">
                          <Globe className="w-3 h-3 shrink-0" />
                          <span>URL Belum Ditetapkan</span>
                        </span>
                      )}
                    </div>
                  </div>
                </>
              );

              if (resolvedUrl) {
                return (
                  <a
                    key={item.id}
                    id={`card-platform-${item.id}`}
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Explore Platform ${displayTitle}`}
                    className="group flex flex-col justify-between h-full bg-white rounded-xl border border-slate-200 hover:border-[#0056D2]/50 hover:shadow-md transition-all duration-150 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2]"
                  >
                    {cardInner}
                  </a>
                );
              }

              return (
                <article
                  key={item.id}
                  id={`card-platform-${item.id}`}
                  className="group flex flex-col justify-between h-full bg-white rounded-xl border border-slate-200/90 overflow-hidden text-left"
                >
                  {cardInner}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
