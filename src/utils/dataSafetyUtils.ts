import { PlatformItem, InquiryItem } from '../types';
import { CarouselSlide } from './carouselStorage';
import { downloadFile } from './csvDataUtils';

/**
 * SYNCROZZ ENGINEERING STANDARD (SES) v4.4
 * Data Safety, Offline Backup, Duplicate Auditing & Recovery Suite.
 */

export interface SyncrozzBackupPayload {
  version: string;
  exportedAt: string;
  environment: string;
  stats: {
    platformsCount: number;
    customUrlsCount: number;
    carouselSlidesCount: number;
    inquiriesCount: number;
    deletedDefaultIdsCount: number;
  };
  data: {
    platforms: PlatformItem[];
    customUrls: Record<string, string>;
    carouselSlides: CarouselSlide[];
    inquiries: InquiryItem[];
    deletedDefaultIds: string[];
  };
}

export interface DuplicatePlatformGroup {
  id: string;
  reason: string;
  confidence: 'Tepat (100%)' | 'Tinggi (90%)' | 'Sederhana (75%)';
  matchType: 'id_exact' | 'name_normalized' | 'url_exact' | 'tagline_similar';
  items: PlatformItem[];
}

export interface DuplicateInquiryGroup {
  id: string;
  reason: string;
  confidence: 'Tepat (100%)' | 'Tinggi (90%)' | 'Sederhana (75%)';
  matchType: 'email_phone_exact' | 'email_identical_message' | 'frequent_sender';
  items: InquiryItem[];
}

export interface DuplicateAuditReport {
  timestamp: number;
  totalPlatformsScanned: number;
  duplicatePlatformGroups: DuplicatePlatformGroup[];
  totalDuplicatePlatforms: number;
  totalInquiriesScanned: number;
  duplicateInquiryGroups: DuplicateInquiryGroup[];
  totalDuplicateInquiries: number;
}

/**
 * Clean string for fuzzy and normalized matching
 */
