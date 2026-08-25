import { PlatformItem } from '../types';
import { SYNCROZZ_OGI_OFFICIAL, SYNCROZZ_PRIMARY_LOGO } from '../data/syncrozzAssets';

const STORAGE_KEY = 'syncrozz_custom_og_images_v1';
const PLATFORM_URLS_STORAGE_KEY = 'syncrozz_custom_platform_urls_v1';

export function getOfficialMasterOgImage(): string {
  return SYNCROZZ_OGI_OFFICIAL.rawUrl;
}

export function getCustomPlatformUrls(): Record<string, string> {
  try {
    const data = localStorage.getItem(PLATFORM_URLS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load custom platform URLs from storage', e);
    return {};
  }
}

export function saveCustomPlatformUrl(platformId: string, url: string): void {
  try {
    const current = getCustomPlatformUrls();
    current[platformId] = url;
    localStorage.setItem(PLATFORM_URLS_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save custom platform URL', e);
  }
}

export function removeCustomPlatformUrl(platformId: string): void {
  try {
    const current = getCustomPlatformUrls();
    delete current[platformId];
    localStorage.setItem(PLATFORM_URLS_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to remove custom platform URL', e);
  }
}

export function getCustomOgImages(): Record<string, string> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load custom OG images from storage', e);
    return {};
  }
}

export function saveCustomOgImage(platformId: string, dataUrl: string): void {
  try {
    const current = getCustomOgImages();
    current[platformId] = dataUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save custom OG image', e);
  }
}

export function removeCustomOgImage(platformId: string): void {
  try {
    const current = getCustomOgImages();
    delete current[platformId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to remove custom OG image', e);
  }
}

/**
 * Generate a high quality 1200x630 Open Graph card SVG data URI
 * Design Language: White / Light / Modern / Clean / Premium Corporate
 * Direct Visual Continuity with OGI.MAINv2.jpg:
 * - Asymmetrical left-right composition
 * - Left: Strong typography hierarchy, category pill, title, tagline, description, domain badge
 * - Right: Technology / dashboard / hero device visual mockup with layered translucent circles & soft shadows
 * - Palette: SYNCROZZ Blue (#0056D2) + Dark Navy (#0F172A) + Clean White (#FFFFFF) + Ice Blue (#EFF6FF)
 */
export function generateDefaultOgImage(item?: Partial<PlatformItem> | null): string {
  const safeItem = item || {};
  const fullName = `${safeItem.name || 'SYNCROZZ'} ${safeItem.subName || ''}`.trim();
  const category = (safeItem.category || 'PLATFORM').toUpperCase();
  const accent = safeItem.accentColor || '#0056D2';
  const tagline = safeItem.tagline || 'Inovasi Digital & Automasi Pintar';
  const description = safeItem.description || 'Penyelesaian digital pintar untuk pendidikan, produktiviti dan inovasi digital.';
  const id = safeItem.id || 'app';
  const status = safeItem.status || 'Aktif';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <!-- Background subtle light corporate gradient -->
      <linearGradient id="lightBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="60%" stop-color="#F8FAFC"/>
        <stop offset="100%" stop-color="#EFF6FF"/>
      </linearGradient>

      <!-- Primary Brand Gradient -->
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0056D2"/>
        <stop offset="100%" stop-color="#0284C7"/>
      </linearGradient>

      <!-- Glass Mockup Shimmer -->
      <linearGradient id="glassCard" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#F1F5F9" stop-opacity="0.9"/>
      </linearGradient>

      <!-- Drop Shadows -->
      <filter id="cardShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0F172A" flood-opacity="0.08"/>
      </filter>
      <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="60" result="blur"/>
      </filter>
      
      <!-- Subtle Grid Pattern -->
      <pattern id="subtleGrid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#E2E8F0" stroke-width="1" opacity="0.6"/>
      </pattern>
    </defs>
    
    <!-- Base Background -->
    <rect width="1200" height="630" fill="url(#lightBg)"/>
    <rect width="1200" height="630" fill="url(#subtleGrid)"/>

    <!-- Right Side Decorative Layered Circles & Ambient Glow (Asymmetrical) -->
    <circle cx="1050" cy="180" r="320" fill="#0056D2" opacity="0.06" filter="url(#glowFilter)"/>
    <circle cx="920" cy="480" r="260" fill="#38BDF8" opacity="0.08" filter="url(#glowFilter)"/>
    <circle cx="1120" cy="315" r="220" fill="none" stroke="#0056D2" stroke-width="1.5" opacity="0.12" stroke-dasharray="6 6"/>
    <circle cx="1120" cy="315" r="340" fill="none" stroke="#94A3B8" stroke-width="1" opacity="0.15"/>

    <!-- TOP HEADER BAR -->
    <!-- Left: Brand Identifier -->
    <g transform="translate(80, 60)">
      <rect width="180" height="46" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
      <image href="${SYNCROZZ_PRIMARY_LOGO}" x="12" y="9" width="28" height="28" />
      <text x="48" y="29" fill="#0056D2" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="18" font-weight="900" letter-spacing="1">SYNCROZZ</text>
    </g>

    <!-- Center/Right: Category Pill -->
    <g transform="translate(280, 60)">
      <rect width="190" height="46" rx="12" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
      <circle cx="20" cy="23" r="5" fill="${accent}"/>
      <text x="34" y="28" fill="#1E40AF" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">${category}</text>
    </g>

    <!-- Top Right 1200x630 Badge -->
    <g transform="translate(1000, 60)">
      <rect width="120" height="46" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <text x="60" y="28" fill="#64748B" font-family="monospace" font-size="12" font-weight="700" text-anchor="middle">1200 × 630</text>
    </g>

    <!-- LEFT SIDE: MAIN INFORMATION & TYPOGRAPHY -->
    <g transform="translate(80, 180)">
      
      <!-- Overline Tagline Badge -->
      <g transform="translate(0, 0)">
        <rect width="320" height="32" rx="8" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1"/>
        <text x="14" y="21" fill="#475569" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1">SMART SOLUTIONS ECOSYSTEM</text>
      </g>

      <!-- Main Headline Name -->
      <text x="0" y="80" fill="#0F172A" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-1.5">
        ${fullName}
      </text>

      <!-- Sub-headline Tagline with Accent Color -->
      <text x="0" y="130" fill="${accent}" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="24" font-weight="700">
        ${tagline}
      </text>

      <!-- Description Block -->
      <g transform="translate(0, 160)">
        <foreignObject width="540" height="110">
          <p xmlns="http://www.w3.org/1999/xhtml" style="color: #475569; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; font-size: 19px; line-height: 1.5; margin: 0; font-weight: 500;">
            ${description}
          </p>
        </foreignObject>
      </g>

      <!-- Bottom Domain Pill & Feature Pill -->
      <g transform="translate(0, 290)">
        <rect width="380" height="44" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" filter="url(#cardShadow)"/>
        <circle cx="20" cy="22" r="5" fill="#10B981"/>
        <text x="34" y="27" fill="#0F172A" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="14" font-weight="700">syncrozz.com/${id}</text>
        <text x="240" y="27" fill="#64748B" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="13" font-weight="600">| Status: ${status}</text>
      </g>
    </g>

    <!-- RIGHT SIDE: ASYMMETRICAL DIGITAL DASHBOARD & DEVICE MOCKUP -->
    <g transform="translate(680, 150)" filter="url(#cardShadow)">
      <!-- Main Outer Device/Dashboard Canvas -->
      <rect width="440" height="380" rx="24" fill="url(#glassCard)" stroke="#E2E8F0" stroke-width="2"/>
      
      <!-- Top Window Header Bar -->
      <rect width="440" height="44" rx="24" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <circle cx="24" cy="22" r="5" fill="#EF4444" opacity="0.8"/>
      <circle cx="40" cy="22" r="5" fill="#F59E0B" opacity="0.8"/>
      <circle cx="56" cy="22" r="5" fill="#10B981" opacity="0.8"/>
      <text x="220" y="27" fill="#64748B" font-family="monospace" font-size="11" font-weight="600" text-anchor="middle">app.syncrozz.com/${id}</text>

      <!-- Mockup Hero Content Area -->
      <g transform="translate(24, 64)">
        <!-- Top Metric Cards Row -->
        <rect width="186" height="74" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
        <text x="16" y="28" fill="#64748B" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700">STATUS SISTEM</text>
        <text x="16" y="54" fill="#0056D2" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="900">${status}</text>

        <g transform="translate(206, 0)">
          <rect width="186" height="74" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
          <text x="16" y="28" fill="#64748B" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700">EKOSISTEM</text>
          <text x="16" y="54" fill="#10B981" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="900">SYNCROZZ</text>
        </g>

        <!-- Center Interactive Flow / Visual Graphic -->
        <g transform="translate(0, 90)">
          <rect width="392" height="120" rx="16" fill="url(#brandGrad)"/>
          <circle cx="340" cy="60" r="50" fill="#FFFFFF" opacity="0.1"/>
          
          <text x="24" y="44" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800">
            ${fullName}
          </text>
          <text x="24" y="70" fill="#E0F2FE" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="500">
            Automasi Pintar & Penyegerakan Data Berpusat
          </text>
          
          <!-- Launch Badge in graphic -->
          <g transform="translate(24, 84)">
            <rect width="130" height="24" rx="6" fill="#FFFFFF"/>
            <text x="65" y="16" fill="#0056D2" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="800" text-anchor="middle">BUKA PLATFORM →</text>
          </g>
        </g>

        <!-- Bottom Status Bar -->
        <g transform="translate(0, 226)">
          <rect width="392" height="60" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
          <circle cx="24" cy="30" r="6" fill="#0056D2"/>
          <text x="40" y="35" fill="#0F172A" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700">Platform Rasmi Ekosistem SYNCROZZ</text>
        </g>
      </g>
    </g>

    <!-- Outer Card Subtle Border -->
    <rect width="1200" height="630" fill="none" stroke="#CBD5E1" stroke-width="2"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

