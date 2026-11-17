import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { PlatformSection } from './components/PlatformSection';
import { WhatsAppContactSection } from './components/WhatsAppContactSection';
import { Footer } from './components/Footer';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { SupportModal } from './components/SupportModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { PlatformItem, PlatformCategory } from './types';
import { CarouselSlide, getLocalCarouselSlides, saveLocalCarouselSlides } from './utils/carouselStorage';
import { compressDataUrl } from './utils/imageCompressor';
import {
  getCustomOgImages,
  saveCustomOgImage,
  removeCustomOgImage,
  getCustomPlatformUrls,
  saveCustomPlatformUrl,
  removeCustomPlatformUrl,
} from './utils/ogStorage';
import {
  getAllPlatforms,
  savePlatform,
  deletePlatform,
  saveLocalCustomPlatforms,
  saveDeletedDefaultPlatformIds,
  getLocalCustomPlatforms,
  getDeletedDefaultPlatformIds,
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
  logAuditEventToFirestore,
  testConnection,
} from './services/firestoreService';
import { initFirebaseAnalytics } from './lib/firebase';
import { safeLocalStorageSet } from './utils/safeStorage';
import {
  fetchFullCloudStateApi,
  checkCloudVersionApi,
  pushClientStateApi,
  savePlatformApi,
  saveMultiplePlatformsApi,
  deletePlatformApi,
  saveCustomUrlApi,
  removeCustomUrlApi,
  saveCarouselSlidesApi,
  saveDeletedPlatformsApi,
  saveOgImageApi,
  removeOgImageApi,
  syncUserToDatabase,
} from './services/apiService';

