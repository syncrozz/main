import { PlatformItem } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchPlatformsApi(): Promise<PlatformItem[] | null> {
  try {
    const res = await fetch('/api/platforms');
    if (!res.ok) return null;
    const json = await res.json();
    return json.platforms || null;
  } catch (error) {
    console.warn('API fetchPlatforms notice:', error);
    return null;
  }
}

export async function savePlatformApi(platform: PlatformItem, token?: string, email?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (email) headers['x-user-email'] = email;

    const res = await fetch('/api/platforms', {
      method: 'POST',
      headers,
      body: JSON.stringify({ platform })
    });
    return res.ok;
  } catch (error) {
    console.warn('API savePlatform notice:', error);
    return false;
  }
}

export async function deletePlatformApi(platformId: string, token?: string, email?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (email) headers['x-user-email'] = email;

    const res = await fetch(`/api/platforms/${encodeURIComponent(platformId)}`, {
      method: 'DELETE',
      headers
    });
    return res.ok;
  } catch (error) {
    console.warn('API deletePlatform notice:', error);
    return false;
  }
}

export async function fetchOgImagesApi(): Promise<Record<string, string> | null> {
  try {
    const res = await fetch('/api/og-images');
    if (!res.ok) return null;
    const json = await res.json();
    return json.images || null;
  } catch (error) {
    console.warn('API fetchOgImages notice:', error);
    return null;
  }
}

export async function saveOgImageApi(platformId: string, imageUrl: string, token?: string, email?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (email) headers['x-user-email'] = email;

    const res = await fetch('/api/og-images', {
      method: 'POST',
      headers,
      body: JSON.stringify({ platformId, imageUrl })
    });
    return res.ok;
  } catch (error) {
    console.warn('API saveOgImage notice:', error);
    return false;
  }
}

export async function submitInquiryApi(inquiry: {
  name: string;
  email: string;
  organization?: string;
  platformOfInterest?: string;
  message: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry)
    });
    return res.ok;
  } catch (error) {
    console.warn('API submitInquiry notice:', error);
    return false;
  }
}

export async function syncUserToDatabase(user: {
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return res.ok;
  } catch (error) {
    console.warn('API syncUser notice:', error);
    return false;
  }
}
