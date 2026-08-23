import React from 'react';
import { 
  Heart, 
  ExternalLink,
  Layers
} from 'lucide-react';

interface FooterProps {
  onPlatformClick: (id: string) => void;
  onContactClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPlatformClick, onContactClick }) => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
          
          {/* Brand Info Column (4 cols) */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0056D2] via-blue-600 to-sky-400 p-[2px] shadow-sm shadow-blue-500/20">
                <div className="w-full h-full bg-white rounded-[8px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0056D2]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 7.5C16.5 5.84315 15.1569 4.5 13.5 4.5H8.5C6.84315 4.5 5.5 5.84315 5.5 7.5C5.5 9.15685 6.84315 10.5 8.5 10.5H15.5C17.1569 10.5 18.5 11.8431 18.5 13.5C18.5 15.1569 17.1569 16.5 15.5 16.5H10.5C8.84315 16.5 7.5 15.1569 7.5 13.5" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-[#0056D2] font-sans">
                SYNCROZZ
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal max-w-sm">
              Smart Solutions for Education, Productivity & Digital Innovation. Platform bersepadu untuk memperkasa warga pendidik dan institusi masa kini.
            </p>

            {/* Social Icons */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Ikuti Kami
              </div>
              <div className="flex items-center gap-2.5">
                
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#0056D2] flex items-center justify-center transition-colors border border-slate-200/60"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-colors border border-slate-200/60"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white flex items-center justify-center transition-colors border border-slate-200/60"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.05 3.23-1.57 3.22-3.39.04-4.88.02-9.76.03-14.64z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-pink-600 flex items-center justify-center transition-colors border border-slate-200/60"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

              </div>
            </div>
          </div>

          {/* Column 1: Platform (2 cols) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-medium">
              <li>
                <button 
                  onClick={() => onPlatformClick('staff-attend')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  Staff Attend
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPlatformClick('student-attend')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  Student Attend
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPlatformClick('class-attend')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  Class Attend
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPlatformClick('syncrozz-qr')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  SYNCROZZ QR
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPlatformClick('urusteam')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  URUSTEAM
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions (2 cols) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Solutions
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-medium">
              <li>
                <button 
                  onClick={() => onPlatformClick('kpm-match')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  KPM Match
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPlatformClick('syncrozz-link')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  SYNCROZZ Link
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPlatformClick('rc-fun-ride')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  RC Fun Ride
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPlatformClick('rc-zone')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  RC Zone
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPlatformClick('peluang-pentas')} 
                  className="hover:text-[#0056D2] transition-colors cursor-pointer text-left"
                >
                  Peluang Pentas
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources (2 cols) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-medium">
              <li>
                <a href="#about" className="hover:text-[#0056D2] transition-colors">
                  Dokumentasi
                </a>
              </li>
              <li>
                <button onClick={onContactClick} className="hover:text-[#0056D2] transition-colors cursor-pointer">
                  Bantuan & FAQ
                </button>
              </li>
              <li>
                <a href="#flow" className="hover:text-[#0056D2] transition-colors">
                  Panduan Aliran
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Status Sistem: 100%
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Syarikat / Company (2 cols) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Syarikat
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-medium">
              <li>
                <a href="#about" className="hover:text-[#0056D2] transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <button onClick={onContactClick} className="hover:text-[#0056D2] transition-colors cursor-pointer">
                  Hubungi Kami
                </button>
              </li>
              <li>
                <a href="#about" className="hover:text-[#0056D2] transition-colors">
                  Dasar Privasi
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#0056D2] transition-colors">
                  Terma Penggunaan
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Accreditation */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SYNCROZZ. Hak Cipta Terpelihara.</p>
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for Education & Digital Innovation</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
