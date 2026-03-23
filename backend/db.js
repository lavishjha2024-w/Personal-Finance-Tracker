const { Pool } = require('pg');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');


const loadEnvIfMissing = () => {
  const currentDbUrl = (process.env.DATABASE_URL || '').trim();
  if (currentDbUrl) return;

  const vercelEnvPath = path.join(__dirname, '.env.vercel.prod');
  const localEnvPath = path.join(__dirname, '.env');

  if (process.env.VERCEL === '1' && fs.existsSync(vercelEnvPath)) {
    dotenv.config({ path: vercelEnvPath, override: false });
  }

  const dbUrlAfterVercelLoad = (process.env.DATABASE_URL || '').trim();

  if (!dbUrlAfterVercelLoad && fs.existsSync(localEnvPath)) {

    delete process.env.DATABASE_URL;
    dotenv.config({ path: localEnvPath, override: false });
  }
};

loadEnvIfMissing();

const databaseUrl = (process.env.DATABASE_URL || '').trim();
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

// SSL needs vary by provider. Default to SSL when DATABASE_URL looks like a managed PG service.
const databaseLooksManaged = /supabase\.com|pooler\.|render\.com|neon\.tech|railway\./i.test(databaseUrl) || /sslmode=|require/i.test(databaseUrl);
const isDeployment = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER) || process.env.VERCEL === '1';
const sslEnabled = (process.env.DATABASE_SSL !== undefined)
  ? process.env.DATABASE_SSL !== 'false'
  : (databaseLooksManaged || isDeployment);

const sslRejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
// Default to `rejectUnauthorized: false` for managed providers/poolers when not explicitly configured.
const rejectUnauthorizedFinal =
  sslRejectUnauthorized !== undefined
    ? sslRejectUnauthorized !== 'false'
    : false;
const ssl = sslEnabled ? { rejectUnauthorized: rejectUnauthorizedFinal } : undefined;
const ipFamily = Number.parseInt(process.env.DATABASE_IP_FAMILY || '4', 10);
const lookupFamily = Number.isNaN(ipFamily) ? 4 : ipFamily;

const pool = new Pool({
  connectionString: databaseUrl,
  family: lookupFamily,
  lookup: (hostname, _options, callback) => {
    dns.lookup(hostname, { family: lookupFamily, all: false }, callback);
  },
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
     if (!currentDbUrl) {
    throw new Error('DATABASE_URL is required');
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
