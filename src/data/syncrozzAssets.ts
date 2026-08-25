/**
 * SYNCROZZ Official Logo Assets (Folder MAIN)
 * Source Repository: https://github.com/syncrozz/syncrozz-assets/tree/main/logo/MAIN
 * 
 * Direct reference to all 13 official logo assets without recreation or redrawing.
 */

export const SYNCROZZ_ASSET_BASE_URL = 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/logo/MAIN';

export const SYNCROZZ_OFFICIAL_ASSETS = {
  // 1. Android Chrome 192x192 (Primary Direct Reference)
  androidChrome192: `${SYNCROZZ_ASSET_BASE_URL}/android-chrome-192x192.png`,
  
  // 2. Android Chrome 512x512
  androidChrome512: `${SYNCROZZ_ASSET_BASE_URL}/android-chrome-512x512.png`,
  
  // 3. Apple Touch Icon (iOS Home Screen)
  appleTouchIcon: `${SYNCROZZ_ASSET_BASE_URL}/apple-touch-icon.png`,
  
  // 4. Favicon 16x16
  favicon16: `${SYNCROZZ_ASSET_BASE_URL}/favicon-16x16.png`,
  
  // 5. Favicon 32x32
  favicon32: `${SYNCROZZ_ASSET_BASE_URL}/favicon-32x32.png`,
  
  // 6. Favicon 48x48
  favicon48: `${SYNCROZZ_ASSET_BASE_URL}/favicon-48x48.png`,
  
  // 7. Favicon 96x96
  favicon96: `${SYNCROZZ_ASSET_BASE_URL}/favicon-96x96.png`,
  
  // 8. Microsoft Tile 150x150
  mstile150: `${SYNCROZZ_ASSET_BASE_URL}/mstile-150x150.png`,
  
  // 9. Site Webmanifest
  siteWebmanifest: `${SYNCROZZ_ASSET_BASE_URL}/site.webmanifest`,
  
  // 10. Web App Manifest 192x192
  webAppManifest192: `${SYNCROZZ_ASSET_BASE_URL}/web-app-manifest-192x192.png`,
  
  // 11. Web App Manifest 512x512
  webAppManifest512: `${SYNCROZZ_ASSET_BASE_URL}/web-app-manifest-512x512.png`,
  
  // 12. Favicon SVG (Scalable Vector Icon)
  faviconSvg: `${SYNCROZZ_ASSET_BASE_URL}/favicon.svg`,
  
  // 13. Favicon ICO (Legacy Browser Icon)
  faviconIco: `${SYNCROZZ_ASSET_BASE_URL}/favicon.ico`,
} as const;

/**
 * Direct reference to primary logo image for UI headers, footers & badges
 */
export const SYNCROZZ_PRIMARY_LOGO = SYNCROZZ_OFFICIAL_ASSETS.androidChrome192;

/**
 * Direct reference to vector SVG logo
 */
export const SYNCROZZ_SVG_LOGO = SYNCROZZ_OFFICIAL_ASSETS.faviconSvg;

/**
 * Array listing all 13 official files with descriptions for manifest/admin display
 */
