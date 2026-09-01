import React, { useState, useEffect } from 'react';
import { AdminHeader, AdminTab } from './AdminHeader';
import { AdminOverview } from './AdminOverview';
import { AdminPlatforms } from './AdminPlatforms';
import { AdminCarousel } from './AdminCarousel';
import { AdminInquiries } from './AdminInquiries';
import { AdminUsers } from './AdminUsers';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminDataTools } from './AdminDataTools';
import { PlatformItem, InquiryItem } from '../../types';
import { CarouselSlide } from '../../utils/carouselStorage';
import { SyncrozzBackupPayload } from '../../utils/dataSafetyUtils';
import { getStoredInquiries, saveStoredInquiries } from '../../utils/inquiryStorage';
import { 
  subscribeToInquiries, 
  updateInquiryStatusInFirestore, 
  deleteInquiryFromFirestore 
} from '../../services/firestoreService';
import { fetchInquiriesApi, updateInquiryStatusApi, deleteInquiryApi } from '../../services/apiService';

interface AdminDashboardProps {
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
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
  const getInitialTab = (): AdminTab => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('datatools') || hash.includes('data') || hash.includes('backup') || hash.includes('sandaran')) return 'datatools';
      if (hash.includes('platforms') || hash.includes('og')) return 'platforms';
      if (hash.includes('inquiries') || hash.includes('messages')) return 'inquiries';
      if (hash.includes('carousel')) return 'carousel';
      if (hash.includes('users') || hash.includes('roles')) return 'users';
      if (hash.includes('settings') || hash.includes('pin')) return 'settings';
      if (hash.includes('logs') || hash.includes('audit')) return 'logs';
    } catch {}
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialTab);
  const [inquiries, setInquiries] = useState<InquiryItem[]>(() => getStoredInquiries());

  // Listen to hash changes inside Admin view
  useEffect(() => {
    const handleHashSync = () => {
      const tab = getInitialTab();
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  // Subscribe to real-time inquiries from Firestore + fetch initial from server
  useEffect(() => {
    // 1. Initial fetch from API / DB
    fetchInquiriesApi().then(apiInquiries => {
      if (apiInquiries && apiInquiries.length > 0) {
        setInquiries(prev => {
          // Merge preserving latest
          const map = new Map<string, InquiryItem>();
          prev.forEach(item => map.set(item.id, item));
          apiInquiries.forEach(item => map.set(item.id, item));
          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
            const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
            return timeB - timeA;
          });
          saveStoredInquiries(merged);
          return merged;
        });
      }
    }).catch(err => {
      console.warn('[AdminDashboard] Note fetching inquiries API:', err);
    });

    // 2. Real-time subscription via Firestore
    const unsubscribe = subscribeToInquiries((remoteInquiries) => {
      if (remoteInquiries && remoteInquiries.length > 0) {
        setInquiries(remoteInquiries);
        saveStoredInquiries(remoteInquiries);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleUpdateInquiryStatus = async (id: string, status: 'new' | 'in_progress' | 'completed' | 'archived', read?: boolean) => {
    // Optimistic UI update
    setInquiries(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status,
            read: read !== undefined ? read : (status !== 'new')
          };
        }
        return item;
      });
      saveStoredInquiries(updated);
      return updated;
    });

    // Sync to Firestore & API
    try {
      await updateInquiryStatusInFirestore(id, status, read);
      await updateInquiryStatusApi(id, status, read);
    } catch (err) {
      console.error('[AdminDashboard] Failed to sync inquiry status update:', err);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    // Optimistic UI update
    setInquiries(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveStoredInquiries(updated);
      return updated;
    });

    // Sync to Firestore & API
    try {
      await deleteInquiryFromFirestore(id);
      await deleteInquiryApi(id);
    } catch (err) {
      console.error('[AdminDashboard] Failed to sync inquiry deletion:', err);
    }
  };

  const unreadInquiriesCount = inquiries.filter(item => !item.read || item.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Admin Top Navigation */}
      <AdminHeader
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onExitToWebsite={onExitToWebsite}
        unreadInquiriesCount={unreadInquiriesCount}
      />

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {activeTab === 'overview' && (
          <AdminOverview
            onNavigateTab={setActiveTab}
            customOgImagesCount={Object.keys(customOgImages).length}
            totalPlatformsCount={platforms.length}
            inquiries={inquiries}
          />
        )}

        {activeTab === 'platforms' && (
          <AdminPlatforms
            platforms={platforms}
            customOgImages={customOgImages}
            customUrls={customUrls}
            onSaveOgImage={onSaveOgImage}
            onRemoveOgImage={onRemoveOgImage}
            onSaveCustomUrl={onSaveCustomUrl}
            onRemoveCustomUrl={onRemoveCustomUrl}
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

        {activeTab === 'inquiries' && (
          <AdminInquiries
            inquiries={inquiries}
            onUpdateInquiryStatus={handleUpdateInquiryStatus}
            onDeleteInquiry={handleDeleteInquiry}
          />
        )}

        {activeTab === 'datatools' && (
          <AdminDataTools
            platforms={platforms}
            inquiries={inquiries}
            carouselSlides={carouselSlides}
            customUrls={customUrls}
            onSavePlatform={onSavePlatform}
            onSaveMultiplePlatforms={(platformsToSave) => {
              platformsToSave.forEach(p => onSavePlatform(p));
            }}
            onRestoreBackup={(backup: SyncrozzBackupPayload) => {
              backup.data.platforms.forEach(p => onSavePlatform(p));
              if (backup.data.carouselSlides && backup.data.carouselSlides.length > 0) {
                onSaveCarouselSlides(backup.data.carouselSlides);
              }
              if (backup.data.customUrls && onSaveCustomUrl) {
                Object.entries(backup.data.customUrls).forEach(([id, url]) => {
                  onSaveCustomUrl(id, url);
                });
              }
            }}
            onNavigateToPlatforms={() => setActiveTab('platforms')}
            onNavigateToInquiries={() => setActiveTab('inquiries')}
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
