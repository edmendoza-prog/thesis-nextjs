import pool from './lib/db';

async function check() {
  const [rows] = await pool.query(`
    SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME, UPDATE_RULE, DELETE_RULE
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'thesis_db'
  `);
  console.table(rows);
  process.exit(0);
}

check();
