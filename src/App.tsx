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
import { SupportModal } from './components/SupportModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { PLATFORMS_DATA } from './data/platforms';
import { PlatformItem } from './types';
import { getCustomOgImages, saveCustomOgImage, removeCustomOgImage } from './utils/ogStorage';
import { 
  saveOgImageToFirestore, 
  removeOgImageFromFirestore, 
  subscribeToOgImages 
} from './services/firestoreService';

function MainAppContent() {
  const { user, isInitialized, isLoading } = useAuth();
  const [isAdminView, setIsAdminView] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isVideoDemoOpen, setIsVideoDemoOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [customOgImages, setCustomOgImages] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('home');

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

  // Load custom OG images on mount and subscribe to Firestore
  useEffect(() => {
    // 1. Initial load from localStorage
    const local = getCustomOgImages();
    setCustomOgImages(local);

    // 2. Real-time sync from Firestore
    const unsubscribe = subscribeToOgImages((firestoreImages) => {
      if (firestoreImages && Object.keys(firestoreImages).length > 0) {
        setCustomOgImages((prev) => ({
          ...prev,
          ...firestoreImages
        }));
      }
    });

    return () => unsubscribe();
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
   * Navigate to Admin view with strict initialization & email verification
   */
  const navigateToAdmin = useCallback(() => {
    // 1. Verify that authentication state is fully initialized
    if (!isInitialized || isLoading) {
      console.warn('Authentication state is not yet initialized.');
      return;
    }

    // 2. Explicitly navigate to admin view
    window.location.hash = '#admin';
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isInitialized, isLoading]);

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
    const found = PLATFORMS_DATA.find((p) => p.id === id);
    if (found) {
      setSelectedPlatform(found);
    }
  };

  const handleSaveOgImage = (platformId: string, dataUrl: string) => {
    saveCustomOgImage(platformId, dataUrl);
    saveOgImageToFirestore(platformId, dataUrl).catch(() => {});
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

  // IF ADMIN VIEW: Render Protected Admin Route
  if (isAdminView) {
    return (
      <AdminLayout
        onExitToWebsite={navigateToSite}
        customOgImages={customOgImages}
        onSaveOgImage={handleSaveOgImage}
        onRemoveOgImage={handleRemoveOgImage}
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
        activeSection={activeSection}
        isAdminMode={isAdminMode}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onAdminClick={navigateToAdmin}
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
          onSelectPlatform={(platform) => setSelectedPlatform(platform)}
          customOgImages={customOgImages}
          onSaveOgImage={handleSaveOgImage}
          onRemoveOgImage={handleRemoveOgImage}
          isAdminMode={isAdminMode}
          onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
          onAdminClick={navigateToAdmin}
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
        onAdminClick={navigateToAdmin}
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
