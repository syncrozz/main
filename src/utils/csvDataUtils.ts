import { PlatformItem, InquiryItem } from '../types';

/**
 * SYNCROZZ ENGINEERING STANDARD (SES) v4.4
 * Deterministic, RFC 4180-compliant CSV generation and parsing utilities.
 * Supports UTF-8 BOM, quoted strings, escaped quotes (""), newlines, and strict schema validation.
 */

// UTF-8 BOM for Excel / Google Sheets compatibility
const UTF8_BOM = '\uFEFF';

/**
 * Safely escape a single CSV field
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }
  let str: string;
  if (Array.isArray(val)) {
    str = val.join('; ');
  } else if (typeof val === 'object') {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }

  // If contains quotes, commas, newlines, or semicolons, wrap in quotes and escape internal quotes
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Standard CSV Platform Headers
 */
export const PLATFORM_CSV_HEADERS = [
  'ID',
  'Name',
  'SubName',
  'Tagline',
  'Category',
  'Status',
  'URL',
  'Description',
  'Features',
  'Audience',
  'BadgeColor',
  'AccentColor',
  'LogoBg',
  'IconName',
  'IsPopular',
  'IsCustom',
  'CreatedAt',
  'UpdatedAt'
] as const;

/**
 * Convert PlatformItem[] to deterministic CSV
 */
export function exportPlatformsToCsv(platforms: PlatformItem[]): string {
  const headerRow = PLATFORM_CSV_HEADERS.join(',');
  const rows = platforms.map(p => {
    return [
      escapeCsvField(p.id),
      escapeCsvField(p.name),
      escapeCsvField(p.subName || ''),
      escapeCsvField(p.tagline),
      escapeCsvField(p.category),
      escapeCsvField(p.status || 'Active'),
      escapeCsvField(p.url || ''),
      escapeCsvField(p.description),
      escapeCsvField(Array.isArray(p.features) ? p.features.join('; ') : ''),
      escapeCsvField(Array.isArray(p.audience) ? p.audience.join('; ') : ''),
      escapeCsvField(p.badgeColor || 'blue'),
      escapeCsvField(p.accentColor || 'blue'),
      escapeCsvField(p.logoBg || 'bg-blue-600'),
      escapeCsvField(p.iconName || 'Sparkles'),
      escapeCsvField(p.isPopular ? 'true' : 'false'),
      escapeCsvField(p.isCustom ? 'true' : 'false'),
      escapeCsvField(p.createdAt ? new Date(p.createdAt).toISOString() : ''),
      escapeCsvField(p.updatedAt ? new Date(p.updatedAt).toISOString() : '')
    ].join(',');
  });

  return UTF8_BOM + [headerRow, ...rows].join('\r\n');
}

/**
 * Standard CSV Inquiry Headers
 */
export const INQUIRY_CSV_HEADERS = [
  'ID',
  'Name',
  'Email',
  'Phone',
  'Organization',
  'PlatformInterest',
  'Status',
  'Read',
  'Message',
  'Notes',
  'CreatedAt',
  'UpdatedAt'
] as const;

/**
 * Convert InquiryItem[] to deterministic CSV
 */
export function exportInquiriesToCsv(inquiries: InquiryItem[]): string {
  const headerRow = INQUIRY_CSV_HEADERS.join(',');
  const rows = inquiries.map(i => {
    return [
      escapeCsvField(i.id),
      escapeCsvField(i.name),
      escapeCsvField(i.email),
      escapeCsvField(i.phone || ''),
      escapeCsvField(i.organization || ''),
      escapeCsvField(i.platformInterest || ''),
      escapeCsvField(i.status || 'new'),
      escapeCsvField(i.read ? 'true' : 'false'),
      escapeCsvField(i.message),
      escapeCsvField(i.notes || ''),
      escapeCsvField(i.createdAt ? new Date(i.createdAt).toISOString() : ''),
      escapeCsvField(i.updatedAt ? new Date(i.updatedAt).toISOString() : '')
    ].join(',');
  });

  return UTF8_BOM + [headerRow, ...rows].join('\r\n');
}

/**
 * Deterministic RFC 4180-compliant CSV Parser
 * Handles multiline cells inside quotes, doubled quotation marks, and arbitrary row delimiters
 */
export function parseRawCsv(csvText: string): string[][] {
  // Strip BOM if present
  let text = csvText;
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Flush remaining field
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  // Filter out completely empty rows
  return rows.filter(r => r.some(cell => cell.trim().length > 0));
}

export interface PlatformValidationResult {
  rowNumber: number;
  data?: PlatformItem;
  errors: string[];
  warnings: string[];
  isDuplicateInCsv?: boolean;
}

export interface InquiryValidationResult {
  rowNumber: number;
  data?: InquiryItem;
  errors: string[];
  warnings: string[];
  isDuplicateInCsv?: boolean;
}

/**
 * Validate and normalize raw parsed CSV rows into PlatformItem[]
 */
