const { Pool } = require('pg');
require('dotenv').config();

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
const ssl = sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized !== 'false' } : undefined;

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
    if (!databaseUrl && isProduction) {
      throw new Error('DATABASE_URL is required in production.');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
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
