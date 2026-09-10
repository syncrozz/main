import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from './schema.ts';

declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const isSqlConfigured = (): boolean => {
  return Boolean(process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME);
};

export const createPool = (): pg.Pool | null => {
  if (!isSqlConfigured()) {
    return null;
  }
  try {
    if (!global._postgresPool) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15000,
      });

      global._postgresPool.on('error', (err) => {
        console.error('Unexpected error on idle SQL pool client:', err);
      });
    }
    return global._postgresPool;
  } catch (err) {
    console.warn('[AI Studio] PostgreSQL pool creation error:', err);
    return null;
  }
};

let dbInstance: any = null;
try {
  const pool = createPool();
  if (pool) {
    dbInstance = drizzle(pool, { schema });
  }
} catch (err) {
  console.warn('[AI Studio] Database not connected — using mock/in-memory fallback:', err);
  dbInstance = null;
}

export const db = dbInstance;

