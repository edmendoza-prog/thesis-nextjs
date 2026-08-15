import { config } from 'dotenv';
import pool, { testConnection } from '../lib/db.js';

// Load environment variables
config();

console.log('\n' + '='.repeat(50));
console.log('  DATABASE CONNECTION TEST');
console.log('='.repeat(50) + '\n');

async function test() {
  try {
    console.log('Testing connection...\n');
    
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to database');
      console.error('\nCheck:');
      console.error('  1. XAMPP MySQL is running');
      console.error('  2. Database exists (thesis_db)');
      console.error('  3. Credentials in .env are correct\n');
      process.exit(1);
    }

    // Get database info
    const [dbInfo] = await pool.query('SELECT DATABASE() as db_name, VERSION() as version');
    const info = (dbInfo as any)[0];
    
    console.log('Connection successful! ✓\n');
    console.log('Database Info:');
    console.log(`  Host:     ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Database: ${info.db_name}`);
    console.log(`  Version:  ${info.version}`);
    console.log(`  User:     ${process.env.DB_USER || 'root'}\n`);
    
    // List tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log(`Tables: ${(tables as any[]).length} found`);
    if ((tables as any[]).length > 0) {
      (tables as any[]).forEach((table: any) => {
        console.log(`  • ${Object.values(table)[0]}`);
      });
    }
    console.log('');
    
  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\nError code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Start MySQL in XAMPP Control Panel\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Solution: Create database "thesis_db" in phpMyAdmin\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Solution: Check DB_USER and DB_PASSWORD in .env file\n');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

test();
