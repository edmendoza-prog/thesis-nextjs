import pool from './lib/db';

async function dumpFks() {
  const [rows] = await pool.query(`
    SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_SCHEMA = 'thesis_db' AND REFERENCED_TABLE_NAME IS NOT NULL
  `);
  console.table(rows);
  process.exit(0);
}

dumpFks();
