import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns/promises';
import net from 'node:net';
import { DiscoveredPlatformMetadata } from '../types';

const REQUEST_TIMEOUT_MS = 4000;
const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 512 * 1024; // 512 KB
const MAX_MANIFEST_BYTES = 256 * 1024; // 256 KB
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_ENTRIES = 200;

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;

interface CachedEntry {
  expiresAt: number;
  data: DiscoveredPlatformMetadata;
}

const discoveryCache = new Map<string, CachedEntry>();
const rateLimitBuckets = new Map<string, number[]>();

export function checkDiscoveryRateLimit(clientIp: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const key = clientIp || 'unknown';
  const timestamps = (rateLimitBuckets.get(key) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000));
    rateLimitBuckets.set(key, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  rateLimitBuckets.set(key, timestamps);

  // Bounded memory cleanup for buckets
  if (rateLimitBuckets.size > 500) {
    for (const [ip, list] of rateLimitBuckets.entries()) {
      if (list.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitBuckets.delete(ip);
      }
    }
  }

  return { allowed: true };
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const num = Number(part);
    if (num < 0 || num > 255) return null;
    value = (value << 8) | num;
  }
  return value >>> 0;
}

function isPrivateOrReservedIpv4(ip: string): boolean {
  const int = ipv4ToInt(ip);
  if (int === null) return true;

  const first = (int >>> 24) & 0xff;
  const second = (int >>> 16) & 0xff;

  if (first === 0) return true; // 0.0.0.0/8 (This network)
  if (first === 10) return true; // 10.0.0.0/8 (RFC1918)
  if (first === 100 && second >= 64 && second <= 127) return true; // 100.64.0.0/10 (CGNAT)
  if (first === 127) return true; // 127.0.0.0/8 (Loopback)
  if (first === 169 && second === 254) return true; // 169.254.0.0/16 (Link-local / Cloud metadata)
  if (first === 172 && second >= 16 && second <= 31) return true; // 172.16.0.0/12 (RFC1918)
  if (first === 192 && second === 0 && ((int >>> 8) & 0xff) === 0) return true; // 192.0.0.0/24
  if (first === 192 && second === 0 && ((int >>> 8) & 0xff) === 2) return true; // 192.0.2.0/24 (TEST-NET-1)
  if (first === 192 && second === 88 && ((int >>> 8) & 0xff) === 99) return true; // 192.88.99.0/24
  if (first === 192 && second === 168) return true; // 192.168.0.0/16 (RFC1918)
  if (first === 198 && (second === 18 || second === 19)) return true; // 198.18.0.0/15 (Benchmarking)
  if (first === 198 && second === 51 && ((int >>> 8) & 0xff) === 100) return true; // 198.51.100.0/24
  if (first === 203 && second === 0 && ((int >>> 8) & 0xff) === 113) return true; // 203.0.113.0/24
  if (first >= 224) return true; // 224.0.0.0/4 Multicast & 240.0.0.0/4 Reserved

  return false;
}

export function isPublicIpAddress(rawIp: string): boolean {
  const ip = rawIp.split('%')[0].toLowerCase();
  const version = net.isIP(ip);

  if (version === 4) {
    return !isPrivateOrReservedIpv4(ip);
  }

  if (version === 6) {
    if (ip === '::' || ip === '::1') return false;
    // IPv4-mapped IPv6 e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1
    if (ip.startsWith('::ffff:')) {
      const mapped = ip.slice(7);
      if (net.isIPv4(mapped)) {
        return !isPrivateOrReservedIpv4(mapped);
      }
      const hexMatch = mapped.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
      if (hexMatch) {
        const hi = parseInt(hexMatch[1], 16);
        const lo = parseInt(hexMatch[2], 16);
        const v4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
        return !isPrivateOrReservedIpv4(v4);
      }
      return false;
    }

    // Unique local (fc00::/7), link-local (fe80::/10), multicast (ff00::/8)
    const firstHextet = parseInt(ip.split(':')[0] || '0', 16);
    if (Number.isNaN(firstHextet)) return false;
    if ((firstHextet & 0xfe00) === 0xfc00) return false; // fc00::/7
    if ((firstHextet & 0xffc0) === 0xfe80) return false; // fe80::/10
    if ((firstHextet & 0xff00) === 0xff00) return false; // ff00::/8
    if (ip.startsWith('2001:db8:')) return false; // Documentation
    if (ip.startsWith('64:ff9b::')) return false; // NAT64

    return true;
  }

  return false;
}

