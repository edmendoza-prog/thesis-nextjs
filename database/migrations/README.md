# Database Migrations Guide

## 🚀 Quick Start: Running Migrations

### ⭐ Recommended Method: NPM Commands

```bash
# Test database connection
npm run db:test

# Run all pending migrations
npm run db:migrate
```

**That's it!** The script automatically handles everything.

---

## 📋 Two Ways to Run Migrations

### Method 1: NPM (Automatic) ⚡

**Advantages:**
- ✅ Automatic - no copy/paste
- ✅ Tracks which migrations ran
- ✅ Runs migrations in correct order
- ✅ Skips already-executed migrations
- ✅ Clear error messages

**Commands:**
```bash
npm run db:test      # Test connection
npm run db:migrate   # Run migrations
```

### Method 2: phpMyAdmin (Manual)

Use this if NPM method fails or you prefer manual control.

**Steps:**

#### Step 1: Start XAMPP
- Open XAMPP Control Panel
- Make sure **MySQL** is running (green highlight)

#### Step 2: Open phpMyAdmin
- Click **"Admin"** button next to MySQL in XAMPP
- Browser opens at http://localhost/phpmyadmin

#### Step 3: Select Database
- Click **`thesis_db`** in the left sidebar

#### Step 4: Open SQL Tab
- Click **"SQL"** tab at the top of the page

#### Step 5: Copy Migration File
- Open the new migration file (e.g., `0001_new_feature.sql`)
- Select ALL text (Ctrl+A)
- Copy (Ctrl+C)

#### Step 6: Run Migration
- Paste into the SQL text box in phpMyAdmin (Ctrl+V)
- Click **"Go"** button (bottom right)
- ✅ Wait for "Query executed successfully" message

#### Step 7: Verify
- Refresh the database in left sidebar
- Check that new tables/columns appear

---

## 📋 Migration Files (Run in Order)

### ✅ Completed Migrations
- `0000_initial_schema.sql` - Initial database setup with all base tables

### ⬜ Pending Migrations
Check this folder for new numbered files and run them in order.

**Keep track of which migrations you've run!**

---

## ⚠️ Important Rules

1. **Run migrations in numerical order** (0000 → 0001 → 0002...)
2. **Never skip a migration**
3. **Don't run the same migration twice**
4. **Always use phpMyAdmin with `thesis_db` selected**
5. **Copy the ENTIRE file contents**

---

## 🐛 Troubleshooting

### "Table 'xyz' already exists"
✅ **This is OK** - You already ran this migration, skip to the next one

### "Unknown column 'abc'"
❌ **Problem** - You skipped a migration. Run earlier migrations first

### "Syntax error at line X"
❌ **Problem** - Copy the entire file, don't copy partial SQL

### "Can't connect to MySQL"
❌ **Problem** - Start MySQL in XAMPP Control Panel

### "Access denied for user 'root'"
❌ **Problem** - Check your password in `.env` file

---

## 📝 Migration Log Template

Copy this to track your migrations:

```
Migration History:
------------------
✅ 0000_initial_schema.sql        | Date: 2026-08-15 | Status: Complete
⬜ 0001_example_migration.sql     | Date: __________ | Status: Pending
⬜ 0002_another_migration.sql     | Date: __________ | Status: Pending
```

---

## 🆘 Need Help?

1. Make sure XAMPP MySQL is running
2. Make sure `thesis_db` database exists
3. Check `.env` file has correct database credentials
4. Read the full guide in `/DATABASE_SETUP.md`
