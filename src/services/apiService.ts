import { PlatformItem, DiscoveredPlatformMetadata } from '../types';
import { CarouselSlide } from '../utils/carouselStorage';
import { AuthUser, SecondaryAdminEntry, UserRole } from '../auth/types';
import { auth } from '../lib/firebase';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FullCloudState {
  version: number;
  lastUpdated: number;
  platforms: PlatformItem[];
  customUrls: Record<string, string>;
  carouselSlides: CarouselSlide[];
  deletedDefaultIds: string[];
  ogImages: Record<string, string>;
  inquiries?: any[];
}

export interface SessionVerificationResult {
  ok: boolean;
  status: number;
  role: UserRole;
  user?: AuthUser;
  error?: string;
}

async function getFirebaseIdToken(explicitToken?: string): Promise<string | null> {
  if (explicitToken && explicitToken.trim()) {
    return explicitToken.trim();
  }
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }
  try {
    return await currentUser.getIdToken();
  } catch {
    return null;
  }
}

async function getAuthHeaders(explicitToken?: string): Promise<Record<string, string> | null> {
  const token = await getFirebaseIdToken(explicitToken);
  if (!token) {
    return null;
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ----------------------------------------------------
// ADMIN GOOGLE SESSION & RBAC APIS
// ----------------------------------------------------

export async function verifyGoogleAdminSessionApi(idToken: string): Promise<SessionVerificationResult> {
  try {
    const res = await fetch('/api/admin/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    const json = await res.json().catch(() => ({}));
    return {
      ok: res.ok && Boolean(json?.success),
      status: res.status,
      role: (json?.role || json?.user?.role || 'USER') as UserRole,
      user: json?.user as AuthUser | undefined,
      error: json?.error,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 500,
      role: 'USER',
      error: error?.message || 'Gagal menghubungi pelayan pengesahan.',
    };
  }
}

export async function logoutAdminSessionApi(explicitToken?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(explicitToken);
    if (!headers) return true;
    const res = await fetch('/api/admin/logout', {
      method: 'POST',
      headers,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchSecondaryAdminsApi(): Promise<{
  masterAdmin: string;
  secondaryAdmins: SecondaryAdminEntry[];
} | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return null;
    const res = await fetch('/api/admin/users', { headers, cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      masterAdmin: json.masterAdmin,
      secondaryAdmins: Array.isArray(json.secondaryAdmins) ? json.secondaryAdmins : [],
    };
  } catch {
    return null;
  }
}

export async function addSecondaryAdminApi(
  email: string,
  name?: string
): Promise<{ success: boolean; secondaryAdmins?: SecondaryAdminEntry[]; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      return { success: false, error: 'Sesi Google Master Admin diperlukan.' };
    }
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, name }),
    });
    const json = await res.json().catch(() => ({}));
    return {
      success: res.ok && Boolean(json?.success),
      secondaryAdmins: json?.secondaryAdmins,
      error: json?.error,
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Ralat pelayan.' };
  }
}

export async function removeSecondaryAdminApi(
  email: string
): Promise<{ success: boolean; secondaryAdmins?: SecondaryAdminEntry[]; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) {
      return { success: false, error: 'Sesi Google Master Admin diperlukan.' };
    }
    const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers,
    });
    const json = await res.json().catch(() => ({}));
    return {
      success: res.ok && Boolean(json?.success),
      secondaryAdmins: json?.secondaryAdmins,
      error: json?.error,
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Ralat pelayan.' };
  }
}

export async function fetchAuditLogsApi(): Promise<any[] | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return null;
    const res = await fetch('/api/admin/logs', { headers, cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json?.logs) ? json.logs : null;
  } catch {
    return null;
  }
}

