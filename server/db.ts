// src/lib/db.ts
/**
 * Robust Postgres + Drizzle connector (TS-friendly)
 *
 * - Uses DATABASE_URL / DEV_DATABASE_URL (no hardcoded creds)
 * - Reuses pool & drizzle instance across hot-reloads (global)
 * - Connect-retry with exponential backoff
 * - Graceful shutdown + process handlers
 * - Avoids newer JS syntax that some bundlers choke on (no ?? or ?.)
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';

console.log(process.env.DATABASE_URL);

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('Loaded .env from:', envPath);
} else {
  // still load any env vars provided by the environment
  console.warn('No .env found at', envPath);
}

// Use conservative fallbacks (avoid nullish coalescing ??)
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

// prefer DEV_DATABASE_URL in development, otherwise DATABASE_URL
const connectionString = isDev && process.env.DEV_DATABASE_URL
  ? process.env.DEV_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or DEV_DATABASE_URL must be set in environment');
}

// Pool configuration (tunable via env)
const poolConfig = {
  connectionString: connectionString,
  max: Number(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || '30000'),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || '10000')
};

// Keep pool + drizzle on globalThis to avoid duplicates (hot reloads / serverless)
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __drizzle: ReturnType<typeof drizzle> | undefined;
}

const globalAny: any = globalThis as any;

const pool: Pool = globalAny.__pgPool ? globalAny.__pgPool : new Pool(poolConfig);
if (!globalAny.__pgPool) globalAny.__pgPool = pool;

pool.on('error', (err: Error) => {
  console.error('Unexpected Postgres client error', err);
});

/**
 * Try connecting with retries (non-blocking IIFE).
 * Exits the process if the DB cannot be reached after retries.
 */
(function connectWithRetry() {
  const maxRetries = Number(process.env.DB_CONNECT_RETRIES || '5');
  let attempt = 0;

  async function tryConnect(): Promise<void> {
    attempt += 1;
    try {
      // simple probe
      await pool.query('SELECT 1');
      console.log('✅ Successfully connected to the database');
    } catch (err) {
      const errMsg = (err && (err as Error).message) ? (err as Error).message : String(err);
      console.warn('DB connect attempt', attempt, 'failed:', errMsg);
      if (attempt >= maxRetries) {
        console.error('Exceeded maximum DB connection attempts. Exiting.');
        console.error(err);
        // give a tiny bit of time for logs to flush, then exit
        setTimeout(() => process.exit(1), 50);
        return;
      }
      // exponential backoff: min(1000 * 2^(attempt-1), 30000)
      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
      setTimeout(tryConnect, backoffMs);
    }
  }

  // start first attempt
  tryConnect();
})();

// Drizzle singleton
const drizzleInstance = globalAny.__drizzle ? globalAny.__drizzle : drizzle(pool, { schema });
if (!globalAny.__drizzle) globalAny.__drizzle = drizzleInstance;

export const db = drizzleInstance;

// Helper for raw queries
export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

// Simple health-check helper
export async function isDBReady(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  }
}

// Graceful shutdown
let shuttingDown = false;
async function _shutdown(signal?: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('Shutdown signal received (' + (signal || 'unknown') + '). Closing DB pool...');
  try {
    await pool.end();
    console.log('DB pool closed.');
  } catch (err) {
    console.error('Error closing DB pool', err);
  } finally {
    // ensure exit
    setTimeout(() => process.exit(0), 50);
  }
}

process.on('SIGINT', function () { _shutdown('SIGINT'); });
process.on('SIGTERM', function () { _shutdown('SIGTERM'); });

process.on('unhandledRejection', function (reason) {
  console.error('Unhandled Rejection at promise:', reason);
});
process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception thrown:', err);
  _shutdown('uncaughtException');
});
