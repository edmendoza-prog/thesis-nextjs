import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import pool from '../lib/db.js';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

async function createMigrationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  await pool.query(sql);
  console.log(`${colors.blue}✓${colors.reset} Migrations tracking table ready\n`);
}

async function getExecutedMigrations() {
  try {
    const [rows] = await pool.query(
      `SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY filename`
    );
    return (rows as any[]).map((row: any) => row.filename);
  } catch (error) {
    return [];
  }
}

async function recordMigration(filename: string) {
  await pool.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES (?)`,
    [filename]
  );
}

async function runMigration(filename: string, filepath: string) {
  console.log(`${colors.yellow}→${colors.reset} Running: ${filename}`);
  
  const sql = fs.readFileSync(filepath, 'utf8');
  
  // Skip empty files or template files
  if (!sql.trim() || sql.includes('TEMPLATE') || sql.includes('Add your SQL statements here')) {
    console.log(`  ${colors.yellow}⊘${colors.reset} Skipped (template/empty file)\n`);
    return false;
  }
  
  try {
    // Clean up SQL: remove comments and USE statements
    const cleanedSql = sql
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               !trimmed.startsWith('--') && 
               !trimmed.toUpperCase().startsWith('USE ');
      })
      .join('\n');
    
    if (!cleanedSql.trim()) {
      console.log(`  ${colors.yellow}⊘${colors.reset} Skipped (no executable statements)\n`);
      return false;
    }
    
    // Split into individual statements and execute them
    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await pool.query(statement);
        } catch (error: any) {
          console.error(`  ${colors.red}✗${colors.reset} Error in statement ${i + 1}:`);
          console.error(`  ${error.message}`);
          console.error(`  Statement preview: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }
    
    await recordMigration(filename);
    console.log(`  ${colors.green}✓${colors.reset} Success! (${statements.length} statements executed)\n`);
    return true;
  } catch (error: any) {
    console.error(`  ${colors.red}✗${colors.reset} Migration failed\n`);
    throw error;
  }
}

async function migrate() {
  console.log('\n' + '='.repeat(50));
  console.log('  DATABASE MIGRATION TOOL');
  console.log('='.repeat(50) + '\n');

  try {
    // Test connection and verify database
    const connection = await pool.getConnection();
    const [result] = await connection.query('SELECT DATABASE() as db');
    const dbName = (result as any)[0].db;
    
    if (!dbName) {
      console.error(`${colors.red}✗ No database selected!${colors.reset}`);
      console.error(`Check your .env file - DB_NAME should be set to 'thesis_db'\n`);
      connection.release();
      process.exit(1);
    }
    
    console.log(`${colors.blue}Database:${colors.reset} ${dbName}`);
    connection.release();

    // Create migrations tracking table
    await createMigrationsTable();

    // Get list of executed migrations
    const executed = await getExecutedMigrations();
    console.log(`${colors.blue}Already executed:${colors.reset} ${executed.length} migration(s)\n`);

    // Get all migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql') && !f.includes('TEMPLATE'))
      .sort();

    if (files.length === 0) {
      console.log(`${colors.yellow}No migration files found in ${MIGRATIONS_DIR}${colors.reset}\n`);
      process.exit(0);
    }

    // Filter pending migrations
    const pending = files.filter(f => !executed.includes(f));

    if (pending.length === 0) {
      console.log(`${colors.green}✓ All migrations are up to date!${colors.reset}\n`);
      process.exit(0);
    }

    console.log(`${colors.blue}Pending migrations:${colors.reset} ${pending.length}\n`);
    console.log('─'.repeat(50) + '\n');

    // Run pending migrations
    let successCount = 0;
    for (const file of pending) {
      const filepath = path.join(MIGRATIONS_DIR, file);
      const ran = await runMigration(file, filepath);
      if (ran) successCount++;
    }

    console.log('─'.repeat(50) + '\n');
    console.log(`${colors.green}✓ Migration complete!${colors.reset}`);
    console.log(`  Executed: ${successCount} migration(s)\n`);

  } catch (error: any) {
    console.error(`\n${colors.red}✗ Migration failed:${colors.reset} ${error.message}\n`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
migrate();
