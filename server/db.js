const { Pool } = require("pg");

// Neon Postgres connection pool.
// DATABASE_URL comes from your .env file (see .env.example at project root).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Creates tables if they don't already exist. Called once on server start.
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      guest_id TEXT,
      company TEXT NOT NULL,
      role TEXT,
      questions JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS resumes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      original_text TEXT,
      corrected_text TEXT,
      skills JSONB,
      suggested_companies JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("[db] Tables verified/created successfully");
}

module.exports = { pool, initDb };
