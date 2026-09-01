import { safeLocalStorageGet, safeLocalStorageSet } from './safeStorage';
import { compressDataUrl } from './imageCompressor';

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
    const raw = safeLocalStorageGet<string | null>(CAROUSEL_STORAGE_KEY, null);
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

export async function sanitizeAndCompressSlides(slides: CarouselSlide[]): Promise<CarouselSlide[]> {
  const processed = await Promise.all(
    slides.map(async (slide) => {
      if (slide.imageUrl && slide.imageUrl.startsWith('data:image/') && slide.imageUrl.length > 80000) {
        try {
          const compressed = await compressDataUrl(slide.imageUrl, { maxWidth: 1200, maxHeight: 675, quality: 0.8 });
          return { ...slide, imageUrl: compressed };
        } catch {
          return slide;
        }
      }
      return slide;
    })
  );
  return processed;
}

export function saveLocalCarouselSlides(slides: CarouselSlide[]): void {
  try {
    safeLocalStorageSet(CAROUSEL_STORAGE_KEY, JSON.stringify(slides));
  } catch (err) {
    console.warn('Could not save carousel slides to local storage:', err);
  }
}
