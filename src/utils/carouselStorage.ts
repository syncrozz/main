export interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  badge?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
}

export const DEFAULT_HERO_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    title: 'Ekosistem SYNCROZZ Pintar',
    subtitle: 'Penyelesaian digital integrasi penuh untuk sekolah, institusi dan komuniti.',
    imageUrl: 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/OGI/OGI.MAINv2.jpg',
    badge: 'Ekosistem Digital',
    linkUrl: '#platform',
    order: 1,
    isActive: true
  },
  {
    id: 'slide-2',
    title: 'Staff Attend & Imbasan QR',
    subtitle: 'Sistem kehadiran GPS & imbasan pantas tanpa perkakasan rumit.',
    imageUrl: 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/OGI/OGI.ATTEND.jpg',
    badge: 'Produktiviti & Kehadiran',
    linkUrl: '#platform',
    order: 2,
    isActive: true
  },
  {
    id: 'slide-3',
    title: 'Pengurusan Tugas & Kolaborasi',
    subtitle: 'URUSTEAM & buku program digital untuk melancarkan acara dan pentadbiran.',
    imageUrl: 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/OGI/OGI.URUSTEAM.jpg',
    badge: 'Urus Pasukan',
    linkUrl: '#platform',
    order: 3,
    isActive: true
  }
];

const CAROUSEL_STORAGE_KEY = 'syncrozz_hero_carousel_slides_v1';

export function getLocalCarouselSlides(): CarouselSlide[] {
  try {
    const raw = localStorage.getItem(CAROUSEL_STORAGE_KEY);
    if (!raw) return DEFAULT_HERO_CAROUSEL_SLIDES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_HERO_CAROUSEL_SLIDES;
  } catch {
    return DEFAULT_HERO_CAROUSEL_SLIDES;
  }
}

export function saveLocalCarouselSlides(slides: CarouselSlide[]): void {
  try {
    localStorage.setItem(CAROUSEL_STORAGE_KEY, JSON.stringify(slides));
  } catch (err) {
    console.error('Failed to save slides locally:', err);
  }
}
