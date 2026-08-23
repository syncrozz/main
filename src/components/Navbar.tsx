import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';

interface NavbarProps {
  onExploreClick: () => void;
  onContactClick: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onExploreClick, 
  onContactClick,
  activeSection 
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
    { label: 'Kos', href: '#kos', id: 'kos' },
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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-xs border-b border-slate-100 py-3.5' 
          : 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <a 
            href="#home" 
            id="brand-logo-btn"
            className="flex items-center gap-3 group cursor-pointer"
          >
            {/* Signature SYNCROZZ Logo Badge */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0056D2] via-blue-600 to-sky-400 p-[2px] shadow-sm shadow-blue-500/20 transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
                <svg className="w-5 h-5 text-[#0056D2] relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 7.5C16.5 5.84315 15.1569 4.5 13.5 4.5H8.5C6.84315 4.5 5.5 5.84315 5.5 7.5C5.5 9.15685 6.84315 10.5 8.5 10.5H15.5C17.1569 10.5 18.5 11.8431 18.5 13.5C18.5 15.1569 17.1569 16.5 15.5 16.5H10.5C8.84315 16.5 7.5 15.1569 7.5 13.5" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="17" cy="6" r="1.5" fill="#38BDF8"/>
                  <circle cx="7" cy="18" r="1.5" fill="#0056D2"/>
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-[#0056D2] flex items-center gap-1 font-sans">
                SYNCROZZ
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
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
                      ? 'text-[#0056D2] font-semibold'
                      : 'text-slate-600 hover:text-[#0056D2]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              id="header-explore-btn"
              onClick={onExploreClick}
              className="bg-[#0056D2] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-colors shadow-sm shadow-blue-200 cursor-pointer"
            >
              Explore Platform
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
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
