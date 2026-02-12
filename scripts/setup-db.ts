import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // 1. Enable pgvector extension
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('Enabled vector extension');

    // 2. Create portfolio_context table in the my_portfolio schema
    await client.query('DROP TABLE IF EXISTS my_portfolio.portfolio_context');
    await client.query(`
      CREATE TABLE IF NOT EXISTS my_portfolio.portfolio_context (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding vector(3072)
      )
    `);
    console.log('Created my_portfolio.portfolio_context table');

    console.log('Skipping HNSW index creation (vector size 3072 exceeds page size, but dataset is small).');
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setupDatabase();
