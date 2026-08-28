import { InquiryItem } from '../types';

const STORAGE_KEY_INQUIRIES = 'syncrozz_inquiries_cache';

/**
 * Get stored local inquiries
 */
export function getLocalInquiries(): InquiryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INQUIRIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return sortInquiriesNewest(parsed);
    }
    return [];
  } catch (e) {
    console.warn('Failed to parse local inquiries:', e);
    return [];
  }
}

/**
 * Save inquiries locally
 */
export function saveLocalInquiries(inquiries: InquiryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(sortInquiriesNewest(inquiries)));
  } catch (e) {
    console.warn('Failed to save local inquiries:', e);
  }
}

export const getStoredInquiries = getLocalInquiries;
export const saveStoredInquiries = saveLocalInquiries;


/**
 * Sort inquiries newest first based on createdAt
 */
export function sortInquiriesNewest(inquiries: InquiryItem[]): InquiryItem[] {
  return [...inquiries].sort((a, b) => {
    const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
    const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

/**
 * Helper to count unread or new inquiries
 */
export function countUnreadInquiries(inquiries: InquiryItem[]): number {
  return inquiries.filter(i => !i.read || i.status === 'new').length;
}

/**
 * Add or update an inquiry in the list
 */
export function mergeInquiries(existing: InquiryItem[], incoming: InquiryItem[]): InquiryItem[] {
  const map = new Map<string, InquiryItem>();
  existing.forEach(item => map.set(item.id, item));
  incoming.forEach(item => {
    // If incoming exists, update it
    map.set(item.id, {
      ...map.get(item.id),
      ...item
    });
  });
  return sortInquiriesNewest(Array.from(map.values()));
}
