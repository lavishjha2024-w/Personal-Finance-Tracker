const { Pool } = require('pg');
require('dotenv').config();

// Config for connecting to PostgreSQL.
// Use the DATABASE_URL environment variable if provided, 
// otherwise fallback to a local postgres database.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finance_tracker',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // Need SSL for Render
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize the database table
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);
    console.log('Connected to the PostgreSQL database.');
  } catch (err) {
    console.error('Error initializing database', err);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
