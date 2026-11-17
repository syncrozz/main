import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Play, Pause } from 'lucide-react';
import { CarouselSlide } from '../utils/carouselStorage';
import { SYNCROZZ_OGI_PRIMARY } from '../data/syncrozzAssets';

interface HeroCarouselProps {
  slides: CarouselSlide[];
  onExplorePlatforms?: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  onExplorePlatforms
}) => {
  const activeSlides = slides.filter((s) => s.isActive !== false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  // Auto-Swap if > 1 slide and not paused
  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeSlides.length, isPaused]);

  // Handle slide index bounds
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  if (activeSlides.length === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
      } else {
        setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      id="hero-interactive-carousel"
      className="w-full max-w-5xl mx-auto relative group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Carousel Slide Media Area (1200x630 / 16:9 friendly stage) */}
        <div className="relative aspect-[16/9] sm:aspect-[1200/630] w-full bg-slate-900 overflow-hidden">
          {activeSlides.map((slide, idx) => {
            const slideKey = slide.id || String(idx);
            const imgSrc = failedImages[slideKey] ? SYNCROZZ_OGI_PRIMARY : slide.imageUrl;

            return (
              <div
                key={slideKey}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={imgSrc}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  onError={() => {
                    if (!failedImages[slideKey]) {
                      setFailedImages((prev) => ({ ...prev, [slideKey]: true }));
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              </div>
            );
          })}

          {/* Navigation Arrows (Shown if > 1 slide) */}
          {activeSlides.length > 1 && (
            <>
              <button
                id="carousel-prev-btn"
                type="button"
                onClick={handlePrev}
                aria-label="Slaid Sebelumnya"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/55 hover:bg-slate-950/80 text-white backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                id="carousel-next-btn"
                type="button"
                onClick={handleNext}
                aria-label="Slaid Seterusnya"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/55 hover:bg-slate-950/80 text-white backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Overlaid Title & Quiet Category Text on Image */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 z-20 text-left pointer-events-none">
            {currentSlide.badge && (
              <p className="text-xs font-medium text-sky-200 mb-1">
                {currentSlide.badge}
              </p>
            )}
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug line-clamp-1 max-w-3xl">
              {currentSlide.title}
            </h1>
            {currentSlide.subtitle && (
              <p className="text-slate-200 text-xs sm:text-sm mt-1 line-clamp-2 max-w-2xl">
                {currentSlide.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Controls, Counter, Pause/Resume & Action Strip */}
        <div className="px-4 py-3 sm:px-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
          {/* Left: Slide Indicators */}
          <div className="flex items-center gap-3">
            {activeSlides.length > 1 ? (
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Slide selection">
                {activeSlides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentIndex(dotIdx)}
                    aria-label={`Ke Slaid ${dotIdx + 1}`}
                    aria-selected={dotIdx === currentIndex}
                    className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                      dotIdx === currentIndex
                        ? 'w-7 bg-[#0056D2]'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs font-medium text-slate-500">SYNCROZZ Showcase</span>
            )}
          </div>

          {/* Right: Pause/Resume, Counter & Primary Slide Link */}
          <div className="flex items-center gap-3 shrink-0">
            {activeSlides.length > 1 && (
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                title={isPaused ? 'Sambung Auto-Swap' : 'Jeda Auto-Swap'}
                aria-label={isPaused ? 'Sambung putaran slaid' : 'Jeda putaran slaid'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            )}

            <span className="text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap">
              {currentIndex + 1} / {activeSlides.length}
            </span>

            {currentSlide.linkUrl?.startsWith('http') ? (
              <a
                href={currentSlide.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0056D2] hover:text-[#0045a8] whitespace-nowrap transition-colors"
              >
                <span>Lihat Info</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onExplorePlatforms}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0056D2] hover:text-[#0045a8] whitespace-nowrap transition-colors cursor-pointer"
              >
                <span>Explore Platforms</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