interface ValidatedTarget {
  url: URL;
  resolvedIp: string;
  family: 4 | 6;
}

async function validateAndResolveTarget(rawUrl: string): Promise<ValidatedTarget> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Only HTTP/HTTPS protocols are allowed');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Embedded URL credentials are not allowed');
  }

  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    throw new Error('Only standard HTTP/HTTPS ports (80, 443) are permitted');
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '');
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.arpa')
  ) {
    throw new Error('Blocked internal or reserved hostname');
  }

  // If literal IP, validate directly without DNS lookup
  const ipLiteralVersion = net.isIP(hostname.replace(/^\[|\]$/g, ''));
  if (ipLiteralVersion === 4 || ipLiteralVersion === 6) {
    const cleanIp = hostname.replace(/^\[|\]$/g, '');
    if (!isPublicIpAddress(cleanIp)) {
      throw new Error('Access to private or reserved IP addresses is blocked');
    }
    return {
      url: parsed,
      resolvedIp: cleanIp,
      family: ipLiteralVersion,
    };
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records || records.length === 0) {
    throw new Error('DNS lookup returned no addresses');
  }

  // Ensure EVERY returned record is a public IP before pinning one
  for (const rec of records) {
    if (!isPublicIpAddress(rec.address)) {
      throw new Error('Target domain resolved to a private or reserved IP address');
    }
  }

  const preferred = records.find((r) => r.family === 4) || records[0];
  return {
    url: parsed,
    resolvedIp: preferred.address,
    family: preferred.family === 6 ? 6 : 4,
  };
}

function fetchPinnedUrlOnce(
  target: ValidatedTarget,
  maxBytes: number,
  acceptHeader: string
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const isHttps = target.url.protocol === 'https:';
    const transport = isHttps ? https : http;
    const defaultPort = isHttps ? 443 : 80;
    const port = target.url.port ? Number(target.url.port) : defaultPort;

    let settled = false;
    const finishError = (err: Error) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    const req = transport.request(
      {
        hostname: target.url.hostname,
        port,
        path: `${target.url.pathname}${target.url.search}`,
        method: 'GET',
        // Pin DNS resolution directly to validated IP to neutralize DNS rebinding (TOCTOU)
        lookup: (_host, opts: any, cb: any) => {
          if (typeof opts === 'function') {
            opts(null, target.resolvedIp, target.family);
            return;
          }
          if (opts && opts.all) {
            cb(null, [{ address: target.resolvedIp, family: target.family }]);
            return;
          }
          cb(null, target.resolvedIp, target.family);
        },
        ...(isHttps ? { servername: target.url.hostname } : {}),
        headers: {
          'User-Agent': 'SYNCROZZ-Metadata-Discovery/1.0 (+https://www.syncrozz.com)',
          Accept: acceptHeader,
          'Accept-Encoding': 'identity',
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        const remoteAddr = res.socket?.remoteAddress;
        if (remoteAddr && !isPublicIpAddress(remoteAddr)) {
          req.destroy();
          finishError(new Error('Connected socket resolved to disallowed IP address'));
          return;
        }

        const contentLengthHeader = res.headers['content-length'];
        if (contentLengthHeader) {
          const declaredSize = Number(contentLengthHeader);
          if (Number.isFinite(declaredSize) && declaredSize > maxBytes) {
            req.destroy();
            finishError(new Error(`Response exceeded size limit (${maxBytes} bytes)`));
            return;
          }
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;

        res.on('data', (chunk: Buffer) => {
          totalBytes += chunk.length;
          if (totalBytes > maxBytes) {
            req.destroy();
            finishError(new Error(`Response stream exceeded limit (${maxBytes} bytes)`));
            return;
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          if (settled) return;
          settled = true;
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });

        res.on('error', (err) => finishError(err));
      }
    );

    req.on('timeout', () => {
      req.destroy();
      finishError(new Error('Outbound request timed out'));
    });

    req.on('error', (err) => finishError(err));
    req.end();
  });
}

async function fetchWithValidatedRedirects(
  initialUrl: string,
  maxBytes: number,
  acceptHeader: string
): Promise<{ finalUrl: string; contentType: string; body: string; statusCode: number }> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const validated = await validateAndResolveTarget(currentUrl);
    const response = await fetchPinnedUrlOnce(validated, maxBytes, acceptHeader);

    const isRedirect = [301, 302, 303, 307, 308].includes(response.statusCode);
    if (isRedirect) {
      const location = response.headers.location;
      if (!location || hop === MAX_REDIRECTS) {
        throw new Error('Too many redirects or missing redirect target');
      }
      currentUrl = new URL(location, validated.url).toString();
      continue;
    }

    return {
      finalUrl: validated.url.toString(),
      contentType: String(response.headers['content-type'] || ''),
      body: response.body,
      statusCode: response.statusCode,
    };
  }

  throw new Error('Redirect limit exceeded');
}

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(tag)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[key] = val.trim();
  }
  return attrs;
}

