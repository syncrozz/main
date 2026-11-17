import React from 'react';
import { SYNCROZZ_PRIMARY_LOGO } from '../data/syncrozzAssets';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onOpenLegal: (doc: Exclude<LegalDocType, null>) => void;
  onContactClick: () => void;
  onAdminClick?: () => void;
}

const WHATSAPP_URL = 'https://wa.me/60145313756';

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onContactClick,
  onAdminClick,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 sm:py-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Branding & Short Description */}
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2.5">
              <img
                src={SYNCROZZ_PRIMARY_LOGO}
                alt="SYNCROZZ"
                className="w-7 h-7 rounded-lg object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg font-extrabold tracking-tight text-[#0056D2]">
                SYNCROZZ
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Smart Solutions for Education, Productivity &amp; Digital Innovation.
            </p>
          </div>

          {/* Essential Links Only */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-600" aria-label="Footer Navigation">
            <button
              type="button"
              id="footer-privacy-btn"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-[#0056D2] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              id="footer-terms-btn"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-[#0056D2] transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <button
              type="button"
              id="footer-contact-btn"
              onClick={onContactClick}
              className="hover:text-[#0056D2] transition-colors cursor-pointer"
            >
              Contact
            </button>
            {onAdminClick && (
              <button
                type="button"
                id="footer-admin-link"
                onClick={onAdminClick}
                className="text-slate-500 hover:text-[#0056D2] transition-colors cursor-pointer"
              >
                Admin
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Copyright & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} SYNCROZZ. Hak Cipta Terpelihara.</p>
          <p>
            Develop By{' '}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 hover:text-[#0056D2] font-semibold hover:underline transition-colors"
            >
              Syncrozz
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
