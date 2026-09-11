import { db, isSqlConfigured } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

// Auto-seeding disabled per architecture guidelines:
// Empty, reduced, or deleted platforms are a valid application state.
// No default/mock platforms should be resurrected automatically.
export async function seedDatabaseIfEmpty() {
  if (!db || !isSqlConfigured()) {
    return;
  }
  try {
    // Only ensure master admin record exists if completely missing
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
    console.warn('Database user init notice:', err);
  }
}
