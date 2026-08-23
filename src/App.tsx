import React, { useState, useEffect } from 'react';
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
import { PLATFORMS_DATA } from './data/platforms';
import { PlatformItem } from './types';

export default function App() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isVideoDemoOpen, setIsVideoDemoOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Handle active section on scroll
  useEffect(() => {
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
  }, []);

  const scrollToSection = (sectionId: string) => {
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

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Fixed Sticky Navigation */}
      <Navbar
        onExploreClick={() => scrollToSection('platform')}
        onContactClick={() => setIsContactOpen(true)}
        activeSection={activeSection}
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
      />

      {/* Modals */}
      <PlatformModal
        platform={selectedPlatform}
        onClose={() => setSelectedPlatform(null)}
        onContactClick={() => setIsContactOpen(true)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <VideoDemoModal
        isOpen={isVideoDemoOpen}
        onClose={() => setIsVideoDemoOpen(false)}
        onExploreClick={() => scrollToSection('platform')}
      />

    </div>
  );
}
