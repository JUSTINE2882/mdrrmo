import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const globalForPg = globalThis as unknown as { pool: Pool };

const pool =
  globalForPg.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false }, // required for Supabase
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pool = pool;
}

export const db = drizzle(pool, { schema });
