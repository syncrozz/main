import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustStrip } from './components/TrustStrip';
import { PlatformSection } from './components/PlatformSection';
import { CategoriesSection } from './components/CategoriesSection';
import { WhySyncrozz } from './components/WhySyncrozz';
import { EcosystemFlow } from './components/EcosystemFlow';
import { CostCalculator } from './components/CostCalculator';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { PlatformModal } from './components/PlatformModal';
import { ContactModal } from './components/ContactModal';
import { VideoDemoModal } from './components/VideoDemoModal';
import { AdminOgModal } from './components/AdminOgModal';
import { AdminPinModal } from './components/AdminPinModal';
import { SupportModal } from './components/SupportModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { PlatformFormModal } from './components/admin/PlatformFormModal';
import { PLATFORMS_DATA } from './data/platforms';
import { PlatformItem } from './types';
import { CarouselSlide, getLocalCarouselSlides, saveLocalCarouselSlides } from './utils/carouselStorage';
import { getCustomOgImages, saveCustomOgImage, removeCustomOgImage, getCustomPlatformUrls, saveCustomPlatformUrl, removeCustomPlatformUrl } from './utils/ogStorage';
import { 
  getAllPlatforms, 
  savePlatform, 
  deletePlatform,
  saveLocalCustomPlatforms,
  saveDeletedDefaultPlatformIds,
  getLocalCustomPlatforms,
  getDeletedDefaultPlatformIds
} from './utils/platformStorage';
import { 
  saveOgImageToFirestore, 
  removeOgImageFromFirestore, 
  subscribeToOgImages,
  savePlatformToFirestore,
  deletePlatformFromFirestore,
  subscribeToCustomPlatforms,
  subscribeToCustomPlatformUrls,
  saveCustomPlatformUrlToFirestore,
  removeCustomPlatformUrlFromFirestore,
  subscribeToDeletedDefaultPlatforms,
  saveCarouselSlidesToFirestore,
  subscribeToCarouselSlides,
  logAuditEventToFirestore
} from './services/firestoreService';
import { safeLocalStorageSet } from './utils/safeStorage';
import {
  fetchFullCloudStateApi,
  checkCloudVersionApi,
  pushClientStateApi,
  savePlatformApi,
  deletePlatformApi,
  saveCustomUrlApi,
  removeCustomUrlApi,
  saveCarouselSlidesApi,
  saveDeletedPlatformsApi,
  saveOgImageApi,
  syncUserToDatabase
} from './services/apiService';

