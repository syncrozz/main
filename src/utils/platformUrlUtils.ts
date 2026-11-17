import { PlatformItem } from '../types';

/**
 * Validates that a string is a safe, well-formed external HTTP(S) URL.
 * Rejects empty strings, '#', javascript:/data: schemes, and malformed values.
 */
export function isValidExternalHttpUrl(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === '#' || trimmed.startsWith('/#')) return false;

  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Resolves the authoritative external platform URL from Admin customUrls first,
 * falling back to the registry platform.url. Returns null when unverified/unset.
 */
export function resolvePlatformUrl(
  platform: Pick<PlatformItem, 'id' | 'url'>,
  customUrls?: Record<string, string>
): string | null {
  const override = customUrls?.[platform.id];
  if (typeof override === 'string') {
    const trimmedOverride = override.trim();
    if (trimmedOverride && isValidExternalHttpUrl(trimmedOverride)) {
      return trimmedOverride;
    }
    // If admin explicitly cleared override to empty string, fall back to registry if valid
  }

  if (platform.url && isValidExternalHttpUrl(platform.url)) {
    return platform.url.trim();
  }

  return null;
}

/**
 * Formats a clean hostname/path label for display (e.g. "syncrozz.com/staff-attend").
 */
export function formatPlatformDisplayHost(validUrl: string): string {
  try {
    const parsed = new URL(validUrl);
    const cleanHost = parsed.hostname.replace(/^www\./, '');
    const cleanPath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.replace(/\/+$/, '') : '';
    return `${cleanHost}${cleanPath}`;
  } catch {
    return validUrl;
  }
}
