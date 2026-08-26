import { db, isSqlConfigured } from './index.ts';
import { users, platforms, platformOgImages, auditLogs, contactInquiries } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { PlatformItem } from '../types.ts';
import { PLATFORMS_DATA } from '../data/platforms.ts';

// In-Memory fallback caches
const inMemoryUsers = new Map<string, any>();
const inMemoryPlatforms = new Map<string, any>(
  PLATFORMS_DATA.map((p) => [
    p.id,
    {
      id: p.id,
      name: p.name,
      subName: p.subName || null,
      tagline: p.tagline,
      description: p.description,
      category: p.category,
      badgeColor: p.badgeColor || 'blue',
      accentColor: p.accentColor || 'blue',
      logoBg: p.logoBg || 'bg-blue-600',
      iconName: p.iconName || 'Sparkles',
      features: JSON.stringify(p.features || []),
      audience: JSON.stringify(p.audience || []),
      url: p.url || null,
      isPopular: p.isPopular ?? false,
      status: p.status || 'Active',
      ogImage: p.ogImage || null,
      ogTitle: p.ogTitle || null,
      ogDescription: p.ogDescription || null,
      isDefault: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
);
const inMemoryOgImages = new Map<string, { platformId: string; imageUrl: string; updatedBy: string; updatedAt: Date }>();
const inMemoryAuditLogs: any[] = [];
const inMemoryInquiries: any[] = [];

// User helper
export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  const fallbackRecord = {
    id: uid,
    uid,
    email,
    displayName: displayName || null,
    photoUrl: photoUrl || null,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryUsers.set(uid, fallbackRecord);

  if (!db || !isSqlConfigured()) {
    return fallbackRecord;
  }

  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.warn('PostgreSQL getOrCreateUser unavailable, using memory store.');
    return fallbackRecord;
  }
}

export async function getAllUsers() {
  if (!db || !isSqlConfigured()) {
    return Array.from(inMemoryUsers.values());
  }

  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.warn('PostgreSQL getAllUsers unavailable, using memory store.');
    return Array.from(inMemoryUsers.values());
  }
}

// Platforms helpers
export async function getActivePlatforms() {
  if (!db || !isSqlConfigured()) {
    return Array.from(inMemoryPlatforms.values()).filter((p) => !p.isDeleted);
  }

  try {
    return await db.select().from(platforms).where(eq(platforms.isDeleted, false));
  } catch (error) {
    console.warn('PostgreSQL getActivePlatforms unavailable, using memory store.');
    return Array.from(inMemoryPlatforms.values()).filter((p) => !p.isDeleted);
  }
}

export async function upsertPlatform(platform: PlatformItem, isDefault: boolean = false) {
  const record = {
    id: platform.id,
    name: platform.name,
    subName: platform.subName || null,
    tagline: platform.tagline,
    description: platform.description,
    category: platform.category,
    badgeColor: platform.badgeColor || 'blue',
    accentColor: platform.accentColor || 'blue',
    logoBg: platform.logoBg || 'bg-blue-600',
    iconName: platform.iconName || 'Sparkles',
    features: JSON.stringify(platform.features || []),
    audience: JSON.stringify(platform.audience || []),
    url: platform.url || null,
    isPopular: platform.isPopular ?? false,
    status: platform.status || 'Active',
    ogImage: platform.ogImage || null,
    ogTitle: platform.ogTitle || null,
    ogDescription: platform.ogDescription || null,
    isDefault,
    isDeleted: false,
    updatedAt: new Date(),
  };

  inMemoryPlatforms.set(platform.id, record);

  if (!db || !isSqlConfigured()) {
    return record;
  }

  try {
    const result = await db
      .insert(platforms)
      .values(record)
      .onConflictDoUpdate({
        target: platforms.id,
        set: {
          name: platform.name,
          subName: platform.subName || null,
          tagline: platform.tagline,
          description: platform.description,
          category: platform.category,
          badgeColor: platform.badgeColor || 'blue',
          accentColor: platform.accentColor || 'blue',
          logoBg: platform.logoBg || 'bg-blue-600',
          iconName: platform.iconName || 'Sparkles',
          features: JSON.stringify(platform.features || []),
          audience: JSON.stringify(platform.audience || []),
          url: platform.url || null,
          isPopular: platform.isPopular ?? false,
          status: platform.status || 'Active',
          ogImage: platform.ogImage || null,
          ogTitle: platform.ogTitle || null,
          ogDescription: platform.ogDescription || null,
          isDeleted: false,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.warn('PostgreSQL upsertPlatform unavailable, cached in memory.');
    return record;
  }
}

export async function softDeletePlatform(platformId: string) {
  const existing = inMemoryPlatforms.get(platformId);
  if (existing) {
    existing.isDeleted = true;
    existing.updatedAt = new Date();
    inMemoryPlatforms.set(platformId, existing);
  }

  if (!db || !isSqlConfigured()) {
    return existing || { id: platformId, isDeleted: true };
  }

  try {
    const result = await db
      .update(platforms)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(platforms.id, platformId))
      .returning();

    return result[0];
  } catch (error) {
    console.warn('PostgreSQL softDeletePlatform unavailable, marked in memory.');
    return existing || { id: platformId, isDeleted: true };
  }
}

// Open Graph Images
export async function getAllOgImages() {
  if (!db || !isSqlConfigured()) {
    return Array.from(inMemoryOgImages.values());
  }

  try {
    return await db.select().from(platformOgImages);
  } catch (error) {
    console.warn('PostgreSQL getAllOgImages unavailable, using memory store.');
    return Array.from(inMemoryOgImages.values());
  }
}

export async function upsertOgImage(platformId: string, imageUrl: string, updatedBy?: string) {
  const record = {
    platformId,
    imageUrl,
    updatedBy: updatedBy || 'admin',
    updatedAt: new Date(),
  };
  inMemoryOgImages.set(platformId, record);

  if (!db || !isSqlConfigured()) {
    return record;
  }

  try {
    const result = await db
      .insert(platformOgImages)
      .values(record)
      .onConflictDoUpdate({
        target: platformOgImages.platformId,
        set: {
          imageUrl,
          updatedBy: updatedBy || 'admin',
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.warn('PostgreSQL upsertOgImage unavailable, saved to memory.');
    return record;
  }
}

export async function deleteOgImage(platformId: string) {
  inMemoryOgImages.delete(platformId);

  if (!db || !isSqlConfigured()) {
    return { platformId };
  }

  try {
    return await db
      .delete(platformOgImages)
      .where(eq(platformOgImages.platformId, platformId))
      .returning();
  } catch (error) {
    console.warn('PostgreSQL deleteOgImage unavailable, removed from memory.');
    return { platformId };
  }
}

// Audit Logs
export async function createAuditLog(eventType: string, userEmail: string, status: string, details?: string) {
  const record = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    eventType,
    userEmail,
    status,
    details: details || null,
    timestamp: new Date(),
  };
  inMemoryAuditLogs.unshift(record);

  if (!db || !isSqlConfigured()) {
    return record;
  }

  try {
    const result = await db
      .insert(auditLogs)
      .values({
        eventType,
        userEmail,
        status,
        details: details || null,
      })
      .returning();

    return result[0];
  } catch (error) {
    return record;
  }
}

export async function getRecentAuditLogs(limitCount = 50) {
  if (!db || !isSqlConfigured()) {
    return inMemoryAuditLogs.slice(0, limitCount);
  }

  try {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(limitCount);
  } catch (error) {
    console.warn('PostgreSQL getRecentAuditLogs unavailable, returning memory logs.');
    return inMemoryAuditLogs.slice(0, limitCount);
  }
}

// Inquiries
export async function createContactInquiry(
  name: string,
  email: string,
  message: string,
  organization?: string,
  platformOfInterest?: string
) {
  const record = {
    id: 'inquiry_' + Date.now(),
    name,
    email,
    message,
    organization: organization || null,
    platformOfInterest: platformOfInterest || null,
    createdAt: new Date(),
  };
  inMemoryInquiries.push(record);

  if (!db || !isSqlConfigured()) {
    return record;
  }

  try {
    const result = await db
      .insert(contactInquiries)
      .values({
        name,
        email,
        message,
        organization: organization || null,
        platformOfInterest: platformOfInterest || null,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.warn('PostgreSQL createContactInquiry unavailable, saved in memory.');
    return record;
  }
}