function decodeBasicEntities(input: string): string {
  return input
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function extractHtmlMetadata(html: string, baseUrl: string) {
  let title: string | undefined;
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    title = decodeBasicEntities(titleMatch[1].replace(/\s+/g, ' ').trim());
  }

  let description: string | undefined;
  let ogTitle: string | undefined;
  let ogDescription: string | undefined;
  let ogImage: string | undefined;
  let ogUrl: string | undefined;
  let manifestHref: string | undefined;
  let iconHref: string | undefined;

  const metaRegex = /<meta\b[^>]*>/gi;
  let metaMatch: RegExpExecArray | null;
  while ((metaMatch = metaRegex.exec(html)) !== null) {
    const attrs = parseAttributes(metaMatch[0]);
    const key = (attrs.property || attrs.name || '').toLowerCase();
    const content = attrs.content ? decodeBasicEntities(attrs.content) : '';
    if (!content) continue;

    if (key === 'description' && !description) description = content;
    else if (key === 'og:title' && !ogTitle) ogTitle = content;
    else if (key === 'og:description' && !ogDescription) ogDescription = content;
    else if ((key === 'og:image' || key === 'og:image:secure_url' || key === 'twitter:image') && !ogImage) {
      ogImage = content;
    } else if (key === 'og:url' && !ogUrl) {
      ogUrl = content;
    }
  }

  const linkRegex = /<link\b[^>]*>/gi;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const attrs = parseAttributes(linkMatch[0]);
    const rel = (attrs.rel || '').toLowerCase().split(/\s+/);
    const href = attrs.href;
    if (!href) continue;

    if (rel.includes('manifest') && !manifestHref) {
      manifestHref = href;
    } else if ((rel.includes('icon') || rel.includes('apple-touch-icon')) && !iconHref) {
      iconHref = href;
    }
  }

  const resolveSafeHttp = (candidate?: string): string | undefined => {
    if (!candidate) return undefined;
    try {
      const resolved = new URL(candidate, baseUrl);
      if (resolved.protocol === 'https:' || resolved.protocol === 'http:') {
        return resolved.toString();
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  return {
    title,
    description,
    ogTitle: ogTitle || title,
    ogDescription: ogDescription || description,
    ogImage: resolveSafeHttp(ogImage),
    ogUrl: resolveSafeHttp(ogUrl),
    manifestUrl: resolveSafeHttp(manifestHref),
    iconUrl: resolveSafeHttp(iconHref),
  };
}

function pickBestManifestIcon(icons: any, manifestUrl: string): string | undefined {
  if (!Array.isArray(icons) || icons.length === 0) return undefined;

  let bestScore = -1;
  let bestUrl: string | undefined;

  for (const icon of icons) {
    if (!icon || typeof icon.src !== 'string') continue;
    try {
      const resolved = new URL(icon.src, manifestUrl);
      if (resolved.protocol !== 'https:' && resolved.protocol !== 'http:') continue;

      let sizeScore = 0;
      if (typeof icon.sizes === 'string') {
        const match = icon.sizes.match(/(\d+)\s*x\s*(\d+)/i);
        if (match) {
          sizeScore = Number(match[1]) * Number(match[2]);
        }
      }
      if (sizeScore >= bestScore) {
        bestScore = sizeScore;
        bestUrl = resolved.toString();
      }
    } catch {
      continue;
    }
  }

  return bestUrl;
}

export async function discoverPlatformMetadata(rawUrl: string): Promise<DiscoveredPlatformMetadata> {
  const normalizedUrl = rawUrl.trim();
  const now = Date.now();

  const cached = discoveryCache.get(normalizedUrl);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const pageRes = await fetchWithValidatedRedirects(
    normalizedUrl,
    MAX_HTML_BYTES,
    'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8'
  );

  if (pageRes.statusCode < 200 || pageRes.statusCode >= 400) {
    throw new Error(`Target responded with HTTP ${pageRes.statusCode}`);
  }

  const htmlMeta = extractHtmlMetadata(pageRes.body, pageRes.finalUrl);

  let manifestUrl = htmlMeta.manifestUrl;
  let manifestData: any = null;

  // Attempt to fetch declared manifest, or probe /manifest.webmanifest if omitted
  const candidateManifestUrls = manifestUrl
    ? [manifestUrl]
    : [new URL('/manifest.webmanifest', pageRes.finalUrl).toString()];

  for (const candidate of candidateManifestUrls) {
    try {
      const manifestRes = await fetchWithValidatedRedirects(
        candidate,
        MAX_MANIFEST_BYTES,
        'application/manifest+json,application/json;q=0.9,*/*;q=0.8'
      );
      if (manifestRes.statusCode >= 200 && manifestRes.statusCode < 300) {
        const trimmed = manifestRes.body.trim();
        if (trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object') {
            manifestUrl = manifestRes.finalUrl;
            manifestData = parsed;
            break;
          }
        }
      }
    } catch {
      // Manifest absent or blocked; non-fatal fallback to HTML OG metadata
    }
  }

  const resolveOptionalUrl = (val: unknown, base: string): string | undefined => {
    if (typeof val !== 'string' || !val.trim()) return undefined;
    try {
      const resolved = new URL(val.trim(), base);
      return resolved.protocol === 'https:' || resolved.protocol === 'http:'
        ? resolved.toString()
        : undefined;
    } catch {
      return undefined;
    }
  };

  const manifestBase = manifestUrl || pageRes.finalUrl;
  const manifestIcon = manifestData ? pickBestManifestIcon(manifestData.icons, manifestBase) : undefined;

  // Detect when a subpath on syncrozz.com rewrites back to the root portal SPA shell
  const finalPath = new URL(pageRes.finalUrl).pathname;
  const isSubpathOnPortal = finalPath !== '/' && finalPath.length > 1;
  const isRootPortalFallback = Boolean(
    isSubpathOnPortal &&
      htmlMeta.manifestUrl === 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/logo/MAIN/site.webmanifest' &&
      htmlMeta.ogImage === 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/OGI/OGI.MAINv2.jpg'
  );

  const result: DiscoveredPlatformMetadata = {
    sourceUrl: normalizedUrl,
    finalUrl: pageRes.finalUrl,
    manifestUrl,
    name: typeof manifestData?.name === 'string' && manifestData.name.trim() ? manifestData.name.trim() : undefined,
    shortName:
      typeof manifestData?.short_name === 'string' && manifestData.short_name.trim()
        ? manifestData.short_name.trim()
        : undefined,
    description:
      (typeof manifestData?.description === 'string' && manifestData.description.trim()) ||
      htmlMeta.ogDescription ||
      htmlMeta.description,
    startUrl: manifestData ? resolveOptionalUrl(manifestData.start_url, manifestBase) : undefined,
    scope: manifestData ? resolveOptionalUrl(manifestData.scope, manifestBase) : undefined,
    iconUrl: manifestIcon || htmlMeta.iconUrl,
    ogTitle: htmlMeta.ogTitle,
    ogDescription: htmlMeta.ogDescription,
    ogImage: htmlMeta.ogImage,
    isRootPortalFallback,
    discoveredAt: now,
  };

  // Bounded cache eviction
  if (discoveryCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = discoveryCache.keys().next().value;
    if (oldestKey) discoveryCache.delete(oldestKey);
  }
  discoveryCache.set(normalizedUrl, {
    expiresAt: now + CACHE_TTL_MS,
    data: result,
  });

  return result;
}