export async function postAuditLogApi(entry: {
  action: string;
  status: 'SUCCESS' | 'DENIED' | 'INFO';
  details?: string;
}): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return false;
    const res = await fetch('/api/admin/logs', {
      method: 'POST',
      headers,
      body: JSON.stringify(entry),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// FULL CLOUD SYNC APIS (Cross-Device & Incognito Tabs)
// ----------------------------------------------------

export async function fetchFullCloudStateApi(): Promise<FullCloudState | null> {
  try {
    const res = await fetch('/api/sync/all', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch (error) {
    console.warn('API fetchFullCloudState notice:', error);
    return null;
  }
}

export async function checkCloudVersionApi(): Promise<{ version: number; lastUpdated: number } | null> {
  try {
    const res = await fetch('/api/sync/version', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function pushClientStateApi(
  clientState: {
    platforms?: PlatformItem[];
    customUrls?: Record<string, string>;
    carouselSlides?: CarouselSlide[];
    deletedDefaultIds?: string[];
    ogImages?: Record<string, string>;
  },
  token?: string
): Promise<FullCloudState | null> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return null;
    const res = await fetch('/api/sync/push', {
      method: 'POST',
      headers,
      body: JSON.stringify(clientState),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn('API pushClientState notice:', error);
    return null;
  }
}

// ----------------------------------------------------
// PLATFORMS APIS
// ----------------------------------------------------

export async function fetchPlatformsApi(): Promise<PlatformItem[] | null> {
  try {
    const res = await fetch('/api/platforms', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.platforms || null;
  } catch (error) {
    console.warn('API fetchPlatforms notice:', error);
    return null;
  }
}

export async function savePlatformApi(platform: PlatformItem, token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;

    const res = await fetch('/api/platforms', {
      method: 'POST',
      headers,
      body: JSON.stringify({ platform }),
    });
    return res.ok;
  } catch (error) {
    console.warn('API savePlatform notice:', error);
    return false;
  }
}

export async function saveMultiplePlatformsApi(platforms: PlatformItem[], token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;

    const res = await fetch('/api/platforms/batch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ platforms }),
    });
    return res.ok;
  } catch (error) {
    console.warn('API saveMultiplePlatforms notice:', error);
    return false;
  }
}

export async function deletePlatformApi(platformId: string, token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;

    const res = await fetch(`/api/platforms/${encodeURIComponent(platformId)}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch (error) {
    console.warn('API deletePlatform notice:', error);
    return false;
  }
}

// ----------------------------------------------------
// CUSTOM PLATFORM URLS APIS
// ----------------------------------------------------

export async function fetchCustomUrlsApi(): Promise<Record<string, string> | null> {
  try {
    const res = await fetch('/api/custom-urls', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.urls || null;
  } catch (error) {
    console.warn('API fetchCustomUrls notice:', error);
    return null;
  }
}

export async function saveCustomUrlApi(platformId: string, url: string, token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;
    const res = await fetch('/api/custom-urls', {
      method: 'POST',
      headers,
      body: JSON.stringify({ platformId, url }),
    });
    return res.ok;
  } catch (error) {
    console.warn('API saveCustomUrl notice:', error);
    return false;
  }
}

export async function removeCustomUrlApi(platformId: string, token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;
    const res = await fetch(`/api/custom-urls/${encodeURIComponent(platformId)}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch (error) {
    console.warn('API removeCustomUrl notice:', error);
    return false;
  }
}

// ----------------------------------------------------
// HERO CAROUSEL SLIDES APIS
// ----------------------------------------------------

export async function fetchCarouselSlidesApi(): Promise<CarouselSlide[] | null> {
  try {
    const res = await fetch('/api/carousel-slides', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.slides || null;
  } catch (error) {
    console.warn('API fetchCarouselSlides notice:', error);
    return null;
  }
}

export async function saveCarouselSlidesApi(slides: CarouselSlide[], token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;
    const res = await fetch('/api/carousel-slides', {
      method: 'POST',
      headers,
      body: JSON.stringify({ slides }),
    });
    return res.ok;
  } catch (error) {
    console.warn('API saveCarouselSlides notice:', error);
    return false;
  }
}

// ----------------------------------------------------
// DELETED DEFAULT PLATFORMS APIS
// ----------------------------------------------------

export async function saveDeletedPlatformsApi(deletedIds: string[], token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;
    const res = await fetch('/api/deleted-platforms', {
      method: 'POST',
      headers,
      body: JSON.stringify({ deletedIds }),
    });
    return res.ok;
  } catch (error) {
    console.warn('API saveDeletedPlatforms notice:', error);
    return false;
  }
}

// ----------------------------------------------------
// OG IMAGES APIS
// ----------------------------------------------------

export async function fetchOgImagesApi(): Promise<Record<string, string> | null> {
  try {
    const res = await fetch('/api/og-images', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.images || null;
  } catch (error) {
    console.warn('API fetchOgImages notice:', error);
    return null;
  }
}

export async function saveOgImageApi(platformId: string, imageUrl: string, token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;

    const res = await fetch('/api/og-images', {
      method: 'POST',
      headers,
      body: JSON.stringify({ platformId, imageUrl }),
    });
    return res.ok;
  } catch (error) {
    console.warn('API saveOgImage notice:', error);
    return false;
  }
}

export async function removeOgImageApi(platformId: string, token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;

    const res = await fetch(`/api/og-images/${encodeURIComponent(platformId)}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch (error) {
    console.warn('API removeOgImage notice:', error);
    return false;
  }
}

// ----------------------------------------------------
// INQUIRIES APIS
// ----------------------------------------------------

export async function submitInquiryApi(inquiry: {
  id?: string;
  name: string;
  email: string;
  organization?: string;
  platformOfInterest?: string;
  message: string;
}): Promise<any> {
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.inquiry || true;
    }
    return false;
  } catch (error) {
    console.warn('API submitInquiry notice:', error);
    return false;
  }
}

export async function fetchInquiriesApi(token?: string): Promise<any[]> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return [];
    const res = await fetch('/api/admin/inquiries', { headers, cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.inquiries || [];
  } catch (error) {
    console.warn('API fetchInquiries notice:', error);
    return [];
  }
}

export async function updateInquiryStatusApi(
  id: string | number,
  status: string,
  read?: boolean,
  token?: string
): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;
    const res = await fetch(`/api/admin/inquiries/${encodeURIComponent(String(id))}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, ...(read !== undefined ? { read } : {}) }),
    });
    return res.ok;
  } catch (error) {
    console.warn('API updateInquiryStatus notice:', error);
    return false;
  }
}

export async function deleteInquiryApi(id: string | number, token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;
    const res = await fetch(`/api/admin/inquiries/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch (error) {
    console.warn('API deleteInquiry notice:', error);
    return false;
  }
}

export async function syncUserToDatabase(token?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(token);
    if (!headers) return false;
    const res = await fetch('/api/users/sync', {
      method: 'POST',
      headers,
    });
    return res.ok;
  } catch (error) {
    console.warn('API syncUser notice:', error);
    return false;
  }
}

const clientDiscoveryMemo = new Map<string, Promise<DiscoveredPlatformMetadata | null>>();

export async function discoverPlatformMetadataApi(url: string): Promise<DiscoveredPlatformMetadata | null> {
  const normalized = url?.trim();
  if (!normalized) return null;

  const existing = clientDiscoveryMemo.get(normalized);
  if (existing) return existing;

  const request = (async () => {
    try {
      const res = await fetch(`/api/platforms/discover?url=${encodeURIComponent(normalized)}`, {
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json?.success && json.metadata) {
        return json.metadata as DiscoveredPlatformMetadata;
      }
      return null;
    } catch {
      return null;
    }
  })();

  clientDiscoveryMemo.set(normalized, request);
  return request;
}
