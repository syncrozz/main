import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * SYNCROZZ Firestore Cross-Project Migration Tool (SES v4.5)
 *
 * Usage:
 *   npx tsx scripts/migrate-firestore.ts --dry-run
 *   SOURCE_SERVICE_ACCOUNT_JSON=/path/old-sa.json TARGET_SERVICE_ACCOUNT_JSON=/path/syncrozz3-sa.json npx tsx scripts/migrate-firestore.ts
 *
 * Optional flags:
 *   --dry-run                Inspect source & local .syncrozz_store.json without writing to syncrozz3
 *   --seed-store             Seed non-PII public showcase collections in syncrozz3 from .syncrozz_store.json
 *   --target-db=<dbId>       Override target databaseId (defaults to firebase-applet-config.json firestoreDatabaseId)
 */

const OLD_PROJECT_ID = 'gen-lang-client-0739778545';
const OLD_DATABASE_ID = 'ai-studio-main-9397a38a-d011-40a3-a753-a8b0bc16511d';
const NEW_PROJECT_ID = 'syncrozz3';

const COLLECTIONS_TO_MIGRATE = [
  'platformOgImages',
  'customPlatforms',
  'customPlatformUrls',
  'platformSettings',
  'inquiries',
  'admins',
  'auditLogs',
];

function readJsonFile(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const seedStore = args.has('--seed-store');
  const dbFlag = process.argv.slice(2).find((a) => a.startsWith('--target-db='));

  const appletConfig = readJsonFile(path.join(process.cwd(), 'firebase-applet-config.json'));
  const targetDbId = dbFlag
    ? dbFlag.replace('--target-db=', '').trim()
    : appletConfig.firestoreDatabaseId || '(default)';

  const sourceSaPath = process.env.SOURCE_SERVICE_ACCOUNT_JSON;
  const targetSaPath = process.env.TARGET_SERVICE_ACCOUNT_JSON;
  const storePath = path.join(process.cwd(), '.syncrozz_store.json');

  console.log('=== SYNCROZZ Firestore Migration Tool ===');
  console.log(`Mode: ${dryRun ? 'DRY-RUN (no remote writes)' : 'LIVE EXECUTION'}`);
  console.log(`Source: ${OLD_PROJECT_ID} (${OLD_DATABASE_ID})`);
  console.log(`Target: ${NEW_PROJECT_ID} (${targetDbId})`);

  if (fs.existsSync(storePath)) {
    const store = readJsonFile(storePath);
    console.log('\n[Local .syncrozz_store.json Summary]');
    console.log({
      version: store.version,
      platformsCount: Array.isArray(store.platforms) ? store.platforms.length : 0,
      customUrlsCount: store.customUrls ? Object.keys(store.customUrls).length : 0,
      carouselSlidesCount: Array.isArray(store.carouselSlides) ? store.carouselSlides.length : 0,
      deletedDefaultIdsCount: Array.isArray(store.deletedDefaultIds) ? store.deletedDefaultIds.length : 0,
      ogImagesCount: store.ogImages ? Object.keys(store.ogImages).length : 0,
      inquiriesCount: Array.isArray(store.inquiries) ? store.inquiries.length : 0,
      secondaryAdminsCount: Array.isArray(store.secondaryAdmins) ? store.secondaryAdmins.length : 0,
    });
  }

  if (!sourceSaPath && !seedStore) {
    console.log(
      '\nNotice: SOURCE_SERVICE_ACCOUNT_JSON not supplied. Skipping remote cross-project export (cannot fabricate remote records without source project credentials).'
    );
    return;
  }

  const targetApp = initializeApp(
    targetSaPath ? { credential: cert(readJsonFile(targetSaPath)), projectId: NEW_PROJECT_ID } : { projectId: NEW_PROJECT_ID },
    'migration-target'
  );
  const targetDb =
    targetDbId && targetDbId !== '(default)' ? getFirestore(targetApp, targetDbId) : getFirestore(targetApp);

  let sourceApp: ReturnType<typeof initializeApp> | null = null;
  const counts: Record<string, { read: number; written: number }> = {};

  try {
    if (sourceSaPath) {
      sourceApp = initializeApp(
        { credential: cert(readJsonFile(sourceSaPath)), projectId: OLD_PROJECT_ID },
        'migration-source'
      );
      const sourceDb = getFirestore(sourceApp, OLD_DATABASE_ID);

      for (const colName of COLLECTIONS_TO_MIGRATE) {
        const snap = await sourceDb.collection(colName).get();
        counts[colName] = { read: snap.size, written: 0 };

        for (const docSnap of snap.docs) {
          const data = docSnap.data();

          // Migrate legacy platformOgImages/config_inquiries safely into isolated /inquiries collection
          if (colName === 'platformOgImages' && docSnap.id === 'config_inquiries') {
            const legacyList = Array.isArray(data?.inquiries) ? data.inquiries : [];
            for (const inq of legacyList) {
              if (!inq || !inq.id || !inq.email) continue;
              if (!dryRun) {
                await targetDb.collection('inquiries').doc(String(inq.id)).set(inq, { merge: true });
              }
              counts['inquiries'] = counts['inquiries'] || { read: 0, written: 0 };
              counts['inquiries'].written += 1;
            }
            continue;
          }

          if (!dryRun) {
            await targetDb.collection(colName).doc(docSnap.id).set(data, { merge: true });
          }
          counts[colName].written += 1;
        }
      }
    }

    if (seedStore && fs.existsSync(storePath)) {
      const store = readJsonFile(storePath);
      const nowIso = new Date().toISOString();
      if (!dryRun) {
        if (Array.isArray(store.carouselSlides) && store.carouselSlides.length > 0) {
          await targetDb.collection('platformOgImages').doc('config_hero_carousel').set(
            { slides: store.carouselSlides, updatedAt: nowIso, updatedBy: 'migration-script' },
            { merge: true }
          );
        }
        if (Array.isArray(store.platforms) && store.platforms.length > 0) {
          await targetDb.collection('platformOgImages').doc('config_custom_platforms').set(
            { platforms: store.platforms, updatedAt: nowIso, updatedBy: 'migration-script' },
            { merge: true }
          );
        }
        if (store.customUrls && Object.keys(store.customUrls).length > 0) {
          await targetDb.collection('platformOgImages').doc('config_custom_urls').set(
            { urls: store.customUrls, updatedAt: nowIso, updatedBy: 'migration-script' },
            { merge: true }
          );
        }
        if (Array.isArray(store.deletedDefaultIds) && store.deletedDefaultIds.length > 0) {
          await targetDb.collection('platformOgImages').doc('config_deleted_platforms').set(
            { deletedIds: store.deletedDefaultIds, updatedAt: nowIso, updatedBy: 'migration-script' },
            { merge: true }
          );
        }
      }
    }

    console.log('\nMigration summary:', counts);
  } finally {
    if (sourceApp) await deleteApp(sourceApp).catch(() => {});
    await deleteApp(targetApp).catch(() => {});
  }
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
