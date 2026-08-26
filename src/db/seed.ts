import { db, isSqlConfigured } from './index.ts';
import { platforms, users, auditLogs } from './schema.ts';
import { PLATFORMS_DATA } from '../data/platforms.ts';
import { eq } from 'drizzle-orm';

export async function seedDatabaseIfEmpty() {
  if (!db || !isSqlConfigured()) {
    return;
  }
  try {
    const existing = await db.select().from(platforms);

    if (existing.length === 0) {
      console.log('Seeding initial SYNCROZZ platforms into PostgreSQL database...');
      for (const p of PLATFORMS_DATA) {
        await db.insert(platforms).values({
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
        }).onConflictDoNothing();
      }
      console.log(`Seeded ${PLATFORMS_DATA.length} platforms.`);
    }

    // Seed master admin placeholder record
    const masterAdminEmail = 'admin@syncrozz.com';
    const existingAdmin = await db.select().from(users).where(eq(users.email, masterAdminEmail));
    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        uid: 'master_admin_syncrozz',
        email: masterAdminEmail,
        displayName: 'Master Administrator',
        role: 'MASTER_ADMIN',
      }).onConflictDoNothing();
    }
  } catch (err) {
    console.warn('Database auto-seed notice:', err);
  }
}
