import React, { useState, useEffect, useCallback } from 'react';
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
import { getCustomOgImages, saveCustomOgImage, removeCustomOgImage } from './utils/ogStorage';
import { 
  getAllPlatforms, 
  savePlatform, 
  deletePlatform 
} from './utils/platformStorage';
import { 
  saveOgImageToFirestore, 
  removeOgImageFromFirestore, 
  subscribeToOgImages,
  savePlatformToFirestore,
  deletePlatformFromFirestore,
  subscribeToCustomPlatforms,
  subscribeToCustomPlatformUrls,
  subscribeToDeletedDefaultPlatforms,
  logAuditEventToFirestore
} from './services/firestoreService';

function MainAppContent() {
  const { user, isAuthenticated, isAdmin, isMasterAdmin, isInitialized, isLoading } = useAuth();
  const [isAdminView, setIsAdminView] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformItem[]>(() => getAllPlatforms());
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isVideoDemoOpen, setIsVideoDemoOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [customOgImages, setCustomOgImages] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('home');

  // Keep latest snapshot refs for merging
  const latestCustomPlatformsRef = React.useRef<PlatformItem[]>([]);
  const latestDeletedIdsRef = React.useRef<string[]>([]);

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

  // Load custom OG images and subscribe to Firestore
  useEffect(() => {
    // 1. Initial load from localStorage
    const local = getCustomOgImages();
    setCustomOgImages(local);

    // 2. Real-time sync OG images from Firestore
    const unsubscribeOg = subscribeToOgImages((firestoreImages) => {
      if (firestoreImages && Object.keys(firestoreImages).length > 0) {
        setCustomOgImages((prev) => ({
          ...prev,
          ...firestoreImages
        }));
      }
    });

    // 3. Real-time sync Custom Platforms & Deleted Platforms from Firestore
    const unsubscribePlatforms = subscribeToCustomPlatforms((firestorePlatforms) => {
      latestCustomPlatformsRef.current = firestorePlatforms || [];
      const merged = getAllPlatforms(latestCustomPlatformsRef.current, latestDeletedIdsRef.current);
      setPlatforms(merged);
    });

    const unsubscribeDeleted = subscribeToDeletedDefaultPlatforms((deletedIds) => {
      latestDeletedIdsRef.current = deletedIds || [];
      const merged = getAllPlatforms(latestCustomPlatformsRef.current, latestDeletedIdsRef.current);
      setPlatforms(merged);
    });

    // 4. Real-time sync Custom Platform URLs
    const unsubscribeUrls = subscribeToCustomPlatformUrls((urls) => {
      if (urls && Object.keys(urls).length > 0) {
        try {
          const current = JSON.parse(localStorage.getItem('syncrozz_custom_platform_urls_v1') || '{}');
          localStorage.setItem('syncrozz_custom_platform_urls_v1', JSON.stringify({ ...current, ...urls }));
        } catch {}
      }
    });

    return () => {
      unsubscribeOg();
      unsubscribePlatforms();
      unsubscribeDeleted();
      unsubscribeUrls();
    };
  }, []);

  // Handle active section on scroll
  useEffect(() => {
    if (isAdminView) return;

    const handleScroll = () => {
      const sections = ['home', 'platform', 'flow', 'solutions', 'kos', 'about', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
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
    saveOgImageToFirestore(platformId, dataUrl, user?.email || undefined).catch(() => {});
    setCustomOgImages((prev) => ({
      ...prev,
      [platformId]: dataUrl
    }));
  };

  const handleRemoveOgImage = (platformId: string) => {
    removeCustomOgImage(platformId);
    removeOgImageFromFirestore(platformId).catch(() => {});
    setCustomOgImages((prev) => {
      const copy = { ...prev };
      delete copy[platformId];
      return copy;
    });
  };

  const handleSavePlatform = (platform: PlatformItem, ogImageDataUrl?: string) => {
    const updated = savePlatform(platform);
    setPlatforms(updated);
    savePlatformToFirestore(platform, user?.email || undefined).catch(() => {});
    logAuditEventToFirestore('SAVE_PLATFORM', user?.email || 'admin', 'SUCCESS', `Platform ${platform.name} (#${platform.id}) saved.`).catch(() => {});

    if (ogImageDataUrl) {
      handleSaveOgImage(platform.id, ogImageDataUrl);
    }
  };

  const handleDeletePlatform = (platformId: string) => {
    const updated = deletePlatform(platformId);
    setPlatforms(updated);
    deletePlatformFromFirestore(platformId).catch(() => {});
    logAuditEventToFirestore('DELETE_PLATFORM', user?.email || 'admin', 'SUCCESS', `Platform #${platformId} removed.`).catch(() => {});
  };

  // IF ADMIN VIEW: Render Protected Admin Route
  if (isAdminView) {
    return (
      <AdminLayout
        onExitToWebsite={navigateToSite}
        customOgImages={customOgImages}
        onSaveOgImage={handleSaveOgImage}
        onRemoveOgImage={handleRemoveOgImage}
        platforms={platforms}
        onSavePlatform={handleSavePlatform}
        onDeletePlatform={handleDeletePlatform}
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
        {/* 1. Hero Section */}
        <Hero
          onExploreClick={() => scrollToSection('platform')}
          onVideoDemoClick={() => setIsVideoDemoOpen(true)}
        />

        {/* 2. Trust / Value Strip */}
        <TrustStrip />

        {/* 3. Platform Section ("Satu Platform, Banyak Penyelesaian") */}
        <PlatformSection
          platforms={platforms}
          onSelectPlatform={(platform) => setSelectedPlatform(platform)}
          customOgImages={customOgImages}
          onSaveOgImage={handleSaveOgImage}
          onRemoveOgImage={handleRemoveOgImage}
          isAdminMode={isAdminMode}
          onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
          onAdminClick={handleAdminAccess}
          onAddPlatformClick={() => setIsAddPlatformModalOpen(true)}
        />

        {/* 4. Ecosystem Visual ("Flow") */}
        <EcosystemFlow />

        {/* 5. Categories Section ("Solutions") */}
        <CategoriesSection
          onSelectCategory={(category) => {
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
