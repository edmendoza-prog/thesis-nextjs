# Database Setup Guide

## XAMPP MySQL Configuration

### 1. Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Click "Admin" next to MySQL to open phpMyAdmin

### 2. Create Database
In phpMyAdmin:
1. Click "New" in the left sidebar
2. Enter database name: `thesis_db`
3. Set collation to: `utf8mb4_unicode_ci`
4. Click "Create"

### 3. Configure Environment Variables
The `.env` file has been created with default XAMPP settings:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          (leave empty for default XAMPP)
DB_NAME=thesis_db
```

**If you changed your MySQL password:**
- Update `DB_PASSWORD` in `.env`

**If using a different database name:**
- Update `DB_NAME` in `.env`

### 4. Run Migrations

#### Option A: Using NPM (Recommended) ⭐

The easiest way to run migrations:

```bash
# Test your database connection
npm run db:test

# Run all pending migrations
npm run db:migrate
```

The migration script will:
- ✅ Automatically execute all `.sql` files in order
- ✅ Skip migrations that have already been run
- ✅ Track migration history in `schema_migrations` table
- ✅ Show clear progress and error messages

**First time setup:**
```bash
npm run db:migrate
```
This runs `0000_initial_schema.sql` and creates all tables.

**When new migrations are added:**
```bash
npm run db:migrate
```
Only new migrations will be executed.

#### Option B: Manual phpMyAdmin (Alternative)
1. **Open phpMyAdmin**
   - Go to XAMPP Control Panel
   - Click "Admin" button next to MySQL
   - Browser opens phpMyAdmin

2. **Select Database**
   - Click `thesis_db` in the left sidebar
   
3. **Run Migration File**
   - Click "SQL" tab at the top
   - Open `database/migrations/0000_initial_schema.sql` in a text editor
   - Copy ALL the SQL code
   - Paste into the SQL text area
   - Click "Go" button (bottom right)
   - Wait for "Query executed successfully" message

4. **Verify Tables Created**
   - Click `thesis_db` in left sidebar
   - You should see tables: users, classes, student_enrollments, attendance, activities, grades, badges, student_badges

#### Running New Migrations (When Updates Are Added)

**When you see a new `.sql` file in `database/migrations/` folder:**

1. **Check Migration Files**
   ```
   database/migrations/
   ├── 0000_initial_schema.sql     ✅ Already run
   ├── 0001_add_new_feature.sql    ⚠️ New - needs to run
   └── 0002_another_update.sql     ⚠️ New - needs to run
   ```

2. **Run Each New Migration in Order**
   - Open phpMyAdmin → Select `thesis_db`
   - Click "SQL" tab
   - Open the migration file (e.g., `0001_add_new_feature.sql`)
   - Copy ALL the SQL code
   - Paste into SQL text area
   - Click "Go"
   - ✅ Check for success message

3. **Repeat for Each New Migration**
   - Run them in **numerical order** (0001 → 0002 → 0003...)
   - Do NOT skip migrations
   - Do NOT run the same migration twice

#### Quick Migration Checklist

```
□ XAMPP MySQL is running
□ Database 'thesis_db' exists and is selected
□ Migration file is opened in text editor
□ All SQL code is copied (Ctrl+A, Ctrl+C)
□ Pasted into phpMyAdmin SQL tab
□ Clicked "Go" button
□ Success message appeared
□ Tables/changes are visible in left sidebar
```

#### Track Which Migrations You've Run

Create a simple note or mark migrations as complete:
```
✅ 0000_initial_schema.sql - Run on 2026-08-15
✅ 0001_add_new_feature.sql - Run on 2026-08-15
⬜ 0002_future_update.sql - Not yet run
```

#### Common Migration Errors

**Error: "Table already exists"**
- You already ran this migration
- Skip to the next migration file

**Error: "Unknown column"**
- You skipped a migration
- Go back and run previous migrations first

**Error: "Syntax error"**
- Make sure you copied the ENTIRE SQL file
- Check you didn't copy extra text from outside the file

### 5. Test Connection
Create a test API route to verify the connection:

```typescript
// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import pool, { testConnection } from '@/lib/db';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      const [rows] = await pool.query('SELECT 1 + 1 AS result');
      return NextResponse.json({ 
        success: true, 
        message: 'Database connected!',
        data: rows 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Connection failed' 
    }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

Visit: `http://localhost:3000/api/test-db`

### 6. Common Issues

**Port Conflict (3306 in use):**
- Another MySQL service is running
- Change port in XAMPP config or stop other MySQL service

**Access Denied:**
- Verify username/password in `.env`
- Check MySQL user permissions

**Database Not Found:**
- Ensure `thesis_db` exists in phpMyAdmin
- Check database name matches `.env`

### 7. Using the Database Connection

In your API routes:
```typescript
import pool from '@/lib/db';

export async function GET() {
  const [rows] = await pool.query('SELECT * FROM users');
  return NextResponse.json(rows);
}
```

## Security Notes
- Never commit `.env` to git (it's in `.gitignore`)
- Use strong passwords in production
- Limit database user permissions