export function validateAndNormalizePlatformCsv(rawRows: string[][]): {
  isValidHeader: boolean;
  headerErrors: string[];
  results: PlatformValidationResult[];
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
} {
  if (rawRows.length === 0) {
    return {
      isValidHeader: false,
      headerErrors: ['Fail CSV kosong. Sila pilih fail CSV yang mengandungi data platform.'],
      results: [],
      validCount: 0,
      invalidCount: 0,
      duplicateCount: 0
    };
  }

  const rawHeaders = rawRows[0].map(h => h.trim().toLowerCase());
  const headerMap = new Map<string, number>();
  rawHeaders.forEach((h, idx) => headerMap.set(h, idx));

  // Required header fields
  const requiredHeaders = ['name', 'tagline', 'description'];
  const missingHeaders = requiredHeaders.filter(h => !headerMap.has(h));

  if (missingHeaders.length > 0) {
    return {
      isValidHeader: false,
      headerErrors: [`Lajur wajib tidak dijumpai: ${missingHeaders.join(', ')}. Pastikan fail mengandungi pengepala: Name, Tagline, Description.`],
      results: [],
      validCount: 0,
      invalidCount: 0,
      duplicateCount: 0
    };
  }

  const getVal = (row: string[], colName: string): string => {
    const idx = headerMap.get(colName.toLowerCase());
    if (idx !== undefined && row[idx] !== undefined) {
      return row[idx].trim();
    }
    return '';
  };

  const results: PlatformValidationResult[] = [];
  const seenIdsInCsv = new Set<string>();
  const seenNamesInCsv = new Set<string>();

  let duplicateCount = 0;

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rowNumber = i + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    const rawName = getVal(row, 'name');
    const rawTagline = getVal(row, 'tagline');
    const rawDescription = getVal(row, 'description');
    let rawCategory = getVal(row, 'category');
    const rawStatus = getVal(row, 'status');
    const rawUrl = getVal(row, 'url');
    let rawId = getVal(row, 'id');

    if (!rawName) errors.push('Nama platform wajib diisi.');
    if (!rawTagline) errors.push('Tagline platform wajib diisi.');
    if (!rawDescription) errors.push('Penerangan platform wajib diisi.');

    // Generate or sanitize ID
    if (!rawId) {
      rawId = rawName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!rawId) rawId = `custom_platform_${Date.now()}_${i}`;
      warnings.push(`ID dijana automatik: ${rawId}`);
    } else {
      rawId = rawId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    }

    // Category normalization
    const validCategories = ['Education', 'Campus', 'Productivity', 'Community', 'Innovation'];
    const matchedCategory = validCategories.find(c => c.toLowerCase() === rawCategory.toLowerCase());
    if (matchedCategory) {
      rawCategory = matchedCategory;
    } else {
      rawCategory = 'Productivity';
      if (getVal(row, 'category')) {
        warnings.push(`Kategori diselaraskan kepada 'Productivity' (sebelum: ${getVal(row, 'category')})`);
      }
    }

    // Status normalization
    let status: 'Active' | 'Beta' | 'New' = 'Active';
    if (/beta/i.test(rawStatus)) status = 'Beta';
    else if (/new|baharu/i.test(rawStatus)) status = 'New';

    // Parse features and audience (semicolon or comma split)
    const rawFeatures = getVal(row, 'features');
    const features = rawFeatures
      ? rawFeatures.split(/[;|\n]/).map(f => f.trim()).filter(f => f.length > 0)
      : ['Penyegerakan masa nyata', 'Integrasi SYNCROZZ'];

    const rawAudience = getVal(row, 'audience');
    const audience = rawAudience
      ? rawAudience.split(/[;|\n]/).map(a => a.trim()).filter(a => a.length > 0)
      : ['Semua Pengguna'];

    // Check duplicate within the CSV itself
    let isDuplicateInCsv = false;
    const normalizedName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenIdsInCsv.has(rawId) || seenNamesInCsv.has(normalizedName)) {
      isDuplicateInCsv = true;
      duplicateCount++;
      warnings.push('Rekod pendua dikesan dalam fail CSV yang sama.');
    } else {
      seenIdsInCsv.add(rawId);
      seenNamesInCsv.add(normalizedName);
    }

    let parsedItem: PlatformItem | undefined;
    if (errors.length === 0) {
      parsedItem = {
        id: rawId,
        name: rawName,
        subName: getVal(row, 'subname') || undefined,
        tagline: rawTagline,
        description: rawDescription,
        category: rawCategory as any,
        status,
        url: rawUrl || undefined,
        features,
        audience,
        badgeColor: getVal(row, 'badgecolor') || 'blue',
        accentColor: getVal(row, 'accentcolor') || 'blue',
        logoBg: getVal(row, 'logobg') || 'bg-blue-600',
        iconName: getVal(row, 'iconname') || 'Sparkles',
        isPopular: /true|ya|1/i.test(getVal(row, 'ispopular')),
        isCustom: true,
        createdAt: getVal(row, 'createdat') || Date.now(),
        updatedAt: Date.now()
      };
    }

    results.push({
      rowNumber,
      data: parsedItem,
      errors,
      warnings,
      isDuplicateInCsv
    });
  }

  const validCount = results.filter(r => r.errors.length === 0).length;
  const invalidCount = results.filter(r => r.errors.length > 0).length;

  return {
    isValidHeader: true,
    headerErrors: [],
    results,
    validCount,
    invalidCount,
    duplicateCount
  };
}

/**
 * Trigger deterministic browser file download
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