function MainAppContent() {
  const { user, isAuthenticated, isAdmin, isMasterAdmin, isInitialized, isLoading } = useAuth();
  const [isAdminView, setIsAdminView] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformItem[]>(() => getAllPlatforms());
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<any>('All');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isVideoDemoOpen, setIsVideoDemoOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [customOgImages, setCustomOgImages] = useState<Record<string, string>>({});
  const [customUrls, setCustomUrls] = useState<Record<string, string>>(() => getCustomPlatformUrls());
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() => getLocalCarouselSlides());
  const [activeSection, setActiveSection] = useState('home');

  // Keep latest snapshot refs for merging
  const latestCustomPlatformsRef = useRef<PlatformItem[]>([]);
  const latestDeletedIdsRef = useRef<string[]>([]);
  const lastSeenSyncTimeRef = useRef<number>(0);

  // Verify route after authentication state is fully initialized
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const checkRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash === '#admin' || hash.startsWith('#/admin') || path.startsWith('/admin')) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }

      if (hash === '#support' || hash.startsWith('#/support')) {
        setIsSupportOpen(true);
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);

    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, [isInitialized, isLoading]);

  // Load persistent cloud state and subscribe to all sync channels
  useEffect(() => {
    // 1. Initial fast load from localStorage for zero perceived latency
    const localOg = getCustomOgImages();
    setCustomOgImages(localOg);

    const localUrls = getCustomPlatformUrls();
    setCustomUrls(localUrls);

    const localSlides = getLocalCarouselSlides();
    setCarouselSlides(localSlides);

    const localPlatforms = getLocalCustomPlatforms();
    const localDeleted = getDeletedDefaultPlatformIds();
    latestCustomPlatformsRef.current = localPlatforms;
    latestDeletedIdsRef.current = localDeleted;
    setPlatforms(getAllPlatforms(localPlatforms, localDeleted));

    // 2. Immediate Full Cloud State Sync (Solves Incognito and Cross-Device synchronization)
    fetchFullCloudStateApi().then((cloudState) => {
      if (cloudState) {
        lastSeenSyncTimeRef.current = cloudState.lastUpdated || Date.now();

        // If cloud store has platforms, apply them
        if (cloudState.platforms && cloudState.platforms.length > 0) {
          latestCustomPlatformsRef.current = cloudState.platforms;
          saveLocalCustomPlatforms(cloudState.platforms);
          const deleted = cloudState.deletedDefaultIds || [];
          latestDeletedIdsRef.current = deleted;
          setPlatforms(getAllPlatforms(cloudState.platforms, deleted));
        }

        // Custom URLs
        if (cloudState.customUrls && Object.keys(cloudState.customUrls).length > 0) {
          setCustomUrls(cloudState.customUrls);
          safeLocalStorageSet('syncrozz_custom_platform_urls_v1', JSON.stringify(cloudState.customUrls));
        }

        // Carousel Slides
        if (cloudState.carouselSlides && cloudState.carouselSlides.length > 0) {
          setCarouselSlides(cloudState.carouselSlides);
          saveLocalCarouselSlides(cloudState.carouselSlides);
        }

        // OG Images
        if (cloudState.ogImages && Object.keys(cloudState.ogImages).length > 0) {
          setCustomOgImages((prev) => ({ ...prev, ...cloudState.ogImages }));
          safeLocalStorageSet('syncrozz_custom_og_images_v1', JSON.stringify(cloudState.ogImages));
        }

        // If local client has platforms/slides/urls that might be missing on cloud (e.g. from an existing tab before cloud sync)
        const hasUnsyncedLocalPlatforms = localPlatforms.some(lp => !cloudState.platforms.some(cp => cp.id === lp.id));
        const hasUnsyncedLocalUrls = Object.keys(localUrls).some(id => !cloudState.customUrls[id]);
        if (hasUnsyncedLocalPlatforms || hasUnsyncedLocalUrls) {
          pushClientStateApi({
            platforms: localPlatforms,
            customUrls: localUrls,
            carouselSlides: localSlides,
            deletedDefaultIds: localDeleted,
            ogImages: localOg
          }).then((merged) => {
            if (merged && merged.platforms) {
              latestCustomPlatformsRef.current = merged.platforms;
              setPlatforms(getAllPlatforms(merged.platforms, merged.deletedDefaultIds || []));
            }
          }).catch(() => {});
        }
      }
    }).catch((err) => {
      console.warn('Initial cloud sync notice:', err);
    });

    // 3. Firestore Subscriptions (active in parallel for real-time Firebase syncing)
    const unsubscribeOg = subscribeToOgImages((firestoreImages) => {
      if (firestoreImages) {
        setCustomOgImages((prev) => ({ ...prev, ...firestoreImages }));
        try {
          const current = getCustomOgImages();
          safeLocalStorageSet('syncrozz_custom_og_images_v1', JSON.stringify({ ...current, ...firestoreImages }));
        } catch {}
      }
    });

    const unsubscribePlatforms = subscribeToCustomPlatforms((firestorePlatforms) => {
      if (firestorePlatforms && firestorePlatforms.length > 0) {
        latestCustomPlatformsRef.current = firestorePlatforms;
        saveLocalCustomPlatforms(firestorePlatforms);
        const merged = getAllPlatforms(firestorePlatforms, latestDeletedIdsRef.current);
        setPlatforms(merged);
      }
    });

    const unsubscribeDeleted = subscribeToDeletedDefaultPlatforms((deletedIds) => {
      if (deletedIds) {
        latestDeletedIdsRef.current = deletedIds;
        saveDeletedDefaultPlatformIds(deletedIds);
        const merged = getAllPlatforms(latestCustomPlatformsRef.current, deletedIds);
        setPlatforms(merged);
      }
    });

    const unsubscribeUrls = subscribeToCustomPlatformUrls((urls) => {
      if (urls) {
        setCustomUrls((prev) => ({ ...prev, ...urls }));
        try {
          const current = getCustomPlatformUrls();
          safeLocalStorageSet('syncrozz_custom_platform_urls_v1', JSON.stringify({ ...current, ...urls }));
        } catch {}
      }
    });

    const unsubscribeCarousel = subscribeToCarouselSlides((firestoreSlides) => {
      if (firestoreSlides && Array.isArray(firestoreSlides) && firestoreSlides.length > 0) {
        setCarouselSlides(firestoreSlides);
        saveLocalCarouselSlides(firestoreSlides);
      }
    });

    // 4. Background polling & window focus revalidation
    // Ensures incognito tabs and separate devices update dynamically when another tab saves changes
    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const ver = await checkCloudVersionApi();
        if (ver && ver.lastUpdated > lastSeenSyncTimeRef.current) {
          lastSeenSyncTimeRef.current = ver.lastUpdated;
          const fresh = await fetchFullCloudStateApi();
          if (fresh) {
            if (fresh.platforms && fresh.platforms.length > 0) {
              latestCustomPlatformsRef.current = fresh.platforms;
              saveLocalCustomPlatforms(fresh.platforms);
              setPlatforms(getAllPlatforms(fresh.platforms, fresh.deletedDefaultIds || []));
            }
            if (fresh.customUrls) {
              setCustomUrls(fresh.customUrls);
              safeLocalStorageSet('syncrozz_custom_platform_urls_v1', JSON.stringify(fresh.customUrls));
            }
            if (fresh.carouselSlides && fresh.carouselSlides.length > 0) {
              setCarouselSlides(fresh.carouselSlides);
              saveLocalCarouselSlides(fresh.carouselSlides);
            }
            if (fresh.ogImages) {
              setCustomOgImages((prev) => ({ ...prev, ...fresh.ogImages }));
              safeLocalStorageSet('syncrozz_custom_og_images_v1', JSON.stringify(fresh.ogImages));
            }
            if (fresh.deletedDefaultIds) {
              latestDeletedIdsRef.current = fresh.deletedDefaultIds;
            }
          }
        }
      } catch {}
    }, 6000);

    const handleVisibility = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        try {
          const fresh = await fetchFullCloudStateApi();
          if (fresh) {
            lastSeenSyncTimeRef.current = fresh.lastUpdated || Date.now();
            if (fresh.platforms && fresh.platforms.length > 0) {
              latestCustomPlatformsRef.current = fresh.platforms;
              setPlatforms(getAllPlatforms(fresh.platforms, fresh.deletedDefaultIds || []));
            }
            if (fresh.customUrls) setCustomUrls(fresh.customUrls);
            if (fresh.carouselSlides) setCarouselSlides(fresh.carouselSlides);
            if (fresh.ogImages) setCustomOgImages((prev) => ({ ...prev, ...fresh.ogImages }));
          }
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 5. Same-browser cross-tab storage event synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'syncrozz_custom_platforms_v1') {
        const local = getLocalCustomPlatforms();
        setPlatforms(getAllPlatforms(local, latestDeletedIdsRef.current));
      } else if (e.key === 'syncrozz_custom_og_images_v1') {
        setCustomOgImages(getCustomOgImages());
      } else if (e.key === 'syncrozz_custom_platform_urls_v1') {
        setCustomUrls(getCustomPlatformUrls());
      } else if (e.key === 'syncrozz_hero_carousel_slides_v1') {
        setCarouselSlides(getLocalCarouselSlides());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeOg();
      unsubscribePlatforms();
      unsubscribeDeleted();
      unsubscribeUrls();
      unsubscribeCarousel();
    };
  }, []);

  // Sync authenticated user to Database
  useEffect(() => {
    if (isAuthenticated && user) {
      syncUserToDatabase({
        uid: user.id || user.email,
        email: user.email,
        displayName: user.name,
        photoUrl: user.picture
      }).catch(() => {});
    }
  }, [isAuthenticated, user]);

  // Section Observer for smooth nav highlight
  useEffect(() => {
    if (isAdminView) return;

    const sections = ['home', 'platform', 'ecosystem', 'solutions', 'why', 'kos'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminView]);

  /**
   * Navigate to Admin view with strict initialization
   */
  const navigateToAdmin = useCallback(() => {
    window.location.hash = '#admin';
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Open PIN modal if not authenticated, or navigate to Admin view if already logged in
   */
  const handleAdminAccess = useCallback(() => {
    if (isAuthenticated && (isAdmin || isMasterAdmin)) {
      navigateToAdmin();
    } else {
      setIsAdminPinModalOpen(true);
    }
  }, [isAuthenticated, isAdmin, isMasterAdmin, navigateToAdmin]);

  const navigateToSite = useCallback(() => {
    window.location.hash = '#home';
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (isAdminView) {
      setIsAdminView(false);
      window.location.hash = `#${sectionId}`;
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPlatformById = (id: string) => {
    const found = platforms.find((p) => p.id === id) || PLATFORMS_DATA.find((p) => p.id === id);
    if (found) {
      setSelectedPlatform(found);
    }
  };

  const handleSaveOgImage = (platformId: string, dataUrl: string) => {
    saveCustomOgImage(platformId, dataUrl);
    setCustomOgImages((prev) => ({
      ...prev,
      [platformId]: dataUrl
    }));
    saveOgImageApi(platformId, dataUrl, user?.token, user?.email || undefined).catch(() => {});
    saveOgImageToFirestore(platformId, dataUrl, user?.email || undefined).catch(() => {});
  };

  const handleRemoveOgImage = (platformId: string) => {
    removeCustomOgImage(platformId);
    setCustomOgImages((prev) => {
      const copy = { ...prev };
      delete copy[platformId];
      return copy;
    });
    fetch(`/api/og-images/${encodeURIComponent(platformId)}`, {
      method: 'DELETE',
      headers: {
        'x-admin-pin': '5313',
        'Authorization': 'Bearer pin_session_5313_master',
        'x-user-email': user?.email || 'admin@syncrozz.com'
      }
    }).catch(() => {});
    removeOgImageFromFirestore(platformId).catch(() => {});
  };

  const handleSaveCustomUrl = (platformId: string, url: string) => {
    saveCustomPlatformUrl(platformId, url);
    setCustomUrls((prev) => ({
      ...prev,
      [platformId]: url
    }));
    saveCustomUrlApi(platformId, url, user?.email || undefined).catch(() => {});
    saveCustomPlatformUrlToFirestore(platformId, url, user?.email || undefined).catch(() => {});
  };

  const handleRemoveCustomUrl = (platformId: string) => {
    removeCustomPlatformUrl(platformId);
    setCustomUrls((prev) => {
      const copy = { ...prev };
      delete copy[platformId];
      return copy;
    });
    removeCustomUrlApi(platformId, user?.email || undefined).catch(() => {});
    removeCustomPlatformUrlFromFirestore(platformId).catch(() => {});
  };

  const handleSavePlatform = (platform: PlatformItem, ogImageDataUrl?: string) => {
    const updated = savePlatform(platform);
    setPlatforms(updated);
    savePlatformApi(platform, user?.token, user?.email || undefined).catch(() => {});
    savePlatformToFirestore(platform, user?.email || undefined).catch(() => {});
    logAuditEventToFirestore('SAVE_PLATFORM', user?.email || 'admin', 'SUCCESS', `Platform ${platform.name} (#${platform.id}) saved.`).catch(() => {});

    if (ogImageDataUrl) {
      handleSaveOgImage(platform.id, ogImageDataUrl);
    }
  };

  const handleDeletePlatform = (platformId: string) => {
    const updated = deletePlatform(platformId);
    setPlatforms(updated);
    const updatedDeletedIds = getDeletedDefaultPlatformIds();
    saveDeletedPlatformsApi(updatedDeletedIds, user?.email || undefined).catch(() => {});
    deletePlatformApi(platformId, user?.token, user?.email || undefined).catch(() => {});
    deletePlatformFromFirestore(platformId).catch(() => {});
    logAuditEventToFirestore('DELETE_PLATFORM', user?.email || 'admin', 'SUCCESS', `Platform #${platformId} removed.`).catch(() => {});
  };

  const handleSaveCarouselSlides = (updatedSlides: CarouselSlide[]) => {
    setCarouselSlides(updatedSlides);
    saveLocalCarouselSlides(updatedSlides);
    saveCarouselSlidesApi(updatedSlides, user?.email || undefined).catch(() => {});
    saveCarouselSlidesToFirestore(updatedSlides, user?.email || undefined).catch(() => {});
    logAuditEventToFirestore('UPDATE_CAROUSEL', user?.email || 'admin', 'SUCCESS', `Hero Carousel updated (${updatedSlides.length} slides).`).catch(() => {});
  };

  // IF ADMIN VIEW: Render Protected Admin Route
  if (isAdminView) {
    return (
      <AdminLayout
        onExitToWebsite={navigateToSite}
        customOgImages={customOgImages}
        customUrls={customUrls}
        onSaveOgImage={handleSaveOgImage}
        onRemoveOgImage={handleRemoveOgImage}
        onSaveCustomUrl={handleSaveCustomUrl}
        onRemoveCustomUrl={handleRemoveCustomUrl}
        platforms={platforms}
        onSavePlatform={handleSavePlatform}
        onDeletePlatform={handleDeletePlatform}
        carouselSlides={carouselSlides}
        onSaveCarouselSlides={handleSaveCarouselSlides}
      />
    );
  }

  // PUBLIC WEBSITE VIEW
  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Fixed Sticky Navigation */}
      <Navbar
        onExploreClick={() => scrollToSection('platform')}
        onContactClick={() => setIsContactOpen(true)}
        onLogoClick={() => scrollToSection('home')}
        activeSection={activeSection}
        isAdminMode={isAdminMode}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onAdminClick={handleAdminAccess}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* 1. Hero Section with Dynamic Auto-Swap Carousel */}
        <Hero
          onExploreClick={() => scrollToSection('platform')}
          onVideoDemoClick={() => setIsVideoDemoOpen(true)}
          carouselSlides={carouselSlides}
        />

        {/* 2. Trust / Value Strip */}
        <TrustStrip />

        {/* 3. Platform Section ("Satu Platform, Banyak Penyelesaian") */}
        <PlatformSection
          platforms={platforms}
          onSelectPlatform={(platform) => setSelectedPlatform(platform)}
          customOgImages={customOgImages}
          customUrls={customUrls}
          onSaveOgImage={handleSaveOgImage}
          onRemoveOgImage={handleRemoveOgImage}
          isAdminMode={isAdminMode}
          onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
          onAdminClick={handleAdminAccess}
          onAddPlatformClick={() => setIsAddPlatformModalOpen(true)}
          selectedCategory={selectedCategoryFilter}
          onSelectCategoryFilter={setSelectedCategoryFilter}
        />

        {/* 4. Ecosystem Visual ("Flow") */}
        <EcosystemFlow />

        {/* 5. Categories Section ("Solutions") */}
        <CategoriesSection
          platforms={platforms}
          onSelectCategory={(category) => {
            setSelectedCategoryFilter(category as any);
            scrollToSection('platform');
          }}
        />

        {/* 6. Why SYNCROZZ ("Teknologi Yang Dibina Untuk Memudahkan") */}
        <WhySyncrozz />

        {/* 7. Value & Cost Estimator ("Kos") */}
        <CostCalculator
          onContactClick={() => setIsContactOpen(true)}
        />

        {/* 8. Call To Action Section */}
        <CtaSection
          onExploreClick={() => scrollToSection('platform')}
          onContactClick={() => setIsContactOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onPlatformClick={handleSelectPlatformById}
        onContactClick={() => setIsContactOpen(true)}
        onAdminClick={handleAdminAccess}
        onSupportClick={() => setIsSupportOpen(true)}
      />

      {/* Modals */}
      <PlatformModal
        platform={selectedPlatform}
        onClose={() => setSelectedPlatform(null)}
        onContactClick={() => setIsContactOpen(true)}
        customOgImages={customOgImages}
        onSaveOgImage={handleSaveOgImage}
        isAdminMode={isAdminMode}
      />

      {/* Quick Add Platform Modal for Admins */}
      <PlatformFormModal
        isOpen={isAddPlatformModalOpen}
        onClose={() => setIsAddPlatformModalOpen(false)}
        onSave={handleSavePlatform}
        existingIds={platforms.map(p => p.id)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => {
          setIsSupportOpen(false);
          if (window.location.hash === '#support' || window.location.hash.startsWith('#/support')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
      />

      <VideoDemoModal
        isOpen={isVideoDemoOpen}
        onClose={() => setIsVideoDemoOpen(false)}
        onExploreClick={() => scrollToSection('platform')}
      />

      {/* Admin PIN Access Modal (Keyboard-first, auto-focus, auto-submit) */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={navigateToAdmin}
      />

      {/* Admin Mode Modal for Open Graph Image Uploads */}
      <AdminOgModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        customOgImages={customOgImages}
        onSaveOgImage={handleSaveOgImage}
        onRemoveOgImage={handleRemoveOgImage}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
