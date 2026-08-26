import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, Play, Pause } from 'lucide-react';
import { CarouselSlide } from '../utils/carouselStorage';

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
  const touchStartX = useRef<number | null>(null);

  // Auto-Swap if > 1 slide and not paused
  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4500); // 4.5 seconds auto rotation

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
        // Swiped left -> next
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
      } else {
        // Swiped right -> prev
        setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
  };

  return (
    <div 
      id="hero-interactive-carousel"
      className="w-full max-w-[460px] mx-auto relative group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/15 via-purple-500/10 to-indigo-500/15 blur-2xl -z-10 rounded-2xl pointer-events-none" />

      {/* Main Glass Card Container */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:border-blue-200 hover:shadow-2xl">
        
        {/* Top Header Badge & Slide Counter */}
        <div className="p-3.5 sm:p-4 pb-2 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0056D2] border border-blue-100/80">
              <Sparkles className="w-3 h-3 text-[#0056D2]" />
              <span>{currentSlide.badge || 'Sorotan SYNCROZZ'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeSlides.length > 1 && (
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
                title={isPaused ? 'Sambung Auto-Swap' : 'Jeda Auto-Swap'}
                aria-label={isPaused ? 'Sambung' : 'Jeda'}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
            )}
            <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
              {currentIndex + 1} / {activeSlides.length}
            </span>
          </div>
        </div>

        {/* Carousel Slide Media Area */}
        <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden group/image">
          {activeSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover/image:scale-105"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            </div>
          ))}

          {/* Navigation Arrows (Shown if > 1 slide) */}
          {activeSlides.length > 1 && (
            <>
              <button
                id="carousel-prev-btn"
                onClick={handlePrev}
                aria-label="Slaid Sebelumnya"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-md cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                id="carousel-next-btn"
                onClick={handleNext}
                aria-label="Slaid Seterusnya"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-md cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Overlaid Title on Image */}
          <div className="absolute bottom-0 inset-x-0 p-3.5 z-20 text-left pointer-events-none">
            <h4 className="text-white text-sm sm:text-base font-bold leading-snug drop-shadow-sm line-clamp-1">
              {currentSlide.title}
            </h4>
            {currentSlide.subtitle && (
              <p className="text-slate-200 text-xs line-clamp-1 opacity-90 drop-shadow-xs">
                {currentSlide.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Action & Pagination Strip */}
        <div className="p-3 sm:p-3.5 bg-white flex items-center justify-between gap-3">
          {/* Dot Indicators */}
          {activeSlides.length > 1 ? (
            <div className="flex items-center gap-1.5">
              {activeSlides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Ke Slaid ${dotIdx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === currentIndex 
                      ? 'w-6 bg-[#0056D2]' 
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="text-[11px] font-medium text-slate-500">
              Paparan Pintar SYNCROZZ
            </div>
          )}

          {/* Action Link Button */}
          {currentSlide.linkUrl?.startsWith('http') ? (
            <a
              href={currentSlide.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0056D2] hover:text-[#0045a8] transition-colors"
            >
              <span>Lihat Info</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <button
              type="button"
              onClick={onExplorePlatforms}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0056D2] hover:text-[#0045a8] transition-colors cursor-pointer"
            >
              <span>Terokai Ekosistem</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
