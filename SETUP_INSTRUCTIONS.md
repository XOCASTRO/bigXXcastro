# PTI Clinic Management System - Setup Instructions

## Overview
Your clinic management system is now fully themed with a beautiful dark glassmorphism design. Follow these steps to get it running on your laptop.

---

## Step 1: Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** package manager - Run: `npm install -g pnpm`
- **MySQL Server** (v8.0 or higher) - [Download](https://www.mysql.com/downloads/mysql/)

---

## Step 2: Database Setup

### 2.1 Create MySQL Database

1. **Open MySQL Command Line or MySQL Workbench**

2. **Run the schema script to create the database:**
   ```bash
   mysql -u root -p < mysql-schema.sql
   ```
   (When prompted, enter your MySQL root password)

   Or if you're using MySQL Workbench:
   - Open the `mysql-schema.sql` file
   - Click "Execute" to run all queries

3. **Verify the database was created:**
   ```bash
   mysql -u root -p
   # Then type: SHOW DATABASES;
   # You should see "clinic_db" in the list
   ```

### 2.2 Initialize Database with Sample Data

After the schema is created, run the initialization script to populate demo staff users:

```bash
cd /path/to/your/project
node scripts/init-db.js
```

This creates the following test accounts:
```
Role      | Email                    | Password
----------|--------------------------|----------
ADMIN     | admin@pticlinic.com      | admin123
DOCTOR    | doctor@pticlinic.com     | doctor123
NURSE     | nurse@pticlinic.com      | nurse123
STAFF     | staff@pticlinic.com      | staff123
VIEWER    | viewer@pticlinic.com     | viewer123
```

---

## Step 3: Environment Configuration

1. **Create or update `.env.local` in your project root:**

```env
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=clinic_db

# Optional: For production environments
NODE_ENV=development
```

2. **Alternative: Use `.env.development.local` for development:**
   - The file already exists in your project
   - Update it with your MySQL credentials if different from defaults

---

## Step 4: Install Dependencies

Run the following command in your project directory:

```bash
pnpm install
```

This installs all required packages including:
- Next.js 16
- React 19
- Tailwind CSS 4
- MySQL2
- shadcn/ui components

---

## Step 5: Run Development Server

Start the development server:

```bash
pnpm dev
```

You should see:
```
✓ Ready in 489ms
- Local:         http://localhost:3000
- Network:       http://[your-ip]:3000
```

Open **http://localhost:3000** in your browser.

---

## Step 6: Login & Test

1. **You'll see the dark glassmorphism login page**
   - The login page features a beautiful frosted glass design with gradient background

2. **Login with demo credentials:**
   - Email: `admin@pticlinic.com`
   - Password: `admin123`

3. **After login, you'll see the dashboard with:**
   - Dark glassmorphism theme throughout
   - Stat cards with colored accents
   - Sidebar navigation with glass effects
   - All pages themed with the new design

---

## Troubleshooting

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:3306"

**Solution:** MySQL is not running or database credentials are wrong
```bash
# Check if MySQL is running (Windows)
Get-Service MySQL80

# Start MySQL (macOS with Homebrew)
brew services start mysql

# Start MySQL (Linux)
sudo service mysql start

# Or verify connection
mysql -u root -p -h localhost
```

### Issue: "Error: Unknown database 'clinic_db'"

**Solution:** Schema wasn't imported correctly
```bash
# Re-run the schema setup
mysql -u root -p < mysql-schema.sql
```

### Issue: "Port 3000 already in use"

**Solution:** Use a different port
```bash
pnpm dev -- -p 3001
```
Then visit http://localhost:3001

### Issue: "Cannot find module" errors

**Solution:** Reinstall dependencies
```bash
rm -rf node_modules
pnpm install
```

---

## Features & Pages

Your clinic management system includes:

### Themed Pages:
- **Dashboard** - Stats and overview with glass cards
- **Patients Management** - Add/edit/delete patient records with glass-themed forms
- **Medical Records** - View and manage student medical records
- **Appointments** - Schedule and manage appointments
- **Reports & Analytics** - Financial and management reports
- **Staff Management** - Manage staff members and roles
- **Inventory** - Track medical supplies
- **Prescriptions** - Prescription history and management
- **Attendance** - Track staff attendance

### Theme Features:
- Dark glassmorphism design
- Frosted glass cards with backdrop blur
- Gradient buttons and accents
- Blue primary color (#64b5f6)
- Emerald accent color (#06d6a0)
- Perfect contrast for readability
- Smooth transitions and hover effects

---

## Build for Production

When ready to deploy:

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Main layout with dark theme
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles + glassmorphism utilities
│   ├── login/                  # Login page with glass forms
│   ├── dashboard/              # Dashboard with glass cards
│   ├── patients/               # Patient management
│   ├── appointments/           # Appointments management
│   ├── medical-records/        # Medical records
│   ├── reports/                # Reports & analytics
│   ├── staff/                  # Staff management
│   ├── inventory/              # Inventory tracking
│   ├── prescriptions/          # Prescription management
│   ├── components/             # Reusable components
│   │   └── sidebar.tsx         # Navigation sidebar
│   └── api/                    # API routes
├── lib/
│   └── mysql-db.ts             # MySQL connection pool
├── scripts/
│   └── init-db.js              # Database initialization
├── mysql-schema.sql            # Database schema
├── package.json
├── tailwind.config.ts
└── next.config.mjs
```

---

## Database Tables

Your system includes the following tables:
- **staff_users** - Authentication and staff management
- **student_files** - Student/patient medical records
- **allergies** - Allergy information
- **treatment_history** - Treatment records
- **prescription_history** - Prescription records
- **doctor_notes** - Clinical notes
- **appointments** - Appointment scheduling
- **attendance** - Staff attendance tracking
- **inventory** - Medical supply inventory

---

## Default Configuration

### MySQL Connection
- Host: `localhost`
- User: `root`
- Password: (empty or as configured)
- Database: `clinic_db`
- Port: `3306`

### Application
- Server: `http://localhost:3000`
- Development: `pnpm dev`
- Build: `pnpm build`
- Production: `pnpm start`

---

## Notes

1. **Security:** The demo passwords should be changed before production deployment
2. **HTTPS:** Use HTTPS in production (consider using Vercel for easy deployment)
3. **Backups:** Regularly backup your MySQL database
4. **Theme:** All glassmorphism classes are in `app/globals.css` and can be customized

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify MySQL is running and accessible
3. Check console logs for specific error messages
4. Ensure all dependencies are installed: `pnpm install`

---

**Your clinic management system is ready to use!** 🎉

The dark glassmorphism theme applies throughout all pages for a modern, professional appearance.
