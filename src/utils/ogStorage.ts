import { PlatformItem } from '../types';

const STORAGE_KEY = 'syncrozz_custom_og_images_v1';

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

// Generate a high quality default 1200x630 Open Graph card SVG data URI for any platform
export function generateDefaultOgImage(item: PlatformItem): string {
  const fullName = `${item.name} ${item.subName || ''}`.trim();
  const category = item.category.toUpperCase();
  const accent = item.accentColor || '#0056D2';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="60%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" opacity="0.25"/>
      </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#grid)"/>

    <!-- Decorative Glow Circles -->
    <circle cx="1050" cy="150" r="280" fill="${accent}" opacity="0.18" filter="blur(80px)"/>
    <circle cx="150" cy="550" r="220" fill="#38bdf8" opacity="0.12" filter="blur(70px)"/>

    <!-- Top Badge Row -->
    <g transform="translate(80, 80)">
      <rect width="210" height="44" rx="22" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <circle cx="28" cy="22" r="6" fill="${accent}"/>
      <text x="44" y="27" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" letter-spacing="2">SYNCROZZ • ${category}</text>
    </g>

    <!-- Brand Logo Top Right -->
    <g transform="translate(1000, 70)">
      <rect width="120" height="48" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="60" y="31" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="1">SYNCROZZ</text>
    </g>

    <!-- Main Title -->
    <g transform="translate(80, 240)">
      <text x="0" y="0" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" letter-spacing="-1">${fullName}</text>
      <text x="0" y="60" fill="url(#accentGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700">${item.tagline}</text>
    </g>

    <!-- Description -->
    <g transform="translate(80, 360)">
      <foreignObject width="1040" height="120">
        <p xmlns="http://www.w3.org/1999/xhtml" style="color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; line-height: 1.5; margin: 0;">
          ${item.description}
        </p>
      </foreignObject>
    </g>

    <!-- Bottom Meta Pill -->
    <g transform="translate(80, 520)">
      <rect width="420" height="46" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="24" y="29" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600">🌐 https://syncrozz.com/${item.id} • Open Graph (JPG)</text>
    </g>

    <!-- 1200x630 Badge -->
    <g transform="translate(1010, 520)">
      <rect width="110" height="46" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="55" y="29" fill="#94a3b8" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle">1200 × 630</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