function MainAppContent() {
  const { user, isAuthenticated, isInitialized, isLoading } = useAuth();
  const [isAdminView, setIsAdminView] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformItem[]>(() => getAllPlatforms());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<PlatformCategory>('All');
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
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

    // Validate Firestore connectivity & initialize optional Analytics safely
    testConnection().catch(() => {});
    initFirebaseAnalytics().catch(() => {});

    // Immediate Full Cloud State Sync
    fetchFullCloudStateApi()
      .then((cloudState) => {
        if (cloudState) {
          lastSeenSyncTimeRef.current = cloudState.lastUpdated || Date.now();

          if (Array.isArray(cloudState.platforms)) {
            latestCustomPlatformsRef.current = cloudState.platforms;
            saveLocalCustomPlatforms(cloudState.platforms);
            const deleted = cloudState.deletedDefaultIds || [];
            latestDeletedIdsRef.current = deleted;
            setPlatforms(getAllPlatforms(cloudState.platforms, deleted));
          }

          if (cloudState.customUrls) {
            setCustomUrls(cloudState.customUrls);
            safeLocalStorageSet('syncrozz_custom_platform_urls_v1', JSON.stringify(cloudState.customUrls));
          }

          if (Array.isArray(cloudState.carouselSlides)) {
            setCarouselSlides(cloudState.carouselSlides);
            saveLocalCarouselSlides(cloudState.carouselSlides);
          }

          if (cloudState.ogImages) {
            setCustomOgImages((prev) => ({ ...prev, ...cloudState.ogImages }));
            safeLocalStorageSet('syncrozz_custom_og_images_v1', JSON.stringify(cloudState.ogImages));
          }
        }
      })
      .catch((err) => {
        console.warn('Initial cloud sync notice:', err);
      });

    // Firestore Subscriptions
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
      if (Array.isArray(firestorePlatforms)) {
        latestCustomPlatformsRef.current = firestorePlatforms;
        saveLocalCustomPlatforms(firestorePlatforms);
        const merged = getAllPlatforms(firestorePlatforms, latestDeletedIdsRef.current);
        setPlatforms(merged);
      }
    });

    const unsubscribeDeleted = subscribeToDeletedDefaultPlatforms((deletedIds) => {
      if (Array.isArray(deletedIds)) {
        latestDeletedIdsRef.current = deletedIds;
        saveDeletedDefaultPlatformIds(deletedIds, false);
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
      if (Array.isArray(firestoreSlides)) {
        setCarouselSlides(firestoreSlides);
        saveLocalCarouselSlides(firestoreSlides);
      }
    });

    // Background polling & window focus revalidation
    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const ver = await checkCloudVersionApi();
        if (ver && ver.lastUpdated > lastSeenSyncTimeRef.current) {
          lastSeenSyncTimeRef.current = ver.lastUpdated;
          const fresh = await fetchFullCloudStateApi();
          if (fresh) {
            if (Array.isArray(fresh.platforms)) {
              latestCustomPlatformsRef.current = fresh.platforms;
              saveLocalCustomPlatforms(fresh.platforms);
              const deleted = fresh.deletedDefaultIds || [];
              latestDeletedIdsRef.current = deleted;
              setPlatforms(getAllPlatforms(fresh.platforms, deleted));
            }
            if (fresh.customUrls) {
              setCustomUrls(fresh.customUrls);
              safeLocalStorageSet('syncrozz_custom_platform_urls_v1', JSON.stringify(fresh.customUrls));
            }
            if (Array.isArray(fresh.carouselSlides) && fresh.carouselSlides.length > 0) {
              setCarouselSlides(fresh.carouselSlides);
              saveLocalCarouselSlides(fresh.carouselSlides);
            }
            if (fresh.ogImages) {
              setCustomOgImages((prev) => ({ ...prev, ...fresh.ogImages }));
              safeLocalStorageSet('syncrozz_custom_og_images_v1', JSON.stringify(fresh.ogImages));
            }
            if (Array.isArray(fresh.deletedDefaultIds)) {
              latestDeletedIdsRef.current = fresh.deletedDefaultIds;
              saveDeletedDefaultPlatformIds(fresh.deletedDefaultIds, false);
            }
          }
        }
      } catch {}
    }, 3500);

    const handleVisibility = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        try {
          const fresh = await fetchFullCloudStateApi();
          if (fresh) {
            lastSeenSyncTimeRef.current = fresh.lastUpdated || Date.now();
            if (Array.isArray(fresh.platforms)) {
              latestCustomPlatformsRef.current = fresh.platforms;
              saveLocalCustomPlatforms(fresh.platforms);
              const deleted = fresh.deletedDefaultIds || [];
              latestDeletedIdsRef.current = deleted;
              setPlatforms(getAllPlatforms(fresh.platforms, deleted));
            }
            if (fresh.customUrls) {
              setCustomUrls(fresh.customUrls);
              safeLocalStorageSet('syncrozz_custom_platform_urls_v1', JSON.stringify(fresh.customUrls));
            }
            if (Array.isArray(fresh.carouselSlides) && fresh.carouselSlides.length > 0) {
              setCarouselSlides(fresh.carouselSlides);
              saveLocalCarouselSlides(fresh.carouselSlides);
            }
            if (fresh.ogImages) {
              setCustomOgImages((prev) => ({ ...prev, ...fresh.ogImages }));
              safeLocalStorageSet('syncrozz_custom_og_images_v1', JSON.stringify(fresh.ogImages));
            }
            if (Array.isArray(fresh.deletedDefaultIds)) {
              latestDeletedIdsRef.current = fresh.deletedDefaultIds;
              saveDeletedDefaultPlatformIds(fresh.deletedDefaultIds, false);
            }
          }
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // Same-browser cross-tab storage event synchronization
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
      window.removeEventListener('focus', handleVisibility);
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
    if (isAuthenticated && user?.token) {
      syncUserToDatabase(user.token).catch(() => {});
    }
  }, [isAuthenticated, user?.id, user?.token]);

  // Section Observer for active nav underline
  useEffect(() => {
    if (isAdminView) return;

    const sections = ['home', 'platforms', 'about', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminView]);

  const navigateToAdmin = useCallback(() => {
    window.location.hash = '#admin';
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAdminAccess = useCallback(() => {
    navigateToAdmin();
  }, [navigateToAdmin]);

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

  const handleSaveOgImage = async (platformId: string, dataUrl: string) => {
    let finalUrl = dataUrl;
    if (dataUrl.startsWith('data:image/') && dataUrl.length > 80000) {
      try {
        finalUrl = await compressDataUrl(dataUrl, { maxWidth: 1200, maxHeight: 630, quality: 0.85 });
      } catch {}
    }

    saveCustomOgImage(platformId, finalUrl);
    setCustomOgImages((prev) => {
      const updated = { ...prev, [platformId]: finalUrl };
      pushClientStateApi({ ogImages: updated }, user?.token).catch(() => {});
      return updated;
    });
    saveOgImageApi(platformId, finalUrl, user?.token).catch(() => {});
    saveOgImageToFirestore(platformId, finalUrl, user?.email || undefined).catch(() => {});
  };

  const handleRemoveOgImage = (platformId: string) => {
    removeCustomOgImage(platformId);
    setCustomOgImages((prev) => {
      const copy = { ...prev };
      delete copy[platformId];
      pushClientStateApi({ ogImages: copy }, user?.token).catch(() => {});
      return copy;
    });
    removeOgImageApi(platformId, user?.token).catch(() => {});
    removeOgImageFromFirestore(platformId).catch(() => {});
  };

  const handleSaveCustomUrl = (platformId: string, url: string) => {
    saveCustomPlatformUrl(platformId, url);
    setCustomUrls((prev) => {
      const updated = { ...prev, [platformId]: url };
      pushClientStateApi({ customUrls: updated }, user?.token).catch(() => {});
      return updated;
    });
    saveCustomUrlApi(platformId, url, user?.token).catch(() => {});
    saveCustomPlatformUrlToFirestore(platformId, url, user?.email || undefined).catch(() => {});
  };

  const handleRemoveCustomUrl = (platformId: string) => {
    removeCustomPlatformUrl(platformId);
    setCustomUrls((prev) => {
      const copy = { ...prev };
      delete copy[platformId];
      pushClientStateApi({ customUrls: copy }, user?.token).catch(() => {});
      return copy;
    });
    removeCustomUrlApi(platformId, user?.token).catch(() => {});
    removeCustomPlatformUrlFromFirestore(platformId).catch(() => {});
  };

  const handleSavePlatform = (platform: PlatformItem, ogImageDataUrl?: string) => {
    const updated = savePlatform(platform);
    setPlatforms(updated);
    const customPlatforms = getLocalCustomPlatforms();
    latestCustomPlatformsRef.current = customPlatforms;

    savePlatformApi(platform, user?.token).catch(() => {});
    pushClientStateApi(
      {
        platforms: customPlatforms,
        deletedDefaultIds: latestDeletedIdsRef.current,
      },
      user?.token
    ).catch(() => {});

    savePlatformToFirestore(platform, user?.email || undefined).catch(() => {});
    logAuditEventToFirestore(
      'SAVE_PLATFORM',
      user?.email || 'admin',
      'SUCCESS',
      `Platform ${platform.name} (#${platform.id}) saved.`
    ).catch(() => {});

    if (ogImageDataUrl) {
      handleSaveOgImage(platform.id, ogImageDataUrl);
    }
  };

  const handleSaveMultiplePlatforms = (newPlatforms: PlatformItem[]) => {
    if (!newPlatforms || newPlatforms.length === 0) return;
    const current = getLocalCustomPlatforms();
    const deletedIds = getDeletedDefaultPlatformIds();
    const map = new Map<string, PlatformItem>(current.map((p) => [p.id, p]));
    const now = Date.now();

    newPlatforms.forEach((p, idx) => {
      const existing = map.get(p.id);
      map.set(p.id, {
        ...p,
        createdAt: p.createdAt || existing?.createdAt || now,
        updatedAt: now + idx,
        isCustom: p.isCustom ?? existing?.isCustom ?? true,
      });
    });

    const updatedCustom = Array.from(map.values());
    saveLocalCustomPlatforms(updatedCustom);
    latestCustomPlatformsRef.current = updatedCustom;
    setPlatforms(getAllPlatforms(updatedCustom, deletedIds));

    saveMultiplePlatformsApi(newPlatforms, user?.token).catch(() => {});
    pushClientStateApi(
      {
        platforms: updatedCustom,
        deletedDefaultIds: deletedIds,
      },
      user?.token
    ).catch(() => {});

    newPlatforms.forEach((p) => {
      savePlatformToFirestore(p, user?.email || undefined).catch(() => {});
    });
    logAuditEventToFirestore(
      'BATCH_SAVE_PLATFORMS',
      user?.email || 'admin',
      'SUCCESS',
      `Batch saved ${newPlatforms.length} platforms.`
    ).catch(() => {});
  };

  const handleDeletePlatform = (platformId: string) => {
    const updated = deletePlatform(platformId);
    setPlatforms(updated);
    const updatedDeletedIds = getDeletedDefaultPlatformIds();
    const updatedCustom = getLocalCustomPlatforms();
    latestCustomPlatformsRef.current = updatedCustom;
    latestDeletedIdsRef.current = updatedDeletedIds;

    pushClientStateApi(
      {
        platforms: updatedCustom,
        deletedDefaultIds: updatedDeletedIds,
      },
      user?.token
    ).catch(() => {});

    saveDeletedPlatformsApi(updatedDeletedIds, user?.token).catch(() => {});
    deletePlatformApi(platformId, user?.token).catch(() => {});
    deletePlatformFromFirestore(platformId).catch(() => {});
    logAuditEventToFirestore(
      'DELETE_PLATFORM',
      user?.email || 'admin',
      'SUCCESS',
      `Platform #${platformId} removed.`
    ).catch(() => {});
  };

  const handleSaveCarouselSlides = (updatedSlides: CarouselSlide[]) => {
    setCarouselSlides(updatedSlides);
    saveLocalCarouselSlides(updatedSlides);
    saveCarouselSlidesApi(updatedSlides, user?.token).catch(() => {});
    pushClientStateApi(
      { carouselSlides: updatedSlides },
      user?.token
    ).catch(() => {});
    saveCarouselSlidesToFirestore(updatedSlides, user?.email || undefined).catch(() => {});
    logAuditEventToFirestore(
      'UPDATE_CAROUSEL',
      user?.email || 'admin',
      'SUCCESS',
      `Hero Carousel updated (${updatedSlides.length} slides).`
    ).catch(() => {});
  };

  // Protected Admin Route
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
        onSaveMultiplePlatforms={handleSaveMultiplePlatforms}
        onDeletePlatform={handleDeletePlatform}
        carouselSlides={carouselSlides}
        onSaveCarouselSlides={handleSaveCarouselSlides}
      />
    );
  }

  // Minimal Premium Platform Showcase Public Homepage
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-[#0056D2] selection:text-white">
      {/* Section 1: Minimal Navigation */}
      <Navbar
        onExploreClick={() => scrollToSection('platforms')}
        onContactClick={() => scrollToSection('contact')}
        onLogoClick={() => scrollToSection('home')}
        activeSection={activeSection}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Section 2: Hero Carousel (Immediately after Navigation) */}
        <section
          id="home"
          className="pt-20 pb-8 sm:pt-24 sm:pb-12 bg-slate-50/50 border-b border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HeroCarousel
              slides={carouselSlides}
              onExplorePlatforms={() => scrollToSection('platforms')}
            />
          </div>
        </section>

        {/* Section 3: Available Platforms Directory (Grid Card) */}
        <PlatformSection
          platforms={platforms}
          customOgImages={customOgImages}
          customUrls={customUrls}
          selectedCategory={selectedCategoryFilter}
          onSelectCategoryFilter={setSelectedCategoryFilter}
        />

        {/* Section 4: Concise About & Direct WhatsApp Contact */}
        <WhatsAppContactSection />
      </main>

      {/* Section 5: Minimal Footer */}
      <Footer
        onOpenLegal={(doc) => setLegalDoc(doc)}
        onContactClick={() => scrollToSection('contact')}
        onAdminClick={handleAdminAccess}
      />

      {/* Legal Policy Modal (Privacy Policy & Terms of Use) */}
      <LegalModal docType={legalDoc} onClose={() => setLegalDoc(null)} />

      {/* Support Modal (Preserved for #support route) */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => {
          setIsSupportOpen(false);
          if (window.location.hash === '#support' || window.location.hash.startsWith('#/support')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
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
