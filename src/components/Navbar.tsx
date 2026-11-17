import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { SYNCROZZ_PRIMARY_LOGO } from '../data/syncrozzAssets';

interface NavbarProps {
  onExploreClick: () => void;
  onContactClick?: () => void;
  onLogoClick?: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onExploreClick,
  onContactClick,
  onLogoClick,
  activeSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Platforms', href: '#platforms', id: 'platforms' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (id === 'contact' && onContactClick) {
      onContactClick();
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onLogoClick) {
      onLogoClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-14 sm:h-16">
          {/* Zone 1: Clean Brand Lockup */}
          <a
            href="#home"
            id="brand-logo-btn"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2] rounded-lg"
            aria-label="SYNCROZZ Home"
          >
            <img
              src={SYNCROZZ_PRIMARY_LOGO}
              alt="SYNCROZZ"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0056D2] whitespace-nowrap">
              SYNCROZZ
            </span>
          </a>

          {/* Zone 2: Minimal Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium" aria-label="Primary Navigation">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.id)}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2] rounded-xs ${
                    isActive
                      ? 'text-[#0056D2] border-[#0056D2] font-semibold'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="header-explore-btn"
              type="button"
              onClick={onExploreClick}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-[#0045a8] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2] focus-visible:ring-offset-2"
            >
              Explore Platforms
            </button>

            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2]"
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-1">
          <nav className="flex flex-col" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.id}
                id={`mobile-nav-${link.id}`}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.id)}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === link.id
                    ? 'bg-blue-50 text-[#0056D2] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            <button
              id="mobile-drawer-explore-btn"
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onExploreClick();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0056D2] hover:bg-[#0045a8] text-white text-sm font-semibold cursor-pointer transition-colors"
            >
              Explore Platforms
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
