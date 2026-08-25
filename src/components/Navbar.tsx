import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  Layers,
  Settings
} from 'lucide-react';

import { SYNCROZZ_PRIMARY_LOGO } from '../data/syncrozzAssets';

interface NavbarProps {
  onExploreClick: () => void;
  onContactClick: () => void;
  onLogoClick?: () => void;
  activeSection: string;
  isAdminMode?: boolean;
  onOpenAdminModal?: () => void;
  onAdminClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onExploreClick, 
  onContactClick,
  onLogoClick,
  activeSection,
  isAdminMode = false,
  onOpenAdminModal,
  onAdminClick
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Platform', href: '#platform', id: 'platform' },
    { label: 'Flow', href: '#flow', id: 'flow' },
    { label: 'Solutions', href: '#solutions', id: 'solutions' },
    { label: 'Price', href: '#kos', id: 'kos' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (href === '#contact') {
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
      window.location.hash = '#home';
      const target = document.querySelector('#home');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-2xs border-b border-slate-100 py-2.5' 
          : 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Title Home Trigger */}
          <a 
            href="#home" 
            id="brand-logo-btn"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group cursor-pointer select-none"
            title="Kembali ke Laman Utama (Home)"
            aria-label="Kembali ke Laman Utama SYNCROZZ"
          >
            {/* Official SYNCROZZ Logo Image */}
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-2xs shadow-blue-500/20 transition-transform group-hover:scale-105 shrink-0 bg-white cursor-pointer">
              <img 
                src={SYNCROZZ_PRIMARY_LOGO} 
                alt="SYNCROZZ" 
                className="w-full h-full object-contain cursor-pointer"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex flex-col cursor-pointer">
              <span className="text-xl font-black tracking-tight text-[#0056D2] flex items-center gap-1 font-sans cursor-pointer group-hover:text-blue-700 transition-colors">
                SYNCROZZ
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-5 text-xs font-semibold">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`transition-colors duration-150 ${
                    isActive
                      ? 'text-[#0056D2] font-bold'
                      : 'text-slate-600 hover:text-[#0056D2]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Admin Panel Button */}
            {onAdminClick && (
              <button
                id="header-admin-portal-btn"
                onClick={onAdminClick}
                title="Akses Mod Admin"
                className="px-2.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-[#0056D2] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                aria-label="Akses Admin"
              >
                <Settings className="w-3.5 h-3.5 text-[#0056D2]" />
                <span>Admin</span>
              </button>
            )}

            <button
              id="header-explore-btn"
              onClick={onExploreClick}
              className="bg-[#0056D2] text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-700 active:scale-95 transition-colors shadow-2xs shadow-blue-200 cursor-pointer"
            >
              Explore Platform
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {onAdminClick && (
              <button
                id="mobile-admin-gear-btn"
                onClick={onAdminClick}
                className="p-1.5 rounded-full border bg-slate-50 border-slate-200 text-slate-700 hover:text-[#0056D2] cursor-pointer"
                aria-label="Admin Access"
                title="Akses Admin"
              >
                <Settings className="w-4 h-4 text-[#0056D2]" />
              </button>
            )}

            <button
              id="mobile-explore-btn"
              onClick={onExploreClick}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#0056D2] text-white shadow-sm shadow-blue-200"
            >
              Explore
            </button>
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-100 px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                id={`mobile-nav-${link.id}`}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between ${
                  activeSection === link.id
                    ? 'bg-blue-50 text-[#0056D2] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
            {onAdminClick && (
              <button
                id="mobile-drawer-admin-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminClick();
                }}
                className="w-full py-2.5 px-4 rounded-full text-center font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Settings className="w-4 h-4 text-[#0056D2]" />
                <span>Admin Access (Google OAuth 2.0)</span>
              </button>
            )}

            <button
              id="mobile-drawer-explore-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onExploreClick();
              }}
              className="w-full py-3 px-4 rounded-full text-center font-semibold text-white bg-[#0056D2] hover:bg-blue-700 shadow-sm shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Platform</span>
              <Layers className="w-4 h-4" />
            </button>
            <button
              id="mobile-drawer-contact-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onContactClick();
              }}
              className="w-full py-2.5 px-4 rounded-full text-center font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Hubungi Kami
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
