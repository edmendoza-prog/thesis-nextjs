import { NextResponse } from 'next/server';
import pool, { testConnection } from '@/lib/db';

export async function GET() {
  try {
    // Test basic connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to connect to database. Check your .env.local settings.' 
        },
        { status: 500 }
      );
    }

    // Test a simple query
    const [rows] = await pool.query('SELECT 1 + 1 AS result, NOW() AS current_time');
    
    // Get database info
    const [dbInfo] = await pool.query('SELECT DATABASE() as db_name, VERSION() as version');
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Database connected successfully!',
      connection: {
        database: (dbInfo as any)[0].db_name,
        version: (dbInfo as any)[0].version,
        host: process.env.DB_HOST,
      },
      test_query: rows 
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      hint: error.code === 'ECONNREFUSED' 
        ? 'Make sure XAMPP MySQL is running' 
        : error.code === 'ER_BAD_DB_ERROR'
        ? 'Database does not exist. Create "thesis_db" in phpMyAdmin'
        : 'Check your .env.local configuration'
    }, { status: 500 });
  }
}