export const SYNCROZZ_ASSET_CATALOG = [
  {
    name: 'android-chrome-192x192.png',
    type: 'image/png',
    dimensions: '192x192',
    purpose: 'Android PWA Icon / Primary UI Logo',
    url: SYNCROZZ_OFFICIAL_ASSETS.androidChrome192,
  },
  {
    name: 'android-chrome-512x512.png',
    type: 'image/png',
    dimensions: '512x512',
    purpose: 'Android Splash / High-Res PWA Icon',
    url: SYNCROZZ_OFFICIAL_ASSETS.androidChrome512,
  },
  {
    name: 'apple-touch-icon.png',
    type: 'image/png',
    dimensions: '180x180',
    purpose: 'Apple iOS Home Screen Icon',
    url: SYNCROZZ_OFFICIAL_ASSETS.appleTouchIcon,
  },
  {
    name: 'favicon-16x16.png',
    type: 'image/png',
    dimensions: '16x16',
    purpose: 'Standard Browser Tab Favicon (Small)',
    url: SYNCROZZ_OFFICIAL_ASSETS.favicon16,
  },
  {
    name: 'favicon-32x32.png',
    type: 'image/png',
    dimensions: '32x32',
    purpose: 'Standard Browser Tab Favicon (Medium)',
    url: SYNCROZZ_OFFICIAL_ASSETS.favicon32,
  },
  {
    name: 'favicon-48x48.png',
    type: 'image/png',
    dimensions: '48x48',
    purpose: 'Browser Tab Favicon (Standard)',
    url: SYNCROZZ_OFFICIAL_ASSETS.favicon48,
  },
  {
    name: 'favicon-96x96.png',
    type: 'image/png',
    dimensions: '96x96',
    purpose: 'Browser Tab Favicon (Retina/HD)',
    url: SYNCROZZ_OFFICIAL_ASSETS.favicon96,
  },
  {
    name: 'mstile-150x150.png',
    type: 'image/png',
    dimensions: '150x150',
    purpose: 'Microsoft Windows Live Tile',
    url: SYNCROZZ_OFFICIAL_ASSETS.mstile150,
  },
  {
    name: 'site.webmanifest',
    type: 'application/manifest+json',
    dimensions: 'N/A',
    purpose: 'PWA Web App Manifest Configuration',
    url: SYNCROZZ_OFFICIAL_ASSETS.siteWebmanifest,
  },
  {
    name: 'web-app-manifest-192x192.png',
    type: 'image/png',
    dimensions: '192x192',
    purpose: 'PWA Manifest Standard Icon',
    url: SYNCROZZ_OFFICIAL_ASSETS.webAppManifest192,
  },
  {
    name: 'web-app-manifest-512x512.png',
    type: 'image/png',
    dimensions: '512x512',
    purpose: 'PWA Manifest High-Resolution Icon',
    url: SYNCROZZ_OFFICIAL_ASSETS.webAppManifest512,
  },
  {
    name: 'favicon.svg',
    type: 'image/svg+xml',
    dimensions: 'Scalable',
    purpose: 'Modern Scalable Vector Favicon',
    url: SYNCROZZ_OFFICIAL_ASSETS.faviconSvg,
  },
  {
    name: 'favicon.ico',
    type: 'image/x-icon',
    dimensions: 'Multi-size',
    purpose: 'Legacy Browser Favicon Fallback',
    url: SYNCROZZ_OFFICIAL_ASSETS.faviconIco,
  },
] as const;

/**
 * Official SYNCROZZ Open Graph Image (OGI) Reference
 * Source: https://github.com/syncrozz/syncrozz-assets/blob/main/OGI/OGI.MAINv2.jpg
 * Style: White / Light / Modern / Clean / Premium Corporate (1200 x 630 px)
 */
export const SYNCROZZ_OGI_OFFICIAL = {
  rawUrl: 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/OGI/OGI.MAINv2.jpg',
  blobUrl: 'https://github.com/syncrozz/syncrozz-assets/blob/main/OGI/OGI.MAINv2.jpg',
  fileName: 'OGI.MAINv2.jpg',
  width: 1200,
  height: 630,
  aspectRatio: '1.905:1 (1200x630)',
  format: 'image/jpeg',
  style: 'White / Light / Modern / Clean / Premium Corporate',
  colorPalette: {
    primary: '#0056D2', // SYNCROZZ Blue
    darkNavy: '#0F172A', // Dark Navy
    white: '#FFFFFF',
    lightBg: '#F8FAFC',
    accentLight: '#E0F2FE'
  }
} as const;

export const SYNCROZZ_OGI_PRIMARY = SYNCROZZ_OGI_OFFICIAL.rawUrl;
