import React, { useState } from 'react';
import { AdminHeader, AdminTab } from './AdminHeader';
import { AdminOverview } from './AdminOverview';
import { AdminPlatforms } from './AdminPlatforms';
import { AdminCarousel } from './AdminCarousel';
import { AdminUsers } from './AdminUsers';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { PlatformItem } from '../../types';
import { CarouselSlide } from '../../utils/carouselStorage';

interface AdminDashboardProps {
  onExitToWebsite: () => void;
  customOgImages: Record<string, string>;
  onSaveOgImage: (platformId: string, dataUrl: string) => void;
  onRemoveOgImage: (platformId: string) => void;
  platforms: PlatformItem[];
  onSavePlatform: (platform: PlatformItem, ogImageDataUrl?: string) => void;
  onDeletePlatform: (platformId: string) => void;
  carouselSlides: CarouselSlide[];
  onSaveCarouselSlides: (slides: CarouselSlide[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onExitToWebsite,
  customOgImages,
  onSaveOgImage,
  onRemoveOgImage,
  platforms,
  onSavePlatform,
  onDeletePlatform,
  carouselSlides,
  onSaveCarouselSlides
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Admin Top Navigation */}
      <AdminHeader
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onExitToWebsite={onExitToWebsite}
      />

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {activeTab === 'overview' && (
          <AdminOverview
            onNavigateTab={setActiveTab}
            customOgImagesCount={Object.keys(customOgImages).length}
            totalPlatformsCount={platforms.length}
          />
        )}

        {activeTab === 'platforms' && (
          <AdminPlatforms
            platforms={platforms}
            customOgImages={customOgImages}
            onSaveOgImage={onSaveOgImage}
            onRemoveOgImage={onRemoveOgImage}
            onSavePlatform={onSavePlatform}
            onDeletePlatform={onDeletePlatform}
          />
        )}

        {activeTab === 'carousel' && (
          <AdminCarousel
            slides={carouselSlides}
            onSaveSlides={onSaveCarouselSlides}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsers />
        )}

        {activeTab === 'settings' && (
          <AdminSettings />
        )}

        {activeTab === 'logs' && (
          <AdminAuditLogs />
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SYNCROZZ Administrative Control Suite • Version 2.5.0</span>
          <span className="font-mono text-[11px] text-slate-600">
            Firebase Firestore & Real-Time Security
          </span>
        </div>
      </footer>

    </div>
  );
};
