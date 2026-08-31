import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AccessDenied } from './AccessDenied';
import { AdminDashboard } from './AdminDashboard';
import { PlatformItem } from '../../types';
import { CarouselSlide } from '../../utils/carouselStorage';

interface AdminLayoutProps {
  onExitToWebsite: () => void;
  customOgImages: Record<string, string>;
  customUrls?: Record<string, string>;
  onSaveOgImage: (platformId: string, dataUrl: string) => void;
  onRemoveOgImage: (platformId: string) => void;
  onSaveCustomUrl?: (platformId: string, url: string) => void;
  onRemoveCustomUrl?: (platformId: string) => void;
  platforms: PlatformItem[];
  onSavePlatform: (platform: PlatformItem, ogImageDataUrl?: string) => void;
  onDeletePlatform: (platformId: string) => void;
  carouselSlides: CarouselSlide[];
  onSaveCarouselSlides: (slides: CarouselSlide[]) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onExitToWebsite,
  customOgImages,
  customUrls = {},
  onSaveOgImage,
  onRemoveOgImage,
  onSaveCustomUrl,
  onRemoveCustomUrl,
  platforms,
  onSavePlatform,
  onDeletePlatform,
  carouselSlides,
  onSaveCarouselSlides
}) => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Mengesahkan Sesi Pentadbir...
          </span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated: Render Google Login Screen
  if (!isAuthenticated || !user) {
    return (
      <AdminLogin
        onBackToHome={onExitToWebsite}
      />
    );
  }

  // 2. Authenticated but Unauthorized (Regular User): Render Access Denied
  if (!isAdmin) {
    return (
      <AccessDenied
        onBackToHome={onExitToWebsite}
        onTryAnotherAccount={() => {
          // Handled inside AccessDenied by calling logout()
        }}
      />
    );
  }

  // 3. Authorized (MASTER_ADMIN or ADMIN): Render Admin Dashboard
  return (
    <AdminDashboard
      onExitToWebsite={onExitToWebsite}
      customOgImages={customOgImages}
      customUrls={customUrls}
      onSaveOgImage={onSaveOgImage}
      onRemoveOgImage={onRemoveOgImage}
      onSaveCustomUrl={onSaveCustomUrl}
      onRemoveCustomUrl={onRemoveCustomUrl}
      platforms={platforms}
      onSavePlatform={onSavePlatform}
      onDeletePlatform={onDeletePlatform}
      carouselSlides={carouselSlides}
      onSaveCarouselSlides={onSaveCarouselSlides}
    />
  );
};