function normalizeText(text: string): string {
  return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Simple Token-based Jaccard similarity for description / tagline comparison
 */
function calculateTextSimilarity(textA: string, textB: string): number {
  const wordsA = new Set((textA || '').toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set((textB || '').toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach(w => {
    if (wordsB.has(w)) intersection++;
  });

  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Perform deep non-destructive duplicate audit on real platforms & inquiries
 */
export function auditDuplicates(
  platforms: PlatformItem[],
  inquiries: InquiryItem[],
  customUrls: Record<string, string> = {}
): DuplicateAuditReport {
  const duplicatePlatformGroups: DuplicatePlatformGroup[] = [];
  const processedPlatformPairs = new Set<string>();

  // 1. Audit Platforms
  for (let i = 0; i < platforms.length; i++) {
    for (let j = i + 1; j < platforms.length; j++) {
      const a = platforms[i];
      const b = platforms[j];
      const pairKey = [a.id, b.id].sort().join(':::');
      if (processedPlatformPairs.has(pairKey)) continue;

      const normNameA = normalizeText(a.name);
      const normNameB = normalizeText(b.name);

      const urlA = (a.url || customUrls[a.id] || '').trim().replace(/\/$/, '').toLowerCase();
      const urlB = (b.url || customUrls[b.id] || '').trim().replace(/\/$/, '').toLowerCase();

      // Case 1: Exact ID collision (if differing objects with same ID exist)
      if (a.id === b.id) {
        processedPlatformPairs.add(pairKey);
        duplicatePlatformGroups.push({
          id: `dup_id_${a.id}`,
          reason: `Pengenal ID tepat bertindih: "${a.id}"`,
          confidence: 'Tepat (100%)',
          matchType: 'id_exact',
          items: [a, b]
        });
        continue;
      }

      // Case 2: Exact or normalized name match
      if (normNameA && normNameB && normNameA === normNameB) {
        processedPlatformPairs.add(pairKey);
        duplicatePlatformGroups.push({
          id: `dup_name_${a.id}_${b.id}`,
          reason: `Nama platform serupa selepas normalisasi: "${a.name}" & "${b.name}"`,
          confidence: 'Tinggi (90%)',
          matchType: 'name_normalized',
          items: [a, b]
        });
        continue;
      }

      // Case 3: Exact URL match
      if (urlA && urlB && urlA.length > 8 && urlA === urlB) {
        processedPlatformPairs.add(pairKey);
        duplicatePlatformGroups.push({
          id: `dup_url_${a.id}_${b.id}`,
          reason: `Kedua-dua platform berkongsi URL destinasi sama: "${urlA}"`,
          confidence: 'Tinggi (90%)',
          matchType: 'url_exact',
          items: [a, b]
        });
        continue;
      }

      // Case 4: Highly similar tagline / description (> 85% token match)
      const taglineSim = calculateTextSimilarity(a.tagline, b.tagline);
      const descSim = calculateTextSimilarity(a.description, b.description);
      if (taglineSim > 0.85 || descSim > 0.85) {
        processedPlatformPairs.add(pairKey);
        duplicatePlatformGroups.push({
          id: `dup_sim_${a.id}_${b.id}`,
          reason: `Penerangan/tagline hampir seiras (${Math.round(Math.max(taglineSim, descSim) * 100)}% kesamaan)`,
          confidence: 'Sederhana (75%)',
          matchType: 'tagline_similar',
          items: [a, b]
        });
      }
    }
  }

  // 2. Audit Inquiries
  const duplicateInquiryGroups: DuplicateInquiryGroup[] = [];
  const processedInquiryPairs = new Set<string>();

  for (let i = 0; i < inquiries.length; i++) {
    for (let j = i + 1; j < inquiries.length; j++) {
      const a = inquiries[i];
      const b = inquiries[j];
      const pairKey = [a.id, b.id].sort().join(':::');
      if (processedInquiryPairs.has(pairKey)) continue;

      const emailA = (a.email || '').trim().toLowerCase();
      const emailB = (b.email || '').trim().toLowerCase();

      const phoneA = (a.phone || '').replace(/[^0-9]/g, '');
      const phoneB = (b.phone || '').replace(/[^0-9]/g, '');

      const msgA = normalizeText(a.message);
      const msgB = normalizeText(b.message);

      // Case 1: Same email and same phone with identical message
      if (emailA && emailA === emailB && msgA && msgA === msgB) {
        processedInquiryPairs.add(pairKey);
        duplicateInquiryGroups.push({
          id: `dup_inq_msg_${a.id}_${b.id}`,
          reason: `Mesej dan emel penghantar sama tepat: "${a.email}"`,
          confidence: 'Tepat (100%)',
          matchType: 'email_identical_message',
          items: [a, b]
        });
        continue;
      }

      // Case 2: Same email & phone
      if (emailA && emailA === emailB && phoneA && phoneB && phoneA === phoneB) {
        processedInquiryPairs.add(pairKey);
        duplicateInquiryGroups.push({
          id: `dup_inq_contact_${a.id}_${b.id}`,
          reason: `Maklumat perhubungan sama (Emel: ${a.email}, Tel: ${a.phone})`,
          confidence: 'Tinggi (90%)',
          matchType: 'email_phone_exact',
          items: [a, b]
        });
      }
    }
  }

  const totalDuplicatePlatforms = new Set(
    duplicatePlatformGroups.flatMap(g => g.items.map(p => p.id))
  ).size;

  const totalDuplicateInquiries = new Set(
    duplicateInquiryGroups.flatMap(g => g.items.map(i => i.id))
  ).size;

  return {
    timestamp: Date.now(),
    totalPlatformsScanned: platforms.length,
    duplicatePlatformGroups,
    totalDuplicatePlatforms,
    totalInquiriesScanned: inquiries.length,
    duplicateInquiryGroups,
    totalDuplicateInquiries
  };
}

/**
 * Generate and trigger download for "Backup Data"
 * Note: Uses structured internal serialization while never exposing the word "JSON" in user-facing labels.
 */
export function createAndDownloadDataBackup(params: {
  platforms: PlatformItem[];
  customUrls: Record<string, string>;
  carouselSlides: CarouselSlide[];
  inquiries: InquiryItem[];
  deletedDefaultIds: string[];
}): void {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  const payload: SyncrozzBackupPayload = {
    version: '4.4',
    exportedAt: now.toISOString(),
    environment: 'production_cloud',
    stats: {
      platformsCount: params.platforms.length,
      customUrlsCount: Object.keys(params.customUrls).length,
      carouselSlidesCount: params.carouselSlides.length,
      inquiriesCount: params.inquiries.length,
      deletedDefaultIdsCount: params.deletedDefaultIds.length
    },
    data: {
      platforms: params.platforms,
      customUrls: params.customUrls,
      carouselSlides: params.carouselSlides,
      inquiries: params.inquiries,
      deletedDefaultIds: params.deletedDefaultIds
    }
  };

  const serialized = JSON.stringify(payload, null, 2);
  const filename = `SYNCROZZ_BACKUP_${dateStr}_${timeStr}.dat`;
  downloadFile(serialized, filename, 'application/octet-stream');
}

/**
 * Validate and parse a user-selected backup file
 */
export function validateBackupFile(fileContent: string): {
  isValid: boolean;
  errors: string[];
  payload?: SyncrozzBackupPayload;
} {
  try {
    const parsed = JSON.parse(fileContent);
    const errors: string[] = [];

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, errors: ['Format data sandaran tidak sah atau rosak.'] };
    }

    if (!parsed.data || typeof parsed.data !== 'object') {
      errors.push('Struktur data sandaran tidak lengkap (tiada blok data teras).');
    }

    if (!Array.isArray(parsed.data?.platforms)) {
      errors.push('Senarai platform tidak dijumpai dalam fail sandaran.');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const payload: SyncrozzBackupPayload = {
      version: parsed.version || '4.4',
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      environment: parsed.environment || 'syncrozz_standalone',
      stats: {
        platformsCount: Array.isArray(parsed.data.platforms) ? parsed.data.platforms.length : 0,
        customUrlsCount: parsed.data.customUrls ? Object.keys(parsed.data.customUrls).length : 0,
        carouselSlidesCount: Array.isArray(parsed.data.carouselSlides) ? parsed.data.carouselSlides.length : 0,
        inquiriesCount: Array.isArray(parsed.data.inquiries) ? parsed.data.inquiries.length : 0,
        deletedDefaultIdsCount: Array.isArray(parsed.data.deletedDefaultIds) ? parsed.data.deletedDefaultIds.length : 0
      },
      data: {
        platforms: parsed.data.platforms || [],
        customUrls: parsed.data.customUrls || {},
        carouselSlides: parsed.data.carouselSlides || [],
        inquiries: parsed.data.inquiries || [],
        deletedDefaultIds: parsed.data.deletedDefaultIds || []
      }
    };

    return { isValid: true, errors: [], payload };
  } catch (e) {
    return {
      isValid: false,
      errors: ['Gagal membaca fail sandaran. Pastikan anda memilih fail sandaran SYNCROZZ yang sah.']
    };
  }
}
