import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.local:', result.error);
}

async function testConnection() {
  console.log('Testing Postgres connection...');
  console.log('POSTGRES_URL length:', process.env.POSTGRES_URL?.length);

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL.');

    // 1. Test Schema Access
    try {
        const res = await client.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name = \'my_portfolio\'');
        if (res.rows.length > 0) {
            console.log('✅ Schema "my_portfolio" exists.');
        } else {
            console.error('❌ Schema "my_portfolio" does NOT exist.');
        }
    } catch (e) {
        console.error('❌ Error checking schema:', e);
    }

    // 2. Test Table Creation (Permissions)
    const testTableName = 'my_portfolio.test_permissions_table';
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS ${testTableName} (id SERIAL PRIMARY KEY, val TEXT)`);
        console.log(`✅ Successfully created table ${testTableName} (Permissions OK).`);
    } catch (e) {
        console.error(`❌ Error creating table ${testTableName}:`, e);
    }

    // 3. Test Insertion (Permissions)
    try {
        await client.query(`INSERT INTO ${testTableName} (val) VALUES ($1)`, ['test_value']);
        console.log(`✅ Successfully inserted row into ${testTableName} (Permissions OK).`);
    } catch (e) {
        console.error(`❌ Error inserting into ${testTableName}:`, e);
    }

    // 4. Test Selection
    try {
        const res = await client.query(`SELECT * FROM ${testTableName}`);
        console.log(`✅ Successfully selected ${res.rowCount} rows from ${testTableName}.`);
    } catch (e) {
        console.error(`❌ Error selecting from ${testTableName}:`, e);
    }

    // Clean up
    try {
        await client.query(`DROP TABLE ${testTableName}`);
        console.log(`✅ Successfully dropped table ${testTableName}.`);
    } catch (e) {
         console.error(`❌ Error dropping table ${testTableName}:`, e);
    }

  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await client.end();
  }
}

testConnection();
