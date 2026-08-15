# 🎯 QUICK GUIDE: How to Run Migrations

## ⚡ Method 1: Using NPM (RECOMMENDED)

### Simple 3-Step Process:

```bash
# 1. Test your database connection
npm run db:test

# 2. Run all pending migrations
npm run db:migrate

# 3. Done! ✓
```

**That's it!** The script automatically:
- ✅ Reads all `.sql` files in order
- ✅ Skips already-executed migrations
- ✅ Tracks which migrations have run
- ✅ Shows clear success/error messages

### First Time Setup:
1. Make sure XAMPP MySQL is running
2. Make sure `thesis_db` database exists
3. Run `npm run db:test` to verify connection
4. Run `npm run db:migrate` to execute migrations

---

## 📋 Method 2: Manual phpMyAdmin (Alternative)

If you prefer the manual way or if npm method fails:

### 1️⃣ XAMPP Running?
```
Open XAMPP → Click START on MySQL
```

### 2️⃣ Open phpMyAdmin
```
XAMPP → Click "Admin" next to MySQL
```

### 3️⃣ Select Database
```
Left sidebar → Click "thesis_db"
```

### 4️⃣ Go to SQL Tab
```
Top menu → Click "SQL"
```

### 5️⃣ Copy Migration File
```
Open: database/migrations/0001_whatever.sql
Press: Ctrl+A (select all)
Press: Ctrl+C (copy)
```

### 6️⃣ Paste & Run
```
phpMyAdmin SQL box → Ctrl+V (paste)
Click "Go" button (bottom right)
```

### 7️⃣ Success?
```
✅ See "Query executed successfully"? → Done!
❌ See error? → Read the error message below
```

---

## 📂 Where are migrations?
```
thesis-nextjs/
└── database/
    └── migrations/
        ├── README.md                          ← Full instructions
        ├── 0000_initial_schema.sql            ← Run this first
        ├── 0001_your_new_migration.sql        ← Run this second
        └── TEMPLATE_migration.sql             ← Copy for new migrations
```

---

## 🚀 NPM Commands

| Command | What it does |
|---------|-------------|
| `npm run db:test` | Test database connection and show info |
| `npm run db:migrate` | Run all pending migrations automatically |

---

## ⚡ Example: Complete NPM Flow

```bash
# Open terminal in project folder
cd C:\Users\ASUS\thesis-nextjs

# Test connection first
npm run db:test
# ✓ Shows: Database connected, lists tables

# Run migrations
npm run db:migrate
# ✓ Executes all pending .sql files
# ✓ Tracks which ones are complete
# ✓ Skips already-run migrations

# That's it! Your database is up to date.
```

---

## ⚡ Example: Manual phpMyAdmin Flow

```
1. Open XAMPP Control Panel
2. MySQL green? If not, click Start
3. Click "Admin" next to MySQL
4. Browser opens → Click "thesis_db" (left side)
5. Click "SQL" tab (top)
6. Open migration file in VS Code
7. Ctrl+A, Ctrl+C (copy all SQL)
8. Click in phpMyAdmin SQL box
9. Ctrl+V (paste)
10. Click "Go" button
11. See success message ✅
12. Done!
```

---

## 🚨 Common Errors

### NPM Method Errors:

| Error Message | What it means | What to do |
|--------------|---------------|------------|
| "ECONNREFUSED" | MySQL not running | Start MySQL in XAMPP |
| "ER_BAD_DB_ERROR" | Database doesn't exist | Create `thesis_db` in phpMyAdmin |
| "ER_ACCESS_DENIED_ERROR" | Wrong credentials | Check `.env` file |
| "Cannot find module" | Dependencies not installed | Run `npm install` |

### Manual phpMyAdmin Errors:

| Er**Use `npm run db:migrate`** - Automatic, tracks progress, no copy-paste
- ✅ Use `npm run db:test` before migrating to verify connection
- ✅ Migrations run in alphabetical order automatically
- ✅ Already-run migrations are skipped automatically
- ❌ Don't edit old migration files
- ❌ Don't delete migration files after running them | Check `.env` file |

---

## 💡 Pro Tips

- ✅ Run migrations in order (0000 → 0001 → 0002...)
- ✅ Copy the ENTIRE file
- ✅ Wait for success message before closing
- ❌ Don't skip migrations
- ❌ Don't run the same migration twice
- ❌ Don't edit old migration files

---

**Need more help?** See full guide: `DATABASE_SETUP.md`
