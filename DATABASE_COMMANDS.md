# Database Commands - Quick Reference

## 🚀 NPM Scripts

### Test Database Connection
```bash
npm run db:test
```
- Checks if MySQL is running
- Verifies database exists
- Shows database info and tables
- Tests credentials from `.env`

### Run Migrations
```bash
npm run db:migrate
```
- Executes all pending SQL migrations
- Automatically tracks which migrations have run
- Skips already-executed migrations
- Runs migrations in alphabetical order

---

## 📖 First Time Setup

1. **Start XAMPP MySQL**
   ```
   Open XAMPP Control Panel → Start MySQL
   ```

2. **Create Database**
   ```
   XAMPP → Admin (opens phpMyAdmin)
   → New → Database name: thesis_db
   → Create
   ```

3. **Test Connection**
   ```bash
   npm run db:test
   ```
   Should show: ✅ Connection successful!

4. **Run Initial Migration**
   ```bash
   npm run db:migrate
   ```
   Creates all tables from `0000_initial_schema.sql`

---

## 🔄 Adding New Migrations

1. **Create Migration File**
   ```bash
   # Copy the template
   cp database/migrations/TEMPLATE_migration.sql database/migrations/0001_your_feature.sql
   ```

2. **Edit the File**
   - Add your SQL statements
   - Use proper naming: `0001_description.sql`, `0002_another.sql`, etc.

3. **Run Migration**
   ```bash
   npm run db:migrate
   ```
   Only your new migration will run (previous ones are tracked)

---

## 🔍 Migration Tracking

Migrations are tracked in the `schema_migrations` table:
- Automatically created on first run
- Stores filename and execution timestamp
- Prevents running the same migration twice

To see executed migrations:
```sql
SELECT * FROM schema_migrations ORDER BY executed_at;
```

---

## ❌ Troubleshooting

### "ECONNREFUSED" Error
**Problem:** MySQL is not running
**Solution:** Start MySQL in XAMPP Control Panel

### "ER_BAD_DB_ERROR" Error
**Problem:** Database doesn't exist
**Solution:** Create `thesis_db` in phpMyAdmin

### "ER_ACCESS_DENIED_ERROR" Error
**Problem:** Wrong username/password
**Solution:** Check credentials in `.env` file

### "Cannot find module" Error
**Problem:** Dependencies not installed
**Solution:** Run `npm install`

---

## 📁 File Structure

```
thesis-nextjs/
├── .env                           ← Database credentials
├── lib/
│   └── db.ts                      ← Database connection
├── scripts/
│   ├── migrate.ts                 ← Migration runner
│   └── test-connection.ts         ← Connection tester
├── database/
│   └── migrations/
│       ├── README.md
│       ├── TEMPLATE_migration.sql ← Copy this for new migrations
│       ├── 0000_initial_schema.sql
│       ├── 0001_your_feature.sql
│       └── 0002_another.sql
└── package.json                   ← Contains npm scripts
```

---

## 📚 More Help

- **Full setup guide:** [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Migration guide:** [HOW_TO_MIGRATE.md](./HOW_TO_MIGRATE.md)
- **Migrations folder:** [database/migrations/README.md](./database/migrations/README.md)
