# Quick Start - 5 Minutes

## TL;DR - Get Running Fast

### 1. Setup MySQL Database (2 minutes)
```bash
# Option A: Command Line
mysql -u root -p < mysql-schema.sql

# Option B: MySQL Workbench
# 1. Open mysql-schema.sql
# 2. Click Execute
```

### 2. Initialize Demo Users (1 minute)
```bash
node scripts/init-db.js
```

### 3. Install & Run (2 minutes)
```bash
pnpm install
pnpm dev
```

### 4. Login
- Go to http://localhost:3000
- Email: `admin@pticlinic.com`
- Password: `admin123`

---

## Demo Accounts

All accounts have the password matching their role name in lowercase:

| Role   | Email                    | Password   |
|--------|--------------------------|-----------|
| Admin  | admin@pticlinic.com      | admin123  |
| Doctor | doctor@pticlinic.com     | doctor123 |
| Nurse  | nurse@pticlinic.com      | nurse123  |
| Staff  | staff@pticlinic.com      | staff123  |
| Viewer | viewer@pticlinic.com     | viewer123 |

---

## What You Get

✓ Dark Glassmorphism Theme - Beautiful frosted glass design throughout
✓ Fully Functional - All pages themed and working
✓ Ready to Deploy - Production-ready code
✓ MySQL Backend - Scalable database with proper schema
✓ Authentication - Role-based access control
✓ Medical Records - Student/patient management system
✓ Responsive Design - Works on desktop and mobile

---

## Common Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Initialize database
node scripts/init-db.js
```

---

## Theme Preview

Your application features:
- **Background:** Deep indigo gradient
- **Primary Color:** Brilliant blue
- **Accent Color:** Vibrant emerald
- **Secondary:** Purple accents
- **Glass Effect:** Frosted glass cards with backdrop blur
- **Text:** Light lavender for perfect contrast

---

## Having Issues?

1. **MySQL Connection Error?**
   - Ensure MySQL is running: `mysql -u root`
   - Check credentials in `.env.local`

2. **Port 3000 already in use?**
   - Use different port: `pnpm dev -- -p 3001`

3. **Dependencies missing?**
   - Run: `pnpm install`

4. **Database not found?**
   - Run: `mysql -u root -p < mysql-schema.sql`

---

See **SETUP_INSTRUCTIONS.md** for detailed setup guide.
