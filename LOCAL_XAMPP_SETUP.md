# Testing Edit Record Feature with Local XAMPP

## Prerequisites
- XAMPP installed with MySQL running
- Node.js and npm/pnpm installed

## Setup Instructions

### Step 1: Start XAMPP MySQL
1. Open XAMPP Control Panel
2. Click "Start" next to **MySQL** (port 3306 should be running)
3. Verify MySQL is running by checking the port

### Step 2: Create Database and Tables

Option A: Using MySQL Command Line
```bash
mysql -u root -p
# Leave password blank if you haven't set one for XAMPP root

# Create database
CREATE DATABASE clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinic_db;
```

Option B: Using phpMyAdmin (easier)
1. Go to `http://localhost/phpmyadmin`
2. Click "New" on the left sidebar
3. Create database named `clinic_db`
4. Import the schema file: Go to Import tab and upload `mysql-schema.sql`

### Step 3: Create Sample Medical Record

Run this in MySQL/phpMyAdmin:

```sql
-- Create a test student
INSERT INTO student_files (matric_number, first_name, last_name, email, phone, address, dob, gender, student_id, department, level, admission_date, emergency_contact, date_created) VALUES (
  'MTH/21/001',
  'John',
  'Doe',
  'john.doe@university.edu',
  '08012345678',
  '123 Main Street, Lagos',
  '2001-05-15',
  'Male',
  'STU001',
  'Mathematics',
  '300',
  '2021-09-01',
  'Jane Doe - 08098765432',
  NOW()
);

-- Add an allergy record
INSERT INTO allergies (student_file_id, allergen, severity, reaction, notes, date_recorded) VALUES (
  'MTH/21/001',
  'Penicillin',
  'High',
  'Anaphylaxis',
  'Previous severe reaction',
  NOW()
);

-- Add a treatment record
INSERT INTO treatment_history (student_file_id, treatment_name, description, start_date, end_date, status) VALUES (
  'MTH/21/001',
  'Diabetes Management',
  'Type 2 Diabetes treatment plan',
  NOW(),
  DATE_ADD(NOW(), INTERVAL 3 MONTH),
  'Active'
);
```

### Step 4: Start the Development Server

```bash
# Install dependencies
pnpm install

# Start dev server
npm run dev
# or
pnpm dev
```

The app should be available at `http://localhost:3000`

### Step 5: Test the Edit Record Feature

1. Go to Medical Records page
2. Search for the test record: **MTH/21/001**
3. Click **"Edit Record"** button
4. Test the edit functionality:
   - Click on each tab to view data
   - Edit student information in the Overview tab
   - Add/Edit/Delete allergies
   - Add/Edit/Delete treatments
   - Add/Edit/Delete prescriptions and notes

## Environment Configuration

If your XAMPP uses different credentials, create a `.env.local` file:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=clinic_db
```

## Troubleshooting

### "Failed to load medical record"
- Ensure MySQL is running in XAMPP
- Verify the database `clinic_db` exists
- Check if the student file with matric number exists
- Look at browser console for detailed error messages

### Connection Refused Error
- MySQL is not running - start it from XAMPP Control Panel
- Check if port 3306 is being used by another application
- Verify firewall isn't blocking the connection

### Table doesn't exist
- Import the `mysql-schema.sql` file in phpMyAdmin
- Or run: `mysql -u root clinic_db < mysql-schema.sql`

## Full Edit Record Features Available

✅ **Overview Tab** - Edit student information
✅ **Allergies Tab** - Add, edit, delete allergies with severity
✅ **Treatments Tab** - Manage treatment records
✅ **Prescriptions Tab** - Edit prescription details
✅ **Doctor Notes Tab** - Add and manage notes
✅ **Clinic Visits Tab** - Track clinic visit history

All changes are saved to your local MySQL database automatically!
