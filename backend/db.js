const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Vercel won't automatically load `backend/.env` (dotenv looks in the CWD by default).
// Load it only when the hosting env vars aren't already provided.
const loadEnvIfMissing = () => {
  const currentDbUrl = (process.env.DATABASE_URL || '').trim();
  if (currentDbUrl) return;

  const vercelEnvPath = path.join(__dirname, '.env.vercel.prod');
  const localEnvPath = path.join(__dirname, '.env');

  if (process.env.VERCEL === '1' && fs.existsSync(vercelEnvPath)) {
    dotenv.config({ path: vercelEnvPath, override: false });
  }

  const dbUrlAfterVercelLoad = (process.env.DATABASE_URL || '').trim();
  // Some Vercel-generated files include placeholders like `DATABASE_URL=""`.
  // Treat empty string as missing and fall back to the local env file.
  if (!dbUrlAfterVercelLoad && fs.existsSync(localEnvPath)) {
    // If `DATABASE_URL` already exists (even as ""), `override:false` won't replace it.
    // Remove it so the next dotenv load can populate the real value.
    delete process.env.DATABASE_URL;
    dotenv.config({ path: localEnvPath, override: false });
  }
};

loadEnvIfMissing();

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const databaseUrl = (process.env.DATABASE_URL || '').trim();

// Local fallback only (used for development). In production you MUST set DATABASE_URL.
const localConnectionString = 'postgresql://postgres:postgres@localhost:5432/finance_tracker';
const poolConnectionString = databaseUrl || localConnectionString;

// SSL needs vary by provider. Default to SSL when DATABASE_URL looks like a managed PG service.
const databaseLooksManaged = /supabase\\.com|pooler\\./i.test(poolConnectionString) || /sslmode=|require/i.test(poolConnectionString);
const sslEnabled = (process.env.DATABASE_SSL !== undefined)
  ? process.env.DATABASE_SSL !== 'false'
  : databaseLooksManaged;

const sslRejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
// Default to `rejectUnauthorized: false` for managed providers/poolers when not explicitly configured.
const rejectUnauthorizedFinal =
  sslRejectUnauthorized !== undefined
    ? sslRejectUnauthorized !== 'false'
    : false;
const ssl = sslEnabled ? { rejectUnauthorized: rejectUnauthorizedFinal } : undefined;

const pool = new Pool({
  connectionString: poolConnectionString,
  ssl
});

pool.on('error', (err) => {
  // Don't crash the process (especially important for serverless runtimes).
  console.error('[backend][db] Unexpected error on idle client', err);
});

let schemaInitPromise = null;
const ensureSchemaInitialized = async () => {
  // Prevent concurrent cold-start schema initializations.
  if (schemaInitPromise) return schemaInitPromise;

  schemaInitPromise = (async () => {
    // In production we fail gracefully instead of trying to connect to localhost.
    const currentDbUrl = (process.env.DATABASE_URL || '').trim();
    if (!currentDbUrl && isProduction) {
      throw new Error('DATABASE_URL is required in production.');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.pft_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);
  })();

  return schemaInitPromise;
};

module.exports = {
  query: async (text, params) => {
    await ensureSchemaInitialized();
    return pool.query(text, params);
  },
};
