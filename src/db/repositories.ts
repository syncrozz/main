import { db } from './index.ts';
import { users, platforms, platformOgImages, auditLogs, contactInquiries } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { PlatformItem } from '../types.ts';

// User helper
export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const result = await db.insert(users)
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
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Failed to synchronize user record.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Database getAllUsers failed:', error);
    throw new Error('Failed to retrieve users.', { cause: error });
  }
}

// Platforms helpers
export async function getActivePlatforms() {
  try {
    return await db.select().from(platforms).where(eq(platforms.isDeleted, false));
  } catch (error) {
    console.error('Database getActivePlatforms failed:', error);
    throw new Error('Failed to retrieve active platforms.', { cause: error });
  }
}

export async function upsertPlatform(platform: PlatformItem, isDefault: boolean = false) {
  try {
    const result = await db.insert(platforms)
      .values({
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
      })
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
    console.error('Database upsertPlatform failed:', error);
    throw new Error('Failed to save platform.', { cause: error });
  }
}

export async function softDeletePlatform(platformId: string) {
  try {
    const result = await db.update(platforms)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(platforms.id, platformId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database softDeletePlatform failed:', error);
    throw new Error('Failed to delete platform.', { cause: error });
  }
}

// Open Graph Images
export async function getAllOgImages() {
  try {
    return await db.select().from(platformOgImages);
  } catch (error) {
    console.error('Database getAllOgImages failed:', error);
    throw new Error('Failed to retrieve OG images.', { cause: error });
  }
}

export async function upsertOgImage(platformId: string, imageUrl: string, updatedBy?: string) {
  try {
    const result = await db.insert(platformOgImages)
      .values({
        platformId,
        imageUrl,
        updatedBy: updatedBy || 'admin',
        updatedAt: new Date(),
      })
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
    console.error('Database upsertOgImage failed:', error);
    throw new Error('Failed to save OG image.', { cause: error });
  }
}

export async function deleteOgImage(platformId: string) {
  try {
    return await db.delete(platformOgImages)
      .where(eq(platformOgImages.platformId, platformId))
      .returning();
  } catch (error) {
    console.error('Database deleteOgImage failed:', error);
    throw new Error('Failed to delete OG image.', { cause: error });
  }
}

// Audit Logs
export async function createAuditLog(eventType: string, userEmail: string, status: string, details?: string) {
  try {
    const result = await db.insert(auditLogs)
      .values({
        eventType,
        userEmail,
        status,
        details: details || null,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database createAuditLog failed:', error);
    // Don't throw for audit log failures to prevent disrupting primary user flows
    return null;
  }
}

export async function getRecentAuditLogs(limitCount = 50) {
  try {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(limitCount);
  } catch (error) {
    console.error('Database getRecentAuditLogs failed:', error);
    throw new Error('Failed to retrieve audit logs.', { cause: error });
  }
}

// Inquiries
export async function createContactInquiry(name: string, email: string, message: string, organization?: string, platformOfInterest?: string) {
  try {
    const result = await db.insert(contactInquiries)
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
    console.error('Database createContactInquiry failed:', error);
    throw new Error('Failed to submit contact inquiry.', { cause: error });
  }
}
